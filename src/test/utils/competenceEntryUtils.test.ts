import { describe, expect, it } from 'vitest';
import { PaymentMethod, TransactionType } from '../../enums/FinanceEnums';
import { buildCompetenceEntries } from '../../utils/competenceEntryUtils';

describe('buildCompetenceEntries', () => {
  it('materializes deterministic credit installments starting next month', () => {
    const entries = buildCompetenceEntries('tx-1', {
      description: 'Notebook', amount: 900, date: '2026-07-10', paymentMethod: PaymentMethod.CREDIT,
      installments: 3, type: TransactionType.EXPENSE,
    });
    expect(entries.map(entry => ({ id: entry.id, date: entry.competenceDate, amount: entry.amount }))).toEqual([
      { id: 'tx-1--001', date: '2026-08-10', amount: 300 },
      { id: 'tx-1--002', date: '2026-09-10', amount: 300 },
      { id: 'tx-1--003', date: '2026-10-10', amount: 300 },
    ]);
  });

  it('keeps boleto competence in the purchase month', () => {
    const entries = buildCompetenceEntries('tx-2', {
      description: 'Course', amount: 200, date: '2026-07-10', paymentMethod: PaymentMethod.BOLETO,
      installments: 2, type: TransactionType.EXPENSE,
    });
    expect(entries.map(entry => entry.competenceDate)).toEqual(['2026-07-10', '2026-08-10']);
  });
});
