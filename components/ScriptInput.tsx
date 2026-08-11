import React, { useState } from 'react';
import { Wand2, AlertCircle } from 'lucide-react';

interface ScriptInputProps {
  onAnalyze: (script: string) => void;
  isAnalyzing: boolean;
}

export const ScriptInput: React.FC<ScriptInputProps> = ({ onAnalyze, isAnalyzing }) => {
  const [script, setScript] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!script.trim()) {
      setError("Please enter a script first.");
      return;
    }
    setError(null);
    onAnalyze(script);
  };

  const sampleScript = `EXT. CITY STREET - NIGHT
Rain slicks the neon-lit pavement. A lone DETECTIVE (40s, trench coat) stands under a flickering streetlamp, lighting a cigarette.

INT. DINER - NIGHT
The Detective enters. The bell chimes. A TIRED WAITRESS looks up from the counter.

DETECTIVE
Coffee. Black.

The Waitress nods, pouring a steaming cup. The Detective stares out the window at a hovering drone scanning the crowd.`;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="text-center space-y-4 mb-10">
        <h2 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
          Bring your story to life.
        </h2>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
          Paste your screenplay, video script, or even a rough idea below. 
          Our AI will break it down into scenes and generate professional storyboard frames instantly.
        </p>
      </div>

      <div className="bg-slate-800 rounded-2xl p-1 shadow-xl border border-slate-700 focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
        <textarea
          value={script}
          onChange={(e) => setScript(e.target.value)}
          className="w-full h-96 bg-slate-900 rounded-xl p-6 text-slate-300 placeholder-slate-600 focus:outline-none resize-none font-mono text-sm leading-relaxed"
          placeholder="EXT. ALIEN PLANET - DAY..."
        />
      </div>

      {error && (
        <div className="flex items-center space-x-2 text-red-400 text-sm px-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex items-center justify-between pt-2">
        <button
          onClick={() => setScript(sampleScript)}
          className="text-sm text-slate-500 hover:text-indigo-400 transition-colors"
        >
          Use sample script
        </button>

        <button
          onClick={handleSubmit}
          disabled={isAnalyzing}
          className={`flex items-center space-x-2 px-8 py-3 rounded-xl font-semibold text-white transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-indigo-500/25 ${
            isAnalyzing
              ? 'bg-slate-700 cursor-wait'
              : 'bg-indigo-600 hover:bg-indigo-500'
          }`}
        >
          {isAnalyzing ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5" />
              <span>Generate Storyboard</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
