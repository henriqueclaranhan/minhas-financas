import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';

export class UserService {
  static async updateInitialBalance(uid: string, val: number): Promise<void> {
    if (!uid) return;
    await setDoc(doc(db, 'users', uid), { initialBalance: val }, { merge: true });
  }

  static subscribeToInitialBalance(
    uid: string,
    onUpdate: (balance: number | null) => void,
    onError: (error: Error) => void = () => undefined,
  ): () => void {
    if (!uid) throw new Error("User ID is required");
    const unsub = onSnapshot(doc(db, 'users', uid), (docSnap: any) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.initialBalance !== undefined) {
          onUpdate(data.initialBalance);
        } else {
          onUpdate(null);
        }
      } else {
        onUpdate(null);
      }
    }, onError);
    return unsub;
  }
}
