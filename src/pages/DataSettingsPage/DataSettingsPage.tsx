import { Download, Trash2, Upload } from 'lucide-react';
import { PageHeader } from '../../components/shared/PageHeader';
import { useLocale } from '../../store/LocaleContext';
import { useSettingsViewModel } from '../SettingsPage/hooks/useSettingsViewModel';
import '../SettingsPage/SettingsPage.css';
import './DataSettingsPage.css';

export function DataSettingsPage() {
  const { t } = useLocale();
  const { state, actions } = useSettingsViewModel();

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={t('settings.data')}
        description={t('settings.dataDescription')}
        showBackButton={true}
        forceShowBackButtonOnDesktop={true}
        backFallback="/settings"
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
        <div className="settings-item" onClick={actions.exportData}>
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

        <div className="settings-item" onClick={actions.handleImportClick}>
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
          className="data-settings-file-input"
          onChange={actions.handleFileChange}
        />

        <div className="settings-item no-border" onClick={actions.clearData}>
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
      </div>
    </div>
  );
}
