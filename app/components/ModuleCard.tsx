"use client";

import { ReactNode } from "react";

interface Props {
  title: string;
  icon: string;
  children: ReactNode;
}

export default function ModuleCard({ title, icon, children }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
      <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
        <span>{icon}</span>
        {title}
      </h3>
      <div className="text-sm text-gray-700 space-y-2">{children}</div>
    </div>
  );
}
