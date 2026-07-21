import { describe, expect, it } from 'vitest';
import { MAX_IMPORT_BYTES, validateImportData } from '../../services/dataImportValidation';

const validBackup = {
  initialBalance: 100,
  transactions: [{
    id: 'tx-1', description: 'Groceries', amount: 42.5, paymentMethod: 'pix',
    installments: 1, date: '2026-07-20', type: 'expense', category: 'food',
  }],
  plannedExpenses: [{
    id: 'plan-1', description: 'Rent', amount: 1000, dueDate: '2026-08-10',
    isRecurring: true, recurrenceInterval: 1, status: 'pending', type: 'expense',
    paymentMethod: 'boleto', installments: 1, category: 'housing',
  }],
};

describe('validateImportData', () => {
  it('normalizes a valid backup', () => {
    const result = validateImportData(JSON.stringify(validBackup));
    expect(result.transactions).toHaveLength(1);
    expect(result.plannedExpenses).toHaveLength(1);
  });

  it.each([
    ['unknown fields', { ...validBackup.transactions[0], injected: true }],
    ['invalid dates', { ...validBackup.transactions[0], date: '2026-02-30' }],
    ['negative amounts', { ...validBackup.transactions[0], amount: -1 }],
    ['excessive installments', { ...validBackup.transactions[0], installments: 361 }],
    ['unknown enums', { ...validBackup.transactions[0], paymentMethod: 'card' }],
    ['unsafe IDs', { ...validBackup.transactions[0], id: '../other-user' }],
  ])('rejects %s', (_label, transaction) => {
    expect(() => validateImportData(JSON.stringify({ ...validBackup, transactions: [transaction] }))).toThrow();
  });

  it('rejects duplicate IDs before writing', () => {
    expect(() => validateImportData(JSON.stringify({
      ...validBackup,
      transactions: [validBackup.transactions[0], validBackup.transactions[0]],
    }))).toThrow(/duplicate document ID/);
  });

  it('rejects files above the configured size limit', () => {
    expect(() => validateImportData(' '.repeat(MAX_IMPORT_BYTES + 1))).toThrow(/5 MB/);
  });
});
