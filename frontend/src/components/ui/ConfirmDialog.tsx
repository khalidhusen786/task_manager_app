// ===== CONFIRM DIALOG =====
import React from 'react';
import Modal from './Modal';

interface ConfirmDialogProps {
  isOpen: boolean;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  destructive?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title = 'Are you sure?',
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  destructive = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title} description={description} size="sm">
      <div className="mt-2">
        <div className="flex justify-end space-x-3">
          <button onClick={onCancel} className="btn-outline">
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={destructive ? 'btn btn-danger' : 'btn-primary'}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;





