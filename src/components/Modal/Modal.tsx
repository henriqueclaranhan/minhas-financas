import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useLocale } from '../../store/LocaleContext';
import './Modal.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const { t } = useLocale();
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isClosing, setIsClosing] = useState(false);
  const titleRef = useRef(title);
  const childrenRef = useRef(children);

  if (isOpen) {
    titleRef.current = title;
    childrenRef.current = children;
  }

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsClosing(false);
      return;
    }

    if (!shouldRender) return;

    setIsClosing(true);
    const reduceMotion = typeof window.matchMedia === 'function'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timeout = window.setTimeout(() => {
      setShouldRender(false);
      setIsClosing(false);
    }, reduceMotion ? 0 : 150);

    return () => window.clearTimeout(timeout);
  }, [isOpen, shouldRender]);

  useEffect(() => {
    if (shouldRender) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.documentElement.style.overflow = 'hidden';
      document.body.setAttribute('data-scroll-y', scrollY.toString());
    }
    return () => {
      // In case the modal is unmounted without isOpen turning false first
      if (document.body.style.position === 'fixed') {
        const scrollY = document.body.getAttribute('data-scroll-y');
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.documentElement.style.overflow = '';
        if (scrollY) {
          window.scrollTo(0, parseInt(scrollY, 10));
          document.body.removeAttribute('data-scroll-y');
        }
      }
    };
  }, [shouldRender]);

  if (!shouldRender) return null;

  return createPortal(
    <div
      className={`modal-overlay ${isClosing ? 'is-closing' : 'is-opening'}`}
      onClick={isClosing ? undefined : onClose}
    >
      <div 
        className="modal-content" 
        onClick={e => e.stopPropagation()} 
        role="dialog" 
        aria-modal="true" 
        aria-labelledby="modal-title"
      >
        <div className="modal-header">
          <h3 id="modal-title">{titleRef.current}</h3>
          <button className="modal-close" onClick={onClose} aria-label={t('common.closeModal')} disabled={isClosing}>
            <X size={24} aria-hidden="true" />
          </button>
        </div>
        <div className="modal-body">
          {childrenRef.current}
        </div>
      </div>
    </div>,
    document.body
  );
}
