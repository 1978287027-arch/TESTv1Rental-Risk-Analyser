"use client";

import { useState, useRef, useCallback } from "react";
import { fileToBase64, compressImage, MAX_IMAGES, MAX_IMAGE_SIZE } from "@/app/lib/utils";

interface Props {
  images: string[];
  onChange: (images: string[]) => void;
}

export default function ImageUpload({ images, onChange }: Props) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    async (files: FileList) => {
      const remaining = MAX_IMAGES - images.length;
      if (remaining <= 0) return;

      const newFiles = Array.from(files).slice(0, remaining);
      const validFiles = newFiles.filter((f) => {
        if (!f.type.startsWith("image/")) return false;
        if (f.size > MAX_IMAGE_SIZE) {
          alert(`${f.name} 文件过大，请选择小于 5MB 的图片`);
          return false;
        }
        return true;
      });

      const newImages: string[] = [];
      for (const file of validFiles) {
        const base64 = await fileToBase64(file);
        const compressed = await compressImage(base64);
        newImages.push(compressed);
      }

      onChange([...images, ...newImages]);
    },
    [images, onChange],
  );

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-gray-700">
        📷 房源截图{" "}
        <span className="text-gray-400 font-normal">（可选，最多 {MAX_IMAGES} 张）</span>
      </label>

      {/* 已上传的图片 */}
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {images.map((img, i) => (
            <div key={i} className="relative group">
              <img
                src={img}
                alt={`房源图 ${i + 1}`}
                className="w-24 h-24 object-cover rounded-lg border border-gray-200"
              />
              <button
                onClick={() => removeImage(i)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                title="删除"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 上传区域 */}
      {images.length < MAX_IMAGES && (
        <div
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
            dragOver
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-gray-400 bg-gray-50"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
          }}
          onClick={() => inputRef.current?.click()}
        >
          <p className="text-gray-500 text-sm">
            📁 拖拽图片到此处，或 <span className="text-blue-600 underline">点击上传</span>
          </p>
          <p className="text-gray-400 text-xs mt-1">
            支持 JPG/PNG，单张 &lt;5MB，自动压缩
          </p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
      />
    </div>
  );
}
