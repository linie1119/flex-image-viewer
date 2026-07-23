import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { useMemoizedFn } from 'ahooks';

export interface ModalProps {
  visible: boolean;
  getContainer?: string | (() => HTMLElement | null) | HTMLElement | null;
  destroyOnClose?: boolean;
  children: React.ReactNode;
  onClose?: () => void;
}

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const selector = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(', ');

  return Array.from(container.querySelectorAll(selector));
}

export default function Modal(props: ModalProps) {
  const {
    visible,
    getContainer: getContainerProp,
    destroyOnClose = false,
    children,
    onClose,
  } = props;

  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const [hasBeenVisible, setHasBeenVisible] = useState(visible);

  const getContainerElement = useMemoizedFn((): HTMLElement => {
    if (!getContainerProp) return document.body;

    if (typeof getContainerProp === 'string') {
      const el = document.querySelector(getContainerProp);
      if (!el || !(el instanceof HTMLElement)) {
        console.warn(
          `Flex-image-Viewer Modal: 选择器 "${getContainerProp}" 未找到有效元素，已回退到 body`
        );
        return document.body;
      }
      return el;
    }

    if (typeof getContainerProp === 'function') {
      const result = getContainerProp();
      if (result && result.nodeType === 1) return result;
      console.warn('Flex-image-Viewer Modal: getContainer 函数返回无效 DOM 元素，已回退到 body');
      return document.body;
    }

    if (getContainerProp instanceof HTMLElement && getContainerProp.nodeType === 1)
      return getContainerProp;

    console.warn('Flex-image-Viewer Modal: getContainer 参数无效，已回退到 body');
    return document.body;
  });

  useEffect(() => {
    if (visible) {
      setHasBeenVisible(true);
    }
  }, [visible]);

  useEffect(() => {
    if (visible) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      document.body.style.overflow = 'hidden';

      // Focus first focusable element after a short delay for DOM to settle
      const timer = setTimeout(() => {
        if (modalRef.current) {
          const focusable = getFocusableElements(modalRef.current);
          if (focusable.length > 0) {
            focusable[0].focus();
          } else {
            modalRef.current.focus();
          }
        }
      }, 0);

      return () => {
        clearTimeout(timer);
      };
    } else {
      document.body.style.overflow = '';
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
        previousFocusRef.current = null;
      }
    }
  }, [visible]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && visible && onClose) {
        onClose();
        return;
      }

      if (e.key === 'Tab' && visible && modalRef.current) {
        const focusable = getFocusableElements(modalRef.current);
        if (focusable.length === 0) {
          e.preventDefault();
          return;
        }

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [visible, onClose]);

  if (!visible && (destroyOnClose || !hasBeenVisible)) {
    return null;
  }

  const targetElement = getContainerElement();

  const modalContent = (
    <div
      ref={modalRef}
      className="flex-image-viewer-modal"
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      style={!visible ? { display: 'none' } : undefined}
    >
      {children}
    </div>
  );

  return ReactDOM.createPortal(modalContent, targetElement);
}
