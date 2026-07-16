import React from 'react';

/**
 * Intercepts paste events on date inputs and automatically formats
 * strings like "DD/MM/YYYY" or "YYYY/MM/DD" into the standard "YYYY-MM-DD"
 * format that the native date input expects.
 */
export const handleDatePaste = (e: React.ClipboardEvent<HTMLInputElement>, setter: (val: string) => void) => {
  const pasted = e.clipboardData.getData('Text').trim();
  
  // Format: DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = pasted.match(/^(\d{2})[\/-](\d{2})[\/-](\d{4})$/);
  if (dmyMatch) {
    e.preventDefault();
    setter(`${dmyMatch[3]}-${dmyMatch[2]}-${dmyMatch[1]}`);
    return;
  }
  
  // Format: YYYY/MM/DD or YYYY-MM-DD
  const ymdMatch = pasted.match(/^(\d{4})[\/-](\d{2})[\/-](\d{2})$/);
  if (ymdMatch) {
    e.preventDefault();
    setter(`${ymdMatch[1]}-${ymdMatch[2]}-${ymdMatch[3]}`);
    return;
  }
};
