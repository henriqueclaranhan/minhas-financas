import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CustomSelect } from '../../../components/shared/CustomSelect/CustomSelect';

vi.mock('../../../store/LocaleContext', () => ({
  useLocale: () => ({ t: (key: string) => key }),
}));

describe('CustomSelect positioning', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('clears the base top coordinate and selects an option when opening upward', async () => {
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 700 });
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      top: 500,
      bottom: 540,
      left: 100,
      right: 360,
      width: 260,
      height: 40,
      x: 100,
      y: 500,
      toJSON: () => ({}),
    });
    const onChange = vi.fn();
    const { container } = render(
      <CustomSelect
        value=""
        onChange={onChange}
        options={[{ value: 'food', label: 'Alimentação' }]}
        placeholder="Selecione"
      />,
    );

    fireEvent.click(container.querySelector('.custom-select-trigger')!);

    const dropdown = await waitFor(() => document.body.querySelector('.custom-select-dropdown'));
    expect(dropdown).toHaveStyle({ top: 'auto', bottom: '204px' });

    fireEvent.click(screen.getByText('Alimentação'));
    expect(onChange).toHaveBeenCalledWith('food');
  });
});
