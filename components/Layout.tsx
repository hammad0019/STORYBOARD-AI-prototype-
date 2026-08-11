import React from 'react';
import { Clapperboard, Sparkles } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  onOpenAssistant: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, onOpenAssistant }) => {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-700 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Clapperboard className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              StoryBoard AI
            </h1>
          </div>
          <button
            onClick={onOpenAssistant}
            className="flex items-center space-x-2 px-4 py-2 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors text-sm font-medium"
          >
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span>AI Assistant</span>
          </button>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {children}
      </main>

      <footer className="border-t border-slate-800 py-6 text-center text-slate-500 text-sm no-print">
        <p>Powered by Google Gemini 2.5 Flash & Pro Models</p>
      </footer>
    </div>
  );
};