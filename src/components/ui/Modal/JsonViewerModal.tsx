// src/components/ui/Modal/JsonViewerModal.tsx
import React, { useEffect, useRef } from "react";
import { FiX, FiCode } from "react-icons/fi";
import Button from "../Button";
import JSONEditor from "jsoneditor";
import "jsoneditor/dist/jsoneditor.css";

interface JsonViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
  title?: string;
}

const JsonViewerModal: React.FC<JsonViewerModalProps> = ({
  isOpen,
  onClose,
  data,
  title = "JSON Data",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<JSONEditor | null>(null);

  useEffect(() => {
    if (isOpen && containerRef.current && data) {
      // Initialize JSON Editor
      const options: any = {
        mode: "view",
        modes: ["view", "code", "tree"],
        search: true,
        navigationBar: false,
      };

      editorRef.current = new JSONEditor(containerRef.current, options);
      editorRef.current.set(data);
    }

    return () => {
      if (editorRef.current) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, [isOpen, data]);

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
          className="relative transform overflow-hidden rounded-lg shadow-xl transition-all w-full max-w-5xl"
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
              <FiCode className="w-6 h-6 text-primary-600" />
              <div>
                <h3
                  className="text-lg font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {title}
                </h3>
                <p
                  className="text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  JSON Data Viewer
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
          <div className="p-6">
            <div
              ref={containerRef}
              style={{
                height: "500px",
                width: "100%",
              }}
            />
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

export default JsonViewerModal;
