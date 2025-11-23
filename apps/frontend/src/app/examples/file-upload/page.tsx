'use client';

import type { Upload } from '@repo/packages-types';
import { FileText, Image, Loader2, Trash2 } from 'lucide-react';
import React, { useState } from 'react';

import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { FileUploadInput } from '@/components/ui/file-upload-input';
import {
  useDeleteUpload,
  useFetchUploads,
  useFetchUploadStats,
  useUploadFile,
} from '@/hooks/api/use-uploads';

export default function FileUploadExamplePage(): React.ReactElement {
  const [selectedFile, setSelectedFile] = useState<globalThis.File | null>(
    null
  );

  const { data: uploads, isLoading: uploadsLoading } = useFetchUploads();
  const { data: stats } = useFetchUploadStats();
  const uploadMutation = useUploadFile();
  const deleteMutation = useDeleteUpload();

  const handleFileSelect = (file: globalThis.File) => {
    setSelectedFile(file);
  };

  const handleUpload = () => {
    if (!selectedFile) return;

    uploadMutation.mutate(selectedFile, {
      onSuccess: () => {
        setSelectedFile(null);
      },
    });
  };

  const handleDelete = (uploadId: string) => {
    if (globalThis.confirm('Are you sure you want to delete this file?')) {
      deleteMutation.mutate({ id: uploadId });
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return <Image className="text-primary h-8 w-8" />;
    }
    return <FileText className="text-primary h-8 w-8" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="container mx-auto max-w-5xl px-4 py-12">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">File Upload</h1>
          <p className="text-muted-foreground mt-2">
            Upload images, PDFs, and documents up to 10MB
          </p>
        </div>

        {/* Upload Stats */}
        {stats && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="bg-card rounded-lg border p-6">
              <div className="text-muted-foreground text-sm font-medium">
                Total Files
              </div>
              <div className="mt-2 text-3xl font-bold">{stats.totalFiles}</div>
            </div>
            <div className="bg-card rounded-lg border p-6">
              <div className="text-muted-foreground text-sm font-medium">
                Total Size
              </div>
              <div className="mt-2 text-3xl font-bold">
                {formatFileSize(stats.totalSize)}
              </div>
            </div>
          </div>
        )}

        {/* Upload Section */}
        <div className="bg-card space-y-4 rounded-lg border p-6">
          <h2 className="text-lg font-semibold">Upload File</h2>

          <FileUploadInput
            onFileSelect={handleFileSelect}
            disabled={uploadMutation.isPending}
          />

          {selectedFile && (
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setSelectedFile(null)}
                disabled={uploadMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpload}
                disabled={uploadMutation.isPending}
              >
                {uploadMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Upload
              </Button>
            </div>
          )}

          {uploadMutation.isError && (
            <Alert variant="destructive">
              {uploadMutation.error?.message || 'Upload failed'}
            </Alert>
          )}

          {uploadMutation.isSuccess && (
            <Alert>File uploaded successfully!</Alert>
          )}
        </div>

        {/* Uploads List */}
        <div className="bg-card space-y-4 rounded-lg border p-6">
          <h2 className="text-lg font-semibold">Your Uploads</h2>

          {uploadsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
            </div>
          ) : uploads && uploads.length > 0 ? (
            <div className="space-y-3">
              {uploads.map((upload: Upload) => (
                <div
                  key={upload.id}
                  className="hover:bg-accent/50 flex items-center justify-between rounded-lg border p-4 transition-colors"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-4">
                    {getFileIcon(upload.mimeType)}
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">
                        {upload.originalName}
                      </p>
                      <div className="text-muted-foreground mt-1 flex items-center gap-3 text-sm">
                        <span>{formatFileSize(upload.size)}</span>
                        <span>•</span>
                        <span>{formatDate(upload.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(upload.url, '_blank')}
                    >
                      View
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(upload.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="text-destructive h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-muted-foreground py-12 text-center">
              <FileText className="mx-auto mb-4 h-12 w-12 opacity-50" />
              <p>No files uploaded yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
