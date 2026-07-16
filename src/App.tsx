import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Layout } from './components/Layout';
import { FinanceProvider } from './store/FinanceContext';
import { AuthProvider, useAuth } from './store/AuthContext';
import { TransactionsPage } from './pages/TransactionsPage';
import { DashboardPage } from './pages/DashboardPage';
import { PlannedExpensesPage } from './pages/PlannedExpensesPage';
import { CreditCardPage } from './pages/CreditCardPage';
import { SettingsPage } from './pages/SettingsPage';
import { AuthPage } from './pages/AuthPage';
import { OnboardingWizard } from './components/OnboardingWizard';
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
      { path: "/settings", element: <SettingsPage /> },
    ]
  }
]);

function AppContent() {
  const { user } = useAuth();

  if (!user) {
    return <AuthPage />;
  }

  return (
    <FinanceProvider>
      <OnboardingWizard />
      <RouterProvider router={router} />
    </FinanceProvider>
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
