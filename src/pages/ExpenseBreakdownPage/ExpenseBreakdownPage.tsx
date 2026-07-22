import { useId, useState } from 'react';
import { CalendarClock, CheckCircle2, ChevronDown, CreditCard, Equal, Plus, ReceiptText, Repeat2, WalletCards } from 'lucide-react';
import { PageHeader } from '../../components/shared/PageHeader';
import { PeriodContext } from '../../components/shared/PeriodContext';
import { TemporalFilterModal } from '../../components/shared/TemporalFilterModal';
import { PaymentMethod } from '../../enums/FinanceEnums';
import { useIsMobile } from '../../hooks/useIsMobile';
import { useLocale } from '../../store/LocaleContext';
import { getCategoryIcon } from '../../utils/categoryIcons';
import type { ExpenseBreakdownGroup, ExpenseBreakdownGroupKey, ExpenseBreakdownItem, ExpenseBreakdownVariant } from './hooks/useExpenseBreakdownViewModel';
import { useExpenseBreakdownViewModel } from './hooks/useExpenseBreakdownViewModel';
import { FinanceContentSkeleton } from '../../components/shared/FinanceContentSkeleton';
import './ExpenseBreakdownPage.css';

interface LedgerSectionProps {
  group: ExpenseBreakdownGroup;
}

const groupCopy: Record<ExpenseBreakdownGroupKey, { title: string; description: string; empty: string }> = {
  payments: { title: 'expenseBreakdown.payments', description: 'expenseBreakdown.paymentsDescription', empty: 'expenseBreakdown.paymentsEmpty' },
  credit: { title: 'expenseBreakdown.creditInstallments', description: 'expenseBreakdown.creditDescription', empty: 'expenseBreakdown.creditEmpty' },
  oneTime: { title: 'expenseBreakdown.oneTimePlans', description: 'expenseBreakdown.oneTimePlansDescription', empty: 'expenseBreakdown.oneTimePlansEmpty' },
  recurring: { title: 'expenseBreakdown.recurringPlans', description: 'expenseBreakdown.recurringPlansDescription', empty: 'expenseBreakdown.recurringPlansEmpty' },
  confirmed: { title: 'expenseBreakdown.confirmedForecast', description: 'expenseBreakdown.confirmedForecastDescription', empty: 'expenseBreakdown.confirmedForecastEmpty' },
  planned: { title: 'expenseBreakdown.plannedForecast', description: 'expenseBreakdown.plannedForecastDescription', empty: 'expenseBreakdown.plannedForecastEmpty' },
};

function GroupIcon({ kind }: { kind: ExpenseBreakdownGroupKey }) {
  if (kind === 'credit') return <CreditCard size={20} />;
  if (kind === 'recurring') return <Repeat2 size={20} />;
  if (kind === 'confirmed') return <CheckCircle2 size={20} />;
  if (kind === 'planned') return <CalendarClock size={20} />;
  if (kind === 'oneTime') return <ReceiptText size={20} />;
  return <WalletCards size={20} />;
}

