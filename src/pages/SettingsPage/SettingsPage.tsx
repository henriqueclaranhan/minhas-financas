import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFinance } from '../../store/FinanceContext';
import { useAuth } from '../../store/AuthContext';
import { ThemeToggle } from '../../components/ThemeToggle';
import { ChevronLeft, Download, Upload, Trash2, Moon, LogOut } from 'lucide-react';
import './SettingsPage.css';

export function SettingsPage() {
  const navigate = useNavigate();
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

  return (
    <div className="animate-fade-in settings-page">
      <header className="hide-on-desktop flex items-center settings-mobile-header">
        <button 
          onClick={() => navigate(-1)} 
          className="btn p-0 flex items-center settings-back-btn" 
        >
          <ChevronLeft size={24} /> Voltar
        </button>
      </header>
      
      <div className="settings-content">
        <header className="mb-lg">
          <h1>Ajustes</h1>
        </header>
        
        {importStatus && (
          <div className={`p-md mb-lg settings-status ${importStatus.includes('Erro') ? 'error' : 'success'}`}>
            {importStatus}
          </div>
        )}

        <div className="glass-panel p-0 settings-panel">
          
          <div className="flex items-center justify-between p-lg settings-item-header">
            <div className="flex items-center gap-md">
              <div className="settings-icon-wrapper alt">
                <Moon size={20} color="var(--clr-text-primary)" />
              </div>
              <span className="font-medium settings-item-title">Aparência</span>
            </div>
            <ThemeToggle />
          </div>

          <div 
            className="settings-item p-lg"
            onClick={exportData}
          >
            <div className="flex items-center gap-md">
              <div className="settings-icon-wrapper primary">
                <Download size={20} color="var(--clr-primary)" />
              </div>
              <div>
                <div className="font-medium settings-item-title text-primary">Exportar Dados</div>
                <div className="settings-item-desc text-secondary">Salvar backup no dispositivo</div>
              </div>
            </div>
          </div>

          <div 
            className="settings-item p-lg"
            onClick={handleImportClick}
          >
            <div className="flex items-center gap-md">
              <div className="settings-icon-wrapper success">
                <Upload size={20} color="#fff" />
              </div>
              <div>
                <div className="font-medium settings-item-title">Importar Dados</div>
                <div className="settings-item-desc text-secondary">Restaurar de um backup</div>
              </div>
            </div>
          </div>
          <input 
            type="file" 
            accept=".json"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />

          <div 
            className="settings-item p-lg"
            onClick={clearData}
          >
            <div className="flex items-center gap-md">
              <div className="settings-icon-wrapper danger">
                <Trash2 size={20} color="#fff" />
              </div>
              <div>
                <div className="font-medium settings-item-title text-danger">Apagar Todos os Dados</div>
                <div className="settings-item-desc text-secondary">Limpar histórico e saldo</div>
              </div>
            </div>
          </div>

          <div 
            className="settings-item no-border p-lg"
            onClick={logout}
          >
            <div className="flex items-center gap-md">
              <div className="settings-icon-wrapper alt">
                <LogOut size={20} color="var(--clr-text-primary)" />
              </div>
              <div>
                <div className="font-medium settings-item-title">Sair da Conta</div>
                <div className="settings-item-desc text-secondary">Fazer logout do aplicativo</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
