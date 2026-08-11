import React, { useState } from 'react';
import { ScriptScene } from '../types';
import { RefreshCw, Edit2, Image as ImageIcon, Save, X, Download, Loader2, AlertCircle } from 'lucide-react';

interface FrameCardProps {
  scene: ScriptScene;
  onUpdate: (updates: Partial<ScriptScene>) => void;
  onGenerate: () => void;
}

export const FrameCard: React.FC<FrameCardProps> = ({ scene, onUpdate, onGenerate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editPrompt, setEditPrompt] = useState(scene.visual_prompt);

  const handleSavePrompt = () => {
    onUpdate({ visual_prompt: editPrompt });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditPrompt(scene.visual_prompt);
    setIsEditing(false);
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (scene.image_url) {
      const link = document.createElement('a');
      link.href = scene.image_url;
      link.download = `storyboard-scene-${scene.scene_number}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className={`bg-slate-800 rounded-xl overflow-hidden border transition-all duration-300 shadow-lg group flex flex-col h-full print-break-inside-avoid print-bg-white print-text-black ${scene.error ? 'border-red-500/50' : 'border-slate-700 hover:border-indigo-500/50'}`}>
      {/* Header */}
      <div className="px-4 py-3 bg-slate-900/50 border-b border-slate-700 flex justify-between items-center print-bg-white">
        <span className={`text-xs font-bold uppercase tracking-wider print-text-black ${scene.error ? 'text-red-400' : 'text-indigo-400'}`}>
          Scene {scene.scene_number}
        </span>
        <div className="flex gap-2 no-print">
           <button
             onClick={() => setIsEditing(!isEditing)}
             className="text-slate-400 hover:text-white transition-colors"
             title="Edit Prompt"
           >
             <Edit2 className="w-4 h-4" />
           </button>
        </div>
      </div>

      {/* Image Area */}
      <div className="relative aspect-video bg-slate-900 group-hover:bg-slate-950 transition-colors print-bg-white overflow-hidden">
        {scene.image_url ? (
          <>
            <img
              src={scene.image_url}
              alt={`Scene ${scene.scene_number}`}
              className="w-full h-full object-cover"
            />
            {/* Download Button - Top Right Corner (Always Visible) */}
             {!scene.is_generating && (
              <button
                onClick={handleDownload}
                className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full backdrop-blur-sm transition-all z-10 no-print border border-white/10"
                title="Download Image"
              >
                <Download className="w-4 h-4" />
              </button>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600 p-6 text-center">
            {scene.is_generating ? (
              <div className="flex flex-col items-center animate-pulse">
                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
                <span className="text-sm text-indigo-400 font-medium">Rendering...</span>
              </div>
            ) : scene.error ? (
              <div className="flex flex-col items-center text-red-400 animate-in fade-in duration-300">
                <AlertCircle className="w-10 h-10 mb-2" />
                <p className="text-sm font-medium mb-3">{scene.error}</p>
                <button 
                  onClick={onGenerate} 
                  className="text-xs bg-red-500/10 hover:bg-red-500/20 text-red-300 px-4 py-2 rounded-full transition-colors border border-red-500/20 flex items-center gap-2"
                >
                  <RefreshCw className="w-3 h-3" /> Try Again
                </button>
              </div>
            ) : (
              <>
                <ImageIcon className="w-12 h-12 mb-3 opacity-50" />
                <p className="text-sm">Ready to generate</p>
              </>
            )}
          </div>
        )}
        
        {/* Loading Overlay for re-generation (if image exists but is regenerating) */}
        {scene.image_url && scene.is_generating && (
           <div className="absolute inset-0 bg-slate-900/80 z-20 flex flex-col items-center justify-center backdrop-blur-sm">
              <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
              <span className="text-sm text-indigo-400 font-medium">Updating...</span>
           </div>
        )}
        
        {/* Center Generate/Regenerate Button Overlay (Screen only) */}
        {!scene.is_generating && !scene.error && (
           <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px] no-print">
             <button
               onClick={onGenerate}
               className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-full font-medium shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 flex items-center gap-2"
             >
               <RefreshCw className="w-4 h-4" />
               {scene.image_url ? 'Regenerate' : 'Generate'}
             </button>
           </div>
        )}
      </div>

      {/* Content Area */}
      <div className="p-4 flex flex-col flex-grow space-y-3">
        {/* Narrative Description */}
        <p className="text-slate-300 text-sm leading-relaxed border-l-2 border-slate-600 pl-3 italic print-text-black">
          "{scene.description}"
        </p>

        {/* Visual Prompt Editor */}
        <div className="mt-auto no-print">
          {isEditing ? (
            <div className="space-y-2 mt-2">
              <label className="text-xs text-slate-500 font-semibold uppercase">Visual Prompt</label>
              <textarea
                value={editPrompt}
                onChange={(e) => setEditPrompt(e.target.value)}
                className="w-full bg-slate-900 rounded-lg p-3 text-xs text-slate-300 border border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500 h-24 resize-none"
              />
              <div className="flex justify-end gap-2">
                <button 
                  onClick={handleCancelEdit}
                  className="p-1.5 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
                <button 
                  onClick={handleSavePrompt}
                  className="p-1.5 text-indigo-400 hover:text-indigo-300"
                >
                  <Save className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="group/prompt cursor-pointer" onClick={() => setIsEditing(true)}>
               <div className="flex justify-between items-baseline mb-1">
                 <span className="text-xs text-slate-500 font-semibold uppercase">Visual Prompt</span>
               </div>
               <p className="text-xs text-slate-500 line-clamp-3 hover:text-slate-400 transition-colors">
                 {scene.visual_prompt}
               </p>
            </div>
          )}
        </div>
        
        {/* Print-only prompt display */}
        <div className="hidden print:block mt-2">
           <span className="text-xs font-bold uppercase text-gray-500">Visual Prompt:</span>
           <p className="text-xs text-black">{scene.visual_prompt}</p>
        </div>
      </div>
    </div>
  );
};