function LedgerSection({ group }: LedgerSectionProps) {
  const { formatCurrency, locale, t } = useLocale();
  const isMobile = useIsMobile(769);
  const [isExpanded, setIsExpanded] = useState(true);
  const contentId = useId();
  const copy = groupCopy[group.key];
  const title = t(copy.title);
  const formatter = new Intl.DateTimeFormat(locale, { day: '2-digit', month: 'short' });
  const originalDateFormatter = new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit', year: 'numeric' });
  const getItemMeta = (item: ExpenseBreakdownItem) => {
    if (group.key === 'credit') return t('expenseBreakdown.creditEntryMeta', {
      current: item.installmentNumber,
      total: item.totalInstallments,
      date: originalDateFormatter.format(new Date(`${item.originalDate}T12:00:00`)),
    });
    const method = Object.values(PaymentMethod).includes(item.paymentMethod as PaymentMethod)
      ? t(`form.${item.paymentMethod}`)
      : item.paymentMethod;
    const category = item.category ? t(`categories.${item.category}`) : t('expenseBreakdown.uncategorized');
    if (group.key === 'recurring') return t('expenseBreakdown.recurringEntryMeta', {
      interval: item.recurrenceInterval ?? 1,
      day: item.recurrenceDay ?? new Date(`${item.originalDate}T12:00:00`).getDate(),
      category,
      method,
      reference: item.planReference ?? '—',
    });
    if (group.key === 'oneTime') return t('expenseBreakdown.plannedEntryMeta', {
      category,
      method,
    });
    if (group.key === 'confirmed' || group.key === 'planned') return t('expenseBreakdown.forecastMonthMeta');
    return t('expenseBreakdown.paymentEntryMeta', { method });
  };

  return (
    <section className={`glass-panel expense-ledger expense-ledger-${group.key}`}>
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
            <GroupIcon kind={group.key} />
          </span>
          <div>
            <h2>{title}</h2>
            <p>{t(copy.description)}</p>
          </div>
        </div>
        <strong>{formatCurrency(group.total)}</strong>
        <ChevronDown className="expense-ledger-chevron" size={20} aria-hidden="true" />
      </div>

      <div
        id={contentId}
        className={`expense-ledger-content ${!isMobile || isExpanded ? 'is-expanded' : 'is-collapsed'}`}
        aria-hidden={isMobile && !isExpanded}
      >
        <div className="expense-ledger-content-inner">
          {group.items.length === 0 ? (
            <div className="expense-ledger-empty">{t(copy.empty)}</div>
          ) : (
            <ul className="expense-ledger-list">
              {group.items.map(item => (
                <li key={item.id} className="expense-ledger-row">
                  <time dateTime={item.competenceDate} className="expense-ledger-date">
                    {formatter.format(new Date(`${item.competenceDate}T12:00:00`))}
                  </time>
                  <span className="expense-ledger-category" aria-hidden="true">
                    {item.category ? getCategoryIcon(item.category) : <ReceiptText size={18} />}
                  </span>
                  <div className="expense-ledger-copy">
                    <strong>{item.description}</strong>
                    <span>{getItemMeta(item)}</span>
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

interface ExpenseBreakdownPageProps {
  variant?: ExpenseBreakdownVariant;
}

export function ExpenseBreakdownPage({ variant = 'confirmed' }: ExpenseBreakdownPageProps) {
  const { state, actions } = useExpenseBreakdownViewModel(variant);
  const { formatCurrency, t } = useLocale();
  const [primaryGroup, secondaryGroup] = state.groups;

  if (state.isLoading) {
    return (
      <div className="animate-fade-in expense-breakdown-page">
        <PageHeader
          title={t(state.config.titleKey)}
          description={t(state.config.descriptionKey)}
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
        title={t(state.config.titleKey)}
        description={t(state.config.descriptionKey)}
        showBackButton
        forceShowBackButtonOnDesktop
        backFallback={state.backFallback}
      />

      <div className="page-section-stack">
        <PeriodContext label={state.filterLabel} onChange={actions.temporal.open} />

        <section className="glass-panel expense-reconciliation" aria-labelledby="expense-reconciliation-title">
          <div className="expense-reconciliation-total">
            <span id="expense-reconciliation-title">{t(state.config.totalLabelKey)}</span>
            <strong>{formatCurrency(state.total)}</strong>
            <p>{t(state.config.totalDescriptionKey)}</p>
          </div>

          <div className="expense-equation" aria-label={t('expenseBreakdown.equationLabel', {
            total: formatCurrency(state.total),
            first: formatCurrency(primaryGroup.total),
            second: formatCurrency(secondaryGroup.total),
            firstLabel: t(groupCopy[primaryGroup.key].title),
            secondLabel: t(groupCopy[secondaryGroup.key].title),
          })}>
            <div className="expense-equation-term">
              <span>{t(groupCopy[primaryGroup.key].title)}</span>
              <strong>{formatCurrency(primaryGroup.total)}</strong>
            </div>
            <Plus size={18} aria-hidden="true" />
            <div className="expense-equation-term">
              <span>{t(groupCopy[secondaryGroup.key].title)}</span>
              <strong>{formatCurrency(secondaryGroup.total)}</strong>
            </div>
            <Equal size={18} aria-hidden="true" />
            <div className="expense-equation-term expense-equation-result">
              <span>{t('expenseBreakdown.total')}</span>
              <strong>{formatCurrency(state.total)}</strong>
            </div>
          </div>

          <div className="expense-composition-rail" aria-hidden="true">
            <span className="expense-composition-payments" style={{ width: `${state.primaryShare}%` }} />
            <span className="expense-composition-credit" style={{ width: `${100 - state.primaryShare}%` }} />
          </div>
        </section>

        {state.total === 0 ? (
          <div className="glass-panel expense-breakdown-empty">
            <ReceiptText size={28} aria-hidden="true" />
            <h2>{t(state.config.emptyTitleKey)}</h2>
            <p>{t(state.config.emptyDescriptionKey)}</p>
          </div>
        ) : (
          <div className="expense-ledgers">
            <LedgerSection group={primaryGroup} />
            <LedgerSection group={secondaryGroup} />
          </div>
        )}
      </div>

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
