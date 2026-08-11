import React, { useState, useEffect } from 'react';
import { ScriptScene } from '../types';
import { 
  X, Sparkles, Sliders, Replace, RotateCcw, Save, Play, Film, Palette, Moon, Box, Camera, Wand2, Type
} from 'lucide-react';

interface BulkEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  scenes: ScriptScene[];
  onSave: (updatedPrompts: Record<string, string>) => void;
  onSaveAndGenerateAll: (updatedPrompts: Record<string, string>) => void;
}

const STYLE_PRESETS = [
  {
    id: 'cinematic',
    name: 'Cinematic Film',
    icon: Film,
    prefix: 'Cinematic movie scene, 35mm film grain, 8k resolution, warm volumetric lighting, ',
    suffix: ', dramatic composition, photorealistic',
  },
  {
    id: 'anime',
    name: 'Anime / Ghibli',
    icon: Palette,
    prefix: 'Detailed anime style illustration, vibrant colors, Studio Ghibli inspired, ',
    suffix: ', high quality digital art, crisp lines',
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    icon: Sparkles,
    prefix: 'Cyberpunk aesthetic, neon futuristic glow, dark moody rain night, ',
    suffix: ', highly detailed, volumetric fog, octane render',
  },
  {
    id: 'noir',
    name: 'Vintage Noir',
    icon: Moon,
    prefix: 'Black and white film noir, dramatic high-contrast lighting, 1940s atmosphere, ',
    suffix: ', deep shadows, grainy texture',
  },
  {
    id: '3d-render',
    name: '3D Render',
    icon: Box,
    prefix: '3D animated render, Pixar style, soft studio lighting, vibrant color palette, ',
    suffix: ', smooth textures, 8k resolution, raytraced',
  },
  {
    id: 'photorealistic',
    name: 'Photorealistic',
    icon: Camera,
    prefix: 'Ultra-realistic photography, Hasselblad medium format, natural lighting, ',
    suffix: ', sharp focus, intricate details, 8k',
  },
];

