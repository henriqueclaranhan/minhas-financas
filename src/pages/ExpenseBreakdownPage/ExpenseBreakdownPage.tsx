import { useId, useState } from 'react';
import { ChevronDown, CreditCard, Equal, Plus, ReceiptText, WalletCards } from 'lucide-react';
import { PageHeader } from '../../components/shared/PageHeader';
import { PeriodContext } from '../../components/shared/PeriodContext';
import { TemporalFilterModal } from '../../components/shared/TemporalFilterModal';
import { PaymentMethod } from '../../enums/FinanceEnums';
import { useIsMobile } from '../../hooks/useIsMobile';
import { useLocale } from '../../store/LocaleContext';
import { getCategoryIcon } from '../../utils/categoryIcons';
import type { ExpenseBreakdownItem } from './hooks/useExpenseBreakdownViewModel';
import { useExpenseBreakdownViewModel } from './hooks/useExpenseBreakdownViewModel';
import { FinanceContentSkeleton } from '../../components/shared/FinanceContentSkeleton';
import './ExpenseBreakdownPage.css';

interface LedgerSectionProps {
  title: string;
  description: string;
  total: number;
  items: ExpenseBreakdownItem[];
  kind: 'payments' | 'credit';
}

function LedgerSection({ title, description, total, items, kind }: LedgerSectionProps) {
  const { formatCurrency, locale, t } = useLocale();
  const isMobile = useIsMobile(769);
  const [isExpanded, setIsExpanded] = useState(true);
  const contentId = useId();
  const formatter = new Intl.DateTimeFormat(locale, { day: '2-digit', month: 'short' });
  const originalDateFormatter = new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <section className={`glass-panel expense-ledger expense-ledger-${kind}`}>
      <div className="expense-ledger-header">
        {isMobile && (
          <button
            type="button"
            className="expense-ledger-toggle"
            aria-expanded={isExpanded}
            aria-controls={contentId}
            aria-label={t(isExpanded ? 'expenseBreakdown.collapseSection' : 'expenseBreakdown.expandSection', { section: title })}
            onClick={() => setIsExpanded(expanded => !expanded)}
          />
        )}
        <div className="expense-ledger-heading">
          <span className="expense-ledger-icon" aria-hidden="true">
            {kind === 'credit' ? <CreditCard size={20} /> : <WalletCards size={20} />}
          </span>
          <div>
            <h2>{title}</h2>
            <p>{description}</p>
          </div>
        </div>
        <strong>{formatCurrency(total)}</strong>
        <ChevronDown className="expense-ledger-chevron" size={20} aria-hidden="true" />
      </div>

      <div
        id={contentId}
        className={`expense-ledger-content ${!isMobile || isExpanded ? 'is-expanded' : 'is-collapsed'}`}
        aria-hidden={isMobile && !isExpanded}
      >
        <div className="expense-ledger-content-inner">
          {items.length === 0 ? (
            <div className="expense-ledger-empty">{t(`expenseBreakdown.${kind}Empty`)}</div>
          ) : (
            <ul className="expense-ledger-list">
              {items.map(item => (
                <li key={item.id} className="expense-ledger-row">
                  <time dateTime={item.competenceDate} className="expense-ledger-date">
                    {formatter.format(new Date(`${item.competenceDate}T12:00:00`))}
                  </time>
                  <span className="expense-ledger-category" aria-hidden="true">
                    {item.category ? getCategoryIcon(item.category) : <ReceiptText size={18} />}
                  </span>
                  <div className="expense-ledger-copy">
                    <strong>{item.description}</strong>
                    <span>
                      {kind === 'credit'
                        ? t('expenseBreakdown.creditEntryMeta', {
                            current: item.installmentNumber,
                            total: item.totalInstallments,
                            date: originalDateFormatter.format(new Date(`${item.originalDate}T12:00:00`)),
                          })
                        : t('expenseBreakdown.paymentEntryMeta', {
                            method: Object.values(PaymentMethod).includes(item.paymentMethod as PaymentMethod)
                              ? t(`form.${item.paymentMethod}`)
                              : item.paymentMethod,
                          })}
                    </span>
                  </div>
                  <strong className="expense-ledger-amount">{formatCurrency(item.amount)}</strong>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

export function ExpenseBreakdownPage() {
  const { state, actions } = useExpenseBreakdownViewModel();
  const { formatCurrency, t } = useLocale();

  if (state.isLoading) {
    return (
      <div className="animate-fade-in expense-breakdown-page">
        <PageHeader
          title={t('expenseBreakdown.title')}
          description={t('expenseBreakdown.description')}
          showBackButton
          forceShowBackButtonOnDesktop
        />
        <FinanceContentSkeleton variant="expenseBreakdown" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in expense-breakdown-page">
      <PageHeader
        title={t('expenseBreakdown.title')}
        description={t('expenseBreakdown.description')}
        showBackButton
        forceShowBackButtonOnDesktop
      />

      <div className="glass-panel temporal-filter-panel expense-breakdown-period">
        <PeriodContext label={state.filterLabel} onAdjust={actions.temporal.open} />
      </div>

      <section className="glass-panel expense-reconciliation" aria-labelledby="expense-reconciliation-title">
        <div className="expense-reconciliation-total">
          <span id="expense-reconciliation-title">{t('expenseBreakdown.totalLabel')}</span>
          <strong>{formatCurrency(state.total)}</strong>
          <p>{t('expenseBreakdown.totalDescription')}</p>
        </div>

        <div className="expense-equation" aria-label={t('expenseBreakdown.equationLabel', {
          total: formatCurrency(state.total),
          payments: formatCurrency(state.paymentsTotal),
          credit: formatCurrency(state.creditTotal),
        })}>
          <div className="expense-equation-term">
            <span>{t('expenseBreakdown.payments')}</span>
            <strong>{formatCurrency(state.paymentsTotal)}</strong>
          </div>
          <Plus size={18} aria-hidden="true" />
          <div className="expense-equation-term">
            <span>{t('expenseBreakdown.creditInstallments')}</span>
            <strong>{formatCurrency(state.creditTotal)}</strong>
          </div>
          <Equal size={18} aria-hidden="true" />
          <div className="expense-equation-term expense-equation-result">
            <span>{t('expenseBreakdown.total')}</span>
            <strong>{formatCurrency(state.total)}</strong>
          </div>
        </div>

        <div className="expense-composition-rail" aria-hidden="true">
          <span className="expense-composition-payments" style={{ width: `${state.paymentsShare}%` }} />
          <span className="expense-composition-credit" style={{ width: `${100 - state.paymentsShare}%` }} />
        </div>
      </section>

      {state.total === 0 ? (
        <div className="glass-panel expense-breakdown-empty">
          <ReceiptText size={28} aria-hidden="true" />
          <h2>{t('expenseBreakdown.emptyTitle')}</h2>
          <p>{t('expenseBreakdown.emptyDescription')}</p>
        </div>
      ) : (
        <div className="expense-ledgers">
          <LedgerSection
            title={t('expenseBreakdown.payments')}
            description={t('expenseBreakdown.paymentsDescription')}
            total={state.paymentsTotal}
            items={state.payments}
            kind="payments"
          />
          <LedgerSection
            title={t('expenseBreakdown.creditInstallments')}
            description={t('expenseBreakdown.creditDescription')}
            total={state.creditTotal}
            items={state.creditInstallments}
            kind="credit"
          />
        </div>
      )}

      <TemporalFilterModal
        isOpen={state.temporal.isOpen}
        onClose={() => actions.temporal.setIsOpen(false)}
        mode={state.temporal.tempMode}
        setMode={actions.temporal.setTempMode}
        month={state.temporal.tempMonth}
        setMonth={actions.temporal.setTempMonth}
        year={state.temporal.tempYear}
        setYear={actions.temporal.setTempYear}
        startDate={state.temporal.tempStartDate}
        setStartDate={actions.temporal.setTempStartDate}
        endDate={state.temporal.tempEndDate}
        setEndDate={actions.temporal.setTempEndDate}
        defaultYear={state.temporal.defaultYear}
        onReset={actions.temporal.reset}
        onApply={actions.temporal.apply}
      />
    </div>
  );
}
