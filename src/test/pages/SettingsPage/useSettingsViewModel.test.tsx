import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useSettingsViewModel } from '../../../pages/SettingsPage/hooks/useSettingsViewModel';

const { importData } = vi.hoisted(() => ({ importData: vi.fn() }));

vi.mock('../../../store/FinanceContext', () => ({
  useFinance: () => ({ importData, exportData: vi.fn(), clearData: vi.fn() }),
}));
vi.mock('../../../store/AuthContext', () => ({ useAuth: () => ({ logout: vi.fn() }) }));
vi.mock('../../../store/LocaleContext', () => ({ useLocale: () => ({ t: (key: string) => key }) }));

class MockFileReader {
  onload: ((event: { target: { result: string } }) => void) | null = null;

  readAsText() {
    this.onload?.({ target: { result: '{}' } });
  }
}

describe('useSettingsViewModel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('FileReader', MockFileReader);
  });

  it('shows an error when import validation returns false', async () => {
    importData.mockResolvedValue(false);
    const { result } = renderHook(() => useSettingsViewModel());
    const input = { files: [new File(['{}'], 'backup.json')], value: 'backup.json' };

    await act(async () => {
      result.current.actions.handleFileChange({ target: input } as unknown as React.ChangeEvent<HTMLInputElement>);
    });

    await waitFor(() => expect(result.current.state.importStatus).toBe('settings.importError'));
  });
});
