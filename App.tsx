import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { ScriptInput } from './components/ScriptInput';
import { Storyboard } from './components/Storyboard';
import { Assistant } from './components/Assistant';
import { AppView, ScriptScene } from './types';
import { analyzeScript, generateSceneImage } from './services/geminiService';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.SCRIPT_INPUT);
  const [scenes, setScenes] = useState<ScriptScene[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  const handleAnalyzeScript = async (scriptText: string) => {
    setIsAnalyzing(true);
    try {
      const analyzedScenes = await analyzeScript(scriptText);
      setScenes(analyzedScenes);
      setView(AppView.BOARD_VIEW);
    } catch (error) {
      alert("Failed to analyze script. Please check your API key and try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleUpdateScene = (id: string, updates: Partial<ScriptScene>) => {
    setScenes(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const handleBulkUpdatePrompts = (updatedPrompts: Record<string, string>) => {
    setScenes(prev => prev.map(s => 
      updatedPrompts[s.id] !== undefined ? { ...s, visual_prompt: updatedPrompts[s.id] } : s
    ));
  };

  const handleGenerateImage = async (id: string) => {
    const sceneIndex = scenes.findIndex(s => s.id === id);
    if (sceneIndex === -1) return;

    // Optimistic update: loading state, clear previous errors
    setScenes(prev => prev.map(s => s.id === id ? { ...s, is_generating: true, error: undefined } : s));

    try {
      const scene = scenes.find(s => s.id === id);
      if (!scene) return;
      
      const imageUrl = await generateSceneImage(scene.visual_prompt);
      
      setScenes(prev => prev.map(s => 
        s.id === id 
          ? { ...s, image_url: imageUrl || undefined, is_generating: false } 
          : s
      ));
    } catch (error: any) {
      console.error(error);
      const errorMsg = "Generation failed";

      setScenes(prev => prev.map(s => 
        s.id === id ? { ...s, is_generating: false, error: errorMsg } : s
      ));
    }
  };

  const handleGenerateAll = async () => {
    const scenesToGenerate = scenes.filter(s => !s.image_url && !s.is_generating);
    if (scenesToGenerate.length === 0) return;

    // 1. Set all to loading
    const idsToGenerate = new Set(scenesToGenerate.map(s => s.id));
    setScenes(prev => prev.map(s => 
      idsToGenerate.has(s.id) ? { ...s, is_generating: true, error: undefined } : s
    ));

    // 2. Parallel Generation (Puter handles concurrency well)
    const promises = scenesToGenerate.map(async (scene) => {
      try {
        const imageUrl = await generateSceneImage(scene.visual_prompt);
        
        setScenes(prev => prev.map(s => 
          s.id === scene.id 
            ? { ...s, image_url: imageUrl || undefined, is_generating: false } 
            : s
        ));
      } catch (error) {
        console.error(`Failed to generate scene ${scene.scene_number}:`, error);
        setScenes(prev => prev.map(s => 
          s.id === scene.id ? { ...s, is_generating: false, error: "Generation failed" } : s
        ));
      }
    });

    await Promise.all(promises);
  };

  return (
    <Layout onOpenAssistant={() => setIsAssistantOpen(true)}>
      {view === AppView.SCRIPT_INPUT && (
        <ScriptInput 
          onAnalyze={handleAnalyzeScript} 
          isAnalyzing={isAnalyzing} 
        />
      )}
      
      {view === AppView.BOARD_VIEW && (
        <Storyboard
          scenes={scenes}
          onBack={() => setView(AppView.SCRIPT_INPUT)}
          onUpdateScene={handleUpdateScene}
          onBulkUpdatePrompts={handleBulkUpdatePrompts}
          onGenerateImage={handleGenerateImage}
          onGenerateAll={handleGenerateAll}
        />
      )}

      <Assistant 
        isOpen={isAssistantOpen} 
        onClose={() => setIsAssistantOpen(false)}
        contextData={scenes}
      />
    </Layout>
  );
};

export default App;