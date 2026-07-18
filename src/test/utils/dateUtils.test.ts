import { describe, it, expect, vi } from 'vitest';
import { handleDatePaste } from '../../utils/dateUtils';
import React from 'react';

describe('dateUtils', () => {
  describe('handleDatePaste', () => {
    it('should format DD/MM/YYYY to YYYY-MM-DD', () => {
      const setter = vi.fn();
      const preventDefault = vi.fn();
      
      const event = {
        preventDefault,
        clipboardData: {
          getData: () => '15/05/2026'
        }
      } as unknown as React.ClipboardEvent<HTMLInputElement>;
      
      handleDatePaste(event, setter);
      
      expect(preventDefault).toHaveBeenCalled();
      expect(setter).toHaveBeenCalledWith('2026-05-15');
    });

    it('should format YYYY-MM-DD correctly', () => {
      const setter = vi.fn();
      const preventDefault = vi.fn();
      
      const event = {
        preventDefault,
        clipboardData: {
          getData: () => '2026-05-15'
        }
      } as unknown as React.ClipboardEvent<HTMLInputElement>;
      
      handleDatePaste(event, setter);
      
      expect(preventDefault).toHaveBeenCalled();
      expect(setter).toHaveBeenCalledWith('2026-05-15');
    });

    it('should ignore invalid formats', () => {
      const setter = vi.fn();
      const preventDefault = vi.fn();
      
      const event = {
        preventDefault,
        clipboardData: {
          getData: () => 'invalid-date'
        }
      } as unknown as React.ClipboardEvent<HTMLInputElement>;
      
      handleDatePaste(event, setter);
      
      expect(preventDefault).not.toHaveBeenCalled();
      expect(setter).not.toHaveBeenCalled();
    });
  });
});
