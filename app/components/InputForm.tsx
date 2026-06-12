"use client";

import { useState } from "react";
import ImageUpload from "./ImageUpload";
import { validateRequest } from "@/app/lib/utils";
import type { AnalyzeRequest } from "@/app/lib/types";

interface Props {
  onSubmit: (data: AnalyzeRequest) => void;
}

export default function InputForm({ onSubmit }: Props) {
  const [images, setImages] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [city, setCity] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validateRequest({
      images,
      description,
      price: Number(price),
      city,
    });

    if (validationError) {
      setError(validationError);
      return;
    }

    onSubmit({
      images,
      description: description.trim(),
      price: Number(price),
      city: city.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 图片上传 */}
      <ImageUpload images={images} onChange={setImages} />

      {/* 房源描述 */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700">
          📝 房源描述 <span className="text-red-500">*</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="请描述房源信息，包括：户型、面积、楼层、朝向、装修情况、周边配套、小区名称等。\n\n💡 提示：如果你上传了图片，请在描述中说明图片包含哪些区域（如：客厅、厨房、卫生间、主卧等），AI 会结合你的描述进行分析。"
          rows={5}
          className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none placeholder:text-gray-400"
        />
      </div>

      {/* 价格 + 城市 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            💰 月租金（元） <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="例如：3000"
            min={1}
            max={100000}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            📍 城市 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="例如：北京"
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          ⚠️ {error}
        </div>
      )}

      {/* 提交按钮 */}
      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-xl transition-colors text-base cursor-pointer"
      >
        🔍 开始分析
      </button>
    </form>
  );
}
