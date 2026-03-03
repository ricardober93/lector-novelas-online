"use client";

import { useState, useCallback } from "react";
import { DropZone } from "./DropZone";
import { PagePreview } from "./PagePreview";
import { ProgressBar } from "./ProgressBar";

interface ChapterUploadFormProps {
  chapterId: string;
  onUploadComplete: () => void;
}

export function ChapterUploadForm({
  chapterId,
  onUploadComplete,
}: ChapterUploadFormProps) {
  const [uploadMethod, setUploadMethod] = useState<"zip" | "individual">("zip");
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentUploading, setCurrentUploading] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleFilesSelected = useCallback((selectedFiles: File[]) => {
    setError(null);
    setFiles((prev) => [...prev, ...selectedFiles]);
  }, []);

  const handleRemoveFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleUploadZip = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", files[0]);

      const response = await fetch(`/api/chapters/${chapterId}/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al subir archivo");
      }

      setFiles([]);
      onUploadComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir archivo");
    } finally {
      setUploading(false);
    }
  };

  const handleUploadIndividual = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setError(null);
    setUploadProgress(0);
    setCurrentUploading(0);

    try {
      for (let i = 0; i < files.length; i++) {
        setCurrentUploading(i + 1);
        setUploadProgress((i / files.length) * 100);

        const formData = new FormData();
        formData.append("file", files[i]);
        formData.append("chapterId", chapterId);
        formData.append("number", String(i + 1));

        const response = await fetch("/api/pages", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || `Error al subir imagen ${i + 1}`);
        }
      }

      setUploadProgress(100);
      setFiles([]);
      onUploadComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir imágenes");
    } finally {
      setUploading(false);
    }
  };

  const handleUpload = () => {
    if (uploadMethod === "zip") {
      handleUploadZip();
    } else {
      handleUploadIndividual();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <button
          onClick={() => setUploadMethod("zip")}
          className={`flex-1 py-3 px-4 rounded-lg border transition-colors ${
            uploadMethod === "zip"
              ? "border-zinc-900 dark:border-zinc-50 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900"
              : "border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50"
          }`}
        >
          Archivo ZIP
        </button>
        <button
          onClick={() => setUploadMethod("individual")}
          className={`flex-1 py-3 px-4 rounded-lg border transition-colors ${
            uploadMethod === "individual"
              ? "border-zinc-900 dark:border-zinc-50 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900"
              : "border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50"
          }`}
        >
          Imágenes individuales
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 dark:bg-red-950 p-4 text-sm text-red-800 dark:text-red-200">
          {error}
        </div>
      )}

      {uploadMethod === "zip" && (
        <div className="space-y-4">
          <DropZone
            onFilesSelected={(selectedFiles) => setFiles(selectedFiles)}
            accept=".zip"
            multiple={false}
            disabled={uploading}
          />

          {files.length > 0 && (
            <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
              <p className="text-sm text-zinc-900 dark:text-zinc-50">
                {files[0].name} ({(files[0].size / 1024 / 1024).toFixed(2)} MB)
              </p>
            </div>
          )}
        </div>
      )}

      {uploadMethod === "individual" && (
        <div className="space-y-4">
          <DropZone
            onFilesSelected={handleFilesSelected}
            accept=".jpg,.jpeg,.png,.webp"
            multiple={true}
            disabled={uploading}
          />

          {files.length > 0 && (
            <>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  Imágenes seleccionadas ({files.length})
                </h3>
                <button
                  onClick={() => setFiles([])}
                  className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50"
                >
                  Limpiar todo
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {files.map((file, index) => (
                  <PagePreview
                    key={`${file.name}-${index}`}
                    file={file}
                    index={index}
                    onRemove={handleRemoveFile}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {uploading && uploadMethod === "individual" && (
        <ProgressBar
          progress={uploadProgress}
          current={currentUploading}
          total={files.length}
        />
      )}

      <div className="flex gap-4">
        <button
          onClick={() => setFiles([])}
          disabled={uploading || files.length === 0}
          className="flex-1 rounded-lg border border-zinc-300 dark:border-zinc-700 px-4 py-3 text-sm font-medium text-zinc-900 dark:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancelar
        </button>
        <button
          onClick={handleUpload}
          disabled={uploading || files.length === 0}
          className="flex-1 rounded-lg bg-zinc-900 dark:bg-zinc-50 dark:text-zinc-900 px-4 py-3 text-sm font-medium text-white hover:bg-zinc-700 dark:hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? "Subiendo..." : "Subir"}
        </button>
      </div>
    </div>
  );
}
