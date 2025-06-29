
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Clock, 
  Calendar as CalendarIcon, 
  Bell, 
  Play, 
  Pause, 
  RotateCcw, 
  Edit, 
  Trash2,
  AlertCircle 
} from 'lucide-react';
import { format, isAfter, isBefore } from 'date-fns';
import { Task } from '@/types';
import { useNotifications } from '@/hooks/useNotifications';

interface TaskItemProps {
  task: Task;
  onUpdate: (taskId: string, updates: Partial<Task>) => void;
  onDelete: (taskId: string) => void;
  onEdit: (task: Task) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onUpdate, onDelete, onEdit }) => {
  const [timerActive, setTimerActive] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const { scheduleNotification } = useNotifications();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive) {
      interval = setInterval(() => {
        setCurrentTime(prev => prev + 1);
        onUpdate(task.id, { timeSpent: task.timeSpent + 1/60 }); // Convert seconds to minutes
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, task.id, task.timeSpent, onUpdate]);

  const toggleTimer = () => {
    setTimerActive(!timerActive);
  };

  const resetTimer = () => {
    setTimerActive(false);
    setCurrentTime(0);
  };

  const toggleComplete = () => {
    onUpdate(task.id, { completed: !task.completed });
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-600';
      case 'medium': return 'bg-yellow-600';
      case 'low': return 'bg-green-600';
      default: return 'bg-slate-600';
    }
  };

  const isOverdue = task.dueDate && isBefore(new Date(task.dueDate), new Date()) && !task.completed;

  return (
    <Card className={`transition-all duration-200 ${
      task.completed 
        ? 'bg-slate-700/30 border-slate-600' 
        : 'bg-slate-700/50 border-slate-600 hover:bg-slate-700/70'
    } ${isOverdue ? 'border-red-500/50' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Checkbox
            checked={task.completed}
            onCheckedChange={toggleComplete}
            className="mt-1"
          />
          
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className={`font-medium ${
                  task.completed ? 'text-slate-400 line-through' : 'text-white'
                }`}>
                  {task.title}
                  {isOverdue && (
                    <AlertCircle className="inline-block w-4 h-4 ml-2 text-red-400" />
                  )}
                </h3>
                {task.description && (
                  <p className={`text-sm mt-1 ${
                    task.completed ? 'text-slate-500' : 'text-slate-300'
                  }`}>
                    {task.description}
                  </p>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(task)}
                  className="text-slate-400 hover:text-blue-400"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(task.id)}
                  className="text-slate-400 hover:text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Task Metadata */}
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <Badge className={`${getPriorityColor(task.priority)} text-white`}>
                {task.priority}
              </Badge>
              
              {task.category && (
                <Badge variant="outline" className="border-slate-500 text-slate-300">
                  {task.category}
                </Badge>
              )}
              
              {task.dueDate && (
                <div className={`flex items-center gap-1 ${
                  isOverdue ? 'text-red-400' : 'text-slate-400'
                }`}>
                  <CalendarIcon className="w-3 h-3" />
                  <span>{format(new Date(task.dueDate), 'MMM d, yyyy')}</span>
                </div>
              )}
              
              {task.alarms.length > 0 && (
                <div className="flex items-center gap-1 text-orange-400">
                  <Bell className="w-3 h-3" />
                  <span>{task.alarms.length}</span>
                </div>
              )}
            </div>

            {/* Tags */}
            {task.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {task.tags.map(tag => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="text-xs bg-slate-600 text-slate-200"
                  >
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Timer Section */}
            {task.timerDuration && (
              <div className="flex items-center gap-3 p-3 bg-slate-600/30 rounded-lg">
                <Clock className="w-4 h-4 text-blue-400" />
                <div className="flex-1">
                  <div className="text-white font-mono">
                    {formatTime(currentTime)} / {task.timerDuration}m
                  </div>
                  <div className="text-xs text-slate-400">
                    Total time spent: {Math.round(task.timeSpent)}m
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={toggleTimer}
                    className="border-slate-600"
                  >
                    {timerActive ? (
                      <Pause className="w-3 h-3" />
                    ) : (
                      <Play className="w-3 h-3" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={resetTimer}
                    className="border-slate-600"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskItem;
