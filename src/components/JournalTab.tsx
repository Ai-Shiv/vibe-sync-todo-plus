
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Download, 
  Edit, 
  Trash2, 
  Calendar as CalendarIcon,
  FileText 
} from 'lucide-react';
import { format } from 'date-fns';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { JournalEntry } from '@/types';
import JournalEditor from './JournalEditor';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';

const JournalTab = () => {
  const [journalEntries, setJournalEntries] = useLocalStorage<JournalEntry[]>('journalEntries', []);
  const [searchTerm, setSearchTerm] = useState('');
  const [showEditor, setShowEditor] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);

  const filteredEntries = journalEntries.filter(entry =>
    entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const createEntry = (entryData: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newEntry: JournalEntry = {
      ...entryData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setJournalEntries([newEntry, ...journalEntries]);
    setShowEditor(false);
  };

  const updateEntry = (entryId: string, updates: Partial<JournalEntry>) => {
    setJournalEntries(entries =>
      entries.map(entry =>
        entry.id === entryId
          ? { ...entry, ...updates, updatedAt: new Date() }
          : entry
      )
    );
    setEditingEntry(null);
    setShowEditor(false);
  };

  const deleteEntry = (entryId: string) => {
    setJournalEntries(entries => entries.filter(entry => entry.id !== entryId));
  };

  const exportEntry = async (entry: JournalEntry, format: 'markdown' | 'html' | 'txt') => {
    let content = '';
    let filename = '';

    switch (format) {
      case 'markdown':
        content = `# ${entry.title}\n\n`;
        content += `**Created:** ${format(new Date(entry.createdAt), 'PPP')}\n`;
        content += `**Updated:** ${format(new Date(entry.updatedAt), 'PPP')}\n`;
        if (entry.tags.length > 0) {
          content += `**Tags:** ${entry.tags.map(tag => `#${tag}`).join(', ')}\n`;
        }
        content += `\n---\n\n${entry.content}`;
        filename = `${entry.title.replace(/[^a-zA-Z0-9]/g, '_')}.md`;
        break;
      case 'html':
        content = `<!DOCTYPE html>
<html>
<head>
    <title>${entry.title}</title>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .meta { color: #666; margin-bottom: 20px; }
        .tags { margin: 10px 0; }
        .tag { background: #e0e0e0; padding: 2px 8px; border-radius: 12px; font-size: 12px; margin-right: 5px; }
    </style>
</head>
<body>
    <h1>${entry.title}</h1>
    <div class="meta">
        <p><strong>Created:</strong> ${format(new Date(entry.createdAt), 'PPP')}</p>
        <p><strong>Updated:</strong> ${format(new Date(entry.updatedAt), 'PPP')}</p>
        ${entry.tags.length > 0 ? `<div class="tags">${entry.tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}</div>` : ''}
    </div>
    <hr>
    <div class="content">${entry.content}</div>
</body>
</html>`;
        filename = `${entry.title.replace(/[^a-zA-Z0-9]/g, '_')}.html`;
        break;
      case 'txt':
        content = `${entry.title}\n`;
        content += `${'='.repeat(entry.title.length)}\n\n`;
        content += `Created: ${format(new Date(entry.createdAt), 'PPP')}\n`;
        content += `Updated: ${format(new Date(entry.updatedAt), 'PPP')}\n`;
        if (entry.tags.length > 0) {
          content += `Tags: ${entry.tags.map(tag => `#${tag}`).join(', ')}\n`;
        }
        content += `\n${'-'.repeat(50)}\n\n`;
        content += entry.content.replace(/<[^>]*>/g, ''); // Strip HTML tags
        filename = `${entry.title.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
        break;
    }

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, filename);
  };

  const exportAllEntries = async () => {
    const zip = new JSZip();
    
    // Add entries in different formats
    const markdownFolder = zip.folder('markdown');
    const htmlFolder = zip.folder('html');
    const txtFolder = zip.folder('txt');

    journalEntries.forEach(entry => {
      const safeTitle = entry.title.replace(/[^a-zA-Z0-9]/g, '_');
      
      // Markdown
      let content = `# ${entry.title}\n\n`;
      content += `**Created:** ${format(new Date(entry.createdAt), 'PPP')}\n`;
      content += `**Updated:** ${format(new Date(entry.updatedAt), 'PPP')}\n`;
      if (entry.tags.length > 0) {
        content += `**Tags:** ${entry.tags.map(tag => `#${tag}`).join(', ')}\n`;
      }
      content += `\n---\n\n${entry.content}`;
      markdownFolder?.file(`${safeTitle}.md`, content);

      // HTML
      const htmlContent = `<!DOCTYPE html>
<html>
<head>
    <title>${entry.title}</title>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .meta { color: #666; margin-bottom: 20px; }
        .tags { margin: 10px 0; }
        .tag { background: #e0e0e0; padding: 2px 8px; border-radius: 12px; font-size: 12px; margin-right: 5px; }
    </style>
</head>
<body>
    <h1>${entry.title}</h1>
    <div class="meta">
        <p><strong>Created:</strong> ${format(new Date(entry.createdAt), 'PPP')}</p>
        <p><strong>Updated:</strong> ${format(new Date(entry.updatedAt), 'PPP')}</p>
        ${entry.tags.length > 0 ? `<div class="tags">${entry.tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}</div>` : ''}
    </div>
    <hr>
    <div class="content">${entry.content}</div>
</body>
</html>`;
      htmlFolder?.file(`${safeTitle}.html`, htmlContent);

      // Plain text
      let txtContent = `${entry.title}\n`;
      txtContent += `${'='.repeat(entry.title.length)}\n\n`;
      txtContent += `Created: ${format(new Date(entry.createdAt), 'PPP')}\n`;
      txtContent += `Updated: ${format(new Date(entry.updatedAt), 'PPP')}\n`;
      if (entry.tags.length > 0) {
        txtContent += `Tags: ${entry.tags.map(tag => `#${tag}`).join(', ')}\n`;
      }
      txtContent += `\n${'-'.repeat(50)}\n\n`;
      txtContent += entry.content.replace(/<[^>]*>/g, '');
      txtFolder?.file(`${safeTitle}.txt`, txtContent);
    });

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    saveAs(zipBlob, 'journal_entries.zip');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search journal entries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder-slate-400"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={exportAllEntries}
                variant="outline"
                className="border-slate-600 text-slate-300"
                disabled={journalEntries.length === 0}
              >
                <Download className="w-4 h-4 mr-2" />
                Export All
              </Button>
              <Button
                onClick={() => setShowEditor(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Entry
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-green-600/20 to-green-800/20 border-green-500/30">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-400">{journalEntries.length}</div>
            <div className="text-sm text-slate-300">Total Entries</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border-blue-500/30">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">
              {journalEntries.reduce((total, entry) => 
                total + entry.content.replace(/<[^>]*>/g, '').split(' ').length, 0
              )}
            </div>
            <div className="text-sm text-slate-300">Total Words</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 border-purple-500/30">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">
              {Array.from(new Set(journalEntries.flatMap(entry => entry.tags))).length}
            </div>
            <div className="text-sm text-slate-300">Unique Tags</div>
          </CardContent>
        </Card>
      </div>

      {/* Journal Entries */}
      {filteredEntries.length > 0 ? (
        <div className="space-y-4">
          {filteredEntries.map(entry => (
            <Card key={entry.id} className="bg-slate-800/50 backdrop-blur-sm border-slate-700 hover:bg-slate-800/70 transition-all">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-2">{entry.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-slate-400 mb-3">
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="w-3 h-3" />
                        <span>{format(new Date(entry.createdAt), 'MMM d, yyyy')}</span>
                      </div>
                      {entry.updatedAt !== entry.createdAt && (
                        <div className="flex items-center gap-1">
                          <Edit className="w-3 h-3" />
                          <span>Updated {format(new Date(entry.updatedAt), 'MMM d, yyyy')}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        <span>{entry.content.replace(/<[^>]*>/g, '').split(' ').length} words</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingEntry(entry);
                        setShowEditor(true);
                      }}
                      className="text-slate-400 hover:text-blue-400"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <div className="relative group">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-slate-400 hover:text-green-400"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <div className="absolute right-0 top-full mt-1 bg-slate-800 border border-slate-700 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <div className="p-1">
                          <button
                            onClick={() => exportEntry(entry, 'markdown')}
                            className="block w-full text-left px-3 py-1 text-sm text-slate-300 hover:bg-slate-700 rounded"
                          >
                            Markdown
                          </button>
                          <button
                            onClick={() => exportEntry(entry, 'html')}
                            className="block w-full text-left px-3 py-1 text-sm text-slate-300 hover:bg-slate-700 rounded"
                          >
                            HTML
                          </button>
                          <button
                            onClick={() => exportEntry(entry, 'txt')}
                            className="block w-full text-left px-3 py-1 text-sm text-slate-300 hover:bg-slate-700 rounded"
                          >
                            Text
                          </button>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteEntry(entry.id)}
                      className="text-slate-400 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Tags */}
                {entry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {entry.tags.map(tag => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="bg-slate-600 text-slate-200"
                      >
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Content Preview */}
                <div 
                  className="text-slate-300 text-sm leading-relaxed overflow-hidden"
                  style={{ 
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical'
                  }}
                  dangerouslySetInnerHTML={{ 
                    __html: entry.content.length > 200 
                      ? entry.content.substring(0, 200) + '...' 
                      : entry.content 
                  }}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-slate-800/30 backdrop-blur-sm border-slate-700">
          <CardContent className="p-12 text-center">
            <BookOpen className="w-16 h-16 mx-auto text-slate-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Journal Entries</h3>
            <p className="text-slate-400 mb-6">
              {searchTerm ? 'No entries match your search.' : 'Start writing your thoughts and experiences.'}
            </p>
            {!searchTerm && (
              <Button
                onClick={() => setShowEditor(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Write Your First Entry
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Journal Editor Modal */}
      {showEditor && (
        <JournalEditor
          entry={editingEntry}
          onSave={editingEntry ? 
            (updates) => updateEntry(editingEntry.id, updates) : 
            createEntry
          }
          onCancel={() => {
            setShowEditor(false);
            setEditingEntry(null);
          }}
        />
      )}
    </div>
  );
};

export default JournalTab;
