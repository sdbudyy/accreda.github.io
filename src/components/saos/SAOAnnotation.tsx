import React, { useEffect, useRef, useState } from 'react';
import { useSAOsStore } from '../../store/saos';
import type { SAOAnnotation } from '../../types/sao';
import { MessageSquare } from 'lucide-react';

interface SAOAnnotationProps {
  saoId: string;
  content: string;
  readOnly?: boolean;
}

interface Highlight {
  id: string;
  start: number;
  end: number;
  comment: string;
}

const HIGHLIGHT_COLOR = '#fff3bf';
const HIGHLIGHT_ACTIVE = '#ffe066';

const SAOAnnotation: React.FC<SAOAnnotationProps> = ({ saoId, content, readOnly }) => {
  const { fetchAnnotations, addAnnotation } = useSAOsStore();
  const [annotations, setAnnotations] = useState<SAOAnnotation[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [pendingRange, setPendingRange] = useState<{ start: number; end: number } | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddBtn, setShowAddBtn] = useState<{ x: number; y: number } | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const highlightRefs = useRef<Record<string, HTMLSpanElement | null>>({});
  const sidebarRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    const loadAnnotations = async () => {
      const anns = await fetchAnnotations(saoId);
      setAnnotations(anns);
    };
    loadAnnotations();
  }, [saoId, fetchAnnotations]);

  // Convert SAOAnnotation to Highlight
  const highlights: (Highlight & { author_role?: string; author_name?: string })[] = annotations.map(a => ({
    id: a.id,
    start: a.location.start,
    end: a.location.end,
    comment: a.annotation,
    author_role: a.author_role,
    author_name: a.author_name,
  }));

  // Get absolute character offset of a node within a parent
  function getOffsetWithin(parent: Node, node: Node, offset: number): number {
    let chars = 0;
    function traverse(current: Node): boolean {
      if (current === node) {
        chars += offset;
        return true;
      }
      if (current.nodeType === Node.TEXT_NODE) {
        chars += (current.textContent || '').length;
      } else {
        for (let child of Array.from(current.childNodes)) {
          if (traverse(child)) return true;
        }
      }
      return false;
    }
    traverse(parent);
    return chars;
  }

  // Handle text selection and show floating button
  const handleMouseUp = (e: React.MouseEvent) => {
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) {
      setShowAddBtn(null);
      return;
    }
    const range = selection.getRangeAt(0);
    if (!contentRef.current || !contentRef.current.contains(range.commonAncestorContainer)) {
      setShowAddBtn(null);
      return;
    }
    if (selection.isCollapsed) {
      setShowAddBtn(null);
      return;
    }
    // Get absolute offsets
    const start = getOffsetWithin(contentRef.current, range.startContainer, range.startOffset);
    const end = getOffsetWithin(contentRef.current, range.endContainer, range.endOffset);
    if (start !== end) {
      // Get bounding rect for floating button
      const rect = range.getBoundingClientRect();
      setShowAddBtn({
        x: rect.right - contentRef.current.getBoundingClientRect().left,
        y: rect.bottom - contentRef.current.getBoundingClientRect().top + window.scrollY
      });
      setPendingRange({ start: Math.min(start, end), end: Math.max(start, end) });
    } else {
      setShowAddBtn(null);
    }
  };

  // Render content with highlights and comment icons
  const renderContent = () => {
    if (!highlights.length) return content;
    let parts: React.ReactNode[] = [];
    let last = 0;
    // Sort highlights by start
    const sorted = [...highlights].sort((a, b) => a.start - b.start);
    sorted.forEach((h, i) => {
      const isSupervisor = h.author_role === 'supervisor';
      const highlightColor = isSupervisor ? (selected === h.id || hovered === h.id ? '#ffe066' : '#fff3bf') : (selected === h.id || hovered === h.id ? '#d0ebff' : '#e7f5ff');
      const borderColor = isSupervisor ? '#ffd43b' : '#228be6';
      parts.push(content.slice(last, h.start));
      parts.push(
        <span
          key={h.id}
          ref={el => (highlightRefs.current[h.id] = el)}
          style={{
            background: highlightColor,
            borderRadius: 3,
            boxShadow: selected === h.id || hovered === h.id ? `0 0 0 2px ${borderColor}` : undefined,
            cursor: 'pointer',
            position: 'relative',
            transition: 'background 0.2s, box-shadow 0.2s',
            padding: '0 2px',
          }}
          onClick={() => {
            setSelected(h.id);
            setTimeout(() => {
              sidebarRefs.current[h.id]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
          }}
          onMouseEnter={() => setHovered(h.id)}
          onMouseLeave={() => setHovered(null)}
        >
          {content.slice(h.start, h.end)}
          {/* Comment icon at end of highlight */}
          <span
            style={{
              display: 'inline-block',
              verticalAlign: 'middle',
              marginLeft: 2,
              color: isSupervisor ? '#fab005' : '#228be6',
              cursor: 'pointer',
              position: 'relative',
              top: 2,
            }}
            title="View comment"
            onClick={e => {
              e.stopPropagation();
              setSelected(h.id);
              sidebarRefs.current[h.id]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }}
          >
            <MessageSquare size={14} />
          </span>
        </span>
      );
      last = h.end;
    });
    parts.push(content.slice(last));
    return parts;
  };

  const handleSave = async () => {
    if (!pendingRange || !comment.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await addAnnotation(saoId, pendingRange, comment);
      setComment('');
      setPendingRange(null);
      setShowInput(false);
      setShowAddBtn(null);
      // Refresh annotations
      const anns = await fetchAnnotations(saoId);
      setAnnotations(anns);
    } catch (e: any) {
      setError(e.message || 'Failed to save annotation');
    } finally {
      setSaving(false);
    }
  };

  // When a comment is selected in the sidebar, scroll to the highlight
  const handleSidebarClick = (h: Highlight) => {
    setSelected(h.id);
    highlightRefs.current[h.id]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <div className="flex gap-6">
      <div style={{ flex: 1, minWidth: 0, position: 'relative' }}>
        <div
          ref={contentRef}
          style={{ whiteSpace: 'pre-wrap', cursor: readOnly ? 'default' : 'text', minHeight: 80 }}
          onMouseUp={readOnly ? undefined : handleMouseUp}
        >
          {renderContent()}
        </div>
        {/* Floating Add Comment button */}
        {!readOnly && showAddBtn && pendingRange && !showInput && (
          <button
            style={{
              position: 'absolute',
              left: showAddBtn.x,
              top: showAddBtn.y,
              zIndex: 10,
              background: '#fab005',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              padding: '4px 10px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              cursor: 'pointer',
              fontWeight: 600,
            }}
            onClick={() => setShowInput(true)}
          >
            Add comment
          </button>
        )}
        {/* Comment input */}
        {!readOnly && showInput && (
          <div className="mt-2 flex flex-col gap-2 bg-yellow-50 p-3 rounded shadow max-w-md" style={{ position: 'absolute', left: showAddBtn?.x || 0, top: showAddBtn?.y || 0, zIndex: 20 }}>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Enter comment..."
              className="w-full px-3 py-2 border border-slate-300 rounded-md"
              rows={2}
              autoFocus
            />
            <div className="flex gap-2">
              <button className="btn btn-primary" onClick={handleSave} disabled={!comment.trim() || saving}>
                {saving ? 'Saving...' : 'Save Comment'}
              </button>
              <button className="btn btn-secondary" onClick={() => { setShowInput(false); setPendingRange(null); setComment(''); setShowAddBtn(null); }} disabled={saving}>
                Cancel
              </button>
            </div>
            {error && <div className="text-red-600 text-sm mt-1">{error}</div>}
          </div>
        )}
      </div>
      {/* Sidebar with comments */}
      <div className="w-72 border-l pl-4 flex flex-col gap-3 bg-slate-50 max-h-[400px] overflow-y-auto">
        <h4 className="font-semibold text-slate-700 mb-2">Comments</h4>
        {highlights.length === 0 && <div className="text-slate-400 text-sm">No comments yet.</div>}
        {highlights.map(h => {
          const isSupervisor = h.author_role === 'supervisor';
          return (
            <div
              key={h.id}
              ref={el => (sidebarRefs.current[h.id] = el)}
              className={`p-2 rounded cursor-pointer transition-all ${selected === h.id ? (isSupervisor ? 'bg-yellow-100' : 'bg-blue-100') : hovered === h.id ? (isSupervisor ? 'bg-yellow-50' : 'bg-blue-50') : 'hover:bg-slate-100'}`}
              onClick={() => handleSidebarClick(h)}
              onMouseEnter={() => setHovered(h.id)}
              onMouseLeave={() => setHovered(null)}
              style={{ borderLeft: selected === h.id ? (isSupervisor ? '3px solid #fab005' : '3px solid #228be6') : '3px solid transparent' }}
            >
              <div className="text-xs text-slate-500 mb-1 italic max-w-full truncate">
                {h.author_name ? `${h.author_name} (${isSupervisor ? 'Supervisor' : 'EIT'})` : ''}
                <span className="ml-2">{content.slice(h.start, h.end)}</span>
              </div>
              <div className="text-slate-800 text-sm">{h.comment}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SAOAnnotation; 