export const BulkEditModal: React.FC<BulkEditModalProps> = ({
  isOpen,
  onClose,
  scenes,
  onSave,
  onSaveAndGenerateAll,
}) => {
  const [promptsMap, setPromptsMap] = useState<Record<string, string>>({});
  const [prefix, setPrefix] = useState('');
  const [suffix, setSuffix] = useState('');
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [activeTab, setActiveTab] = useState<'individual' | 'presets'>('individual');
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const initialMap: Record<string, string> = {};
      scenes.forEach((s) => {
        initialMap[s.id] = s.visual_prompt;
      });
      setPromptsMap(initialMap);
      setPrefix('');
      setSuffix('');
      setFindText('');
      setReplaceText('');
      setNotification(null);
    }
  }, [isOpen, scenes]);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const handlePromptChange = (id: string, value: string) => {
    setPromptsMap((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handlePrependAll = () => {
    if (!prefix.trim()) return;
    setPromptsMap((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((id) => {
        if (!next[id].startsWith(prefix)) {
          next[id] = prefix + next[id];
        }
      });
      return next;
    });
    showToast(`Added prefix to all ${scenes.length} scenes`);
  };

  const handleAppendAll = () => {
    if (!suffix.trim()) return;
    setPromptsMap((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((id) => {
        if (!next[id].endsWith(suffix)) {
          next[id] = next[id] + suffix;
        }
      });
      return next;
    });
    showToast(`Added suffix to all ${scenes.length} scenes`);
  };

  const handleApplyPreset = (preset: typeof STYLE_PRESETS[0]) => {
    setPromptsMap((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((id) => {
        let text = next[id];
        // Prepend if not already starting with prefix
        if (preset.prefix && !text.startsWith(preset.prefix)) {
          text = preset.prefix + text;
        }
        // Append if not already ending with suffix
        if (preset.suffix && !text.endsWith(preset.suffix)) {
          text = text + preset.suffix;
        }
        next[id] = text;
      });
      return next;
    });
    showToast(`Applied "${preset.name}" style preset to all scenes`);
  };

  const handleFindReplace = () => {
    if (!findText) return;
    let replacedCount = 0;
    setPromptsMap((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((id) => {
        if (next[id].includes(findText)) {
          const re = new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
          next[id] = next[id].replace(re, replaceText);
          replacedCount++;
        }
      });
      return next;
    });
    showToast(`Replaced occurrences across ${replacedCount} scene(s)`);
  };

  const handleReset = () => {
    const resetMap: Record<string, string> = {};
    scenes.forEach((s) => {
      resetMap[s.id] = s.visual_prompt;
    });
    setPromptsMap(resetMap);
    setPrefix('');
    setSuffix('');
    setFindText('');
    setReplaceText('');
    showToast('Reset all prompts to original values');
  };

  const hasChanges = scenes.some((s) => promptsMap[s.id] !== s.visual_prompt);

  const handleSave = () => {
    onSave(promptsMap);
    onClose();
  };

  const handleSaveAndGenerate = () => {
    onSaveAndGenerateAll(promptsMap);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in no-print">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/30">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Bulk Edit Visual Prompts
              </h3>
              <p className="text-xs text-slate-400">
                Adjust style tags, batch modify, or fine-tune individual scene prompts across all {scenes.length} frames
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Toast Notification */}
        {notification && (
          <div className="bg-indigo-600/20 border-b border-indigo-500/30 px-6 py-2.5 text-xs font-medium text-indigo-300 flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>{notification}</span>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-grow overflow-y-auto p-6 space-y-6">
          {/* Global Batch Controls */}
          <div className="bg-slate-800/60 rounded-xl p-5 border border-slate-700/80 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-indigo-400" />
                Batch Style & Prompt Modifiers
              </h4>
              <button
                onClick={handleReset}
                disabled={!hasChanges}
                className="text-xs text-slate-400 hover:text-slate-200 disabled:opacity-40 disabled:hover:text-slate-400 flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset All Prompts
              </button>
            </div>

            {/* Quick Style Presets */}
            <div>
              <label className="text-xs font-semibold text-slate-400 mb-2 block">
                Quick Style Presets (Applies preset tags to all prompts)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                {STYLE_PRESETS.map((preset) => {
                  const Icon = preset.icon;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => handleApplyPreset(preset)}
                      className="p-2.5 bg-slate-900/80 hover:bg-indigo-600/20 border border-slate-700/70 hover:border-indigo-500/50 rounded-lg text-left transition-all duration-200 group flex flex-col items-center sm:items-start text-center sm:text-left"
                    >
                      <Icon className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform mb-1" />
                      <span className="text-xs font-medium text-slate-200 group-hover:text-indigo-300">
                        {preset.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Batch Prefix & Suffix Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Prefix */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 flex items-center justify-between">
                  <span>Prepend Prefix to All Prompts</span>
                  <Type className="w-3.5 h-3.5 text-slate-500" />
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={prefix}
                    onChange={(e) => setPrefix(e.target.value)}
                    placeholder="e.g. Cinematic film, 35mm grain, "
                    className="flex-grow bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <button
                    onClick={handlePrependAll}
                    disabled={!prefix.trim()}
                    className="px-3 py-2 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 rounded-lg text-xs font-medium transition-colors disabled:opacity-40 disabled:pointer-events-none whitespace-nowrap"
                  >
                    Prepend All
                  </button>
                </div>
              </div>

              {/* Suffix */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 flex items-center justify-between">
                  <span>Append Suffix to All Prompts</span>
                  <Type className="w-3.5 h-3.5 text-slate-500" />
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={suffix}
                    onChange={(e) => setSuffix(e.target.value)}
                    placeholder="e.g. , 8k resolution, dramatic lighting"
                    className="flex-grow bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <button
                    onClick={handleAppendAll}
                    disabled={!suffix.trim()}
                    className="px-3 py-2 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 rounded-lg text-xs font-medium transition-colors disabled:opacity-40 disabled:pointer-events-none whitespace-nowrap"
                  >
                    Append All
                  </button>
                </div>
              </div>
            </div>

            {/* Find and Replace */}
            <div className="pt-2 border-t border-slate-700/50">
              <label className="text-xs font-semibold text-slate-400 mb-1.5 block">
                Find & Replace Across All Prompts
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={findText}
                  onChange={(e) => setFindText(e.target.value)}
                  placeholder="Find text..."
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <input
                  type="text"
                  value={replaceText}
                  onChange={(e) => setReplaceText(e.target.value)}
                  placeholder="Replace with..."
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  onClick={handleFindReplace}
                  disabled={!findText}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-xs font-medium transition-colors disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-1.5"
                >
                  <Replace className="w-3.5 h-3.5 text-indigo-400" />
                  Replace
                </button>
              </div>
            </div>
          </div>

          {/* Individual Scene Prompts List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Individual Scene Prompts ({scenes.length})
              </h4>
              <span className="text-xs text-slate-500">
                Directly edit any scene's prompt below
              </span>
            </div>

            <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-1">
              {scenes.map((scene) => (
                <div
                  key={scene.id}
                  className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/70 hover:border-slate-600 transition-colors space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                      Scene {scene.scene_number}
                    </span>
                    <span className="text-xs text-slate-500 truncate max-w-[60%]">
                      "{scene.description}"
                    </span>
                  </div>

                  <textarea
                    value={promptsMap[scene.id] || ''}
                    onChange={(e) => handlePromptChange(scene.id, e.target.value)}
                    rows={3}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-y"
                    placeholder={`Visual prompt for scene ${scene.scene_number}...`}
                  />
                  <div className="flex justify-end text-[10px] text-slate-500">
                    {(promptsMap[scene.id] || '').length} characters
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-400">
            {hasChanges ? (
              <span className="text-amber-400 font-medium flex items-center gap-1.5">
                • Unsaved changes made to prompts
              </span>
            ) : (
              <span className="text-slate-500">No prompt changes pending</span>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium transition-colors border border-slate-700 flex items-center gap-2"
            >
              <Save className="w-3.5 h-3.5 text-indigo-400" />
              Save Prompts
            </button>
            <button
              onClick={handleSaveAndGenerate}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition-colors shadow-lg shadow-indigo-500/20 flex items-center gap-2 active:scale-95 transform"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Save & Generate All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
