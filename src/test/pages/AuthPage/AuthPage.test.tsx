import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthPage } from '../../../pages/AuthPage/AuthPage';
import { useAuthViewModel } from '../../../pages/AuthPage/hooks/useAuthViewModel';
import { BrowserRouter } from 'react-router-dom';

vi.mock('../../../pages/AuthPage/hooks/useAuthViewModel');

describe('AuthPage UI', () => {
  const mockActions = {
    setIsLogin: vi.fn(),
    setIsReset: vi.fn(),
    setName: vi.fn(),
    setEmail: vi.fn(),
    setPassword: vi.fn(),
    setError: vi.fn(),
    setMessage: vi.fn(),
    handleSubmit: vi.fn(e => e.preventDefault())
  };

  const mockState = {
    isLogin: true,
    isReset: false,
    name: '',
    email: '',
    password: '',
    error: '',
    message: '',
    loading: false
  };

  beforeEach(() => {
    vi.mocked(useAuthViewModel).mockReturnValue({
      state: mockState,
      actions: mockActions
    } as any);
  });

  const renderWithRouter = (ui: React.ReactElement) => {
    return render(<BrowserRouter>{ui}</BrowserRouter>);
  };

  it('renders login form by default', () => {
    renderWithRouter(<AuthPage />);
    expect(screen.getByText('Bem-vindo de volta')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Seu e-mail')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Sua senha')).toBeInTheDocument();
  });

  it('calls handleSubmit on form submit', () => {
    renderWithRouter(<AuthPage />);
    const emailInput = screen.getByPlaceholderText('Seu e-mail');
    const passwordInput = screen.getByPlaceholderText('Sua senha');
    
    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
    fireEvent.change(passwordInput, { target: { value: '123456' } });
    
    const submitBtn = screen.getByText('Acessar Plataforma');
    fireEvent.submit(submitBtn.closest('form') as HTMLFormElement);
    expect(mockActions.handleSubmit).toHaveBeenCalled();
  });

  it('switches to signup', () => {
    renderWithRouter(<AuthPage />);
    const signupBtn = screen.getByText('Cadastre-se grátis');
    fireEvent.click(signupBtn);
    expect(mockActions.setIsLogin).toHaveBeenCalledWith(false);
  });
});
