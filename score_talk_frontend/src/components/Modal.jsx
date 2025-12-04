import React, { useEffect } from "react";
import classes from "./Modal.module.css";

export function Modal({ isOpen, onClose, title, children }) {
  // 按ESC键关闭模态框
  useEffect(() => {
    if (!isOpen) return;
    
    function handleEscape(e) {
      if (e.key === "Escape") {
        onClose();
      }
    }
    
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }

  return (
    <div className={classes.modalOverlay} onClick={handleBackdropClick}>
      <div className={classes.modalContent}>
        <div className={classes.modalHeader}>
          <h3 className={classes.modalTitle}>{title}</h3>
          <button className={classes.modalClose} onClick={onClose} aria-label="关闭">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div className={classes.modalBody}>
          {children}
        </div>
      </div>
    </div>
  );
}

