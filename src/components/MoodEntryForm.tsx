
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Save, X } from 'lucide-react';
import { MoodEntry } from '@/types';

const moodEmojis = [
  { value: 1, emoji: '😢', label: 'Very Sad' },
  { value: 2, emoji: '😔', label: 'Sad' },
  { value: 3, emoji: '😐', label: 'Neutral' },
  { value: 4, emoji: '😊', label: 'Happy' },
  { value: 5, emoji: '😄', label: 'Very Happy' },
];

interface MoodEntryFormProps {
  entry?: MoodEntry;
  onSave: (entry: Omit<MoodEntry, 'id'>) => void;
  onCancel: () => void;
}

const MoodEntryForm = ({ entry, onSave, onCancel }: MoodEntryFormProps) => {
  const [selectedMood, setSelectedMood] = useState<number>(entry?.mood || 3);
  const [moodNote, setMoodNote] = useState(entry?.note || '');
  const [selectedDate, setSelectedDate] = useState<Date>(entry ? new Date(entry.date) : new Date());

  const handleSave = () => {
    const moodEmoji = moodEmojis.find(m => m.value === selectedMood);
    onSave({
      date: selectedDate,
      mood: selectedMood,
      emoji: moodEmoji?.emoji || '😐',
      note: moodNote.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md bg-slate-800 border-slate-600">
        <CardHeader>
          <CardTitle className="text-white">
            {entry ? 'Edit Mood Entry' : 'Add Mood Entry'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Date Selection */}
          <div>
            <label className="text-sm text-slate-300 mb-2 block">Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start border-slate-600 text-white hover:bg-slate-700"
                >
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  {format(selectedDate, 'PPP')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-slate-800 border-slate-600">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Mood Selection */}
          <div>
            <label className="text-sm text-slate-300 mb-2 block">How are you feeling?</label>
            <div className="flex justify-center gap-2">
              {moodEmojis.map(mood => (
                <button
                  key={mood.value}
                  onClick={() => setSelectedMood(mood.value)}
                  className={`text-3xl p-2 rounded-full transition-all duration-200 hover:scale-110 ${
                    selectedMood === mood.value 
                      ? 'bg-pink-600/50 ring-2 ring-pink-400' 
                      : 'bg-slate-700/30 hover:bg-slate-600/50'
                  }`}
                  title={mood.label}
                >
                  {mood.emoji}
                </button>
              ))}
            </div>
          </div>
          
          {/* Note */}
          <div>
            <label className="text-sm text-slate-300 mb-2 block">Note (optional)</label>
            <Textarea
              value={moodNote}
              onChange={(e) => setMoodNote(e.target.value)}
              placeholder="How was your day? What made you feel this way?"
              className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400"
            />
          </div>
          
          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleSave}
              className="flex-1 bg-pink-600 hover:bg-pink-700"
            >
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
            <Button
              onClick={onCancel}
              variant="outline"
              className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MoodEntryForm;
