import type { ReactNode } from 'react';
import { act, renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { useTemporalFilter } from '../../hooks/useTemporalFilter';
import { TemporalFilterMode } from '../../enums/UIEnums';

const wrapper = ({ children }: { children: ReactNode }) => <MemoryRouter>{children}</MemoryRouter>;

describe('useTemporalFilter URL state', () => {
  it('commits temporary values only through Apply', () => {
    const first = renderHook(() => useTemporalFilter(TemporalFilterMode.MONTH), { wrapper });

    act(() => {
      first.result.current.actions.setTempMode(TemporalFilterMode.YEAR);
      first.result.current.actions.setTempYear(2032);
    });
    act(() => first.result.current.actions.apply());
    expect(first.result.current.state.mode).toBe(TemporalFilterMode.YEAR);
    expect(first.result.current.state.year).toBe(2032);
  });

  it('restores valid URL filters after a page load', () => {
    const urlWrapper = ({ children }: { children: ReactNode }) => (
      <MemoryRouter initialEntries={['/?mode=year&year=2032']}>{children}</MemoryRouter>
    );
    const { result } = renderHook(() => useTemporalFilter(TemporalFilterMode.MONTH), { wrapper: urlWrapper });

    expect(result.current.state.mode).toBe(TemporalFilterMode.YEAR);
    expect(result.current.state.year).toBe(2032);
  });
});
