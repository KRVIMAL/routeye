// src/components/ui/DataTable/ActionButtons.tsx
import React from 'react';
import { FiEdit, FiTrash2, FiSave, FiX } from 'react-icons/fi';
import Button from '../Button';

interface ActionButtonsProps {
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onDelete
}) => {
  if (isEditing) {
    return (
      <div className="flex items-center space-x-2 px-4 py-3">
        <Button
          size="sm"
          variant="primary" 
          onClick={onSave}
          className="p-2"
        >
          <FiSave className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={onCancel}
          className="p-2"
        >
          <FiX className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 px-4 py-3">
      <Button
        size="sm"
        variant="secondary"
        onClick={onEdit}
        className="p-2"
      >
        <FiEdit className="w-4 h-4" />
      </Button>
      <Button
        size="sm"
        variant="error"
        onClick={onDelete}
        className="p-2"
      >
        <FiTrash2 className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default ActionButtons;