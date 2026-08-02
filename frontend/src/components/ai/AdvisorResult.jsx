import { useState } from 'react';

export default function AdvisorResult({ toolName, resultText, timestamp }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(resultText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Safe, lightweight local parser for markdown formatting
  const parseMarkdown = (text) => {
    if (!text) return null;

    const lines = text.split('\n');
    let insideList = false;
    const elements = [];

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();

      // Handle empty lines
      if (trimmedLine === '') {
        if (insideList) {
          insideList = false;
        }
        elements.push(<div key={`space-${index}`} className="h-3" />);
        return;
      }

      // Handle Headers
      if (trimmedLine.startsWith('### ')) {
        insideList = false;
        elements.push(
          <h4 key={`h3-${index}`} className="text-body-lg font-bold text-primary mt-4 mb-2">
            {trimmedLine.slice(4)}
          </h4>
        );
        return;
      }
      if (trimmedLine.startsWith('## ')) {
        insideList = false;
        elements.push(
          <h3 key={`h2-${index}`} className="font-headline-md text-headline-md font-bold text-primary mt-5 mb-2.5">
            {trimmedLine.slice(3)}
          </h3>
        );
        return;
      }
      if (trimmedLine.startsWith('# ')) {
        insideList = false;
        elements.push(
          <h2 key={`h1-${index}`} className="font-headline-xl text-headline-xl font-bold text-primary mt-6 mb-3">
            {trimmedLine.slice(2)}
          </h2>
        );
        return;
      }

      // Handle Unordered Lists
      if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
        const itemContent = trimmedLine.slice(2);
        const parsedContent = formatBoldAndItalic(itemContent);
        
        if (!insideList) {
          insideList = true;
          elements.push(
            <ul key={`ul-${index}`} className="list-disc pl-6 space-y-1.5 text-body-sm text-on-surface-variant my-2">
              <li key={`li-${index}`}>{parsedContent}</li>
            </ul>
          );
        } else {
          // Append to the previous list element (for rendering correctness we just use nested lists or flat items)
          elements.push(
            <ul key={`ul-item-${index}`} className="list-disc pl-6 space-y-1.5 text-body-sm text-on-surface-variant -mt-1.5 my-1.5">
              <li key={`li-${index}`}>{parsedContent}</li>
            </ul>
          );
        }
        return;
      }

      // Default to regular paragraph
      insideList = false;
      elements.push(
        <p key={`p-${index}`} className="text-body-sm text-on-surface-variant leading-relaxed mb-3">
          {formatBoldAndItalic(trimmedLine)}
        </p>
      );
    });

    return elements;
  };

  // Helper to parse **bold** and *italic*
  const formatBoldAndItalic = (text) => {
    // Replace **bold** with React components
    const boldRegex = /\*\*(.*?)\*\*/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = boldRegex.exec(text)) !== null) {
      // Push prefix text
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      // Push bold element
      parts.push(<strong key={match.index} className="font-bold text-primary">{match[1]}</strong>);
      lastIndex = boldRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  const formattedDate = timestamp ? new Date(timestamp).toLocaleString() : new Date().toLocaleString();

  return (
    <div className="bg-surface-container-low border border-outline-variant/30 p-6 md:p-8 rounded-2xl shadow-md space-y-6 max-w-[800px] mx-auto">
      {/* Header Panel */}
      <div className="flex justify-between items-start gap-4 pb-4 border-b border-outline-variant/20">
        <div>
          <div className="flex items-center gap-1.5 text-secondary">
            <span className="material-symbols-outlined text-[20px]">description</span>
            <span className="text-[11px] font-bold uppercase tracking-wider">Generated Output</span>
          </div>
          <h3 className="font-headline-md text-headline-md font-bold text-primary mt-1">
            {toolName}
          </h3>
          <p className="text-[12px] text-on-surface-variant/60 font-semibold mt-0.5">
            Generated on {formattedDate}
          </p>
        </div>

        {/* Copy Button */}
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-4 py-2 border border-outline-variant/60 hover:bg-surface-container hover:border-secondary/40 text-secondary rounded-full text-body-sm font-semibold transition-all shrink-0"
        >
          <span className="material-symbols-outlined text-[18px]">
            {copied ? 'check' : 'content_copy'}
          </span>
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      {/* Output Content Area */}
      <div className="max-h-[500px] overflow-y-auto pr-2 scrollbar-thin bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/20">
        <div className="prose max-w-none">
          {parseMarkdown(resultText)}
        </div>
      </div>
    </div>
  );
}
