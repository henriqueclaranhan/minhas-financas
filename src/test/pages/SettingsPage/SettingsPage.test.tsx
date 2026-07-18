import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SettingsPage } from '../../../pages/SettingsPage/SettingsPage';
import { useSettingsViewModel } from '../../../pages/SettingsPage/hooks/useSettingsViewModel';
import { BrowserRouter } from 'react-router-dom';

vi.mock('../../../pages/SettingsPage/hooks/useSettingsViewModel');

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

  beforeEach(() => {
    vi.mocked(useSettingsViewModel).mockReturnValue({
      state: mockState,
      actions: mockActions
    } as any);
  });

  const renderWithRouter = (ui: React.ReactElement) => {
    return render(<BrowserRouter>{ui}</BrowserRouter>);
  };

  it('renders settings options', () => {
    renderWithRouter(<SettingsPage />);
    
    expect(screen.getByText('Ajustes')).toBeInTheDocument();
    expect(screen.getByText('Exportar Dados')).toBeInTheDocument();
    expect(screen.getByText('Importar Dados')).toBeInTheDocument();
    expect(screen.getByText('Apagar Todos os Dados')).toBeInTheDocument();
    expect(screen.getByText('Sair da Conta')).toBeInTheDocument();
  });

  it('calls exportData when clicking Exportar Dados', () => {
    renderWithRouter(<SettingsPage />);
    const exportBtn = screen.getByText('Exportar Dados');
    fireEvent.click(exportBtn);
    expect(mockActions.exportData).toHaveBeenCalled();
  });

  it('calls clearData when clicking Apagar Todos os Dados', () => {
    renderWithRouter(<SettingsPage />);
    const clearBtn = screen.getByText('Apagar Todos os Dados');
    fireEvent.click(clearBtn);
    expect(mockActions.clearData).toHaveBeenCalled();
  });

  it('calls logout when clicking Sair da Conta', () => {
    renderWithRouter(<SettingsPage />);
    const logoutBtn = screen.getByText('Sair da Conta');
    fireEvent.click(logoutBtn);
    expect(mockActions.logout).toHaveBeenCalled();
  });
});
