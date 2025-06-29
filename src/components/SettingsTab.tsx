import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { 
  Settings, 
  Moon, 
  Sun, 
  Download, 
  Upload, 
  Smartphone, 
  Bell, 
  Volume2,
  Database,
  FileJson,
  FileType,
  Archive,
  Palette,
  TestTube
} from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { AppSettings } from '@/types';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import ThemeCustomizer from './ThemeCustomizer';
import { applyTheme, getStoredTheme } from '@/utils/themeManager';

const SettingsTab = () => {
  const [settings, setSettings] = useLocalStorage<AppSettings>('appSettings', {
    theme: 'dark',
    notifications: true,
    soundEnabled: true,
    defaultAlarmSound: 'default',
    snoozeMinutes: 5,
    workingHours: {
      start: '09:00',
      end: '17:00',
      daysOfWeek: [1, 2, 3, 4, 5]
    },
    autoSave: true,
    backupFrequency: 'weekly',
    layoutPreferences: {
      sidebarCollapsed: false,
      compactMode: false,
      showCompletedTasks: true
    }
  });

  const [tasks] = useLocalStorage('tasks', []);
  const [moodEntries] = useLocalStorage('moodEntries', []);
  const [journalEntries] = useLocalStorage('journalEntries', []);
  const [showThemeCustomizer, setShowThemeCustomizer] = useState(false);
  const [showTestData, setShowTestData] = useState(false);

  const updateSetting = (key: keyof AppSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    
    // Apply theme changes to document
    if (key === 'theme') {
      document.documentElement.classList.toggle('dark', value === 'dark');
    }
  };

  const generateTestData = () => {
    if (!showTestData) return;

    // Generate test tasks
    const testTasks = Array.from({ length: 10 }, (_, i) => ({
      id: `test-task-${i}`,
      title: `Test Task ${i + 1}`,
      description: `This is a test task for demonstration purposes ${i + 1}`,
      completed: Math.random() > 0.5,
      priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high',
      category: ['Work', 'Personal', 'Health', 'Learning'][Math.floor(Math.random() * 4)],
      dueDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
      alarms: [],
      tags: [`tag${i}`, 'test'],
      timerDuration: Math.floor(Math.random() * 120) + 15,
      timeSpent: Math.floor(Math.random() * 60),
      dependencies: [],
      subtasks: []
    }));

    // Generate test mood entries
    const testMoodEntries = Array.from({ length: 20 }, (_, i) => ({
      id: `test-mood-${i}`,
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
      mood: Math.floor(Math.random() * 5) + 1,
      emoji: ['😢', '😔', '😐', '😊', '😄'][Math.floor(Math.random() * 5)],
      note: `Test mood entry ${i + 1} - feeling good about progress!`
    }));

    // Generate test journal entries
    const testJournalEntries = Array.from({ length: 5 }, (_, i) => ({
      id: `test-journal-${i}`,
      title: `Test Journal Entry ${i + 1}`,
      content: `This is a test journal entry ${i + 1}. It contains some sample content to demonstrate the journal functionality. Today was a productive day and I learned many new things.`,
      createdAt: new Date(Date.now() - i * 3 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - i * 3 * 24 * 60 * 60 * 1000),
      tags: [`journal-tag-${i}`, 'test'],
      pinned: Math.random() > 0.7,
      wordCount: 50 + Math.floor(Math.random() * 200),
      readTime: Math.ceil((50 + Math.floor(Math.random() * 200)) / 200)
    }));

    // Save test data
    const existingTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    const existingMoods = JSON.parse(localStorage.getItem('moodEntries') || '[]');
    const existingJournals = JSON.parse(localStorage.getItem('journalEntries') || '[]');

    localStorage.setItem('tasks', JSON.stringify([...existingTasks, ...testTasks]));
    localStorage.setItem('moodEntries', JSON.stringify([...existingMoods, ...testMoodEntries]));
    localStorage.setItem('journalEntries', JSON.stringify([...existingJournals, ...testJournalEntries]));

    alert('Test data generated! Please refresh the page to see the changes.');
  };

  const exportData = async (format: 'json' | 'yaml' | 'zip') => {
    const data = {
      tasks,
      moodEntries,
      journalEntries,
      settings,
      exportDate: new Date().toISOString(),
      appVersion: '1.0.0'
    };

    switch (format) {
      case 'json':
        const jsonBlob = new Blob([JSON.stringify(data, null, 2)], {
          type: 'application/json'
        });
        saveAs(jsonBlob, `lifesync-backup-${new Date().toISOString().split('T')[0]}.json`);
        break;

      case 'yaml':
        const yamlContent = convertToYAML(data);
        const yamlBlob = new Blob([yamlContent], { type: 'text/yaml' });
        saveAs(yamlBlob, `lifesync-backup-${new Date().toISOString().split('T')[0]}.yaml`);
        break;

      case 'zip':
        const zip = new JSZip();
        
        zip.file('backup.json', JSON.stringify(data, null, 2));
        zip.file('tasks.json', JSON.stringify(tasks, null, 2));
        zip.file('mood-entries.json', JSON.stringify(moodEntries, null, 2));
        zip.file('journal-entries.json', JSON.stringify(journalEntries, null, 2));
        zip.file('settings.json', JSON.stringify(settings, null, 2));
        
        if (journalEntries.length > 0) {
          const journalFolder = zip.folder('journal-markdown');
          journalEntries.forEach((entry: any) => {
            const safeTitle = entry.title.replace(/[^a-zA-Z0-9]/g, '_');
            const content = `# ${entry.title}\n\n**Created:** ${new Date(entry.createdAt).toLocaleDateString()}\n\n${entry.content}`;
            journalFolder?.file(`${safeTitle}.md`, content);
          });
        }
        
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        saveAs(zipBlob, `lifesync-complete-backup-${new Date().toISOString().split('T')[0]}.zip`);
        break;
    }
  };

  const convertToYAML = (obj: any, indent = 0): string => {
    const spaces = '  '.repeat(indent);
    let yaml = '';
    
    for (const [key, value] of Object.entries(obj)) {
      if (Array.isArray(value)) {
        yaml += `${spaces}${key}:\n`;
        value.forEach((item, index) => {
          if (typeof item === 'object') {
            yaml += `${spaces}  - ${convertToYAML(item, indent + 2).replace(/^\s+/, '')}`;
          } else {
            yaml += `${spaces}  - ${item}\n`;
          }
        });
      } else if (typeof value === 'object' && value !== null) {
        yaml += `${spaces}${key}:\n${convertToYAML(value, indent + 1)}`;
      } else {
        yaml += `${spaces}${key}: ${value}\n`;
      }
    }
    
    return yaml;
  };

  const importData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target?.result as string);
            
            if (confirm('This will replace all current data. Are you sure?')) {
              if (data.tasks) localStorage.setItem('tasks', JSON.stringify(data.tasks));
              if (data.moodEntries) localStorage.setItem('moodEntries', JSON.stringify(data.moodEntries));
              if (data.journalEntries) localStorage.setItem('journalEntries', JSON.stringify(data.journalEntries));
              if (data.settings) localStorage.setItem('appSettings', JSON.stringify(data.settings));
              
              alert('Data imported successfully! Please refresh the page.');
            }
          } catch (error) {
            alert('Error importing data. Please check the file format.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const clearAllData = () => {
    if (confirm('This will permanently delete all your data. Are you sure?')) {
      if (confirm('This action cannot be undone. Are you absolutely sure?')) {
        localStorage.removeItem('tasks');
        localStorage.removeItem('moodEntries');
        localStorage.removeItem('journalEntries');
        localStorage.removeItem('appSettings');
        alert('All data has been cleared. Please refresh the page.');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* App Settings */}
      <Card className="bg-slate-800/70 backdrop-blur-sm border-slate-600">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-slate-400" />
            App Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {settings.theme === 'dark' ? (
                <Moon className="w-5 h-5 text-blue-400" />
              ) : (
                <Sun className="w-5 h-5 text-yellow-400" />
              )}
              <div>
                <div className="text-white font-medium">Theme</div>
                <div className="text-sm text-slate-400">
                  Currently using {settings.theme} theme
                </div>
              </div>
            </div>
            <Switch
              checked={settings.theme === 'dark'}
              onCheckedChange={(checked) => updateSetting('theme', checked ? 'dark' : 'light')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-orange-400" />
              <div>
                <div className="text-white font-medium">Notifications</div>
                <div className="text-sm text-slate-400">
                  Enable push notifications for reminders
                </div>
              </div>
            </div>
            <Switch
              checked={settings.notifications}
              onCheckedChange={(checked) => updateSetting('notifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Volume2 className="w-5 h-5 text-green-400" />
              <div>
                <div className="text-white font-medium">Sound Effects</div>
                <div className="text-sm text-slate-400">
                  Play sounds for notifications and timers
                </div>
              </div>
            </div>
            <Switch
              checked={settings.soundEnabled}
              onCheckedChange={(checked) => updateSetting('soundEnabled', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Theme Customization */}
      <Card className="bg-slate-800/70 backdrop-blur-sm border-slate-600">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Palette className="w-5 h-5 text-purple-400" />
            Advanced Theming
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 p-4 rounded-lg border border-purple-500/30">
            <h4 className="text-white font-medium mb-2">Custom Themes</h4>
            <p className="text-slate-300 text-sm mb-3">
              Create your own color schemes and gradients to personalize your experience.
            </p>
            <Button
              onClick={() => setShowThemeCustomizer(true)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Palette className="w-4 h-4 mr-2" />
              Open Theme Customizer
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Developer Tools */}
      <Card className="bg-slate-800/70 backdrop-blur-sm border-slate-600">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TestTube className="w-5 h-5 text-cyan-400" />
            Developer Tools
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TestTube className="w-5 h-5 text-cyan-400" />
              <div>
                <div className="text-white font-medium">Generate Test Data</div>
                <div className="text-sm text-slate-400">
                  Add sample tasks, mood entries, and journal entries for testing
                </div>
              </div>
            </div>
            <Switch
              checked={showTestData}
              onCheckedChange={setShowTestData}
            />
          </div>
          
          {showTestData && (
            <div className="bg-cyan-950/50 p-4 rounded-lg border border-cyan-500/30">
              <p className="text-cyan-200 text-sm mb-3">
                This will generate sample data including tasks, mood entries, and journal entries.
              </p>
              <Button
                onClick={generateTestData}
                className="bg-cyan-600 hover:bg-cyan-700"
              >
                Generate Test Data
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mobile Features */}
      <Card className="bg-slate-800/70 backdrop-blur-sm border-slate-600">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-purple-400" />
            Mobile Features
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 p-4 rounded-lg border border-purple-500/30">
            <h4 className="text-white font-medium mb-2">Native Mobile App</h4>
            <p className="text-slate-300 text-sm mb-3">
              This app is built with Capacitor and can be compiled to a native Android APK.
            </p>
            <div className="text-xs text-slate-400 space-y-1">
              <p>• Native notifications and alarms</p>
              <p>• Offline-first data storage</p>
              <p>• Device integration capabilities</p>
              <p>• Full APK packaging support</p>
            </div>
          </div>
          
          <div className="bg-slate-700/30 p-4 rounded-lg">
            <h4 className="text-white font-medium mb-2">Development Instructions</h4>
            <div className="text-xs text-slate-400 space-y-1">
              <p>1. Export project to GitHub</p>
              <p>2. Run: npm install</p>
              <p>3. Run: npx cap add android</p>
              <p>4. Run: npm run build</p>
              <p>5. Run: npx cap sync</p>
              <p>6. Run: npx cap run android</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card className="bg-slate-800/70 backdrop-blur-sm border-slate-600">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-400" />
            Data Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-slate-700/30 p-3 rounded-lg text-center">
              <div className="text-xl font-bold text-blue-400">{tasks.length}</div>
              <div className="text-xs text-slate-400">Tasks</div>
            </div>
            <div className="bg-slate-700/30 p-3 rounded-lg text-center">
              <div className="text-xl font-bold text-pink-400">{moodEntries.length}</div>
              <div className="text-xs text-slate-400">Mood Entries</div>
            </div>
            <div className="bg-slate-700/30 p-3 rounded-lg text-center">
              <div className="text-xl font-bold text-green-400">{journalEntries.length}</div>
              <div className="text-xs text-slate-400">Journal Entries</div>
            </div>
          </div>

          <div>
            <h4 className="text-white font-medium mb-3">Export Data</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Button
                onClick={() => exportData('json')}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                <FileJson className="w-4 h-4 mr-2" />
                JSON
              </Button>
              <Button
                onClick={() => exportData('yaml')}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                <FileType className="w-4 h-4 mr-2" />
                YAML
              </Button>
              <Button
                onClick={() => exportData('zip')}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                <Archive className="w-4 h-4 mr-2" />
                ZIP Archive
              </Button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-700">
            <Button
              onClick={importData}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import Data
            </Button>
            <Button
              onClick={clearAllData}
              variant="destructive"
              className="bg-red-600 hover:bg-red-700"
            >
              <Database className="w-4 h-4 mr-2" />
              Clear All Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card className="bg-slate-800/70 backdrop-blur-sm border-slate-600">
        <CardHeader>
          <CardTitle className="text-white">About LifeSync Pro</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-slate-300 space-y-2 text-sm">
            <p>A comprehensive productivity and wellness companion designed for offline use.</p>
            <p><strong>Version:</strong> 2.0.0</p>
            <p><strong>Features:</strong> Task Management, Mood Tracking, Journaling, Natural Language Input, Advanced Theming</p>
            <p><strong>Data Storage:</strong> 100% Local (No Internet Required)</p>
            <p><strong>Mobile:</strong> Capacitor-powered native capabilities</p>
          </div>
        </CardContent>
      </Card>

      {/* Theme Customizer Modal */}
      {showThemeCustomizer && (
        <ThemeCustomizer onClose={() => setShowThemeCustomizer(false)} />
      )}
    </div>
  );
};

export default SettingsTab;
