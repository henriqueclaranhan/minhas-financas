import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Search } from 'lucide-react';
import { useLocale } from '../../../store/LocaleContext';
import './CustomSelect.css';

export interface SelectOption {
  value: string;
  label: string;
  icon?: ReactNode;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  searchable?: boolean;
  className?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  placeholder,
  searchable = false,
  className = '',
}) => {
  const { t } = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Outside clicks are now handled by the transparent backdrop in the portal

  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties | null>(null);

  useLayoutEffect(() => {
    if (isOpen && containerRef.current) {
      const updatePosition = (e?: Event) => {
        // Ignore scroll events originating from inside the dropdown itself
        if (e?.type === 'scroll' && (e.target as HTMLElement)?.closest?.('.custom-select-dropdown')) {
          return;
        }

        const rect = containerRef.current!.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const dropdownHeight = 300; 
        
        if (spaceBelow < dropdownHeight && rect.top > dropdownHeight) {
          // Render upwards
          setDropdownStyle({
            position: 'fixed',
            bottom: window.innerHeight - rect.top + 4,
            left: rect.left,
            width: rect.width,
            zIndex: 99999,
          });
        } else {
          // Render downwards
          setDropdownStyle({
            position: 'fixed',
            top: rect.bottom + 4,
            left: rect.left,
            width: rect.width,
            zIndex: 99999,
          });
        }
      };

      updatePosition();
      
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition, true); // true to capture scroll on all scrollable parents
      
      return () => {
        window.removeEventListener('resize', updatePosition);
        window.removeEventListener('scroll', updatePosition, true);
      };
    } else {
      setDropdownStyle(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && dropdownStyle && searchInputRef.current) {
      // Focus without scrolling the page
      searchInputRef.current.focus({ preventScroll: true });
    }
  }, [isOpen, dropdownStyle]);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className={`custom-select-container ${className}`} ref={containerRef}>
      <div
        className={`custom-select-trigger form-input ${isOpen ? 'is-open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        tabIndex={0}
      >
        <span className="custom-select-value" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {selectedOption ? (
            <>
              {selectedOption.icon && <span className="custom-select-icon">{selectedOption.icon}</span>}
              {selectedOption.label}
            </>
          ) : (
            <span className="custom-select-placeholder">{placeholder || t('common.select')}</span>
          )}
        </span>
        <ChevronDown className={`custom-select-arrow ${isOpen ? 'open' : ''}`} size={16} />
      </div>

      {isOpen && dropdownStyle && createPortal(
        <>
          {/* Transparent backdrop to catch outside clicks and stop propagation */}
          <div 
            style={{ position: 'fixed', inset: 0, zIndex: 99998 }} 
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
          />
          <div className="custom-select-dropdown" ref={dropdownRef} style={dropdownStyle} onClick={(e) => e.stopPropagation()}>
          {searchable && (
            <div className="custom-select-search-wrapper">
              <Search size={16} className="custom-select-search-icon" />
              <input
                ref={searchInputRef}
                className="custom-select-search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('common.search')}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
          <div className="custom-select-options">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <div
                  key={opt.value}
                  className={`custom-select-option ${opt.value === value ? 'selected' : ''}`}
                  onClick={() => handleSelect(opt.value)}
                >
                  {opt.icon && <span className="custom-select-icon">{opt.icon}</span>}
                  <span>{opt.label}</span>
                </div>
              ))
            ) : (
              <div className="custom-select-no-results">Nenhum resultado</div>
            )}
          </div>
        </div>
        </>,
        document.body
      )}
    </div>
  );
};
