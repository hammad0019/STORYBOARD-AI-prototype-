import React, { useState } from 'react';
import { ScriptScene } from '../types';
import { FrameCard } from './FrameCard';
import { BulkEditModal } from './BulkEditModal';
import { ArrowLeft, Layers, Loader2, Sliders, Printer } from 'lucide-react';

interface StoryboardProps {
  scenes: ScriptScene[];
  onBack: () => void;
  onUpdateScene: (id: string, updates: Partial<ScriptScene>) => void;
  onBulkUpdatePrompts?: (updatedPrompts: Record<string, string>) => void;
  onGenerateImage: (id: string) => void;
  onGenerateAll: () => void;
}

export const Storyboard: React.FC<StoryboardProps> = ({
  scenes,
  onBack,
  onUpdateScene,
  onBulkUpdatePrompts,
  onGenerateImage,
  onGenerateAll
}) => {
  const [isBulkEditOpen, setIsBulkEditOpen] = useState(false);
  
  const completedCount = scenes.filter(s => s.image_url).length;
  const isComplete = completedCount === scenes.length;
  const progress = Math.round((completedCount / scenes.length) * 100);
  const isAnyGenerating = scenes.some(s => s.is_generating);

  const handleSaveBulkPrompts = (updatedPrompts: Record<string, string>) => {
    if (onBulkUpdatePrompts) {
      onBulkUpdatePrompts(updatedPrompts);
    } else {
      Object.entries(updatedPrompts).forEach(([id, prompt]) => {
        onUpdateScene(id, { visual_prompt: prompt });
      });
    }
  };

  const handleSaveAndGenerateAll = (updatedPrompts: Record<string, string>) => {
    handleSaveBulkPrompts(updatedPrompts);
    setTimeout(() => {
      onGenerateAll();
    }, 100);
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-800/50 p-4 rounded-2xl border border-slate-700 backdrop-blur-sm sticky top-20 z-40 no-print">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white"
            title="Back to Script"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              Storyboard
            </h2>
            <div className="flex items-center gap-2">
              <p className="text-xs text-slate-400">
                {completedCount} of {scenes.length} frames rendered
              </p>
              {isAnyGenerating && (
                <span className="text-xs text-indigo-400 animate-pulse font-medium flex items-center gap-1">
                   • Processing...
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Bulk Edit Button */}
          <button
            onClick={() => setIsBulkEditOpen(true)}
            className="px-3.5 py-2 bg-slate-700/80 hover:bg-slate-700 text-slate-200 rounded-lg text-sm font-medium transition-colors border border-slate-600/60 flex items-center gap-2 shadow-sm hover:border-indigo-500/50"
            title="Bulk edit visual prompts for all scenes"
          >
            <Sliders className="w-4 h-4 text-indigo-400" />
            <span>Bulk Edit Prompts</span>
          </button>

          {/* Export PDF Button */}
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-slate-700/80 hover:bg-slate-700 text-slate-200 rounded-lg text-sm font-medium transition-colors border border-slate-600/60 flex items-center gap-2 shadow-sm hover:border-indigo-500/50"
            title="Export storyboard as PDF or print"
          >
            <Printer className="w-4 h-4 text-indigo-400" />
            <span>Export PDF</span>
          </button>

          {/* Progress Bar */}
          {progress < 100 && (
            <div className="hidden sm:block w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-500 transition-all duration-500 relative"
                style={{ width: `${progress}%` }}
              >
                {isAnyGenerating && (
                   <div className="absolute inset-0 bg-white/20 animate-pulse w-full h-full" />
                )}
              </div>
            </div>
          )}
          
          {/* Status / Action Buttons */}
          {isAnyGenerating ? (
            <div className="px-4 py-2 bg-indigo-600/50 text-indigo-200 rounded-lg text-sm font-medium flex items-center gap-2 cursor-wait border border-indigo-500/20">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Generating...</span>
            </div>
          ) : !isComplete ? (
            <button
              onClick={onGenerateAll}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-indigo-500/20 active:transform active:scale-95"
            >
              Generate All Images
            </button>
          ) : null}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20 print-grid-cols-2">
        {scenes.map((scene) => (
          <FrameCard
            key={scene.id}
            scene={scene}
            onUpdate={(updates) => onUpdateScene(scene.id, updates)}
            onGenerate={() => onGenerateImage(scene.id)}
          />
        ))}
      </div>

      {/* Bulk Edit Modal */}
      <BulkEditModal
        isOpen={isBulkEditOpen}
        onClose={() => setIsBulkEditOpen(false)}
        scenes={scenes}
        onSave={handleSaveBulkPrompts}
        onSaveAndGenerateAll={handleSaveAndGenerateAll}
      />
    </div>
  );
};