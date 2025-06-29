
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
  recurrence?: Recurrence;
  dependencies: string[]; // Task IDs this task depends on
  subtasks: SubTask[];
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
}

export interface Recurrence {
  type: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number; // every N days/weeks/months/years
  daysOfWeek?: number[]; // 0-6, Sunday-Saturday (for weekly)
  dayOfMonth?: number; // 1-31 (for monthly)
  endDate?: Date;
  endAfterOccurrences?: number;
}

export interface Alarm {
  id: string;
  time: Date;
  enabled: boolean;
  label: string;
  soundId?: string;
  snoozeMinutes?: number;
}

export interface MoodEntry {
  id: string;
  date: Date;
  mood: number; // 1-5 scale
  emoji: string;
  note?: string;
  tags?: string[];
  activities?: string[];
  weather?: string;
  sleep?: number; // hours of sleep
}

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  folder?: string;
  pinned: boolean;
  wordCount: number;
  readTime: number; // estimated reading time in minutes
  attachments?: Attachment[];
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

export interface JournalFolder {
  id: string;
  name: string;
  description?: string;
  color: string;
  createdAt: Date;
  parentId?: string; // for nested folders
}

export interface AppSettings {
  theme: 'light' | 'dark';
  customTheme?: string;
  notifications: boolean;
  soundEnabled: boolean;
  defaultAlarmSound: string;
  snoozeMinutes: number;
  workingHours: {
    start: string;
    end: string;
    daysOfWeek: number[];
  };
  autoSave: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
  layoutPreferences: {
    sidebarCollapsed: boolean;
    compactMode: boolean;
    showCompletedTasks: boolean;
  };
}

export interface NotificationSound {
  id: string;
  name: string;
  url: string;
  duration: number;
}

export interface AppStats {
  tasksCompleted: number;
  totalTimeSpent: number;
  journalEntriesCount: number;
  averageMood: number;
  streakDays: number;
  lastActive: Date;
}
