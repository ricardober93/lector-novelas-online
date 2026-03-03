"use client";

import { useState } from "react";

interface PagePreviewProps {
  file: File;
  index: number;
  onRemove: (index: number) => void;
}

export function PagePreview({ file, index, onRemove }: PagePreviewProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  const reader = new FileReader();
  reader.onload = (e) => {
    setPreview(e.target?.result as string);
  };
  reader.readAsDataURL(file);

  return (
    <div className="relative group aspect-[3/4] rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-zinc-300 border-t-zinc-600 rounded-full animate-spin" />
        </div>
      )}

      {preview && (
        <img
          src={preview}
          alt={`Página ${index + 1}`}
          onLoad={() => setLoaded(true)}
          className="w-full h-full object-cover"
          style={{ opacity: loaded ? 1 : 0 }}
        />
      )}

      <div className="absolute top-2 left-2 bg-black/70 text-white text-xs py-1 px-2 rounded">
        {index + 1}
      </div>

      <button
        onClick={() => onRemove(index)}
        className="absolute top-2 right-2 bg-red-500 text-white w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-sm"
      >
        ×
      </button>
    </div>
  );
}
