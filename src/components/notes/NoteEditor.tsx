import { useState, useEffect, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Note } from '../../lib/types';
import Card, { CardTitle, CardContent, CardFooter } from '../common/Card';
import Button from '../common/Button';

interface NoteEditorProps {
  note: Note;
  onUpdate: (updatedNote: Note) => void;
  onDelete: () => void;
}

const NoteEditor = ({ note, onUpdate, onDelete }: NoteEditorProps) => {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [tags, setTags] = useState<string[]>(note.tags || []);
  const [newTag, setNewTag] = useState('');
  const titleInputRef = useRef<HTMLInputElement>(null);
  const quillRef = useRef<ReactQuill>(null);

  // Quill modules and formats
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'image'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
      ['clean']
    ]
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'link', 'image',
    'color', 'background',
    'align'
  ];

  // Update state when note changes
  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
    setTags(note.tags || []);
    setIsEditingTitle(false);
    setHasChanges(false);
  }, [note]);

  // Auto-focus title input when editing title
  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [isEditingTitle]);

  // Handle save changes
  const handleSaveChanges = () => {
    if (hasChanges) {
      onUpdate({
        ...note,
        title,
        content,
        tags,
      });
      setHasChanges(false);
    }
  };

  // Handle discard changes
  const handleDiscardChanges = () => {
    setTitle(note.title);
    setContent(note.content);
    setTags(note.tags || []);
    setHasChanges(false);
  };

  // Handle title change
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    setHasChanges(true);
  };

  // Handle content change
  const handleContentChange = (value: string) => {
    setContent(value);
    setHasChanges(true);
  };

  // Add a new tag
  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      const updatedTags = [...tags, newTag.trim()];
      setTags(updatedTags);
      setNewTag('');
      setHasChanges(true);
    }
  };

  // Remove a tag
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
    setHasChanges(true);
  };

  // Format date for display
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Card className="h-full flex flex-col">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        {isEditingTitle ? (
          <input
            ref={titleInputRef}
            type="text"
            value={title}
            onChange={handleTitleChange}
            className="flex-1 font-medium text-lg text-gray-900 dark:text-white bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-primary-500 focus:ring-0"
            autoFocus
            onBlur={() => setIsEditingTitle(false)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                setIsEditingTitle(false);
              }
            }}
          />
        ) : (
          <h2
            className="font-medium text-lg text-gray-900 dark:text-white cursor-pointer"
            onClick={() => setIsEditingTitle(true)}
          >
            {title}
          </h2>
        )}

        <div className="flex items-center space-x-2">
          <Button
            variant="danger"
            size="sm"
            onClick={onDelete}
          >
            Delete
          </Button>
        </div>
      </div>

      <div className="text-xs text-gray-500 dark:text-gray-400 px-4 py-1 bg-gray-50 dark:bg-gray-800 flex justify-between items-center">
        <span>Last updated: {formatDate(note.updatedAt)}</span>
        
        <div className="flex flex-wrap gap-1">
          {tags.map((tag, index) => (
            <span 
              key={index} 
              className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs px-2 py-0.5 rounded-full flex items-center"
            >
              {tag}
              <button 
                className="ml-1 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                onClick={() => handleRemoveTag(tag)}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Tag Input Section */}
      <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center">
        <div className="flex items-center flex-1">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleAddTag();
              }
            }}
            placeholder="Add tag..."
            className="flex-1 text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-l-md focus:ring-primary-500 focus:border-primary-500"
          />
          <button
            onClick={handleAddTag}
            disabled={!newTag.trim()}
            className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-r-md hover:bg-gray-300 dark:hover:bg-gray-500 disabled:opacity-50"
          >
            Add
          </button>
        </div>
      </div>

      {/* Rich Text Editor */}
      <CardContent className="flex-1 overflow-auto">
        <ReactQuill
          ref={quillRef}
          value={content}
          onChange={handleContentChange}
          modules={modules}
          formats={formats}
          theme="snow"
          className="h-full dark:text-gray-200"
          placeholder="Start writing your notes here..."
        />
      </CardContent>

      {/* Save/Discard Buttons */}
      {hasChanges && (
        <CardFooter>
          <div className="text-xs text-gray-500 dark:text-gray-400 mr-auto">
            You have unsaved changes
          </div>
          <Button 
            variant="outline" 
            onClick={handleDiscardChanges}
          >
            Discard Changes
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSaveChanges}
          >
            Save Changes
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default NoteEditor;