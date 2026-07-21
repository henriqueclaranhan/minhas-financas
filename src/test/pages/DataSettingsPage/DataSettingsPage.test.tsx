import { fireEvent, render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DataSettingsPage } from '../../../pages/DataSettingsPage/DataSettingsPage';
import { useSettingsViewModel } from '../../../pages/SettingsPage/hooks/useSettingsViewModel';
import { useLocale } from '../../../store/LocaleContext';

vi.mock('../../../pages/SettingsPage/hooks/useSettingsViewModel');
vi.mock('../../../store/LocaleContext');

describe('DataSettingsPage', () => {
  const actions = {
    handleImportClick: vi.fn(),
    handleFileChange: vi.fn(),
    exportData: vi.fn(),
    clearData: vi.fn(),
    logout: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useSettingsViewModel).mockReturnValue({
      state: {
        importStatus: '',
        importProgress: null,
        fileInputRef: { current: null },
      },
      actions,
    } as any);
    vi.mocked(useLocale).mockReturnValue({
      t: (key: string) => ({
        'common.back': 'Voltar',
        'settings.data': 'Dados',
        'settings.dataDescription': 'Backup, restauração e exclusão de dados',
        'settings.export': 'Exportar dados',
        'settings.exportDescription': 'Salvar backup no dispositivo',
        'settings.import': 'Importar dados',
        'settings.importDescription': 'Restaurar de um backup',
        'settings.clear': 'Apagar todos os dados',
        'settings.clearDescription': 'Limpar histórico e saldo',
      }[key] ?? key),
    } as any);
  });

  it('renders all data management actions on the nested screen', () => {
    render(<BrowserRouter><DataSettingsPage /></BrowserRouter>);

    expect(screen.getByRole('heading', { name: 'Dados' })).toBeInTheDocument();
    expect(screen.getByText('Exportar dados')).toBeInTheDocument();
    expect(screen.getByText('Importar dados')).toBeInTheDocument();
    expect(screen.getByText('Apagar todos os dados')).toBeInTheDocument();
  });

  it('keeps data actions connected to the settings view model', () => {
    render(<BrowserRouter><DataSettingsPage /></BrowserRouter>);

    fireEvent.click(screen.getByText('Exportar dados'));
    fireEvent.click(screen.getByText('Importar dados'));
    fireEvent.click(screen.getByText('Apagar todos os dados'));

    expect(actions.exportData).toHaveBeenCalledOnce();
    expect(actions.handleImportClick).toHaveBeenCalledOnce();
    expect(actions.clearData).toHaveBeenCalledOnce();
  });
});
