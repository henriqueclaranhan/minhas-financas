import { Rocket, BarChart3, ShieldCheck, ChevronRight, Check } from 'lucide-react';
import { CurrencyInput } from '../CurrencyInput';
import { useOnboardingViewModel } from './hooks/useOnboardingViewModel';
import { useLocale } from '../../store/LocaleContext';
import './OnboardingWizard.css';

export function OnboardingWizard() {
  const { state, actions } = useOnboardingViewModel();
  const { t } = useLocale();

  if (!state.shouldShow) return null;

  const renderIcon = (type: string) => {
    switch (type) {
      case 'rocket': return <Rocket size={64} color="var(--clr-primary)" />;
      case 'chart': return <BarChart3 size={64} color="var(--clr-warning)" />;
      case 'shield': return <ShieldCheck size={64} color="var(--clr-success)" />;
      default: return null;
    }
  };

  return (
    <div className="wizard-overlay">
      <div className="wizard-content animate-fade-in">
        <div className="wizard-body">
          {state.currentStep < state.steps.length ? (
            <div className="wizard-slide animate-fade-in" key={state.currentStep}>
              <div className="wizard-icon-wrapper hover-lift">
                {renderIcon(state.steps[state.currentStep].iconType)}
              </div>
              <h2>{state.steps[state.currentStep].title}</h2>
              <p>{state.steps[state.currentStep].description}</p>
            </div>
          ) : (
            <div className="wizard-slide animate-fade-in" key="final">
              <div className="wizard-icon-wrapper">
                <span className="wizard-emoji">💰</span>
              </div>
              <h2>{t('onboarding.finalTitle')}</h2>
              <p>{t('onboarding.finalDesc')}</p>
              
              <form onSubmit={actions.handleFinish} className="wizard-form">
                <div className="form-group wizard-form-group">
                  <label className="form-label">{t('onboarding.currentBalance')}</label>
                  <CurrencyInput 
                    value={state.balanceInput}
                    onChangeValue={actions.setBalanceInput}
                    className="form-input wizard-form-input"
                    autoFocus
                  />
                </div>
                <button type="submit" className="btn btn-primary hover-glow wizard-btn-primary-form">
                  {t('onboarding.startJourney')} <Check size={20} className="wizard-btn-primary-icon" />
                </button>
                <button 
                  type="button" 
                  onClick={actions.skip} 
                  className="btn wizard-btn-secondary" 
                >
                  {t('onboarding.skip')}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Navigation & Progress */}
        {state.currentStep < state.steps.length && (
          <div className="wizard-footer">
            <div className="wizard-progress">
              {Array.from({ length: state.steps.length + 1 }).map((_, i) => (
                <div key={i} className={`wizard-dot ${i === state.currentStep ? 'active' : ''}`} />
              ))}
            </div>
            <button onClick={actions.nextStep} className="btn btn-primary hover-glow wizard-btn-primary">
              {t('onboarding.continue')} <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
