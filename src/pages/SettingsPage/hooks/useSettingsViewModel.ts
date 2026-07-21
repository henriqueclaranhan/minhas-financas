import { useState, useRef } from 'react';
import { useFinance } from '../../../store/FinanceContext';
import { useAuth } from '../../../store/AuthContext';
import { useLocale } from '../../../store/LocaleContext';
import type { ImportProgress } from '../../../services/DataSyncService';

export function useSettingsViewModel() {
  const { exportData, importData, clearData } = useFinance();
  const { logout } = useAuth();
  const { t } = useLocale();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<string>('');
  const [importProgress, setImportProgress] = useState<ImportProgress | null>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      try {
        const imported = await importData(content, setImportProgress);
        if (!imported) throw new Error('Import validation failed');
        setImportStatus(t('settings.importSuccess'));
        setTimeout(() => setImportStatus(''), 3000);
      } catch (err) {
        console.error(err);
        setImportStatus(t('settings.importError'));
        setTimeout(() => setImportStatus(''), 3000);
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  return {
    state: {
      importStatus,
      importProgress,
      fileInputRef
    },
    actions: {
      handleImportClick,
      handleFileChange,
      exportData,
      clearData,
      logout
    }
  };
}
