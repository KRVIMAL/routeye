// src/components/ui/Modal/AccountHierarchyModal.tsx
import React from 'react';
import { FiX, FiUsers, FiChevronRight } from 'react-icons/fi';
import Button from '../Button';

interface HierarchyNode {
  _id: string;
  accountName: string;
  level: number;
  hierarchyPath: string;
  client?: {
    name: string;
    contactName: string;
  };
  children?: HierarchyNode[];
}

interface AccountHierarchyModalProps {
  isOpen: boolean;
  onClose: () => void;
  hierarchyData: HierarchyNode;
}

const AccountHierarchyModal: React.FC<AccountHierarchyModalProps> = ({
  isOpen,
  onClose,
  hierarchyData,
}) => {
  if (!isOpen) return null;

  const renderHierarchyNode = (node: HierarchyNode, depth: number = 0) => {
    const indentClass = `ml-${depth * 6}`;
    
    return (
      <div key={node._id} className="space-y-2">
        <div 
          className={`flex items-center p-3 rounded-lg ${indentClass}`}
          style={{ 
            backgroundColor: depth === 0 ? 'var(--bg-accent)' : 'var(--bg-secondary)',
            border: '1px solid var(--border-light)' 
          }}
        >
          <div className="flex items-center space-x-3 flex-1">
            <div className={`w-3 h-3 rounded-full ${
              depth === 0 ? 'bg-primary-600' : 
              depth === 1 ? 'bg-blue-500' : 
              'bg-green-500'
            }`}></div>
            <div>
              <h4 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                {node.accountName}
              </h4>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Level {node.level} • {node.client?.name || 'No Client'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs px-2 py-1 bg-gray-100 rounded">
              {node.hierarchyPath}
            </span>
            {node.children && node.children.length > 0 && (
              <FiChevronRight className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
            )}
          </div>
        </div>
        
        {node.children && node.children.map(child => 
          renderHierarchyNode(child, depth + 1)
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className="relative transform overflow-hidden rounded-lg shadow-xl transition-all w-full max-w-4xl"
          style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--border-light)' }}>
            <div className="flex items-center space-x-3">
              <FiUsers className="w-6 h-6 text-primary-600" />
              <div>
                <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Account Hierarchy
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {hierarchyData.accountName}
                </p>
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              icon={FiX}
              onClick={onClose}
              className="!p-2"
            >
              {}
            </Button>
          </div>

          {/* Content */}
          <div className="p-6 max-h-96 overflow-y-auto">
            {renderHierarchyNode(hierarchyData)}
          </div>

          {/* Footer */}
          <div className="flex justify-end p-6 border-t" style={{ borderColor: 'var(--border-light)' }}>
            <Button variant="primary" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountHierarchyModal;