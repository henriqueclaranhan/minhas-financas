
import { ThemeToggle } from './components/ThemeToggle';
import { Download, Upload, Trash2, Moon, LogOut, User as UserIcon, ChevronRight } from 'lucide-react';
import { useSettingsViewModel } from './hooks/useSettingsViewModel';
import { PageHeader } from '../../components/shared/PageHeader';
import { useNavigate } from 'react-router-dom';
import './SettingsPage.css';

export function SettingsPage() {

  const { state, actions } = useSettingsViewModel();
  const navigate = useNavigate();

  return (
    <div className="animate-fade-in">
      <PageHeader 
        title="Ajustes"
        showBackButton={true}
      />
        
        {state.importStatus && (
          <div className={`p-md mb-lg settings-status ${state.importStatus.includes('Erro') ? 'error' : 'success'}`}>
            {state.importStatus}
          </div>
        )}

        <div className="glass-panel p-0 settings-panel">
          
          <div className="flex items-center justify-between settings-item-header">
            <div className="flex items-center gap-md">
              <div className="settings-icon-wrapper alt">
                <Moon size={20} color="var(--clr-text-primary)" />
              </div>
              <span className="font-medium settings-item-title">Aparência</span>
            </div>
            <ThemeToggle />
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
                  <div className="font-medium settings-item-title">Meu Perfil</div>
                  <div className="settings-item-desc text-secondary">Atualizar nome, email e senha</div>
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
                <div className="font-medium settings-item-title text-primary">Exportar Dados</div>
                <div className="settings-item-desc text-secondary">Salvar backup no dispositivo</div>
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
                <div className="font-medium settings-item-title">Importar Dados</div>
                <div className="settings-item-desc text-secondary">Restaurar de um backup</div>
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
                <div className="font-medium settings-item-title text-danger">Apagar Todos os Dados</div>
                <div className="settings-item-desc text-secondary">Limpar histórico e saldo</div>
              </div>
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
                <div className="font-medium settings-item-title">Sair da Conta</div>
                <div className="settings-item-desc text-secondary">Fazer logout do aplicativo</div>
              </div>
            </div>
          </div>

        </div>
    </div>
  );
}
