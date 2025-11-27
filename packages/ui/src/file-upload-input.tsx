'use client';

import { Upload, X } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';

import { Button } from './button';
import { cn } from './lib/utils';

interface FileUploadInputProps {
  onFileSelect: (file: globalThis.File) => void;
  accept?: string;
  maxSize?: number;
  disabled?: boolean;
  className?: string;
}

export function FileUploadInput({
  onFileSelect,
  accept = 'image/*,application/pdf,.doc,.docx,.xls,.xlsx,.txt,.csv',
  maxSize = 10 * 1024 * 1024, // 10MB default
  disabled = false,
  className,
}: FileUploadInputProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<globalThis.File | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback(
    (file: globalThis.File): boolean => {
      setError(null);

      if (file.size > maxSize) {
        setError(
          `File size exceeds ${(maxSize / 1024 / 1024).toFixed(0)}MB limit`
        );
        return false;
      }

      return true;
    },
    [maxSize]
  );

  const handleFile = useCallback(
    (file: globalThis.File) => {
      if (!validateFile(file)) {
        return;
      }

      setSelectedFile(file);
      onFileSelect(file);
    },
    [onFileSelect, validateFile]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) {
        setIsDragging(true);
      }
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (disabled) return;

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFile(files[0]);
      }
    },
    [disabled, handleFile]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleClick = () => {
    if (!disabled) {
      inputRef.current?.click();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
      e.preventDefault();
      handleClick();
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setError(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className={cn('w-full', className)}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled}
      />

      <div
        role="button"
        tabIndex={0}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={cn(
          'relative flex w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-10 transition-colors',
          isDragging && !disabled && 'border-primary bg-primary/5',
          !isDragging &&
            !disabled &&
            'border-muted-foreground/25 hover:border-primary/50 hover:bg-accent/50',
          disabled && 'cursor-not-allowed opacity-50',
          error && 'border-destructive'
        )}
      >
        {selectedFile ? (
          <div className="flex w-full flex-col items-center gap-2">
            <div className="flex w-full items-center justify-between gap-4">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <Upload className="text-primary h-8 w-8 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {selectedFile.name}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
                disabled={disabled}
                className="flex-shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-muted-foreground text-center text-xs">
              Click to change file or drag and drop a new one
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="text-muted-foreground h-10 w-10" />
            <div className="flex flex-col items-center gap-1">
              <p className="text-sm font-medium">
                {isDragging
                  ? 'Drop file here'
                  : 'Click to upload or drag and drop'}
              </p>
              <p className="text-muted-foreground text-xs">
                Images, PDFs, and documents up to{' '}
                {(maxSize / 1024 / 1024).toFixed(0)}MB
              </p>
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-destructive mt-2 text-sm">{error}</p>}
    </div>
  );
}
