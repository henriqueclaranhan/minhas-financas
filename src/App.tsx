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
      { path: "/settings", element: <SettingsPage /> },
      { path: "/settings/profile", element: <ProfileSettingsPage /> },
      { path: "/privacidade", element: <PrivacyPolicyPage /> },
    ]
  }
]);

const unauthRouter = createBrowserRouter([
  { path: "/privacidade", element: <PrivacyPolicyPage /> },
  { path: "*", element: <AuthPage /> }
]);

import { ThemeProvider } from './store/ThemeContext';

function AppContent() {
  const { user } = useAuth();

  if (!user) {
    return (
      <ThemeProvider>
        <LocaleProvider>
          <RouterProvider router={unauthRouter} />
        </LocaleProvider>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <LocaleProvider>
        <FinanceProvider>
          <OnboardingWizard />
          <RouterProvider router={router} />
        </FinanceProvider>
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
