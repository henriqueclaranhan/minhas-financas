import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFinance } from '../store/FinanceContext';
import { ThemeToggle } from '../components/ThemeToggle';
import { ChevronLeft, Download, Upload, Trash2, Moon } from 'lucide-react';

export function SettingsPage() {
  const navigate = useNavigate();
  const { exportData, importData, clearData } = useFinance();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<string>('');

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importData(content);
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
    <div className="animate-fade-in" style={{ paddingBottom: 'var(--spacing-xl)' }}>
      <header style={{ marginBottom: 'var(--spacing-xl)', display: 'flex', alignItems: 'center' }}>
        <button 
          onClick={() => navigate(-1)} 
          className="btn" 
          style={{ background: 'transparent', padding: '0', color: 'var(--clr-primary)', display: 'flex', alignItems: 'center', fontSize: '1.1rem', fontWeight: 500 }}
        >
          <ChevronLeft size={24} /> Voltar
        </button>
      </header>
      
      <div style={{ padding: '0 var(--spacing-sm)' }}>
        <h1 style={{ marginBottom: 'var(--spacing-xl)', fontSize: '2rem' }}>Ajustes</h1>
        
        {importStatus && (
          <div style={{ padding: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)', borderRadius: 'var(--radius-md)', background: importStatus.includes('Erro') ? 'var(--clr-danger)' : 'var(--clr-success)', color: '#fff' }}>
            {importStatus}
          </div>
        )}

        <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--spacing-lg)', borderBottom: '1px solid var(--clr-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
              <div style={{ background: 'var(--clr-surface-alt)', padding: '8px', borderRadius: '8px' }}>
                <Moon size={20} color="var(--clr-text-primary)" />
              </div>
              <span style={{ fontSize: '1.1rem', fontWeight: 500 }}>Aparência</span>
            </div>
            <ThemeToggle />
          </div>

          <div 
            style={{ display: 'flex', alignItems: 'center', padding: 'var(--spacing-lg)', borderBottom: '1px solid var(--clr-border)', cursor: 'pointer', transition: 'background 0.2s' }}
            onClick={exportData}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
              <div style={{ background: 'var(--clr-primary-glow)', padding: '8px', borderRadius: '8px' }}>
                <Download size={20} color="var(--clr-primary)" />
              </div>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 500, color: 'var(--clr-primary)' }}>Exportar Dados</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--clr-text-secondary)' }}>Salvar backup no dispositivo</div>
              </div>
            </div>
          </div>

          <div 
            style={{ display: 'flex', alignItems: 'center', padding: 'var(--spacing-lg)', borderBottom: '1px solid var(--clr-border)', cursor: 'pointer', transition: 'background 0.2s' }}
            onClick={handleImportClick}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
              <div style={{ background: 'var(--clr-success)', opacity: 0.9, padding: '8px', borderRadius: '8px' }}>
                <Upload size={20} color="#fff" />
              </div>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 500 }}>Importar Dados</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--clr-text-secondary)' }}>Restaurar de um backup</div>
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
            style={{ display: 'flex', alignItems: 'center', padding: 'var(--spacing-lg)', cursor: 'pointer', transition: 'background 0.2s' }}
            onClick={clearData}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
              <div style={{ background: 'var(--clr-danger)', opacity: 0.9, padding: '8px', borderRadius: '8px' }}>
                <Trash2 size={20} color="#fff" />
              </div>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 500, color: 'var(--clr-danger)' }}>Apagar Todos os Dados</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--clr-text-secondary)' }}>Limpar histórico e saldo</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
