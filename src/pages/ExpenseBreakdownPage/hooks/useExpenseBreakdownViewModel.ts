import { useEffect, useMemo, useRef } from 'react';
import { addMonths, format, parseISO, startOfMonth } from 'date-fns';
import { useSearchParams } from 'react-router-dom';
import { ExpenseStatus, PaymentMethod, TransactionType } from '../../../enums/FinanceEnums';
import { TemporalFilterMode } from '../../../enums/UIEnums';
import { useCompetenceEntries } from '../../../hooks/useCompetenceEntries';
import { useTemporalFilter } from '../../../hooks/useTemporalFilter';
import { useFinance } from '../../../store/FinanceContext';
import { useLocale } from '../../../store/LocaleContext';
import type { CompetenceEntry, Transaction } from '../../../types';
import {
  buildExpenseBreakdownPath,
  getExpenseBreakdownIsoPeriod,
  parseExpenseBreakdownPeriod,
} from '../../../utils/expenseBreakdownUtils';
import { aggregateCompetenceEntries } from '../../../utils/financeAggregationUtils';
import { expandPlannedExpenses } from '../../../utils/financeUtils';
import { calculateProjections } from '../../../utils/projectionUtils';
import { getPlanReference } from '../../../utils/planReferenceUtils';

export type ExpenseBreakdownVariant = 'confirmed' | 'planned' | 'forecast';
export type ExpenseBreakdownGroupKey = 'payments' | 'credit' | 'oneTime' | 'recurring' | 'confirmed' | 'planned';

export interface ExpenseBreakdownItem {
  id: string;
  originalId?: string;
  description: string;
  amount: number;
  competenceDate: string;
  originalDate: string;
  paymentMethod: Transaction['paymentMethod'];
  category?: string;
  installmentNumber: number;
  totalInstallments: number;
  recurrenceInterval?: number;
  recurrenceDay?: number;
  planReference?: string;
}

export interface ExpenseBreakdownGroup {
  key: ExpenseBreakdownGroupKey;
  total: number;
  items: ExpenseBreakdownItem[];
}

const variantConfig = {
  confirmed: {
    pathname: '/expenses/breakdown',
    parentPath: '/transactions',
    titleKey: 'expenseBreakdown.title',
    descriptionKey: 'expenseBreakdown.description',
    totalLabelKey: 'expenseBreakdown.totalLabel',
    totalDescriptionKey: 'expenseBreakdown.totalDescription',
    emptyTitleKey: 'expenseBreakdown.emptyTitle',
    emptyDescriptionKey: 'expenseBreakdown.emptyDescription',
  },
  planned: {
    pathname: '/planned/breakdown',
    parentPath: '/planned',
    titleKey: 'expenseBreakdown.plannedTitle',
    descriptionKey: 'expenseBreakdown.plannedDescription',
    totalLabelKey: 'expenseBreakdown.plannedTotalLabel',
    totalDescriptionKey: 'expenseBreakdown.plannedTotalDescription',
    emptyTitleKey: 'expenseBreakdown.plannedEmptyTitle',
    emptyDescriptionKey: 'expenseBreakdown.plannedEmptyDescription',
  },
  forecast: {
    pathname: '/forecast/breakdown',
    parentPath: '/forecast',
    titleKey: 'expenseBreakdown.forecastTitle',
    descriptionKey: 'expenseBreakdown.forecastDescription',
    totalLabelKey: 'expenseBreakdown.forecastTotalLabel',
    totalDescriptionKey: 'expenseBreakdown.forecastTotalDescription',
    emptyTitleKey: 'expenseBreakdown.forecastEmptyTitle',
    emptyDescriptionKey: 'expenseBreakdown.forecastEmptyDescription',
  },
} as const;

function toBreakdownItem(entry: CompetenceEntry): ExpenseBreakdownItem {
  return {
    id: entry.id ?? `${entry.description}-${entry.competenceDate}`,
    originalId: entry.transactionId,
    description: entry.description,
    amount: entry.amount,
    competenceDate: entry.competenceDate,
    originalDate: entry.originalDate,
    paymentMethod: entry.paymentMethod,
    category: entry.category,
    installmentNumber: entry.installmentNumber,
    totalInstallments: entry.totalInstallments,
  };
}

function parseBooleanParam(value: string | null, fallback: boolean) {
  if (value === 'false') return false;
  if (value === 'true') return true;
  return fallback;
}

export function useExpenseBreakdownViewModel(variant: ExpenseBreakdownVariant = 'confirmed') {
  const { transactions, plannedExpenses = [], initialBalance, isLoading: isFinanceLoading } = useFinance();
  const { locale } = useLocale();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialParams = useRef(new URLSearchParams(searchParams)).current;
  const initialPeriod = useRef(parseExpenseBreakdownPeriod(initialParams)).current;
  const temporal = useTemporalFilter(TemporalFilterMode.MONTH, initialPeriod);
  const config = variantConfig[variant];

  const context = useRef({
    search: initialParams.get('search') ?? '',
    category: initialParams.get('category') ?? 'all',
    method: initialParams.get('method') ?? 'all',
    includePlannedIncome: parseBooleanParam(initialParams.get('plannedIncome'), true),
    includePlannedExpense: parseBooleanParam(initialParams.get('plannedExpense'), true),
  }).current;

  const activePeriod = useMemo(() => ({
    mode: temporal.state.mode,
    month: temporal.state.month,
    year: temporal.state.year,
    startDate: temporal.state.startDate,
    endDate: temporal.state.endDate,
  }), [
    temporal.state.endDate,
    temporal.state.mode,
    temporal.state.month,
    temporal.state.startDate,
    temporal.state.year,
  ]);
  const period = getExpenseBreakdownIsoPeriod(activePeriod);

  useEffect(() => {
    const params: Record<string, string | boolean | undefined> = variant === 'planned'
      ? { search: context.search, category: context.category, method: context.method }
      : variant === 'forecast'
        ? {
            plannedIncome: context.includePlannedIncome ? undefined : false,
            plannedExpense: context.includePlannedExpense ? undefined : false,
          }
        : {};
    const nextQuery = buildExpenseBreakdownPath(activePeriod, { pathname: config.pathname, params }).split('?')[1];
    if (searchParams.toString() !== nextQuery) setSearchParams(nextQuery, { replace: true });
  }, [activePeriod, config.pathname, context, searchParams, setSearchParams, variant]);

  const competenceStartDate = variant === 'forecast' ? '0001-01-01' : period.startDate;
  const { entries: competenceEntries, isLoading: isCompetenceLoading } = useCompetenceEntries(
    competenceStartDate,
    period.endDate,
    transactions,
  );

  const selectedCompetenceEntries = useMemo(
    () => competenceEntries.filter(entry => entry.competenceDate >= period.startDate && entry.competenceDate <= period.endDate),
    [competenceEntries, period.endDate, period.startDate],
  );
  const confirmedItems = useMemo(() => selectedCompetenceEntries
    .filter(entry => entry.type === TransactionType.EXPENSE)
    .map(toBreakdownItem)
    .sort((a, b) => b.competenceDate.localeCompare(a.competenceDate)), [selectedCompetenceEntries]);
  const confirmedAggregate = useMemo(
    () => aggregateCompetenceEntries(selectedCompetenceEntries),
    [selectedCompetenceEntries],
  );

  const confirmedGroups = useMemo<ExpenseBreakdownGroup[]>(() => [
    {
      key: 'payments',
      items: confirmedItems.filter(item => item.paymentMethod !== PaymentMethod.CREDIT),
      total: confirmedAggregate.directExpense,
    },
    {
      key: 'credit',
      items: confirmedItems.filter(item => item.paymentMethod === PaymentMethod.CREDIT),
      total: confirmedAggregate.creditExpense,
    },
  ], [confirmedAggregate.creditExpense, confirmedAggregate.directExpense, confirmedItems]);

  const plannedGroups = useMemo<ExpenseBreakdownGroup[]>(() => {
    const recurringIds = new Set(plannedExpenses.filter(item => item.isRecurring).map(item => item.id));
    const items = expandPlannedExpenses(plannedExpenses, period)
      .filter(item => item.status === ExpenseStatus.PENDING)
      .filter(item => item.type === TransactionType.EXPENSE || !item.type)
      .filter(item => !context.search || item.description.toLowerCase().includes(context.search.toLowerCase()))
      .filter(item => context.category === 'all' || item.category === context.category)
      .filter(item => context.method === 'all' || item.paymentMethod === context.method)
      .map<ExpenseBreakdownItem>(item => {
        const originalId = item.originalId ?? item.id ?? `${item.description}-${item.dueDate}`;
        return {
          id: item.id ?? originalId,
          originalId,
          description: item.description,
          amount: item.amount,
          competenceDate: item.dueDate,
          originalDate: item.dueDate,
          paymentMethod: item.paymentMethod ?? PaymentMethod.PIX,
          category: item.category,
          installmentNumber: item.installmentNumber ?? 1,
          totalInstallments: item.totalInstallments ?? item.installments ?? 1,
          recurrenceInterval: item.recurrenceInterval,
          recurrenceDay: item.recurrenceDay,
          planReference: recurringIds.has(originalId) ? getPlanReference(originalId) : undefined,
        };
      })
      .sort((a, b) => a.competenceDate.localeCompare(b.competenceDate));
    const isRecurring = (item: ExpenseBreakdownItem) => recurringIds.has(item.originalId);
    const oneTime = items.filter(item => !isRecurring(item));
    const recurring = items.filter(isRecurring);
    return [
      { key: 'oneTime', items: oneTime, total: oneTime.reduce((sum, item) => sum + item.amount, 0) },
      { key: 'recurring', items: recurring, total: recurring.reduce((sum, item) => sum + item.amount, 0) },
    ];
  }, [context.category, context.method, context.search, period, plannedExpenses]);

  const forecastGroups = useMemo<ExpenseBreakdownGroup[]>(() => {
    const projectionOptions = {
      transactions,
      plannedExpenses,
      initialBalance: initialBalance ?? 0,
      startDate: parseISO(period.startDate),
      endDate: parseISO(period.endDate),
      includePlannedIncome: context.includePlannedIncome,
      includePlannedExpense: context.includePlannedExpense,
      locale,
      competenceEntries,
      competenceAggregate: aggregateCompetenceEntries(competenceEntries),
    };
    const totalProjection = calculateProjections(projectionOptions);
    const confirmedProjection = calculateProjections({
      ...projectionOptions,
      includePlannedIncome: false,
      includePlannedExpense: false,
    });
    const startMonth = startOfMonth(parseISO(period.startDate));
    const confirmed: ExpenseBreakdownItem[] = [];
    const planned: ExpenseBreakdownItem[] = [];
    totalProjection.data.forEach((month, index) => {
      const competenceDate = format(addMonths(startMonth, index), 'yyyy-MM-dd');
      const confirmedAmount = confirmedProjection.data[index]?.expense ?? 0;
      const plannedAmount = Math.max(0, month.expense - confirmedAmount);
      if (confirmedAmount > 0) confirmed.push({
        id: `forecast-confirmed-${competenceDate}`,
        description: month.name,
        amount: confirmedAmount,
        competenceDate,
        originalDate: competenceDate,
        paymentMethod: '',
        installmentNumber: 1,
        totalInstallments: 1,
      });
      if (plannedAmount > 0) planned.push({
        id: `forecast-planned-${competenceDate}`,
        description: month.name,
        amount: plannedAmount,
        competenceDate,
        originalDate: competenceDate,
        paymentMethod: '',
        installmentNumber: 1,
        totalInstallments: 1,
      });
    });
    return [
      { key: 'confirmed', items: confirmed, total: confirmed.reduce((sum, item) => sum + item.amount, 0) },
      { key: 'planned', items: planned, total: planned.reduce((sum, item) => sum + item.amount, 0) },
    ];
  }, [competenceEntries, context.includePlannedExpense, context.includePlannedIncome, initialBalance, locale, period.endDate, period.startDate, plannedExpenses, transactions]);

  const groups = variant === 'planned' ? plannedGroups : variant === 'forecast' ? forecastGroups : confirmedGroups;
  const total = groups.reduce((sum, group) => sum + group.total, 0);
  const parentParams = new URLSearchParams(searchParams);
  ['plannedIncome', 'plannedExpense'].forEach(key => parentParams.delete(key));
  const backFallback = `${config.parentPath}${parentParams.size ? `?${parentParams.toString()}` : ''}`;

  return {
    state: {
      variant,
      config,
      backFallback,
      groups,
      total,
      primaryShare: total > 0 ? (groups[0].total / total) * 100 : 0,
      filterLabel: temporal.state.label,
      temporal: temporal.state,
      isLoading: isFinanceLoading || (variant !== 'planned' && isCompetenceLoading),
      // Backward-compatible fields retained for focused aggregation consumers.
      payments: confirmedGroups[0].items,
      creditInstallments: confirmedGroups[1].items,
      paymentsTotal: confirmedGroups[0].total,
      creditTotal: confirmedGroups[1].total,
      paymentsShare: total > 0 ? (confirmedGroups[0].total / total) * 100 : 0,
    },
    actions: {
      temporal: temporal.actions,
    },
  };
}
