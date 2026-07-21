import {
  collection,
  documentId,
  getDocs,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { CompetenceEntry } from '../types';

export class CompetenceEntryService {
  static async getEntriesForPeriod(uid: string, startDate: string, endDate: string): Promise<CompetenceEntry[]> {
    if (!uid) throw new Error('User ID is required');

    const snapshot = await getDocs(query(
      collection(db, 'users', uid, 'competenceEntries'),
      where('competenceDate', '>=', startDate),
      where('competenceDate', '<=', endDate),
      orderBy('competenceDate', 'desc'),
      orderBy(documentId(), 'desc'),
    ));

    return snapshot.docs.map(entry => ({ ...entry.data(), id: entry.id } as CompetenceEntry));
  }
}
