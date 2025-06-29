
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Filter, Clock, Bell, Calendar as CalendarIcon, CheckSquare, Sparkles } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Task } from '@/types';
import TaskForm from './TaskForm';
import TaskItem from './TaskItem';
import NaturalLanguageInput from './NaturalLanguageInput';
import DirectEditModal from './DirectEditModal';

const TasksTab = () => {
  const [tasks, setTasks] = useLocalStorage<Task[]>('tasks', []);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [directEditTask, setDirectEditTask] = useState<Task | null>(null);
  const [showNaturalInput, setShowNaturalInput] = useState(false);

  const categories = ['all', ...Array.from(new Set(tasks.map(task => task.category).filter(Boolean)))];
  
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || task.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const completedTasks = filteredTasks.filter(task => task.completed);
  const pendingTasks = filteredTasks.filter(task => !task.completed);

  const addTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      dependencies: [],
      subtasks: []
    };
    setTasks([...tasks, newTask]);
    setShowTaskForm(false);
  };

  const createTaskFromNL = (taskData: any) => {
    addTask({
      ...taskData,
      alarms: [],
      tags: taskData.tags || []
    });
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, ...updates, updatedAt: new Date() }
        : task
    ));
  };

  const deleteTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const handleTaskClick = (task: Task) => {
    setDirectEditTask(task);
  };

  const handleDirectEditSave = (updates: Partial<Task>) => {
    if (directEditTask) {
      updateTask(directEditTask.id, updates);
      setDirectEditTask(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Natural Language Input */}
      {showNaturalInput && (
        <NaturalLanguageInput
          onTaskCreate={createTaskFromNL}
          onMoodCreate={() => {}}
          onJournalCreate={() => {}}
        />
      )}

      {/* Header with Search and Filters */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search tasks, tags, or descriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder-slate-400"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-md text-white text-sm"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
              <Button
                onClick={() => setShowNaturalInput(!showNaturalInput)}
                variant="outline"
                className={`border-slate-600 ${showNaturalInput ? 'bg-blue-600 text-white' : 'text-slate-300'}`}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Smart Add
              </Button>
              <Button
                onClick={() => setShowTaskForm(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Task
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border-blue-500/30">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">{tasks.length}</div>
            <div className="text-sm text-slate-300">Total Tasks</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-600/20 to-green-800/20 border-green-500/30">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-400">{completedTasks.length}</div>
            <div className="text-sm text-slate-300">Completed</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-600/20 to-orange-800/20 border-orange-500/30">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-400">{pendingTasks.length}</div>
            <div className="text-sm text-slate-300">Pending</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 border-purple-500/30">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">
              {tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date()).filter(t => !t.completed).length}
            </div>
            <div className="text-sm text-slate-300">Overdue</div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Tasks */}
      {pendingTasks.length > 0 && (
        <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-400" />
              Pending Tasks ({pendingTasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingTasks.map(task => (
              <div key={task.id} onClick={() => handleTaskClick(task)} className="cursor-pointer">
                <TaskItem
                  task={task}
                  onUpdate={updateTask}
                  onDelete={deleteTask}
                  onEdit={(task) => {
                    setEditingTask(task);
                    setShowTaskForm(true);
                  }}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <Card className="bg-slate-800/30 backdrop-blur-sm border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-300 flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-green-400" />
              Completed Tasks ({completedTasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {completedTasks.map(task => (
              <div key={task.id} onClick={() => handleTaskClick(task)} className="cursor-pointer">
                <TaskItem
                  task={task}
                  onUpdate={updateTask}
                  onDelete={deleteTask}
                  onEdit={(task) => {
                    setEditingTask(task);
                    setShowTaskForm(true);
                  }}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Task Form Modal */}
      {showTaskForm && (
        <TaskForm
          task={editingTask}
          onSave={editingTask ? 
            (updates) => {
              updateTask(editingTask.id, updates);
              setEditingTask(null);
              setShowTaskForm(false);
            } : addTask
          }
          onCancel={() => {
            setShowTaskForm(false);
            setEditingTask(null);
          }}
        />
      )}

      {/* Direct Edit Modal */}
      {directEditTask && (
        <DirectEditModal
          type="task"
          item={directEditTask}
          onSave={handleDirectEditSave}
          onCancel={() => setDirectEditTask(null)}
        />
      )}
    </div>
  );
};

export default TasksTab;
