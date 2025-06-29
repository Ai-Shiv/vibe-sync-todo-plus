
import { Task, MoodEntry, JournalEntry } from '@/types';

export interface ParsedIntent {
  type: 'task' | 'mood' | 'journal';
  action: 'create' | 'update' | 'delete';
  data: any;
  confidence: number;
}

export const parseNaturalLanguage = (input: string): ParsedIntent | null => {
  const lowerInput = input.toLowerCase().trim();
  
  // Task patterns
  const taskPatterns = [
    /(?:add|create|new|make)\s+(?:task|todo|reminder)?\s*:?\s*(.+)/i,
    /(?:remind me to|i need to|todo)\s+(.+)/i,
    /(.+)\s+(?:by|due|before)\s+(.+)/i,
    /(.+)\s+(?:high|medium|low)\s+priority/i,
    /(?:urgent|important):\s*(.+)/i
  ];

  // Mood patterns
  const moodPatterns = [
    /(?:i feel|feeling|mood is|i am)\s+(very sad|sad|okay|good|great|happy|excited|terrible|awful|amazing)/i,
    /(?:mood|feeling):\s*([1-5])/i,
    /(😢|😔|😐|😊|😄)/
  ];

  // Journal patterns
  const journalPatterns = [
    /(?:journal|diary|note|write|log)\s*:?\s*(.+)/i,
    /(?:dear diary|today i|reflection)\s*:?\s*(.+)/i
  ];

  // Check for task patterns
  for (const pattern of taskPatterns) {
    const match = lowerInput.match(pattern);
    if (match) {
      const title = match[1].trim();
      
      // Extract priority
      let priority: 'low' | 'medium' | 'high' = 'medium';
      if (lowerInput.includes('urgent') || lowerInput.includes('important') || lowerInput.includes('high priority')) {
        priority = 'high';
      } else if (lowerInput.includes('low priority')) {
        priority = 'low';
      }

      // Extract due date
      let dueDate: Date | undefined;
      const dateMatch = lowerInput.match(/(?:by|due|before)\s+(today|tomorrow|next week|monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i);
      if (dateMatch) {
        const dateStr = dateMatch[1].toLowerCase();
        const now = new Date();
        
        switch (dateStr) {
          case 'today':
            dueDate = new Date(now);
            break;
          case 'tomorrow':
            dueDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
            break;
          case 'next week':
            dueDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
            break;
        }
      }

      return {
        type: 'task',
        action: 'create',
        data: {
          title,
          description: '',
          priority,
          category: '',
          dueDate,
          completed: false,
          alarms: [],
          tags: [],
          timeSpent: 0
        },
        confidence: 0.8
      };
    }
  }

  // Check for mood patterns
  for (const pattern of moodPatterns) {
    const match = lowerInput.match(pattern);
    if (match) {
      let moodValue = 3;
      const moodText = match[1];
      
      if (moodText.includes('terrible') || moodText.includes('awful') || moodText.includes('😢')) {
        moodValue = 1;
      } else if (moodText.includes('sad') || moodText.includes('😔')) {
        moodValue = 2;
      } else if (moodText.includes('okay') || moodText.includes('😐')) {
        moodValue = 3;
      } else if (moodText.includes('good') || moodText.includes('happy') || moodText.includes('😊')) {
        moodValue = 4;
      } else if (moodText.includes('great') || moodText.includes('amazing') || moodText.includes('excited') || moodText.includes('😄')) {
        moodValue = 5;
      } else if (/[1-5]/.test(moodText)) {
        moodValue = parseInt(moodText);
      }

      const moodEmojis = ['', '😢', '😔', '😐', '😊', '😄'];
      
      return {
        type: 'mood',
        action: 'create',
        data: {
          date: new Date(),
          mood: moodValue,
          emoji: moodEmojis[moodValue],
          note: input
        },
        confidence: 0.7
      };
    }
  }

  // Check for journal patterns
  for (const pattern of journalPatterns) {
    const match = lowerInput.match(pattern);
    if (match) {
      const content = match[1].trim();
      
      return {
        type: 'journal',
        action: 'create',
        data: {
          title: content.length > 50 ? content.substring(0, 50) + '...' : content,
          content,
          tags: []
        },
        confidence: 0.6
      };
    }
  }

  return null;
};

export const suggestCompletions = (input: string): string[] => {
  const suggestions: string[] = [];
  const lowerInput = input.toLowerCase();

  // Task suggestions
  if (lowerInput.includes('task') || lowerInput.includes('todo') || lowerInput.includes('remind')) {
    suggestions.push(
      'Add task: Complete project report by tomorrow',
      'Remind me to call mom at 6pm',
      'High priority: Review budget proposal',
      'Add urgent task: Submit application'
    );
  }

  // Mood suggestions
  if (lowerInput.includes('feel') || lowerInput.includes('mood')) {
    suggestions.push(
      'I feel happy today because...',
      'Mood: 4 - Had a productive day',
      'Feeling stressed about upcoming deadline',
      'I am excited about the weekend'
    );
  }

  // Journal suggestions
  if (lowerInput.includes('journal') || lowerInput.includes('write') || lowerInput.includes('note')) {
    suggestions.push(
      'Journal: Today I learned something new',
      'Write about my morning routine',
      'Note: Important meeting insights',
      'Dear diary, today was special because...'
    );
  }

  return suggestions.slice(0, 4);
};
