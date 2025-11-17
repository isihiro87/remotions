interface TextSegment {
  text: string;
  highlight: boolean;
}

const HIGHLIGHT_PATTERN = /\[\[(.+?)\]\]/g;

export const splitHighlightText = (text: string, highlights?: string[]) => {
  const segments: TextSegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null = null;

  while ((match = HIGHLIGHT_PATTERN.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        text: text.slice(lastIndex, match.index),
        highlight: false,
      });
    }

    segments.push({
      text: match[1],
      highlight: true,
    });

    lastIndex = HIGHLIGHT_PATTERN.lastIndex;
  }

  if (lastIndex < text.length) {
    segments.push({
      text: text.slice(lastIndex),
      highlight: false,
    });
  }

  if (!segments.length) {
    segments.push({ text, highlight: false });
  }

  if (highlights?.length) {
    return segments.map((segment) => {
      if (segment.highlight) {
        return segment;
      }
      if (highlights.some((word) => segment.text.includes(word))) {
        return { ...segment, highlight: true };
      }
      return segment;
    });
  }

  return segments;
};

