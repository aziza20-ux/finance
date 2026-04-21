import React from "react";

type ModalProps = {
  isOpen: boolean;
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
  size?: "sm" | "lg" | "xl";
};

const Modal = ({ isOpen, title, onClose, children, size }: ModalProps) => {
  if (!isOpen) {
    return null;
  }

  const dialogClassName = ["modal-dialog", size ? `modal-${size}` : ""].filter(Boolean).join(" ");

  return (
    <>
      <div className="modal fade show d-block" role="dialog" aria-modal="true" aria-labelledby="common-modal-title">
        <div className={dialogClassName}>
          <div className="modal-content shadow">
            <div className="modal-header">
              <h5 className="modal-title" id="common-modal-title">
                {title}
              </h5>
              <button type="button" className="btn-close" aria-label="Close" onClick={onClose} />
            </div>
            <div className="modal-body">{children}</div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" onClick={onClose} />
    </>
  );
};

export default Modal;
