/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  id: string;
  email: string;
  user_metadata?: {
    name?: string;
    avatar?: string;
  };
}

export interface Member {
  id: string;
  name: string;
  avatar: string;
  role: string;
  company: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Message {
  id: string;
  taskId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: string;
  isSystem?: boolean;
}

export type TaskPriority = 'BAIXA' | 'MÉDIA' | 'CRÍTICA' | 'CONCLUÍDO';
export type TaskColumn = 'todo' | 'inprogress' | 'done';

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  column: TaskColumn;
  assignees: string[]; // Member IDs
  effort: string;
  statusText: string;
  progress: number;
  checklist: ChecklistItem[];
  insight: string | null;
}

export interface TeamDynamicsAnalysis {
  positiveSignals: string[];
  communicationPatterns: string[];
  overloadSigns: string[];
  potentialTensions: string[];
  collaborationRisks: string[];
  improvementSuggestions: string[];
  overallSummary: string;
}

export interface TeamHealth {
  climate: string; // e.g. "Sereno", "Agitado", etc.
  rechargeTime: string; // e.g. "12h Restantes"
  mentalAlignment: string; // e.g. "Alta Fluidez"
  empathyLevel: number; // 0-100 percentage
  collectiveSymmetry: number; // 0-100 percentage
  careSignals: string; // AI generated synthesis
}
