import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  Timestamp,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);

// Initialize Firestore with offline persistence enabled (modern API)
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
});

// Models / Types
export interface Transaction {
  id?: string;
  amount: number;
  description: string;
  date: Date;
  type: 'income' | 'expense';
  category?: string;
  userId: string; // Used for security rules
}

export interface FixedExpense {
  id?: string;
  amount: number;
  description: string;
  dueDate: number; // Day of the month (1-31)
  category?: string;
  active: boolean;
  userId: string; // Used for security rules
}

// Functions

/**
 * Adds a new transaction.
 */
export const addTransaction = async (transaction: Omit<Transaction, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, "transactions"), {
      ...transaction,
      // Convert JS Date to Firestore Timestamp
      date: Timestamp.fromDate(transaction.date)
    });
    return docRef.id;
  } catch (e) {
    console.error("Error adding transaction: ", e);
    throw e;
  }
};

/**
 * Gets transactions for a specific month and year.
 * @param month 1-indexed month (1 = January, 12 = December)
 * @param year full year (e.g., 2026)
 * @param userId The current user's ID
 */
export const getTransactions = async (month: number, year: number, userId: string): Promise<Transaction[]> => {
  try {
    // Note: JS Date month is 0-indexed, so month - 1
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);
    
    const q = query(
      collection(db, "transactions"),
      where("userId", "==", userId), // Ensure querying by user for security
      where("date", ">=", Timestamp.fromDate(startDate)),
      where("date", "<=", Timestamp.fromDate(endDate))
    );
    
    const querySnapshot = await getDocs(q);
    const transactions: Transaction[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      transactions.push({
        id: doc.id,
        amount: data.amount,
        description: data.description,
        date: data.date.toDate(),
        type: data.type,
        category: data.category,
        userId: data.userId
      });
    });
    return transactions;
  } catch (e) {
    console.error("Error getting transactions: ", e);
    throw e;
  }
};

/**
 * Adds a new fixed expense.
 */
export const addFixedExpense = async (expense: Omit<FixedExpense, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, "fixedExpenses"), expense);
    return docRef.id;
  } catch (e) {
    console.error("Error adding fixed expense: ", e);
    throw e;
  }
};

/**
 * Gets all fixed expenses for a specific user.
 */
export const getFixedExpenses = async (userId: string): Promise<FixedExpense[]> => {
  try {
    const q = query(
      collection(db, "fixedExpenses"),
      where("userId", "==", userId)
    );
    const querySnapshot = await getDocs(q);
    const expenses: FixedExpense[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      expenses.push({
        id: doc.id,
        amount: data.amount,
        description: data.description,
        dueDate: data.dueDate,
        category: data.category,
        active: data.active,
        userId: data.userId
      });
    });
    return expenses;
  } catch (e) {
    console.error("Error getting fixed expenses: ", e);
    throw e;
  }
};

export { db };
