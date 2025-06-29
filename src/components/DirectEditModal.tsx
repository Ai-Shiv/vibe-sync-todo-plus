
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { X, Save, Calendar as CalendarIcon, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Task, MoodEntry, JournalEntry } from '@/types';

interface DirectEditModalProps {
  type: 'task' | 'mood' | 'journal';
  item: Task | MoodEntry | JournalEntry;
  onSave: (updates: any) => void;
  onCancel: () => void;
}

const DirectEditModal: React.FC<DirectEditModalProps> = ({ type, item, onSave, onCancel }) => {
  const [formData, setFormData] = useState<any>({});
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    setFormData(item);
  }, [item]);

  const handleSave = () => {
    onSave(formData);
  };

  const addTag = () => {
    if (tagInput.trim() && formData.tags && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: (prev.tags || []).filter(tag => tag !== tagToRemove)
    }));
  };

  const renderTaskFields = () => (
    <>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Title</label>
        <Input
          value={formData.title || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          className="bg-slate-700 border-slate-600 text-white"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
        <Textarea
          value={formData.description || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          className="bg-slate-700 border-slate-600 text-white"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Priority</label>
          <select
            value={formData.priority || 'medium'}
            onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
          <Input
            value={formData.category || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            className="bg-slate-700 border-slate-600 text-white"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Due Date</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start bg-slate-700 border-slate-600 text-white"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formData.dueDate ? format(new Date(formData.dueDate), "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-slate-800 border-slate-700">
            <Calendar
              mode="single"
              selected={formData.dueDate ? new Date(formData.dueDate) : undefined}
              onSelect={(date) => setFormData(prev => ({ ...prev, dueDate: date }))}
              initialFocus
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>
    </>
  );

  const renderMoodFields = () => {
    const moodEmojis = [
      { value: 1, emoji: '😢', label: 'Very Sad' },
      { value: 2, emoji: '😔', label: 'Sad' },
      { value: 3, emoji: '😐', label: 'Neutral' },
      { value: 4, emoji: '😊', label: 'Happy' },
      { value: 5, emoji: '😄', label: 'Very Happy' },
    ];

    return (
      <>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start bg-slate-700 border-slate-600 text-white"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(new Date(formData.date), "PPP")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-slate-800 border-slate-700">
              <Calendar
                mode="single"
                selected={new Date(formData.date)}
                onSelect={(date) => date && setFormData(prev => ({ ...prev, date }))}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Mood</label>
          <div className="flex justify-center gap-2">
            {moodEmojis.map(mood => (
              <button
                key={mood.value}
                onClick={() => setFormData(prev => ({ 
                  ...prev, 
                  mood: mood.value,
                  emoji: mood.emoji
                }))}
                className={`text-3xl p-2 rounded-full transition-all duration-200 hover:scale-110 ${
                  formData.mood === mood.value 
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

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Note</label>
          <Textarea
            value={formData.note || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
            placeholder="How was your day? What made you feel this way?"
            className="bg-slate-700 border-slate-600 text-white"
          />
        </div>
      </>
    );
  };

  const renderJournalFields = () => (
    <>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Title</label>
        <Input
          value={formData.title || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          className="bg-slate-700 border-slate-600 text-white"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Content</label>
        <Textarea
          value={formData.content || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
          className="bg-slate-700 border-slate-600 text-white min-h-[200px]"
        />
      </div>
    </>
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-800 border-slate-600">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white capitalize">
            Edit {type} Entry
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {type === 'task' && renderTaskFields()}
          {type === 'mood' && renderMoodFields()}
          {type === 'journal' && renderJournalFields()}

          {/* Tags (for tasks and journals) */}
          {(type === 'task' || type === 'journal') && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Tags</label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add a tag..."
                  className="bg-slate-700 border-slate-600 text-white"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button
                  type="button"
                  onClick={addTag}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(formData.tags || []).map(tag => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="bg-slate-600 text-white hover:bg-slate-500"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-2 hover:text-red-400"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
            <Button
              onClick={onCancel}
              variant="outline"
              className="border-slate-600 text-slate-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DirectEditModal;
