import { useState, useRef } from 'react';
import { useFinance } from '../../../store/FinanceContext';
import { useAuth } from '../../../store/AuthContext';

export function useSettingsViewModel() {
  const { exportData, importData, clearData } = useFinance();
  const { logout } = useAuth();
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
      const success = await importData(content);
      if (success) {
        setImportStatus('Dados importados com sucesso!');
        setTimeout(() => setImportStatus(''), 3000);
      } else {
        setImportStatus('Erro ao importar arquivo. Verifique o formato.');
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
