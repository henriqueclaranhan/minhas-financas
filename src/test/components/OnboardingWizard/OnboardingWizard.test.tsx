import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OnboardingWizard } from '../../../components/OnboardingWizard/OnboardingWizard';
import { useOnboardingViewModel } from '../../../components/OnboardingWizard/hooks/useOnboardingViewModel';

vi.mock('../../../components/OnboardingWizard/hooks/useOnboardingViewModel');

describe('OnboardingWizard UI', () => {
  const mockActions = {
    setBalanceInput: vi.fn(),
    nextStep: vi.fn(),
    handleFinish: vi.fn(e => e.preventDefault()),
    skip: vi.fn()
  };

  const mockState = {
    currentStep: 0,
    balanceInput: '',
    shouldShow: true,
    steps: [
      { title: 'Step 1', description: 'Desc 1', iconType: 'rocket' },
      { title: 'Step 2', description: 'Desc 2', iconType: 'chart' }
    ]
  };

  beforeEach(() => {
    vi.mocked(useOnboardingViewModel).mockReturnValue({
      state: mockState,
      actions: mockActions
    } as any);
  });

  it('renders nothing when shouldShow is false', () => {
    vi.mocked(useOnboardingViewModel).mockReturnValue({
      state: { ...mockState, shouldShow: false },
      actions: mockActions
    } as any);
    const { container } = render(<OnboardingWizard />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders step 1 and advances on click', () => {
    render(<OnboardingWizard />);
    expect(screen.getByText('Step 1')).toBeInTheDocument();
    
    const continueBtn = screen.getByText('Continuar');
    fireEvent.click(continueBtn);
    expect(mockActions.nextStep).toHaveBeenCalled();
  });

  it('renders final step when currentStep reaches steps length', () => {
    vi.mocked(useOnboardingViewModel).mockReturnValue({
      state: { ...mockState, currentStep: 2 },
      actions: mockActions
    } as any);
    render(<OnboardingWizard />);
    
    expect(screen.getByText('Qual o seu saldo hoje?')).toBeInTheDocument();
    
    const startBtn = screen.getByText(/Começar Jornada/i);
    fireEvent.click(startBtn);
    expect(mockActions.handleFinish).toHaveBeenCalled();
    
    const skipBtn = screen.getByText('Pular por enquanto');
    fireEvent.click(skipBtn);
    expect(mockActions.skip).toHaveBeenCalled();
  });
});
