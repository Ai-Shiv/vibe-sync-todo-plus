
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import { 
  X, 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Quote,
  Code,
  Palette,
  Plus
} from 'lucide-react';
import { JournalEntry } from '@/types';

interface JournalEditorProps {
  entry?: JournalEntry | null;
  onSave: (entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

const JournalEditor: React.FC<JournalEditorProps> = ({ entry, onSave, onCancel }) => {
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Color,
      Highlight.configure({
        multicolor: true,
      }),
    ],
    content: entry?.content || '<p>Start writing your thoughts...</p>',
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[300px] text-white',
      },
    },
  });

  useEffect(() => {
    if (entry) {
      setTitle(entry.title);
      setTags(entry.tags);
      editor?.commands.setContent(entry.content);
    }
  }, [entry, editor]);

  const handleSave = () => {
    if (!title.trim() || !editor) return;

    const content = editor.getHTML();
    onSave({
      title: title.trim(),
      content,
      tags,
    });
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  if (!editor) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden bg-slate-800 border-slate-700">
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-700">
          <CardTitle className="text-white">
            {entry ? 'Edit Journal Entry' : 'New Journal Entry'}
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
        
        <CardContent className="p-0 flex flex-col h-[calc(90vh-140px)]">
          {/* Title and Tags */}
          <div className="p-6 border-b border-slate-700 space-y-4">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Journal entry title..."
              className="bg-slate-700 border-slate-600 text-white text-lg font-semibold"
            />
            
            {/* Tags */}
            <div>
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
                {tags.map(tag => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="bg-slate-600 text-white hover:bg-slate-500"
                  >
                    #{tag}
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
          </div>

          {/* Editor Toolbar */}
          <div className="p-4 border-b border-slate-700 bg-slate-750">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 border-r border-slate-600 pr-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  className={`text-slate-400 hover:text-white ${
                    editor.isActive('bold') ? 'bg-slate-600 text-white' : ''
                  }`}
                >
                  <Bold className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  className={`text-slate-400 hover:text-white ${
                    editor.isActive('italic') ? 'bg-slate-600 text-white' : ''
                  }`}
                >
                  <Italic className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().toggleStrike().run()}
                  className={`text-slate-400 hover:text-white ${
                    editor.isActive('strike') ? 'bg-slate-600 text-white' : ''
                  }`}
                >
                  <Underline className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex items-center gap-1 border-r border-slate-600 pr-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().setTextAlign('left').run()}
                  className={`text-slate-400 hover:text-white ${
                    editor.isActive({ textAlign: 'left' }) ? 'bg-slate-600 text-white' : ''
                  }`}
                >
                  <AlignLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().setTextAlign('center').run()}
                  className={`text-slate-400 hover:text-white ${
                    editor.isActive({ textAlign: 'center' }) ? 'bg-slate-600 text-white' : ''
                  }`}
                >
                  <AlignCenter className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().setTextAlign('right').run()}
                  className={`text-slate-400 hover:text-white ${
                    editor.isActive({ textAlign: 'right' }) ? 'bg-slate-600 text-white' : ''
                  }`}
                >
                  <AlignRight className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex items-center gap-1 border-r border-slate-600 pr-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().toggleBulletList().run()}
                  className={`text-slate-400 hover:text-white ${
                    editor.isActive('bulletList') ? 'bg-slate-600 text-white' : ''
                  }`}
                >
                  <List className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().toggleOrderedList().run()}
                  className={`text-slate-400 hover:text-white ${
                    editor.isActive('orderedList') ? 'bg-slate-600 text-white' : ''
                  }`}
                >
                  <ListOrdered className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().toggleBlockquote().run()}
                  className={`text-slate-400 hover:text-white ${
                    editor.isActive('blockquote') ? 'bg-slate-600 text-white' : ''
                  }`}
                >
                  <Quote className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().toggleCode().run()}
                  className={`text-slate-400 hover:text-white ${
                    editor.isActive('code') ? 'bg-slate-600 text-white' : ''
                  }`}
                >
                  <Code className="w-4 h-4" />
                </Button>
              </div>

              <select
                onChange={(e) => {
                  const level = parseInt(e.target.value);
                  if (level === 0) {
                    editor.chain().focus().setParagraph().run();
                  } else {
                    editor.chain().focus().toggleHeading({ level: level as any }).run();
                  }
                }}
                className="px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm"
              >
                <option value="0">Paragraph</option>
                <option value="1">Heading 1</option>
                <option value="2">Heading 2</option>
                <option value="3">Heading 3</option>
              </select>
            </div>
          </div>

          {/* Editor Content */}
          <div className="flex-1 overflow-y-auto p-6 bg-slate-900">
            <EditorContent editor={editor} className="prose-invert max-w-none" />
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-slate-700 flex justify-between items-center">
            <div className="text-sm text-slate-400">
              {editor.storage.characterCount?.characters() || 0} characters, {' '}
              {editor.storage.characterCount?.words() || 0} words
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onCancel}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={!title.trim()}
                className="bg-green-600 hover:bg-green-700"
              >
                {entry ? 'Update Entry' : 'Save Entry'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default JournalEditor;
