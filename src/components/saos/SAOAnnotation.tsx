import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useSAOsStore } from '../../store/saos';
import type { SAOAnnotation } from '../../types/sao';
import { MessageSquare, X, CheckCircle, Trash2, CornerDownRight, Plus, Filter } from 'lucide-react';
import { supabase } from '../../lib/supabase';

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
  author_role: string;
  author_name: string;
  resolved: boolean;
  replies: any[];
}

const SAOAnnotation: React.FC<SAOAnnotationProps> = ({ saoId, content, readOnly, section }) => {
  const {
    fetchAnnotations,
    addAnnotation,
    fetchReplies,
    addReply,
    resolveAnnotation,
    deleteAnnotation,
  } = useSAOsStore();
  
  // Optimized state management
  const [annotations, setAnnotations] = useState<SAOAnnotation[]>([]);
  const [replies, setReplies] = useState<Record<string, any[]>>({});
  const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(null);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [pendingSelection, setPendingSelection] = useState<{ start: number; end: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResolved, setShowResolved] = useState(false);
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});
  
  const contentRef = useRef<HTMLDivElement>(null);
  const commentInputRef = useRef<HTMLDivElement>(null);

  // Memoized highlights for better performance
  const highlights = useMemo(() => {
    return annotations.map(a => ({
      id: a.id,
      start: a.location.start,
      end: a.location.end,
      comment: a.annotation,
      author_role: a.author_role,
      author_name: a.author_name,
      resolved: a.resolved || false,
      replies: replies[a.id] || []
    }));
  }, [annotations, replies]);

  // Filter annotations based on resolved status
  const visibleHighlights = useMemo(() => {
    return highlights.filter(h => showResolved || !h.resolved);
  }, [highlights, showResolved]);

  // Load annotations and replies efficiently
  const loadAnnotations = useCallback(async () => {
    try {
      setIsLoading(true);
      const anns = await fetchAnnotations(saoId, section);
      setAnnotations(anns);
      
      // Batch fetch replies for better performance
      const replyPromises = anns.map(ann => fetchReplies(ann.id));
      const replyResults = await Promise.all(replyPromises);
      
      const repliesObj: Record<string, any[]> = {};
      anns.forEach((ann, index) => {
        repliesObj[ann.id] = replyResults[index];
      });
      setReplies(repliesObj);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [saoId, section, fetchAnnotations, fetchReplies]);

  useEffect(() => {
    loadAnnotations();
  }, [loadAnnotations]);

  // Real-time updates using Supabase subscriptions
  useEffect(() => {
    const channel = supabase
      .channel(`sao-annotations-${saoId}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'sao_annotation',
          filter: `sao_id=eq.${saoId}`
        }, 
        () => {
          loadAnnotations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [saoId, loadAnnotations]);

  // Improved text selection handling
  const handleTextSelection = useCallback((e: React.MouseEvent) => {
    if (readOnly) return;
    
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      setShowCommentInput(false);
      setPendingSelection(null);
      return;
    }

    const range = selection.getRangeAt(0);
    if (!contentRef.current?.contains(range.commonAncestorContainer)) {
      return;
    }

    // Calculate character offsets more efficiently
    const start = getCharacterOffset(contentRef.current, range.startContainer, range.startOffset);
    const end = getCharacterOffset(contentRef.current, range.endContainer, range.endOffset);
    
    if (start !== end) {
      setPendingSelection({ start: Math.min(start, end), end: Math.max(start, end) });
      setShowCommentInput(true);
      
      // Position comment input near selection
      const rect = range.getBoundingClientRect();
      if (commentInputRef.current) {
        commentInputRef.current.style.position = 'absolute';
        commentInputRef.current.style.left = `${rect.left}px`;
        commentInputRef.current.style.top = `${rect.bottom + 10}px`;
      }
    }
  }, [readOnly]);

  // Efficient character offset calculation
  const getCharacterOffset = (root: Node, node: Node, offset: number): number => {
    const walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_TEXT,
      null
    );
    
    let charCount = 0;
    let currentNode: Node | null;
    
    while (currentNode = walker.nextNode()) {
      if (currentNode === node) {
        return charCount + offset;
      }
      charCount += currentNode.textContent?.length || 0;
    }
    
    return charCount;
  };

  // Save comment
  const handleSaveComment = useCallback(async () => {
    if (!pendingSelection || !commentText.trim()) return;
    
    try {
      setIsLoading(true);
      await addAnnotation(saoId, pendingSelection, commentText, section);
      setCommentText('');
      setPendingSelection(null);
      setShowCommentInput(false);
      await loadAnnotations();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [pendingSelection, commentText, saoId, section, addAnnotation, loadAnnotations]);

  // Add reply
  const handleAddReply = useCallback(async (annotationId: string) => {
    const replyText = replyTexts[annotationId];
    if (!replyText?.trim()) return;
    
    try {
      setIsLoading(true);
      await addReply(annotationId, replyText);
      setReplyTexts(prev => ({ ...prev, [annotationId]: '' }));
      await loadAnnotations();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [replyTexts, addReply, loadAnnotations]);

  // Resolve annotation
  const handleResolve = useCallback(async (annotationId: string) => {
    try {
      setIsLoading(true);
      await resolveAnnotation(annotationId);
      await loadAnnotations();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [resolveAnnotation, loadAnnotations]);

  // Delete annotation
  const handleDelete = useCallback(async (annotationId: string) => {
    try {
      setIsLoading(true);
      await deleteAnnotation(annotationId);
      await loadAnnotations();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [deleteAnnotation, loadAnnotations]);

  // Render content with highlights
  const renderContent = useCallback(() => {
    if (!visibleHighlights.length) return content;
    
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    
    // Sort highlights by start position
    const sortedHighlights = [...visibleHighlights].sort((a, b) => a.start - b.start);
    
    sortedHighlights.forEach((highlight) => {
      // Add text before highlight
      if (highlight.start > lastIndex) {
        parts.push(content.slice(lastIndex, highlight.start));
      }
      
      // Add highlighted text
      parts.push(
        <span
          key={highlight.id}
          className={`inline-block px-1 rounded cursor-pointer transition-all ${
            highlight.resolved 
              ? 'bg-gray-200 text-gray-600' 
              : highlight.author_role === 'supervisor'
              ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
              : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
          } ${selectedAnnotation === highlight.id ? 'ring-2 ring-offset-1 ring-blue-500' : ''}`}
          onClick={() => setSelectedAnnotation(highlight.id)}
          title={`${highlight.author_name} (${highlight.author_role}): ${highlight.comment}`}
        >
          {content.slice(highlight.start, highlight.end)}
          <MessageSquare size={12} className="inline ml-1" />
        </span>
      );
      
      lastIndex = highlight.end;
    });
    
    // Add remaining text
    if (lastIndex < content.length) {
      parts.push(content.slice(lastIndex));
    }
    
    return parts;
  }, [content, visibleHighlights, selectedAnnotation]);

  return (
    <div className="space-y-4">
      {/* Error display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* Content area */}
      <div className="relative">
        <div
          ref={contentRef}
          className={`prose prose-sm max-w-none p-4 border rounded-lg ${
            readOnly ? 'bg-gray-50' : 'bg-white'
          }`}
          style={{ whiteSpace: 'pre-wrap', minHeight: '120px' }}
          onMouseUp={handleTextSelection}
        >
          {renderContent()}
        </div>

        {/* Comment input */}
        {showCommentInput && !readOnly && (
          <div
            ref={commentInputRef}
            className="absolute z-10 bg-white border border-gray-300 rounded-lg shadow-lg p-4 min-w-[300px]"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Add Comment</span>
              <button
                onClick={() => setShowCommentInput(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            </div>
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Enter your comment..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none"
              rows={3}
              autoFocus
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleSaveComment}
                disabled={!commentText.trim() || isLoading}
                className="btn btn-primary btn-sm"
              >
                {isLoading ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={() => setShowCommentInput(false)}
                className="btn btn-secondary btn-sm"
                disabled={isLoading}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Comments panel */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-gray-800">Comments ({visibleHighlights.length})</h4>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowResolved(!showResolved)}
              className={`btn btn-sm ${showResolved ? 'btn-primary' : 'btn-secondary'}`}
            >
              <Filter size={14} className="mr-1" />
              {showResolved ? 'Hide Resolved' : 'Show Resolved'}
            </button>
          </div>
        </div>

        {isLoading && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        )}

        {visibleHighlights.length === 0 && !isLoading && (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare size={24} className="mx-auto mb-2" />
            <p>No comments yet</p>
            {!readOnly && (
              <p className="text-sm">Select text above to add a comment</p>
            )}
          </div>
        )}

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {visibleHighlights.map((highlight) => (
            <div
              key={highlight.id}
              className={`p-3 rounded-lg border transition-all ${
                selectedAnnotation === highlight.id
                  ? 'border-blue-300 bg-blue-50'
                  : 'border-gray-200 bg-white'
              } ${highlight.resolved ? 'opacity-75' : ''}`}
            >
              {/* Comment header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">
                    {highlight.author_name}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    highlight.author_role === 'supervisor'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {highlight.author_role}
                  </span>
                  {highlight.resolved && (
                    <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                      Resolved
                    </span>
                  )}
                </div>
                <div className="flex gap-1">
                  {!highlight.resolved && (
                    <button
                      onClick={() => handleResolve(highlight.id)}
                      className="btn btn-success btn-xs"
                      disabled={isLoading}
                    >
                      <CheckCircle size={12} />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(highlight.id)}
                    className="btn btn-danger btn-xs"
                    disabled={isLoading}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>

              {/* Comment text */}
              <div className="text-sm text-gray-800 mb-2">
                {highlight.comment}
              </div>

              {/* Highlighted text */}
              <div className="text-xs text-gray-500 mb-2 bg-gray-100 p-2 rounded">
                "{content.slice(highlight.start, highlight.end)}"
              </div>

              {/* Replies */}
              {highlight.replies.length > 0 && (
                <div className="ml-4 space-y-2">
                  {highlight.replies.map((reply: any) => (
                    <div key={reply.id} className="flex items-start gap-2 text-sm">
                      <CornerDownRight size={12} className="mt-1 text-gray-400" />
                      <div className="bg-gray-50 p-2 rounded flex-1">
                        <span className="text-gray-600">{reply.content}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply input */}
              {!highlight.resolved && !readOnly && (
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    value={replyTexts[highlight.id] || ''}
                    onChange={(e) => setReplyTexts(prev => ({ ...prev, [highlight.id]: e.target.value }))}
                    placeholder="Add a reply..."
                    className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded-md"
                  />
                  <button
                    onClick={() => handleAddReply(highlight.id)}
                    disabled={!replyTexts[highlight.id]?.trim() || isLoading}
                    className="btn btn-primary btn-xs"
                  >
                    Reply
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SAOAnnotation; 