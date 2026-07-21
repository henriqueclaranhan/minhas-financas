import { collection, doc, documentId, getDoc, getDocs, limit, orderBy, query, setDoc, startAfter, writeBatch } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { QueryConstraint } from 'firebase/firestore';
import { validateImportData } from './dataImportValidation';
import { removeUndefinedFields } from './firestoreData';
import { buildCompetenceEntries } from '../utils/competenceEntryUtils';

const BATCH_SIZE = 400;

export interface ImportProgress {
  jobId: string;
  status: 'validated' | 'writing' | 'completed' | 'failed';
  processed: number;
  total: number;
}

interface ImportUnit {
  id?: string;
  writeCount: number;
  apply: (batch: ReturnType<typeof writeBatch>) => void;
}

async function fingerprint(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
}

async function commitWithRetry(batch: ReturnType<typeof writeBatch>, attempts = 3): Promise<void> {
  let lastError: unknown;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      await batch.commit();
      return;
    } catch (error) {
      lastError = error;
      if (attempt < attempts - 1) await new Promise(resolve => setTimeout(resolve, 250 * (2 ** attempt)));
    }
  }
  throw lastError;
}

export class DataSyncService {
  private static async readCollection(uid: string, collectionName: string): Promise<Array<Record<string, unknown>>> {
    const documents: Array<Record<string, unknown>> = [];
    let cursor: unknown;

    while (true) {
      const constraints: QueryConstraint[] = [orderBy(documentId()), limit(BATCH_SIZE)];
      if (cursor) constraints.push(startAfter(cursor));
      const snapshot = await getDocs(query(collection(db, 'users', uid, collectionName), ...constraints));
      snapshot.docs.forEach(document => documents.push({ ...document.data(), id: document.id }));
      if (snapshot.docs.length < BATCH_SIZE) break;
      cursor = snapshot.docs[snapshot.docs.length - 1];
    }

    return documents;
  }

  static async exportData(uid: string, initialBalance: number | null): Promise<void> {
    if (!uid) return;
    const [transactions, plannedExpenses] = await Promise.all([
      this.readCollection(uid, 'transactions'),
      this.readCollection(uid, 'plannedExpenses'),
    ]);
    const data = { initialBalance, transactions, plannedExpenses };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `minhas-financas-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  static async importData(uid: string, jsonData: string, onProgress?: (progress: ImportProgress) => void): Promise<boolean> {
    if (!uid) return false;
    const jobId = `import-${await fingerprint(jsonData)}`;
    const jobRef = doc(db, 'users', uid, 'importJobs', jobId);
    let lastProcessed = 0;
    let lastTotal = 0;
    try {
      const data = validateImportData(jsonData);
      const units: ImportUnit[] = [];
      if (data.initialBalance !== undefined) units.push({
        writeCount: 1,
        apply: batch => batch.set(doc(db, 'users', uid), { initialBalance: data.initialBalance }, { merge: true }),
      });
      data.transactions.forEach((transaction, index) => {
        const { id, ...storedTransaction } = transaction;
        const transactionId = id ?? `${jobId}-transaction-${index}`;
        const transactionRef = doc(db, 'users', uid, 'transactions', transactionId);
        const entries = buildCompetenceEntries(transactionId, storedTransaction);
        units.push({
          id: transactionRef.path,
          writeCount: 1 + entries.length,
          apply: batch => {
            batch.set(transactionRef, removeUndefinedFields(storedTransaction));
            entries.forEach(entry => {
              const { id: entryId, ...storedEntry } = entry;
              batch.set(doc(db, 'users', uid, 'competenceEntries', entryId!), removeUndefinedFields(storedEntry));
            });
          },
        });
      });
      data.plannedExpenses.forEach((plannedExpense, index) => {
        const { id, ...storedExpense } = plannedExpense;
        const expenseId = id ?? `${jobId}-planning-${index}`;
        const expenseRef = doc(db, 'users', uid, 'plannedExpenses', expenseId);
        units.push({ id: expenseRef.path, writeCount: 1, apply: batch => batch.set(expenseRef, removeUndefinedFields(storedExpense)) });
      });

      const existingJob = await getDoc(jobRef);
      const existingData = existingJob.exists() ? existingJob.data() : undefined;
      if (existingData?.status === 'completed') {
        onProgress?.({ jobId, status: 'completed', processed: units.length, total: units.length });
        return true;
      }
      let processed = typeof existingData?.processed === 'number' ? existingData.processed : 0;
      lastProcessed = processed;
      const suppliedRefs = units.slice(processed).flatMap(unit => unit.id ? [doc(db, unit.id)] : []);
      for (let start = 0; start < suppliedRefs.length; start += 100) {
        const existing = await Promise.all(suppliedRefs.slice(start, start + 100).map(ref => getDoc(ref)));
        if (existing.some(snapshot => snapshot.exists())) throw new Error('Import would overwrite existing documents');
      }
      const total = units.length;
      lastTotal = total;
      const emit = (status: ImportProgress['status']) => onProgress?.({ jobId, status, processed, total });
      await setDoc(jobRef, { fingerprint: jobId, status: 'validated', processed, total, updatedAt: new Date().toISOString() }, { merge: true });
      emit('validated');

      while (processed < total) {
        const batch = writeBatch(db);
        let writes = 1;
        let nextProcessed = processed;
        while (nextProcessed < total && writes + units[nextProcessed].writeCount <= BATCH_SIZE) {
          units[nextProcessed].apply(batch);
          writes += units[nextProcessed].writeCount;
          nextProcessed += 1;
        }
        batch.set(jobRef, {
          fingerprint: jobId,
          status: nextProcessed === total ? 'completed' : 'writing',
          processed: nextProcessed,
          total,
          updatedAt: new Date().toISOString(),
        }, { merge: true });
        await commitWithRetry(batch);
        processed = nextProcessed;
        lastProcessed = processed;
        emit(processed === total ? 'completed' : 'writing');
      }
      return true;
    } catch (e) {
      console.error("Failed to import data", e);
      await setDoc(jobRef, {
        fingerprint: jobId,
        status: 'failed',
        processed: lastProcessed,
        total: lastTotal,
        updatedAt: new Date().toISOString(),
        error: e instanceof Error ? e.message.slice(0, 500) : 'Unknown import error',
      }, { merge: true }).catch(() => undefined);
      return false;
    }
  }

  static async clearData(uid: string): Promise<void> {
    if (!uid) return;
    if (window.confirm('Tem certeza que deseja apagar todos os seus dados da nuvem? Esta ação não pode ser desfeita.')) {
      for (const collectionName of ['transactions', 'plannedExpenses', 'competenceEntries', 'importJobs']) {
        while (true) {
          const snapshot = await getDocs(query(collection(db, 'users', uid, collectionName), limit(BATCH_SIZE)));
          if (snapshot.empty) break;
          const batch = writeBatch(db);
          snapshot.docs.forEach(document => batch.delete(document.ref));
          await batch.commit();
        }
      }
      const userBatch = writeBatch(db);
      userBatch.set(doc(db, 'users', uid), { initialBalance: 0 }, { merge: true });
      await userBatch.commit();
    }
  }
}
