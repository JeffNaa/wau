import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Link,
  Code,
  Undo,
  Redo,
  Type,
} from 'lucide-react';

interface RichTextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

const toolbarButtons = [
  { cmd: 'bold', icon: Bold, title: 'Bold' },
  { cmd: 'italic', icon: Italic, title: 'Italic' },
  { cmd: 'underline', icon: Underline, title: 'Underline' },
  { cmd: 'strikeThrough', icon: Strikethrough, title: 'Strikethrough' },
  { divider: true },
  { cmd: 'formatBlock', arg: 'H2', icon: Heading2, title: 'Heading 2' },
  { cmd: 'formatBlock', arg: 'H3', icon: Heading3, title: 'Heading 3' },
  { cmd: 'formatBlock', arg: 'P', icon: Type, title: 'Paragraph' },
  { divider: true },
  { cmd: 'insertUnorderedList', icon: List, title: 'Bullet List' },
  { cmd: 'insertOrderedList', icon: ListOrdered, title: 'Numbered List' },
  { divider: true },
  { cmd: 'createLink', icon: Link, title: 'Link', prompt: true },
  { cmd: 'removeFormat', icon: Code, title: 'Clear Formatting' },
  { divider: true },
  { cmd: 'undo', icon: Undo, title: 'Undo' },
  { cmd: 'redo', icon: Redo, title: 'Redo' },
];

export default function RichTextField({ label, value, onChange }: RichTextFieldProps) {
  const [mode, setMode] = useState<'visual' | 'html'>('visual');
  const editorRef = useRef<HTMLDivElement>(null);
  const isInternalChange = useRef(false);

  // Sync external value into editor
  useEffect(() => {
    if (editorRef.current && !isInternalChange.current) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || '';
      }
    }
    isInternalChange.current = false;
  }, [value]);

  const handleEditorInput = useCallback(() => {
    if (editorRef.current) {
      isInternalChange.current = true;
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const execCommand = useCallback(
    (cmd: string, arg?: string, shouldPrompt?: boolean) => {
      if (mode !== 'visual') return;

      const editor = editorRef.current;
      if (!editor) return;

      editor.focus();

      let finalArg = arg;
      if (shouldPrompt) {
        const url = prompt('Enter URL:', 'https://');
        if (!url || url === 'https://') return;
        finalArg = url;
      }

      document.execCommand(cmd, false, finalArg);
      handleEditorInput();
    },
    [mode, handleEditorInput],
  );

  const handleHtmlChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-[12px] font-medium">{label}</label>
        <div className="flex bg-secondary/50 rounded-lg p-0.5">
          <button
            onClick={() => setMode('visual')}
            className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-all ${
              mode === 'visual'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Visual
          </button>
          <button
            onClick={() => setMode('html')}
            className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-all ${
              mode === 'html'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            HTML
          </button>
        </div>
      </div>

      {mode === 'visual' ? (
        <div className="rounded-lg border border-input bg-background overflow-hidden">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-border bg-secondary/30">
            {toolbarButtons.map((btn, i) => {
              if ('divider' in btn) {
                return <div key={i} className="w-px h-4 bg-border mx-0.5" />;
              }
              const Icon = btn.icon;
              return (
                <button
                  key={btn.cmd + (btn.arg || '')}
                  type="button"
                  onClick={() => execCommand(btn.cmd, btn.arg, btn.prompt)}
                  title={btn.title}
                  className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  <Icon size={13} />
                </button>
              );
            })}
          </div>

          {/* Editor */}
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleEditorInput}
            className="min-h-[160px] max-h-[400px] overflow-auto px-3 py-2.5 text-[13px] leading-relaxed outline-none [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:my-2 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:my-1.5 [&_p]:my-1 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-0.5 [&_a]:text-primary [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:italic [&_strong]:font-semibold [&_em]:italic [&_u]:underline [&_s]:line-through"
            style={{ wordBreak: 'break-word' }}
            dangerouslySetInnerHTML={{ __html: value || '' }}
          />
        </div>
      ) : (
        <textarea
          value={value || ''}
          onChange={handleHtmlChange}
          rows={10}
          className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-[12px] font-mono resize-none focus:outline-none focus:ring-2 focus:ring-ring"
          spellCheck={false}
        />
      )}
    </div>
  );
}
