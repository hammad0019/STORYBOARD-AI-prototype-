export interface ScriptScene {
  id: string;
  scene_number: number;
  description: string;
  visual_prompt: string;
  image_url?: string;
  is_generating: boolean;
  error?: string;
}

export enum AppView {
  SCRIPT_INPUT = 'SCRIPT_INPUT',
  BOARD_VIEW = 'BOARD_VIEW'
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}