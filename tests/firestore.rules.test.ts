import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';

let environment: RulesTestEnvironment;

const transaction = {
  description: 'Market',
  amount: 100,
  paymentMethod: 'pix',
  installments: 1,
  date: '2026-07-21',
  type: 'expense',
};

beforeAll(async () => {
  environment = await initializeTestEnvironment({
    projectId: 'demo-minhas-financas',
    firestore: { rules: readFileSync(resolve('firestore.rules'), 'utf8') },
  });
});

beforeEach(() => environment.clearFirestore());
afterAll(() => environment.cleanup());

describe('Firestore finance rules', () => {
  it('allows owners to write valid transactions and denies other users', async () => {
    const owner = environment.authenticatedContext('owner').firestore();
    const other = environment.authenticatedContext('other').firestore();
    const reference = doc(owner, 'users/owner/transactions/tx-1');
    await assertSucceeds(setDoc(reference, transaction));
    await assertFails(getDoc(doc(other, 'users/owner/transactions/tx-1')));
  });

  it('validates competence entries and preserves their source identity', async () => {
    const owner = environment.authenticatedContext('owner').firestore();
    const reference = doc(owner, 'users/owner/competenceEntries/tx-1--001');
    await assertSucceeds(setDoc(reference, {
      transactionId: 'tx-1',
      description: 'Market',
      amount: 100,
      competenceDate: '2026-07-21',
      originalDate: '2026-07-21',
      paymentMethod: 'pix',
      type: 'expense',
      installmentNumber: 1,
      totalInstallments: 1,
    }));
    await assertFails(updateDoc(reference, { transactionId: 'tx-2' }));
  });

  it('prevents processed plans from returning to pending', async () => {
    const owner = environment.authenticatedContext('owner').firestore();
    const reference = doc(owner, 'users/owner/plannedExpenses/plan-1');
    await environment.withSecurityRulesDisabled(async context => {
      await setDoc(doc(context.firestore(), reference.path), {
        description: 'Rent', amount: 1000, dueDate: '2026-08-10', isRecurring: false,
        recurrenceInterval: 1, status: 'confirmed', type: 'expense', paymentMethod: 'pix', installments: 1,
      });
    });
    await assertFails(updateDoc(reference, { status: 'pending' }));
  });

  it('allows recurring plans with a valid recurrence day', async () => {
    const owner = environment.authenticatedContext('owner').firestore();
    const reference = doc(owner, 'users/owner/plannedExpenses/lunch-plan');

    await assertSucceeds(setDoc(reference, {
      description: 'Marmita Trabalho',
      amount: 105,
      dueDate: '2026-08-01',
      isRecurring: true,
      recurrenceInterval: 1,
      recurrenceDay: 1,
      status: 'pending',
      type: 'expense',
      paymentMethod: 'credit',
      installments: 1,
      category: 'Alimentação',
    }));
  });

  it('rejects recurrence days outside the calendar range', async () => {
    const owner = environment.authenticatedContext('owner').firestore();
    const invalidPlan = {
      description: 'Rent',
      amount: 1000,
      dueDate: '2026-08-31',
      isRecurring: true,
      recurrenceInterval: 1,
      status: 'pending',
      type: 'expense',
      paymentMethod: 'pix',
      installments: 1,
    };

    await assertFails(setDoc(
      doc(owner, 'users/owner/plannedExpenses/invalid-day-zero'),
      { ...invalidPlan, recurrenceDay: 0 },
    ));
    await assertFails(setDoc(
      doc(owner, 'users/owner/plannedExpenses/invalid-day-32'),
      { ...invalidPlan, recurrenceDay: 32 },
    ));
  });

  it('rejects import progress beyond the declared total', async () => {
    const owner = environment.authenticatedContext('owner').firestore();
    await assertFails(setDoc(doc(owner, 'users/owner/importJobs/import-1'), {
      fingerprint: 'import-1', status: 'writing', processed: 2, total: 1,
      updatedAt: new Date().toISOString(),
    }));
  });
});
