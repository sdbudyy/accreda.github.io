import React, { useEffect, useRef, useState } from 'react';
import { useSAOsStore } from '../../store/saos';
import type { SAOAnnotation } from '../../types/sao';
import { MessageSquare, X, CheckCircle, Trash2, CornerDownRight } from 'lucide-react';

interface SAOAnnotationProps {
  saoId: string;
  content: string;
  readOnly?: boolean;
  section?: string;
}

interface Highlight {
  id: string;
  start: number;
  end: number;
  comment: string;
}

const HIGHLIGHT_COLOR = '#fff3bf';
const HIGHLIGHT_ACTIVE = '#ffe066';

const SAOAnnotation: React.FC<SAOAnnotationProps> = ({ saoId, content, readOnly, section }) => {
  const {
    fetchAnnotations,
    addAnnotation,
    fetchReplies,
    addReply,
    resolveAnnotation,
    deleteAnnotation,
  } = useSAOsStore();
  const [annotations, setAnnotations] = useState<SAOAnnotation[]>([]);
  const [replies, setReplies] = useState<Record<string, any[]>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [pendingRange, setPendingRange] = useState<{ start: number; end: number } | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddBtn, setShowAddBtn] = useState<{ x: number; y: number } | null>(null);
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});
  const [popover, setPopover] = useState<string | null>(null);
  const [resolved, setResolved] = useState<Record<string, boolean>>({});
  const contentRef = useRef<HTMLDivElement>(null);
  const highlightRefs = useRef<Record<string, HTMLSpanElement | null>>({});
  const sidebarRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Fetch annotations and their replies
  useEffect(() => {
    const loadAnnotations = async () => {
      const anns = await fetchAnnotations(saoId, section);
      setAnnotations(anns);
      // Fetch replies for each annotation
      const repliesObj: Record<string, any[]> = {};
      const resolvedObj: Record<string, boolean> = {};
      for (const ann of anns) {
        repliesObj[ann.id] = await fetchReplies(ann.id);
      }
      setReplies(repliesObj);
      setResolved(resolvedObj);
    };
    loadAnnotations();
  }, [saoId, section, fetchAnnotations, fetchReplies]);

  // Convert SAOAnnotation to Highlight
  const highlights: (Highlight & { author_role?: string; author_name?: string })[] = annotations.map(a => ({
    id: a.id,
    start: a.location.start,
    end: a.location.end,
    comment: a.annotation,
    author_role: a.author_role,
    author_name: a.author_name,
  }));

  // Filter out resolved annotations
  const visibleAnnotations = annotations.filter(a => !a.resolved);

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

  // Render content with highlights and popover
  const renderContent = () => {
    if (!visibleAnnotations.length) return content;
    let parts: React.ReactNode[] = [];
    let last = 0;
    const sorted = [...visibleAnnotations].sort((a, b) => a.location.start - b.location.start);
    sorted.forEach((a, i) => {
      const isSupervisor = a.author_role === 'supervisor';
      const isResolved = a.resolved;
      const highlightColor = isResolved
        ? '#e9ecef'
        : isSupervisor
        ? (selected === a.id || hovered === a.id ? '#ffe066' : '#fff3bf')
        : (selected === a.id || hovered === a.id ? '#d0ebff' : '#e7f5ff');
      const borderColor = isSupervisor ? '#ffd43b' : '#228be6';
      parts.push(content.slice(last, a.location.start));
      parts.push(
        <span
          key={a.id}
          ref={el => (highlightRefs.current[a.id] = el)}
          style={{
            background: highlightColor,
            borderRadius: 3,
            boxShadow: selected === a.id || hovered === a.id ? `0 0 0 2px ${borderColor}` : undefined,
            cursor: 'pointer',
            position: 'relative',
            transition: 'background 0.2s, box-shadow 0.2s',
            padding: '0 2px',
            opacity: isResolved ? 0.6 : 1,
          }}
          onClick={e => {
            setSelected(a.id);
            setPopover(a.id);
            setTimeout(() => {
              sidebarRefs.current[a.id]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
          }}
          onMouseEnter={() => setHovered(a.id)}
          onMouseLeave={() => setHovered(null)}
        >
          {content.slice(a.location.start, a.location.end)}
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
              setSelected(a.id);
              setPopover(a.id);
              sidebarRefs.current[a.id]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }}
          >
            <MessageSquare size={14} />
          </span>
          {/* Popover for comment */}
          {popover === a.id && selected === a.id && (
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: '100%',
                zIndex: 100,
                background: 'white',
                border: '1px solid #ddd',
                borderRadius: 6,
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                minWidth: 280,
                padding: 12,
                marginTop: 4,
              }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-slate-500">
                  {a.author_name} ({isSupervisor ? 'Supervisor' : 'EIT'})
                  {isResolved && <span className="ml-2 text-green-600 font-semibold">[Resolved]</span>}
                </span>
                <button onClick={() => setPopover(null)} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
              </div>
              <div className="text-slate-800 text-sm mb-2">{a.annotation}</div>
              {/* Replies */}
              {replies[a.id] && replies[a.id].length > 0 && (
                <div className="mb-2">
                  {replies[a.id].map((r: any) => (
                    <div key={r.id} className="flex items-start gap-2 mb-1">
                      <CornerDownRight size={14} className="mt-1 text-slate-400" />
                      <div>
                        <span className="text-xs text-slate-500">{r.content}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {/* Reply input */}
              {!isResolved && (
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    className="input input-sm flex-1"
                    placeholder="Reply..."
                    value={replyInputs[a.id] || ''}
                    onChange={e => setReplyInputs({ ...replyInputs, [a.id]: e.target.value })}
                  />
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={async () => {
                      if (!a.id) {
                        console.error('Tried to fetch replies for undefined annotation id');
                        return;
                      }
                      if (!replyInputs[a.id]?.trim()) return;
                      await addReply(a.id, replyInputs[a.id]);
                      setReplyInputs({ ...replyInputs, [a.id]: '' });
                      // Refresh replies
                      const newReplies = await fetchReplies(a.id);
                      setReplies(r => ({ ...r, [a.id]: newReplies }));
                    }}
                  >Reply</button>
                </div>
              )}
              {/* Actions */}
              <div className="flex gap-2 mt-2">
                {!isResolved && (
                  <button className="btn btn-success btn-xs" onClick={async () => {
                    if (!a.id) {
                      console.error('Tried to resolve annotation with undefined id');
                      return;
                    }
                    await resolveAnnotation(a.id);
                    const anns = await fetchAnnotations(saoId, section);
                    setAnnotations(anns);
                    setResolved(r => ({ ...r, [a.id]: true }));
                    if (selected === a.id) setSelected(null);
                    if (popover === a.id) setPopover(null);
                  }}><CheckCircle size={14} className="mr-1" />Resolve</button>
                )}
                {isResolved && (
                  <button className="btn btn-danger btn-xs" onClick={async () => {
                    if (!a.id) {
                      console.error('Tried to delete annotation with undefined id');
                      return;
                    }
                    await deleteAnnotation(a.id);
                    const anns = await fetchAnnotations(saoId, section);
                    setAnnotations(anns);
                    if (popover === a.id) setPopover(null);
                    if (selected === a.id) setSelected(null);
                  }}><Trash2 size={14} className="mr-1" />Delete</button>
                )}
              </div>
            </div>
          )}
        </span>
      );
      last = a.location.end;
    });
    parts.push(content.slice(last));
    return parts;
  };

  const handleSave = async () => {
    if (!pendingRange || !comment.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await addAnnotation(saoId, pendingRange, comment, section);
      setComment('');
      setPendingRange(null);
      setShowInput(false);
      setShowAddBtn(null);
      // Refresh annotations
      const anns = await fetchAnnotations(saoId, section);
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

  // In the sidebar, use visibleAnnotations.map(...)
  // If the selected annotation is not in visibleAnnotations, hide the popover
  useEffect(() => {
    if (selected && !visibleAnnotations.some(a => a.id === selected)) {
      setPopover(null);
      setSelected(null);
    }
  }, [visibleAnnotations, selected]);

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
      {/* Sidebar with comments and replies */}
      <div className="w-72 border-l pl-4 flex flex-col gap-3 bg-slate-50 max-h-[400px] overflow-y-auto">
        <h4 className="font-semibold text-slate-700 mb-2">Comments</h4>
        {visibleAnnotations.length === 0 && <div className="text-slate-400 text-sm">No comments yet.</div>}
        {visibleAnnotations.map(a => {
          const isSupervisor = a.author_role === 'supervisor';
          const isResolved = a.resolved;
          return (
            <div
              key={a.id}
              ref={el => (sidebarRefs.current[a.id] = el)}
              className={`p-2 rounded cursor-pointer transition-all ${selected === a.id ? (isSupervisor ? 'bg-yellow-100' : 'bg-blue-100') : hovered === a.id ? (isSupervisor ? 'bg-yellow-50' : 'bg-blue-50') : 'hover:bg-slate-100'}`}
              onClick={() => setSelected(a.id)}
              onMouseEnter={() => setHovered(a.id)}
              onMouseLeave={() => setHovered(null)}
              style={{ borderLeft: selected === a.id ? (isSupervisor ? '3px solid #fab005' : '3px solid #228be6') : '3px solid transparent', opacity: isResolved ? 0.6 : 1 }}
            >
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-1 italic max-w-full truncate">
                {a.author_name ? `${a.author_name} (${isSupervisor ? 'Supervisor' : 'EIT'})` : ''}
                {isResolved && <span className="ml-2 text-green-600 font-semibold">[Resolved]</span>}
                <span className="ml-2">{content.slice(a.location.start, a.location.end)}</span>
              </div>
              <div className="text-slate-800 text-sm mb-1">{a.annotation}</div>
              {/* Replies */}
              {replies[a.id] && replies[a.id].length > 0 && (
                <div className="mb-1 ml-4">
                  {replies[a.id].map((r: any) => (
                    <div key={r.id} className="flex items-start gap-2 mb-1">
                      <CornerDownRight size={14} className="mt-1 text-slate-400" />
                      <div>
                        <span className="text-xs text-slate-500">{r.content}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {/* Reply input */}
              {!isResolved && (
                <div className="flex gap-2 mt-1 ml-4">
                  <input
                    type="text"
                    className="input input-xs flex-1"
                    placeholder="Reply..."
                    value={replyInputs[a.id] || ''}
                    onChange={e => setReplyInputs({ ...replyInputs, [a.id]: e.target.value })}
                  />
                  <button
                    className="btn btn-primary btn-xs"
                    onClick={async () => {
                      if (!a.id) {
                        console.error('Tried to fetch replies for undefined annotation id');
                        return;
                      }
                      if (!replyInputs[a.id]?.trim()) return;
                      await addReply(a.id, replyInputs[a.id]);
                      setReplyInputs({ ...replyInputs, [a.id]: '' });
                      // Refresh replies
                      const newReplies = await fetchReplies(a.id);
                      setReplies(r => ({ ...r, [a.id]: newReplies }));
                    }}
                  >Reply</button>
                </div>
              )}
              {/* Actions */}
              <div className="flex gap-2 mt-2 ml-4">
                {!isResolved && (
                  <button className="btn btn-success btn-xs" onClick={async () => {
                    if (!a.id) {
                      console.error('Tried to resolve annotation with undefined id');
                      return;
                    }
                    await resolveAnnotation(a.id);
                    const anns = await fetchAnnotations(saoId, section);
                    setAnnotations(anns);
                    setResolved(r => ({ ...r, [a.id]: true }));
                    if (selected === a.id) setSelected(null);
                    if (popover === a.id) setPopover(null);
                  }}><CheckCircle size={14} className="mr-1" />Resolve</button>
                )}
                {isResolved && (
                  <button className="btn btn-danger btn-xs" onClick={async () => {
                    if (!a.id) {
                      console.error('Tried to delete annotation with undefined id');
                      return;
                    }
                    await deleteAnnotation(a.id);
                    const anns = await fetchAnnotations(saoId, section);
                    setAnnotations(anns);
                    if (popover === a.id) setPopover(null);
                    if (selected === a.id) setSelected(null);
                  }}><Trash2 size={14} className="mr-1" />Delete</button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SAOAnnotation; 