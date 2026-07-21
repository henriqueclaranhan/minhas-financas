import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Layout } from './components/Layout';
import { FinanceProvider } from './store/FinanceContext';
import { AuthProvider, useAuth } from './store/AuthContext';
import { LocaleProvider } from './store/LocaleContext';
import { TransactionsPage } from './pages/TransactionsPage';
import { DashboardPage } from './pages/DashboardPage';
import { PlannedExpensesPage } from './pages/PlannedExpensesPage';
import { CreditCardPage } from './pages/CreditCardPage';
import { SettingsPage } from './pages/SettingsPage';
import { AuthPage } from './pages/AuthPage';
import { ForecastPage } from './pages/ForecastPage';
import { ProfileSettingsPage } from './pages/ProfileSettingsPage/ProfileSettingsPage';
import { OnboardingWizard } from './components/OnboardingWizard';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage/PrivacyPolicyPage';
import { CategoryExpensesPage } from './pages/CategoryExpensesPage';
import { NotFoundPage } from './pages/NotFoundPage/NotFoundPage';
import { ExpenseBreakdownPage } from './pages/ExpenseBreakdownPage';
import { SeoManager } from './components/SeoManager';
import { ToastProvider } from './store/ToastContext';
import './App.css';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { path: "/", element: <DashboardPage /> },
      { path: "/transactions", element: <TransactionsPage /> },
      { path: "/planned", element: <PlannedExpensesPage /> },
      { path: "/credit", element: <CreditCardPage /> },
      { path: "/forecast", element: <ForecastPage /> },
      { path: "/categories", element: <CategoryExpensesPage /> },
      { path: "/expenses/breakdown", element: <ExpenseBreakdownPage /> },
      { path: "/settings", element: <SettingsPage /> },
      { path: "/settings/profile", element: <ProfileSettingsPage /> },
      { path: "/privacidade", element: <PrivacyPolicyPage /> },
      { path: "*", element: <NotFoundPage /> },
    ]
  }
]);

const unauthRouter = createBrowserRouter([
  { path: "/", element: <AuthPage /> },
  { path: "/privacidade", element: <PrivacyPolicyPage /> },
  { path: "*", element: <NotFoundPage /> }
]);

import { ThemeProvider } from './store/ThemeContext';

function AppContent() {
  const { user } = useAuth();

  if (!user) {
    return (
      <ThemeProvider>
        <LocaleProvider>
          <ToastProvider>
            <SeoManager isAuthenticated={false} />
            <RouterProvider router={unauthRouter} />
          </ToastProvider>
        </LocaleProvider>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <LocaleProvider>
        <ToastProvider>
          <SeoManager isAuthenticated={true} />
          <FinanceProvider>
            <OnboardingWizard />
            <RouterProvider router={router} />
          </FinanceProvider>
        </ToastProvider>
      </LocaleProvider>
    </ThemeProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
