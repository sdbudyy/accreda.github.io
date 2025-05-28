declare module 'react-annotator' {
  import * as React from 'react';
  export interface Range {
    start: number;
    end: number;
  }
  export interface Highlight {
    id: string;
    start: number;
    end: number;
    comment: string;
  }
  interface AnnotatorProps {
    value: string;
    highlights: Highlight[];
    onSelect: (range: Range) => void;
    onHighlightClick?: (id: string) => void;
    highlightStyle?: (highlight: Highlight) => React.CSSProperties;
  }
  const Annotator: React.FC<AnnotatorProps>;
  export default Annotator;
} 