import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SettingsPage } from '../../../pages/SettingsPage/SettingsPage';
import { useSettingsViewModel } from '../../../pages/SettingsPage/hooks/useSettingsViewModel';
import { BrowserRouter } from 'react-router-dom';
import { useLocale } from '../../../store/LocaleContext';

vi.mock('../../../pages/SettingsPage/hooks/useSettingsViewModel');
vi.mock('../../../store/LocaleContext');
vi.mock('../../../store/ThemeContext', () => ({
  useTheme: () => ({ theme: 'system', setTheme: vi.fn() })
}));
vi.mock('../../../components/shared/CustomSelect/CustomSelect', () => ({
  CustomSelect: ({ value, onChange, options }: any) => {
    let labelText = 'Moeda';
    if (options.some((o: any) => o.value === 'pt-BR')) labelText = 'Idioma e região';
    if (options.some((o: any) => o.value === 'system')) labelText = 'Tema';
    return (
      <select aria-label={labelText} value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((opt: any) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
    );
  }
}));

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // Deprecated
    removeListener: vi.fn(), // Deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe('SettingsPage UI', () => {
  const mockActions = {
    handleImportClick: vi.fn(),
    handleFileChange: vi.fn(),
    exportData: vi.fn(),
    clearData: vi.fn(),
    logout: vi.fn()
  };

  const mockState = {
    importStatus: '',
    fileInputRef: { current: null }
  };

  const mockLocale = {
    currency: 'BRL',
    locale: 'pt-BR',
    formatCurrency: vi.fn(),
    setCurrency: vi.fn(),
    setLocale: vi.fn(),
    t: (key: string) => ({
      'settings.title': 'Ajustes', 'settings.appearance': 'Aparência', 'settings.language': 'Idioma e região',
      'settings.languageDescription': 'Define o idioma da interface e da formatação', 'settings.currency': 'Moeda',
      'settings.currencyDescription': 'Todos os valores passam a usar esta moeda', 'settings.profile': 'Meu perfil',
      'settings.profileDescription': 'Atualizar nome, e-mail e senha', 'settings.export': 'Exportar dados',
      'settings.exportDescription': 'Salvar backup no dispositivo', 'settings.import': 'Importar dados',
      'settings.importDescription': 'Restaurar de um backup', 'settings.clear': 'Apagar todos os dados',
      'settings.clearDescription': 'Limpar histórico e saldo', 'settings.logout': 'Sair da conta',
      'settings.logoutDescription': 'Encerrar sessão no aplicativo',
    }[key] ?? key),
  };

  beforeEach(() => {
    vi.mocked(useSettingsViewModel).mockReturnValue({
      state: mockState,
      actions: mockActions
    } as any);
    vi.mocked(useLocale).mockReturnValue(mockLocale as any);
  });

  const renderWithRouter = (ui: React.ReactElement) => {
    return render(<BrowserRouter>{ui}</BrowserRouter>);
  };

  it('renders settings options', () => {
    renderWithRouter(<SettingsPage />);
    
    expect(screen.getByText('Ajustes')).toBeInTheDocument();
    expect(screen.getByText('Exportar dados')).toBeInTheDocument();
    expect(screen.getByText('Importar dados')).toBeInTheDocument();
    expect(screen.getByText('Apagar todos os dados')).toBeInTheDocument();
    expect(screen.getByText('Sair da conta')).toBeInTheDocument();
    expect(screen.getByLabelText('Idioma e região')).toHaveValue('pt-BR');
    expect(screen.getByLabelText('Moeda')).toHaveValue('BRL');
  });

  it('updates locale and currency preferences', () => {
    renderWithRouter(<SettingsPage />);

    fireEvent.change(screen.getByLabelText('Idioma e região'), { target: { value: 'en-US' } });
    fireEvent.change(screen.getByLabelText('Moeda'), { target: { value: 'USD' } });

    expect(mockLocale.setLocale).toHaveBeenCalledWith('en-US');
    expect(mockLocale.setCurrency).toHaveBeenCalledWith('USD');
  });

  it('calls exportData when clicking Exportar Dados', () => {
    renderWithRouter(<SettingsPage />);
    const exportBtn = screen.getByText('Exportar dados');
    fireEvent.click(exportBtn);
    expect(mockActions.exportData).toHaveBeenCalled();
  });

  it('calls clearData when clicking Apagar Todos os Dados', () => {
    renderWithRouter(<SettingsPage />);
    const clearBtn = screen.getByText('Apagar todos os dados');
    fireEvent.click(clearBtn);
    expect(mockActions.clearData).toHaveBeenCalled();
  });

  it('calls logout when clicking Sair da Conta', () => {
    renderWithRouter(<SettingsPage />);
    const logoutBtn = screen.getByText('Sair da conta');
    fireEvent.click(logoutBtn);
    expect(mockActions.logout).toHaveBeenCalled();
  });
});
