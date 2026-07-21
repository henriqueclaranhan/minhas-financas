

import { Download, Upload, Trash2, Moon, LogOut, User as UserIcon, ChevronRight, Languages, Banknote, Shield } from 'lucide-react';
import { useSettingsViewModel } from './hooks/useSettingsViewModel';
import { PageHeader } from '../../components/shared/PageHeader';
import { CustomSelect } from '../../components/shared/CustomSelect/CustomSelect';
import { useNavigate } from 'react-router-dom';
import { CURRENCY_LABELS, LOCALE_LABELS, useLocale } from '../../store/LocaleContext';
import './SettingsPage.css';

import { useTheme } from '../../store/ThemeContext';

export function SettingsPage() {

  const { state, actions } = useSettingsViewModel();
  const navigate = useNavigate();
  const { currency, locale, setCurrency, setLocale, t } = useLocale();
  const { theme, setTheme } = useTheme();

  return (
    <div className="animate-fade-in">
      <PageHeader 
        title={t('settings.title')}
        showBackButton={true}
      />
        
        {state.importStatus && (
          <div className={`p-md mb-lg settings-status ${state.importStatus === t('settings.importError') ? 'error' : 'success'}`}>
            {state.importStatus}
          </div>
        )}
        {state.importProgress && state.importProgress.status !== 'completed' && (
          <div className="settings-import-progress" aria-live="polite">
            <div className="settings-import-progress-copy">
              <span>{t('settings.importProgress')}</span>
              <strong>{state.importProgress.processed} / {state.importProgress.total}</strong>
            </div>
            <progress value={state.importProgress.processed} max={Math.max(state.importProgress.total, 1)} />
          </div>
        )}

        <div className="glass-panel p-0 settings-panel">
          
          <div className="settings-item settings-preferences-item">
            <div className="settings-preference-copy">
              <div className="flex items-center gap-md">
                <div className="settings-icon-wrapper alt">
                  <Moon size={20} color="var(--clr-text-primary)" />
                </div>
                <div>
                  <div className="font-medium settings-item-title">{t('settings.appearance')}</div>
                  <div className="settings-item-desc text-secondary">{t('settings.themeDescription')}</div>
                </div>
              </div>
            </div>
            <CustomSelect
              className="settings-select"
              value={theme}
              onChange={(val) => setTheme(val as any)}
              options={[
                { value: 'light', label: t('settings.themeLight') },
                { value: 'dark', label: t('settings.themeDark') },
                { value: 'system', label: t('settings.themeSystem') },
              ]}
            />
          </div>

          <div className="settings-item settings-preferences-item">
            <div className="settings-preference-copy">
              <div className="flex items-center gap-md">
                <div className="settings-icon-wrapper primary">
                  <Languages size={20} color="var(--clr-primary)" />
                </div>
                <div>
                  <div className="font-medium settings-item-title">{t('settings.language')}</div>
                  <div className="settings-item-desc text-secondary">{t('settings.languageDescription')}</div>
                </div>
              </div>
            </div>
            <CustomSelect
              className="settings-select"
              value={locale}
              onChange={(val) => setLocale(val as keyof typeof LOCALE_LABELS)}
              options={Object.entries(LOCALE_LABELS).map(([val, label]) => ({ value: val, label }))}
            />
          </div>

          <div className="settings-item settings-preferences-item">
            <div className="settings-preference-copy">
              <div className="flex items-center gap-md">
                <div className="settings-icon-wrapper success">
                  <Banknote size={20} color="#fff" />
                </div>
                <div>
                  <div className="font-medium settings-item-title">{t('settings.currency')}</div>
                  <div className="settings-item-desc text-secondary">{t('settings.currencyDescription')}</div>
                </div>
              </div>
            </div>
            <CustomSelect
              className="settings-select"
              value={currency}
              onChange={(val) => setCurrency(val as keyof typeof CURRENCY_LABELS)}
              options={Object.entries(CURRENCY_LABELS).map(([val, label]) => ({ value: val, label }))}
            />
          </div>

          <div 
            className="settings-item"
            onClick={() => navigate('/settings/profile')}
            style={{ cursor: 'pointer' }}
          >
            <div className="flex items-center justify-between" style={{ width: '100%' }}>
              <div className="flex items-center gap-md">
                <div className="settings-icon-wrapper" style={{ background: 'var(--clr-primary-glow)' }}>
                  <UserIcon size={20} color="var(--clr-primary)" />
                </div>
                <div>
                  <div className="font-medium settings-item-title">{t('settings.profile')}</div>
                  <div className="settings-item-desc text-secondary">{t('settings.profileDescription')}</div>
                </div>
              </div>
              <ChevronRight size={20} color="var(--clr-text-secondary)" />
            </div>
          </div>

          <div 
            className="settings-item"
            onClick={actions.exportData}
          >
            <div className="flex items-center gap-md">
              <div className="settings-icon-wrapper primary">
                <Download size={20} color="var(--clr-primary)" />
              </div>
              <div>
                <div className="font-medium settings-item-title text-primary">{t('settings.export')}</div>
                <div className="settings-item-desc text-secondary">{t('settings.exportDescription')}</div>
              </div>
            </div>
          </div>

          <div 
            className="settings-item"
            onClick={actions.handleImportClick}
          >
            <div className="flex items-center gap-md">
              <div className="settings-icon-wrapper success">
                <Upload size={20} color="#fff" />
              </div>
              <div>
                <div className="font-medium settings-item-title">{t('settings.import')}</div>
                <div className="settings-item-desc text-secondary">{t('settings.importDescription')}</div>
              </div>
            </div>
          </div>
          <input 
            type="file" 
            accept=".json"
            ref={state.fileInputRef}
            style={{ display: 'none' }}
            onChange={actions.handleFileChange}
          />

          <div 
            className="settings-item"
            onClick={actions.clearData}
          >
            <div className="flex items-center gap-md">
              <div className="settings-icon-wrapper danger">
                <Trash2 size={20} color="#fff" />
              </div>
              <div>
                <div className="font-medium settings-item-title text-danger">{t('settings.clear')}</div>
                <div className="settings-item-desc text-secondary">{t('settings.clearDescription')}</div>
              </div>
            </div>
          </div>

          <div 
            className="settings-item"
            onClick={() => navigate('/privacidade')}
            style={{ cursor: 'pointer' }}
          >
            <div className="flex items-center justify-between" style={{ width: '100%' }}>
              <div className="flex items-center gap-md">
                <div className="settings-icon-wrapper primary">
                  <Shield size={20} color="var(--clr-primary)" />
                </div>
                <div>
                  <div className="font-medium settings-item-title">Política de Privacidade</div>
                  <div className="settings-item-desc text-secondary">Termos de uso e proteção de dados</div>
                </div>
              </div>
              <ChevronRight size={20} color="var(--clr-text-secondary)" />
            </div>
          </div>

          <div 
            className="settings-item no-border"
            onClick={actions.logout}
          >
            <div className="flex items-center gap-md">
              <div className="settings-icon-wrapper alt">
                <LogOut size={20} color="var(--clr-text-primary)" />
              </div>
              <div>
                <div className="font-medium settings-item-title">{t('settings.logout')}</div>
                <div className="settings-item-desc text-secondary">{t('settings.logoutDescription')}</div>
              </div>
            </div>
          </div>

        </div>
    </div>
  );
}
