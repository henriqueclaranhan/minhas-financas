import React from 'react';

export function getLocalDateString() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}


/**
 * Intercepts paste events on date inputs and automatically formats
 * strings like "DD/MM/YYYY" or "YYYY/MM/DD" into the standard "YYYY-MM-DD"
 * format that the native date input expects.
 */
export const handleDatePaste = (
  e: React.ClipboardEvent<HTMLInputElement>,
  setter: (val: string) => void,
  locale?: string
) => {
  const pasted = e.clipboardData.getData('Text').trim();
  
  // Format: YYYY/MM/DD or YYYY-MM-DD
  const ymdMatch = pasted.match(/^(\d{4})[\/-](\d{2})[\/-](\d{2})$/);
  if (ymdMatch) {
    e.preventDefault();
    setter(`${ymdMatch[1]}-${ymdMatch[2]}-${ymdMatch[3]}`);
    return;
  }

  // Format: XX/XX/XXXX
  const mixedMatch = pasted.match(/^(\d{2})[\/-](\d{2})[\/-](\d{4})$/);
  if (mixedMatch) {
    e.preventDefault();
    if (locale === 'en-US') {
      // MM/DD/YYYY -> [1]=MM, [2]=DD, [3]=YYYY
      setter(`${mixedMatch[3]}-${mixedMatch[1]}-${mixedMatch[2]}`);
    } else {
      // DD/MM/YYYY -> [1]=DD, [2]=MM, [3]=YYYY
      setter(`${mixedMatch[3]}-${mixedMatch[2]}-${mixedMatch[1]}`);
    }
    return;
  }
};
