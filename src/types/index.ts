
export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  category: string;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  alarms: Alarm[];
  tags: string[];
  timerDuration?: number; // in minutes
  timeSpent: number; // in minutes
}

export interface Alarm {
  id: string;
  time: Date;
  enabled: boolean;
  label: string;
}

export interface MoodEntry {
  id: string;
  date: Date;
  mood: number; // 1-5 scale
  emoji: string;
  note?: string;
}

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
}

export interface AppSettings {
  theme: 'light' | 'dark';
  notifications: boolean;
  soundEnabled: boolean;
}
