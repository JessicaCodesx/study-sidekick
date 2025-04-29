import { useState, useEffect, useRef } from 'react';
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
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [tags, setTags] = useState<string[]>(note.tags || []);
  const [newTag, setNewTag] = useState('');
  const titleInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Update state when note changes
  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
    setTags(note.tags || []);
    setIsEditingTitle(false);
    setIsEditing(false);
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
      setIsEditing(false);
      setIsEditingTitle(false);
    }
  };

  // Handle discard changes
  const handleDiscardChanges = () => {
    setTitle(note.title);
    setContent(note.content);
    setTags(note.tags || []);
    setIsEditing(false);
    setIsEditingTitle(false);
    setHasChanges(false);
  };

  // Handle title change
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    setHasChanges(true);
  };

  // Handle content change
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
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

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Ctrl/Cmd + S to save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      if (hasChanges) {
        handleSaveChanges();
      }
    }
    
    // Ctrl/Cmd + Enter to toggle preview/edit
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      setIsEditing(!isEditing);
    }
  };

  // Format date for display
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Add markdown formatting to selected text
  const addFormattingToSelection = (formatType: string) => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    let formattedText = '';
    
    switch (formatType) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        break;
      case 'heading1':
        formattedText = `# ${selectedText}`;
        break;
      case 'heading2':
        formattedText = `## ${selectedText}`;
        break;
      case 'heading3':
        formattedText = `### ${selectedText}`;
        break;
      case 'link':
        formattedText = `[${selectedText}](url)`;
        break;
      case 'code':
        formattedText = selectedText.includes('\n') 
          ? `\`\`\`\n${selectedText}\n\`\`\``
          : `\`${selectedText}\``;
        break;
      case 'bulletList':
        formattedText = selectedText
          .split('\n')
          .map(line => (line.trim() ? `- ${line}` : line))
          .join('\n');
        break;
      case 'numberedList':
        formattedText = selectedText
          .split('\n')
          .map((line, index) => (line.trim() ? `${index + 1}. ${line}` : line))
          .join('\n');
        break;
      default:
        formattedText = selectedText;
    }
    
    const newContent = 
      textarea.value.substring(0, start) + 
      formattedText + 
      textarea.value.substring(end);
    
    setContent(newContent);
    setHasChanges(true);
    
    // After update, restore focus and try to position cursor appropriately
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = start + formattedText.length;
      textarea.selectionEnd = start + formattedText.length;
    }, 0);
  };

  // Simple markdown renderer
  // In a real app, you'd use a library like react-markdown, marked, or remark
  const renderMarkdown = (markdown: string) => {
    if (!markdown) return null;
    
    // For this example, we'll do basic formatting
    // Headers
    let html = markdown
      .replace(/# (.*?)$/gm, '<h1>$1</h1>')
      .replace(/## (.*?)$/gm, '<h2>$1</h2>')
      .replace(/### (.*?)$/gm, '<h3>$1</h3>');
    
    // Bold and Italic
    html = html
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Links
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-blue-600 hover:underline">$1</a>');
    
    // Code blocks
    html = html.replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-auto"><code>$1</code></pre>');
    
    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code class="bg-gray-100 dark:bg-gray-800 px-1 rounded">$1</code>');
    
    // Lists
    html = html.replace(/- (.*?)$/gm, '<li>$1</li>');
    html = html.replace(/(\d+)\. (.*?)$/gm, '<li>$2</li>');
    
    // Wrap lists in ul/ol tags
    html = html.replace(/(<li>.*<\/li>)(?!\n<li>)/gs, '<ul>$1</ul>');
    
    // Line breaks
    html = html.replace(/\n/g, '<br />');
    
    return { __html: html };
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
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Preview' : 'Edit'}
          </Button>
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
              {isEditing && (
                <button 
                  className="ml-1 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                  onClick={() => handleRemoveTag(tag)}
                >
                  ×
                </button>
              )}
            </span>
          ))}
        </div>
      </div>

      {isEditing && (
        <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-2 bg-gray-50 dark:bg-gray-800 flex flex-wrap items-center gap-2">
          <button
            onClick={() => addFormattingToSelection('bold')}
            className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
            title="Bold"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12h8a2 2 0 002-2V8a2 2 0 00-2-2H6M6 12h8a2 2 0 012 2v2a2 2 0 01-2 2H6" />
            </svg>
          </button>
          
          <button
            onClick={() => addFormattingToSelection('italic')}
            className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
            title="Italic"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 17l4-11M5 17h10M10 6h4" />
            </svg>
          </button>
          
          <button
            onClick={() => addFormattingToSelection('heading1')}
            className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
            title="Heading 1"
          >
            <span className="font-bold">H1</span>
          </button>
          
          <button
            onClick={() => addFormattingToSelection('heading2')}
            className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
            title="Heading 2"
          >
            <span className="font-bold">H2</span>
          </button>
          
          <button
            onClick={() => addFormattingToSelection('heading3')}
            className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
            title="Heading 3"
          >
            <span className="font-bold">H3</span>
          </button>
          
          <div className="h-5 border-l border-gray-300 dark:border-gray-600 mx-1"></div>
          
          <button
            onClick={() => addFormattingToSelection('bulletList')}
            className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
            title="Bullet List"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <button
            onClick={() => addFormattingToSelection('numberedList')}
            className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
            title="Numbered List"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </button>
          
          <button
            onClick={() => addFormattingToSelection('link')}
            className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
            title="Link"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.172 13.828a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </button>
          
          <button
            onClick={() => addFormattingToSelection('code')}
            className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
            title="Code"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </button>
          
          <div className="h-5 border-l border-gray-300 dark:border-gray-600 mx-1"></div>
          
          <div className="flex-1 flex justify-end">
            <div className="flex items-center">
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
                className="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-l-md focus:ring-primary-500 focus:border-primary-500"
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
        </div>
      )}

      <CardContent className="flex-1 overflow-auto" onKeyDown={handleKeyDown}>
        {isEditing ? (
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleContentChange}
            className="w-full h-full min-h-[300px] p-2 border-gray-300 dark:border-gray-700 dark:bg-gray-800 rounded focus:border-primary-500 focus:ring-primary-500 font-mono text-sm"
            placeholder="Enter your note content here... Markdown is supported."
          />
        ) : (
          <div className="prose dark:prose-invert prose-sm max-w-none p-2">
            {content ? (
              <div dangerouslySetInnerHTML={renderMarkdown(content)} />
            ) : (
              <div className="text-gray-400 dark:text-gray-500 italic">
                No content. Click "Edit" to add content to this note.
              </div>
            )}
          </div>
        )}
      </CardContent>

      {hasChanges && (
        <CardFooter>
          <div className="text-xs text-gray-500 dark:text-gray-400 mr-auto">
            <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">Ctrl</kbd> + <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">S</kbd> to save
          </div>
          <Button variant="outline" onClick={handleDiscardChanges}>
            Discard Changes
          </Button>
          <Button variant="primary" onClick={handleSaveChanges}>
            Save Changes
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default NoteEditor;