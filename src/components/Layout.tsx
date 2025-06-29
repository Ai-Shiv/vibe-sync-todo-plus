
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckSquare, Calendar, Heart, BookOpen, Settings } from 'lucide-react';
import TasksTab from './TasksTab';
import MoodTab from './MoodTab';
import JournalTab from './JournalTab';
import SettingsTab from './SettingsTab';

const Layout = () => {
  const [activeTab, setActiveTab] = useState('tasks');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            LifeSync Pro
          </h1>
          <p className="text-slate-300">Your complete productivity companion</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6 bg-slate-800/50 backdrop-blur-sm border border-slate-700">
            <TabsTrigger value="tasks" className="flex items-center gap-2 data-[state=active]:bg-blue-600">
              <CheckSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Tasks</span>
            </TabsTrigger>
            <TabsTrigger value="mood" className="flex items-center gap-2 data-[state=active]:bg-pink-600">
              <Heart className="w-4 h-4" />
              <span className="hidden sm:inline">Mood</span>
            </TabsTrigger>
            <TabsTrigger value="journal" className="flex items-center gap-2 data-[state=active]:bg-green-600">
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Journal</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2 data-[state=active]:bg-slate-600">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tasks" className="space-y-4">
            <TasksTab />
          </TabsContent>

          <TabsContent value="mood" className="space-y-4">
            <MoodTab />
          </TabsContent>

          <TabsContent value="journal" className="space-y-4">
            <JournalTab />
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <SettingsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Layout;
