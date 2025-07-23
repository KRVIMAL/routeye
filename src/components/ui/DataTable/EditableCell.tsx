  // src/components/ui/DataTable/EditableCell.tsx
  import React, { useState, useEffect, useRef } from 'react';
  import CustomInput from '../CustomInput';
  import { EditCellParams } from './types';
  
  const EditableCell: React.FC<EditCellParams> = ({
    value: initialValue,
    field,
    row,
    onChange,
    onSave,
    onCancel
  }) => {
    const [value, setValue] = useState(initialValue || '');
    const inputRef = useRef<HTMLInputElement>(null);
  
    useEffect(() => {
      setValue(initialValue || '');
    }, [initialValue]);
  
    useEffect(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, []);
  
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setValue(newValue);
      onChange(newValue);
    };
  
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        onSave();
      } else if (e.key === 'Escape') {
        onCancel();
      }
    };
  
    return (
      <CustomInput
        ref={inputRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={onSave}
        size="sm"
        className="border-0 focus:ring-0 bg-transparent"
      />
    );
  };
  
  export default EditableCell;