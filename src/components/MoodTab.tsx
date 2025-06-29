import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays } from 'date-fns';
import { Calendar as CalendarIcon, TrendingUp, Heart, Plus, Edit, Trash2, Sparkles } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { MoodEntry } from '@/types';
import MoodEntryForm from './MoodEntryForm';
import NaturalLanguageInput from './NaturalLanguageInput';
import DirectEditModal from './DirectEditModal';

const moodEmojis = [
  { value: 1, emoji: '😢', label: 'Very Sad' },
  { value: 2, emoji: '😔', label: 'Sad' },
  { value: 3, emoji: '😐', label: 'Neutral' },
  { value: 4, emoji: '😊', label: 'Happy' },
  { value: 5, emoji: '😄', label: 'Very Happy' },
];

const MoodTab = () => {
  const [moodEntries, setMoodEntries] = useLocalStorage<MoodEntry[]>('moodEntries', []);
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [moodNote, setMoodNote] = useState('');
  const [viewPeriod, setViewPeriod] = useState<'day' | 'week' | 'month'>('week');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showMoodForm, setShowMoodForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<MoodEntry | null>(null);
  const [showNaturalInput, setShowNaturalInput] = useState(false);
  const [directEditEntry, setDirectEditEntry] = useState<MoodEntry | null>(null);

  const addMoodEntry = () => {
    if (selectedMood) {
      const newEntry: MoodEntry = {
        id: crypto.randomUUID(),
        date: new Date(),
        mood: selectedMood,
        emoji: moodEmojis.find(m => m.value === selectedMood)?.emoji || '😐',
        note: moodNote.trim() || undefined,
      };
      setMoodEntries([...moodEntries, newEntry]);
      setSelectedMood(null);
      setMoodNote('');
    }
  };

  const createMoodFromNL = (moodData: any) => {
    const newEntry: MoodEntry = {
      ...moodData,
      id: crypto.randomUUID(),
    };
    setMoodEntries([...moodEntries, newEntry]);
  };

  const saveMoodEntry = (entryData: Omit<MoodEntry, 'id'>) => {
    if (editingEntry) {
      // Update existing entry
      setMoodEntries(entries => 
        entries.map(entry => 
          entry.id === editingEntry.id 
            ? { ...entry, ...entryData }
            : entry
        )
      );
    } else {
      // Add new entry
      const newEntry: MoodEntry = {
        ...entryData,
        id: crypto.randomUUID(),
      };
      setMoodEntries([...moodEntries, newEntry]);
    }
    setShowMoodForm(false);
    setEditingEntry(null);
  };

  const deleteMoodEntry = (entryId: string) => {
    if (confirm('Are you sure you want to delete this mood entry?')) {
      setMoodEntries(entries => entries.filter(entry => entry.id !== entryId));
    }
  };

  const handleEntryClick = (entry: MoodEntry) => {
    setDirectEditEntry(entry);
  };

  const handleDirectEditSave = (updates: Partial<MoodEntry>) => {
    if (directEditEntry) {
      setMoodEntries(entries => 
        entries.map(entry => 
          entry.id === directEditEntry.id 
            ? { ...entry, ...updates }
            : entry
        )
      );
      setDirectEditEntry(null);
    }
  };

  const getFilteredEntries = () => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    switch (viewPeriod) {
      case 'day':
        startDate = startOfDay(selectedDate);
        endDate = endOfDay(selectedDate);
        break;
      case 'week':
        startDate = startOfWeek(selectedDate);
        endDate = endOfWeek(selectedDate);
        break;
      case 'month':
        startDate = startOfMonth(selectedDate);
        endDate = endOfMonth(selectedDate);
        break;
      default:
        startDate = startOfDay(now);
        endDate = endOfDay(now);
    }

    return moodEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= startDate && entryDate <= endDate;
    });
  };

  const getChartData = () => {
    const filtered = getFilteredEntries();
    const chartData = [];
    
    if (viewPeriod === 'day') {
      const hourlyData: { [key: string]: { total: number; count: number } } = {};
      
      filtered.forEach(entry => {
        const hour = format(new Date(entry.date), 'HH:00');
        if (!hourlyData[hour]) {
          hourlyData[hour] = { total: 0, count: 0 };
        }
        hourlyData[hour].total += entry.mood;
        hourlyData[hour].count += 1;
      });
      
      Object.entries(hourlyData).forEach(([hour, data]) => {
        chartData.push({
          time: hour,
          mood: Math.round((data.total / data.count) * 10) / 10,
        });
      });
    } else {
      const dailyData: { [key: string]: { total: number; count: number } } = {};
      
      filtered.forEach(entry => {
        const day = format(new Date(entry.date), 'MMM dd');
        if (!dailyData[day]) {
          dailyData[day] = { total: 0, count: 0 };
        }
        dailyData[day].total += entry.mood;
        dailyData[day].count += 1;
      });
      
      Object.entries(dailyData).forEach(([day, data]) => {
        chartData.push({
          time: day,
          mood: Math.round((data.total / data.count) * 10) / 10,
        });
      });
    }
    
    return chartData.sort((a, b) => a.time.localeCompare(b.time));
  };

  const getAverageMood = () => {
    const filtered = getFilteredEntries();
    if (filtered.length === 0) return 0;
    
    const total = filtered.reduce((sum, entry) => sum + entry.mood, 0);
    return Math.round((total / filtered.length) * 10) / 10;
  };

  const getTodayEntries = () => {
    const today = startOfDay(new Date());
    const tomorrow = endOfDay(new Date());
    return moodEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= today && entryDate <= tomorrow;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  return (
    <div className="space-y-6">
      {/* Natural Language Input */}
      {showNaturalInput && (
        <NaturalLanguageInput
          onTaskCreate={() => {}}
          onMoodCreate={createMoodFromNL}
          onJournalCreate={() => {}}
        />
      )}

      {/* Quick Mood Input */}
      <Card className="bg-gradient-to-br from-pink-600/20 to-purple-600/20 border-pink-500/30 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink-400" />
              Quick Mood Check
            </CardTitle>
            <Button
              onClick={() => setShowNaturalInput(!showNaturalInput)}
              variant="outline"
              size="sm"
              className={`border-pink-500/30 ${showNaturalInput ? 'bg-pink-600 text-white' : 'text-pink-300'}`}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Smart Add
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center gap-3">
            {moodEmojis.map(mood => (
              <button
                key={mood.value}
                onClick={() => setSelectedMood(mood.value)}
                className={`text-4xl p-3 rounded-full transition-all duration-200 hover:scale-110 ${
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
          
          <Textarea
            value={moodNote}
            onChange={(e) => setMoodNote(e.target.value)}
            placeholder="Quick note about your mood (optional)"
            className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400"
          />
          
          <div className="flex gap-2">
            <Button
              onClick={addMoodEntry}
              disabled={!selectedMood}
              className="flex-1 bg-pink-600 hover:bg-pink-700 disabled:opacity-50"
            >
              <Plus className="w-4 h-4 mr-2" />
              Quick Add
            </Button>
            <Button
              onClick={() => setShowMoodForm(true)}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Detailed Entry
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Today's Entries */}
      {getTodayEntries().length > 0 && (
        <Card className="bg-slate-800/70 backdrop-blur-sm border-slate-600">
          <CardHeader>
            <CardTitle className="text-white">Today's Mood Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getTodayEntries().map(entry => (
                <div 
                  key={entry.id} 
                  onClick={() => handleEntryClick(entry)}
                  className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-lg group hover:bg-slate-700/50 cursor-pointer transition-colors"
                >
                  <span className="text-2xl">{entry.emoji}</span>
                  <div className="flex-1">
                    <div className="text-white font-medium">
                      {moodEmojis.find(m => m.value === entry.mood)?.label}
                    </div>
                    <div className="text-sm text-slate-400">
                      {format(new Date(entry.date), 'HH:mm')}
                    </div>
                    {entry.note && (
                      <p className="text-sm text-slate-300 mt-2">{entry.note}</p>
                    )}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingEntry(entry);
                        setShowMoodForm(true);
                      }}
                      className="h-8 w-8 p-0 hover:bg-slate-600"
                    >
                      <Edit className="w-3 h-3 text-slate-400" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteMoodEntry(entry.id);
                      }}
                      className="h-8 w-8 p-0 hover:bg-red-600"
                    >
                      <Trash2 className="w-3 h-3 text-red-400" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mood Analytics */}
      <Card className="bg-slate-800/70 backdrop-blur-sm border-slate-600">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              Mood Analytics
            </CardTitle>
            <div className="flex items-center gap-2">
              <select
                value={viewPeriod}
                onChange={(e) => setViewPeriod(e.target.value as any)}
                className="px-3 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm"
              >
                <option value="day">Day</option>
                <option value="week">Week</option>
                <option value="month">Month</option>
              </select>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="border-slate-600 text-white">
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    {format(selectedDate, 'MMM dd, yyyy')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-slate-800 border-slate-700">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-gradient-to-br from-blue-600/20 to-blue-800/20 rounded-lg border border-blue-500/30">
              <div className="text-2xl font-bold text-blue-400">{getAverageMood()}</div>
              <div className="text-sm text-slate-300">Average Mood</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-green-600/20 to-green-800/20 rounded-lg border border-green-500/30">
              <div className="text-2xl font-bold text-green-400">{getFilteredEntries().length}</div>
              <div className="text-sm text-slate-300">Total Entries</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-purple-600/20 to-purple-800/20 rounded-lg border border-purple-500/30">
              <div className="text-2xl font-bold text-purple-400">{moodEntries.length}</div>
              <div className="text-sm text-slate-300">All Time Entries</div>
            </div>
          </div>

          {getChartData().length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={getChartData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="time" 
                  stroke="#9CA3AF"
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  domain={[1, 5]} 
                  stroke="#9CA3AF"
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F3F4F6'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="mood" 
                  stroke="#EC4899" 
                  strokeWidth={3}
                  dot={{ fill: '#EC4899', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#EC4899', strokeWidth: 2, fill: '#1F2937' }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-slate-400">
              <Heart className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No mood data for this period</p>
              <p className="text-sm">Start tracking your mood to see analytics here</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mood Entry Form Modal */}
      {showMoodForm && (
        <MoodEntryForm
          entry={editingEntry || undefined}
          onSave={saveMoodEntry}
          onCancel={() => {
            setShowMoodForm(false);
            setEditingEntry(null);
          }}
        />
      )}

      {/* Direct Edit Modal */}
      {directEditEntry && (
        <DirectEditModal
          type="mood"
          item={directEditEntry}
          onSave={handleDirectEditSave}
          onCancel={() => setDirectEditEntry(null)}
        />
      )}
    </div>
  );
};

export default MoodTab;
