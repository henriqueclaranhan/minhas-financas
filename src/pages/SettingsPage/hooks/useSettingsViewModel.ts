import { useState, useRef } from 'react';
import { useFinance } from '../../../store/FinanceContext';
import { useAuth } from '../../../store/AuthContext';
import { useLocale } from '../../../store/LocaleContext';

export function useSettingsViewModel() {
  const { exportData, importData, clearData } = useFinance();
  const { logout } = useAuth();
  const { t } = useLocale();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<string>('');

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
        await importData(content);
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
