// src/components/ui/Modal/PermissionsModal.tsx
import React from "react";
import { FiX, FiShield, FiUsers } from "react-icons/fi";
import Button from "../Button";

interface ModulePermission {
  _id?: string;
  module: string;
  permissions: string[];
}

interface PermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  roleData: {
    name: string;
    displayName: string;
    modulePermissions: ModulePermission[];
  };
}

const PermissionsModal: React.FC<PermissionsModalProps> = ({
  isOpen,
  onClose,
  roleData,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="relative transform overflow-hidden rounded-lg shadow-xl transition-all w-full max-w-4xl"
          style={{
            backgroundColor: "var(--bg-primary)",
            border: "1px solid var(--border-light)",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between p-6 border-b"
            style={{ borderColor: "var(--border-light)" }}
          >
            <div className="flex items-center space-x-3">
              <FiShield className="w-6 h-6 text-primary-600" />
              <div>
                <h3
                  className="text-lg font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  Role Permissions
                </h3>
                <p
                  className="text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {roleData.displayName} ({roleData.name})
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
              Close
            </Button>
          </div>

          {/* Content */}
          <div className="p-6 max-h-96 overflow-y-auto">
            {roleData.modulePermissions.length === 0 ? (
              <div
                className="text-center py-8"
                style={{ color: "var(--text-muted)" }}
              >
                <FiUsers className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No module permissions assigned</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {roleData.modulePermissions.map((modulePermission, index) => (
                  <div
                    key={index}
                    className="rounded-lg p-4"
                    style={{
                      backgroundColor: "var(--bg-secondary)",
                      border: "1px solid var(--border-light)",
                    }}
                  >
                    <h4
                      className="font-semibold mb-3"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {modulePermission.module.replace(/_/g, " ")}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {modulePermission.permissions.map(
                        (permission, permIndex) => (
                          <span
                            key={permIndex}
                            className="px-2 py-1 rounded text-xs font-medium bg-primary-100 text-primary-800"
                          >
                            {permission}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div
            className="flex justify-end p-6 border-t"
            style={{ borderColor: "var(--border-light)" }}
          >
            <Button variant="primary" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PermissionsModal;
