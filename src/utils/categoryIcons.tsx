import { 
  Utensils, Car, Home, HeartPulse, GraduationCap, 
  Gamepad2, ShoppingBag, Dog, Shirt, TrendingUp, 
  HelpCircle, DollarSign, Gift, Wallet, CreditCard,
  Landmark, Banknote, QrCode
} from 'lucide-react';
import { ExpenseCategory, IncomeCategory, PaymentMethod } from '../enums/FinanceEnums';

export const getCategoryIcon = (category: string) => {
  switch (category) {
    case ExpenseCategory.FOOD: return <Utensils size={18} />;
    case ExpenseCategory.TRANSPORT: return <Car size={18} />;
    case ExpenseCategory.HOUSING: return <Home size={18} />;
    case ExpenseCategory.HEALTH: return <HeartPulse size={18} />;
    case ExpenseCategory.EDUCATION: return <GraduationCap size={18} />;
    case ExpenseCategory.ENTERTAINMENT: return <Gamepad2 size={18} />;
    case ExpenseCategory.SHOPPING: return <ShoppingBag size={18} />;
    case ExpenseCategory.PETS: return <Dog size={18} />;
    case ExpenseCategory.CLOTHING: return <Shirt size={18} />;
    
    case IncomeCategory.SALARY: return <DollarSign size={18} />;
    case IncomeCategory.INVESTMENT: return <TrendingUp size={18} />;
    case IncomeCategory.GIFT: return <Gift size={18} />;
    case IncomeCategory.OTHERS: return <Wallet size={18} />;
    
    default: return <HelpCircle size={18} />;
  }
};

export const getPaymentMethodIcon = (method: string) => {
  switch (method) {
    case PaymentMethod.CREDIT: return <CreditCard size={18} />;
    case PaymentMethod.DEBIT: return <CreditCard size={18} />;
    case PaymentMethod.PIX: return <QrCode size={18} />;
    case PaymentMethod.CASH: return <Banknote size={18} />;
    case PaymentMethod.TRANSFER: return <Landmark size={18} />;
    default: return <CreditCard size={18} />;
  }
};
