
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Send, Lightbulb, X, Sparkles } from 'lucide-react';
import { parseNaturalLanguage, suggestCompletions } from '@/utils/naturalLanguageParser';

interface NaturalLanguageInputProps {
  onTaskCreate: (taskData: any) => void;
  onMoodCreate: (moodData: any) => void;
  onJournalCreate: (journalData: any) => void;
}

const NaturalLanguageInput: React.FC<NaturalLanguageInputProps> = ({
  onTaskCreate,
  onMoodCreate,
  onJournalCreate
}) => {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (input.length > 2) {
      const newSuggestions = suggestCompletions(input);
      setSuggestions(newSuggestions);
      setShowSuggestions(newSuggestions.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }, [input]);

  const handleSubmit = async () => {
    if (!input.trim()) return;

    setIsProcessing(true);
    const parsed = parseNaturalLanguage(input);

    if (parsed && parsed.confidence > 0.5) {
      try {
        switch (parsed.type) {
          case 'task':
            onTaskCreate(parsed.data);
            break;
          case 'mood':
            onMoodCreate(parsed.data);
            break;
          case 'journal':
            onJournalCreate(parsed.data);
            break;
        }
        setInput('');
        setShowSuggestions(false);
      } catch (error) {
        console.error('Error creating entry:', error);
      }
    }

    setIsProcessing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const applySuggestion = (suggestion: string) => {
    setInput(suggestion);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  return (
    <Card className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 border-blue-500/20 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-medium text-blue-400">Natural Language Input</span>
        </div>
        
        <div className="relative">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Try: 'Add task: Review project by tomorrow' or 'I feel happy today'"
              className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400"
            />
            <Button
              onClick={handleSubmit}
              disabled={!input.trim() || isProcessing}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>

          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-600 rounded-lg shadow-lg z-50">
              <div className="p-2 border-b border-slate-600 flex items-center gap-2">
                <Lightbulb className="w-3 h-3 text-yellow-400" />
                <span className="text-xs text-slate-300">Suggestions</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSuggestions(false)}
                  className="ml-auto h-6 w-6 p-0"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
              <div className="p-2 space-y-1">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => applySuggestion(suggestion)}
                    className="w-full text-left p-2 text-sm text-slate-300 hover:bg-slate-700 rounded transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          <Badge variant="outline" className="border-blue-500/30 text-blue-400">
            Tasks: "Add task: ..."
          </Badge>
          <Badge variant="outline" className="border-pink-500/30 text-pink-400">
            Mood: "I feel happy"
          </Badge>
          <Badge variant="outline" className="border-green-500/30 text-green-400">
            Journal: "Write about..."
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default NaturalLanguageInput;
