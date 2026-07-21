import {
  collection,
  doc,
  documentId,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  startAfter,
  writeBatch,
} from 'firebase/firestore';
import type { QueryConstraint } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Transaction } from '../types';
import { buildCompetenceEntries } from '../utils/competenceEntryUtils';
import { removeUndefinedFields } from './firestoreData';

export const FINANCE_SCHEMA_VERSION = 2;
const MIGRATION_PAGE_SIZE = 25;

export class FinanceMigrationService {
  static async ensureCurrentSchema(uid: string): Promise<void> {
    if (!uid) throw new Error('User ID is required');
    const userRef = doc(db, 'users', uid);
    const userSnapshot = await getDoc(userRef);
    const userData = userSnapshot.exists() ? userSnapshot.data() : {};
    if (userData.financeSchemaVersion === FINANCE_SCHEMA_VERSION) return;

    let cursor = typeof userData.financeMigrationCursor === 'string'
      ? userData.financeMigrationCursor
      : undefined;

    while (true) {
      const constraints: QueryConstraint[] = [orderBy(documentId()), limit(MIGRATION_PAGE_SIZE)];
      if (cursor) constraints.push(startAfter(cursor));
      const snapshot = await getDocs(query(collection(db, 'users', uid, 'transactions'), ...constraints));

      for (const transactionDocument of snapshot.docs) {
        const transaction = transactionDocument.data() as Transaction;
        const batch = writeBatch(db);
        buildCompetenceEntries(transactionDocument.id, transaction).forEach(entry => {
          const { id, ...storedEntry } = entry;
          batch.set(doc(db, 'users', uid, 'competenceEntries', id!), removeUndefinedFields(storedEntry));
        });
        await batch.commit();
      }

      if (snapshot.empty || snapshot.docs.length < MIGRATION_PAGE_SIZE) break;
      cursor = snapshot.docs[snapshot.docs.length - 1].id;
      await setDoc(userRef, { financeMigrationCursor: cursor }, { merge: true });
    }

    await setDoc(userRef, {
      financeSchemaVersion: FINANCE_SCHEMA_VERSION,
      financeMigrationCursor: null,
    }, { merge: true });
  }
}
