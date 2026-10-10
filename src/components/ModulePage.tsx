import React from 'react';

interface ModulePageProps {
  title: string;
  children: React.ReactNode;
  onAdd?: () => void;
}

export default function ModulePage({ title, children, onAdd }: ModulePageProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        {onAdd && (
          <button 
            onClick={onAdd}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            + Add New
          </button>
        )}
      </div>
      <div className="bg-white p-6 border rounded-xl">
        {children}
      </div>
    </div>
  );
}
