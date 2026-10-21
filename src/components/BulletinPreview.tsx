import React, { useState, useEffect, useCallback, useRef } from 'react';
import QRCode from 'qrcode';
import { BulletinData } from '../types/bulletin';
import { SocialIcons } from './SocialIcons';
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Type,
  Baseline,
  Palette,
  Sparkles,
  RotateCcw,
  FileText,
  BookOpen,
} from 'lucide-react';

interface BulletinPreviewProps {
  bulletin: BulletinData;
  scale?: number;
}

// Consistent EB Garamond base typography
const FONT_GARAMOND = "'EB Garamond', Georgia, serif";

// Formats text with styled Telegram handles (@username), email addresses, and web links
const formatTextWithHandles = (text: string) => {
  const parts = text.split(
    /(https?:\/\/[^\s,;()]+|www\.[^\s,;()]+|@[a-zA-Z0-9_]+|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g
  );

  return parts.map((part, index) => {
    if (part.startsWith('http://') || part.startsWith('https://')) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold text-black underline decoration-stone-500 hover:text-stone-700 inline-block mx-0.5"
        >
          {part}
        </a>
      );
    }
    if (part.startsWith('www.')) {
      return (
        <a
          key={index}
          href={`https://${part}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold text-black underline decoration-stone-500 hover:text-stone-700 inline-block mx-0.5"
        >
          {part}
        </a>
      );
    }
    if (part.startsWith('@')) {
      const username = part.slice(1);
      return (
        <a
          key={index}
          href={`https://t.me/${username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold text-black underline decoration-stone-500 hover:text-stone-700 inline-block mx-0.5"
        >
          {part}
        </a>
      );
    }
    if (part.includes('@') && part.includes('.') && !part.includes(' ')) {
      return (
        <a
          key={index}
          href={`mailto:${part}`}
          className="font-bold text-black underline decoration-stone-500 hover:text-stone-700 inline-block mx-0.5"
        >
          {part}
        </a>
      );
    }
    return <span key={index}>{part}</span>;
  });
};

// Formats meditation paragraphs cleanly in line with the text
const renderMeditationParagraphs = (
  text: string,
  fontSize: number,
  lineHeight: number
) => {
  const paragraphs = text.split('\n\n').filter((p) => p.trim().length > 0);

  return paragraphs.map((rawParagraph, idx) => {
    let p = rawParagraph.trim();
    let pointHeader: string | null = null;

    if (idx === 0) {
      const match = p.match(/^([0-9]+)\.\s*(.*)/s);
      if (match) {
        const num = match[1];
        const roman = num === '1' ? 'I' : num === '2' ? 'II' : num;
        pointHeader = `Point ${roman}`;
        p = match[2];
      }
    }

    return (
      <div key={idx} className="space-y-1">
        {pointHeader && (
          <div
            contentEditable
            suppressContentEditableWarning
            className="text-center font-bold tracking-[0.22em] uppercase text-stone-900 py-0.5 border-y border-stone-400 mb-1 cursor-text outline-none focus:ring-1 focus:ring-amber-800 rounded-xs"
            style={{
              fontFamily: FONT_GARAMOND,
              fontSize: `${Math.max(10, +(fontSize * 0.88).toFixed(1))}px`,
            }}
          >
            ☩ {pointHeader} ☩
          </div>
        )}
        <p
          contentEditable
          suppressContentEditableWarning
          className="indent-6 text-justify text-black cursor-text outline-none focus:ring-1 focus:ring-amber-800 rounded-xs"
          style={{
            fontFamily: FONT_GARAMOND,
            fontSize: `${fontSize}px`,
            lineHeight,
          }}
        >
          {p}
        </p>
      </div>
    );
  });
};

// AutoFitMeditation: Failsafe component to guarantee text never overruns the A5 page
interface AutoFitMeditationProps {
  text: string;
}

const AutoFitMeditation: React.FC<AutoFitMeditationProps> = ({ text }) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);

  // Compute a smart baseline font size from word count
  const getInitialFontSize = (content: string) => {
    const words = content.split(/\s+/).filter(Boolean).length;
    if (words > 750) return 10.0;
    if (words > 600) return 11.0;
    if (words > 480) return 12.0;
    if (words > 380) return 12.8;
    if (words > 280) return 13.5;
    return 14.0;
  };

  const [fontSize, setFontSize] = React.useState<number>(() => getInitialFontSize(text));

  // Reset to computed baseline when text changes
  React.useEffect(() => {
    setFontSize(getInitialFontSize(text));
  }, [text]);

  // Failsafe auto-shrink effect:
  // If content scrollHeight exceeds container clientHeight, decrease font size step-by-step
  React.useLayoutEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content) return;

    const isOverflowing = content.scrollHeight > container.clientHeight + 1;
    if (isOverflowing && fontSize > 8.0) {
      const overshoot = content.scrollHeight - container.clientHeight;
      const step = overshoot > 50 ? 0.8 : overshoot > 20 ? 0.4 : 0.2;
      const nextSize = Math.max(8.0, +(fontSize - step).toFixed(2));
      if (nextSize < fontSize) {
        setFontSize(nextSize);
      }
    }
  }, [fontSize, text]);

  const lineHeight = fontSize < 11.2 ? 1.5 : fontSize < 12.6 ? 1.58 : 1.66;
  const spacingClass = fontSize < 11.5 ? 'space-y-1.5' : 'space-y-2.5';

  return (
    <div
      ref={containerRef}
      className="flex-1 w-full min-h-0 overflow-hidden flex flex-col justify-start"
    >
      <div
        ref={contentRef}
        className={spacingClass}
        style={{ fontSize: `${fontSize}px`, lineHeight }}
      >
        {renderMeditationParagraphs(text, fontSize, lineHeight)}
      </div>
    </div>
  );
};

export const BulletinPreview: React.FC<BulletinPreviewProps> = ({
  bulletin,
  scale = 1,
}) => {
  const { sunday, weekDays, nextSunday, massSettings, announcements, meditation, generalInfo } = bulletin;

  // Clean Kyriale title for Missal box symmetry (e.g. "Mass VI (Rex Genitor)" -> "Mass VI")
  const shortKyrialeName = massSettings.kyrialeName.split('(')[0].trim();

  // Dynamic QR code generation for the LinkTree / Community URL
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>(`${import.meta.env.BASE_URL}assets/qr-linktree.png`);

  useEffect(() => {
    const targetUrl = generalInfo.linkTreeUrl || 'https://linktr.ee/efmasscommunitysingapore';
    QRCode.toDataURL(targetUrl, {
      width: 256,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    })
      .then((url) => setQrCodeDataUrl(url))
      .catch((err) => {
        console.error('Failed to generate dynamic QR code data URL:', err);
        setQrCodeDataUrl(`${import.meta.env.BASE_URL}assets/qr-linktree.png`);
      });
  }, [generalInfo.linkTreeUrl]);

  // Floating contextual toolbar state to follow selected text in real-time
  const [toolbarState, setToolbarState] = useState<{
    top: number;
    left: number;
    isFloating: boolean;
    arrowLeft: number;
    placementBelow: boolean;
    activeTextSnippet: string;
  }>({
    top: 80,
    left: 20,
    isFloating: false,
    arrowLeft: 40,
    placementBelow: false,
    activeTextSnippet: '',
  });

  const toolbarRef = useRef<HTMLDivElement>(null);
  const lastTargetRef = useRef<HTMLElement | null>(null);
  const lastRangeRef = useRef<Range | null>(null);

  // Updates the toolbar coordinates directly according to the selected text range or focused/clicked element
  const updateToolbar = useCallback(() => {
    const docEl = document.getElementById('bulletin-document');
    if (!docEl) return;

    let targetRect: DOMRect | null = null;
    let snippet = '';
    let foundTargetEl: HTMLElement | null = null;
    let foundRange: Range | null = null;

    const selection = window.getSelection();

    // 1. Check if user selected/highlighted text or placed cursor inside the document
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const containerNode = range.commonAncestorContainer.nodeType === Node.TEXT_NODE
        ? range.commonAncestorContainer.parentElement
        : (range.commonAncestorContainer as HTMLElement);

      if (containerNode && docEl.contains(containerNode)) {
        foundTargetEl = containerNode;
        foundRange = range;

        if (!range.collapsed) {
          const rect = range.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            targetRect = rect;
            snippet = selection.toString().trim().slice(0, 24);
          }
        } else {
          // Collapsed selection: user clicked or placed cursor inside this element
          const rect = containerNode.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            targetRect = rect;
            snippet = (containerNode.textContent || '').trim().slice(0, 24);
          }
        }
      }
    }

    // 2. Fall back to active focused contentEditable element inside bulletin-document
    if (!targetRect) {
      const activeEl = document.activeElement as HTMLElement | null;
      if (activeEl && docEl.contains(activeEl) && (activeEl.isContentEditable || activeEl.hasAttribute('contenteditable'))) {
        foundTargetEl = activeEl;
        const rect = activeEl.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          targetRect = rect;
          snippet = (activeEl.textContent || '').trim().slice(0, 24);
        }
      }
    }

    if (foundTargetEl) {
      lastTargetRef.current = foundTargetEl;
    }
    if (foundRange) {
      lastRangeRef.current = foundRange.cloneRange();
    }

    if (targetRect) {
      const toolbarWidth = toolbarRef.current?.offsetWidth || 560;
      const toolbarHeight = toolbarRef.current?.offsetHeight || 44;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const targetCenterX = targetRect.left + targetRect.width / 2;

      // Position above text by default; if within 74px of viewport top, position below
      let top = targetRect.top - toolbarHeight - 12;
      let placementBelow = false;
      if (top < 74) {
        top = targetRect.bottom + 10;
        placementBelow = true;
      }
      if (top + toolbarHeight > viewportHeight - 10) {
        top = Math.max(74, targetRect.top - toolbarHeight - 12);
        placementBelow = false;
      }

      // Horizontal clamping within viewport bounds
      let left = targetCenterX - toolbarWidth / 2;
      if (left < 16) {
        left = 16;
      } else if (left + toolbarWidth > viewportWidth - 16) {
        left = Math.max(16, viewportWidth - toolbarWidth - 16);
      }

      const arrowLeft = Math.max(20, Math.min(toolbarWidth - 20, targetCenterX - left));

      setToolbarState({
        top: Math.round(top),
        left: Math.round(left),
        isFloating: true,
        arrowLeft: Math.round(arrowLeft),
        placementBelow,
        activeTextSnippet: snippet ? `“${snippet}${snippet.length >= 24 ? '…' : ''}”` : '',
      });
    }
  }, []);

  useEffect(() => {
    document.addEventListener('selectionchange', updateToolbar);
    document.addEventListener('mouseup', updateToolbar);
    document.addEventListener('keyup', updateToolbar);
    document.addEventListener('focusin', updateToolbar);
    window.addEventListener('scroll', updateToolbar, true);
    window.addEventListener('resize', updateToolbar);

    return () => {
      document.removeEventListener('selectionchange', updateToolbar);
      document.removeEventListener('mouseup', updateToolbar);
      document.removeEventListener('keyup', updateToolbar);
      document.removeEventListener('focusin', updateToolbar);
      window.removeEventListener('scroll', updateToolbar, true);
      window.removeEventListener('resize', updateToolbar);
    };
  }, [updateToolbar]);

  // Selected typography states for inline formatting toolbar
  const [selectedFont, setSelectedFont] = useState<string>("'EB Garamond', Georgia, serif");
  const [selectedSize, setSelectedSize] = useState<string>('14px');

  // Preview format: 'pages' (A5 sequential 1..4) or 'booklet' (A4 landscape spreads [4|1] and [2|3])
  const [previewMode, setPreviewMode] = useState<'pages' | 'booklet'>('pages');

  // Command handlers that prevent losing focus in the preview contentEditable element
  const execFormat = (cmd: string, val: string | undefined = undefined) => {
    if (lastRangeRef.current) {
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(lastRangeRef.current);
    }
    document.execCommand(cmd, false, val);
    setTimeout(updateToolbar, 50);
  };

  const applyFontFamily = (fontFamily: string) => {
    setSelectedFont(fontFamily);
    const target = lastTargetRef.current || (document.activeElement as HTMLElement);
    if (target && (target.isContentEditable || target.hasAttribute('contenteditable'))) {
      target.style.fontFamily = fontFamily;
    }
    document.execCommand('fontName', false, fontFamily);
    setTimeout(updateToolbar, 50);
  };

  const applyFontSize = (sizeStr: string) => {
    setSelectedSize(sizeStr);
    const target = lastTargetRef.current || (document.activeElement as HTMLElement);
    if (target && (target.isContentEditable || target.hasAttribute('contenteditable'))) {
      target.style.fontSize = sizeStr;
    }
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
      const span = document.createElement('span');
      span.style.fontSize = sizeStr;
      const range = sel.getRangeAt(0);
      try {
        span.appendChild(range.extractContents());
        range.insertNode(span);
      } catch {
        // fallback
      }
    }
    setTimeout(updateToolbar, 50);
  };

  const adjustFontSize = (delta: number) => {
    const target = lastTargetRef.current || (document.activeElement as HTMLElement);
    if (target && (target.isContentEditable || target.hasAttribute('contenteditable'))) {
      const current = parseFloat(window.getComputedStyle(target).fontSize) || 14;
      const next = Math.max(8, Math.min(48, current + delta));
      target.style.fontSize = `${next}px`;
      setSelectedSize(`${next}px`);
    }
    setTimeout(updateToolbar, 50);
  };

  const applyTextColor = (color: string) => {
    const target = lastTargetRef.current || (document.activeElement as HTMLElement);
    if (target && (target.isContentEditable || target.hasAttribute('contenteditable'))) {
      target.style.color = color;
    }
    document.execCommand('foreColor', false, color);
    setTimeout(updateToolbar, 50);
  };

  // Shared formatting toolbar UI
  const renderToolbarActions = () => (
    <div className="flex items-center gap-1.5 flex-wrap">
      {/* Font Family Picker */}
      <div className="flex items-center bg-stone-800 rounded-md border border-stone-700 px-1.5 py-0.5">
        <Type className="w-3.5 h-3.5 text-amber-400 mr-1 shrink-0" />
        <select
          value={selectedFont}
          onChange={(e) => applyFontFamily(e.target.value)}
          className="bg-transparent text-xs text-white focus:outline-none cursor-pointer pr-1"
          title="Apply Font Family"
        >
          <option value="'EB Garamond', Georgia, serif" className="bg-stone-900 text-white">
            EB Garamond
          </option>
          <option value="'Cinzel', serif" className="bg-stone-900 text-white">
            Cinzel
          </option>
          <option value="'Cormorant Garamond', Georgia, serif" className="bg-stone-900 text-white">
            Cormorant
          </option>
          <option value="'Cardo', Georgia, serif" className="bg-stone-900 text-white">
            Cardo
          </option>
          <option value="Georgia, serif" className="bg-stone-900 text-white">
            Georgia
          </option>
        </select>
      </div>

      {/* Font Size Step & Picker */}
      <div className="flex items-center bg-stone-800 rounded-md border border-stone-700 p-0.5">
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            adjustFontSize(-1);
          }}
          title="Decrease Font Size"
          className="px-1.5 py-1 hover:bg-stone-700 rounded text-stone-300 font-bold text-xs"
        >
          A-
        </button>
        <select
          value={selectedSize}
          onChange={(e) => applyFontSize(e.target.value)}
          className="bg-transparent text-[11px] text-white focus:outline-none cursor-pointer px-1"
          title="Font Size"
        >
          <option value="10px" className="bg-stone-900 text-white">10px</option>
          <option value="11px" className="bg-stone-900 text-white">11px</option>
          <option value="12px" className="bg-stone-900 text-white">12px</option>
          <option value="13px" className="bg-stone-900 text-white">13px</option>
          <option value="14px" className="bg-stone-900 text-white">14px</option>
          <option value="15px" className="bg-stone-900 text-white">15px</option>
          <option value="16px" className="bg-stone-900 text-white">16px</option>
          <option value="18px" className="bg-stone-900 text-white">18px</option>
          <option value="20px" className="bg-stone-900 text-white">20px</option>
          <option value="24px" className="bg-stone-900 text-white">24px</option>
        </select>
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            adjustFontSize(1);
          }}
          title="Increase Font Size"
          className="px-1.5 py-1 hover:bg-stone-700 rounded text-stone-300 font-bold text-xs"
        >
          A+
        </button>
      </div>

      {/* Bold, Italic, Underline */}
      <div className="flex items-center bg-stone-800 rounded-md border border-stone-700 p-0.5">
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            execFormat('bold');
          }}
          title="Bold"
          className="p-1 hover:bg-stone-700 rounded text-stone-200"
        >
          <Bold className="w-3.5 h-3.5" />
        </button>
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            execFormat('italic');
          }}
          title="Italic"
          className="p-1 hover:bg-stone-700 rounded text-stone-200"
        >
          <Italic className="w-3.5 h-3.5" />
        </button>
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            execFormat('underline');
          }}
          title="Underline"
          className="p-1 hover:bg-stone-700 rounded text-stone-200"
        >
          <Underline className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Alignment */}
      <div className="hidden sm:flex items-center bg-stone-800 rounded-md border border-stone-700 p-0.5">
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            execFormat('justifyLeft');
          }}
          title="Align Left"
          className="p-1 hover:bg-stone-700 rounded text-stone-300"
        >
          <AlignLeft className="w-3.5 h-3.5" />
        </button>
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            execFormat('justifyCenter');
          }}
          title="Align Center"
          className="p-1 hover:bg-stone-700 rounded text-stone-300"
        >
          <AlignCenter className="w-3.5 h-3.5" />
        </button>
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            execFormat('justifyRight');
          }}
          title="Align Right"
          className="p-1 hover:bg-stone-700 rounded text-stone-300"
        >
          <AlignRight className="w-3.5 h-3.5" />
        </button>
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            execFormat('justifyFull');
          }}
          title="Justify"
          className="p-1 hover:bg-stone-700 rounded text-stone-300"
        >
          <AlignJustify className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Quick Color Swatches */}
      <div className="flex items-center gap-1 bg-stone-800 rounded-md border border-stone-700 px-1.5 py-1">
        <Palette className="w-3 h-3 text-stone-400 mr-0.5" />
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            applyTextColor('#000000');
          }}
          title="Black"
          className="w-3.5 h-3.5 rounded-full bg-black border border-stone-600 hover:scale-110 transition-transform"
        />
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            applyTextColor('#78350f');
          }}
          title="Amber / Gold"
          className="w-3.5 h-3.5 rounded-full bg-amber-800 border border-stone-600 hover:scale-110 transition-transform"
        />
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            applyTextColor('#991b1b');
          }}
          title="Crimson Liturgical"
          className="w-3.5 h-3.5 rounded-full bg-red-800 border border-stone-600 hover:scale-110 transition-transform"
        />
      </div>
    </div>
  );

  return (
    <div className="flex flex-col items-center w-full relative">
      {/* 1. Contextual Floating Toolbar (moves dynamically according to selected text) */}
      {toolbarState.isFloating && (
        <div
          ref={toolbarRef}
          className="no-print fixed z-50 bg-stone-900/98 backdrop-blur-md text-white px-3.5 py-2 rounded-xl shadow-2xl border border-stone-600 flex flex-wrap items-center justify-between gap-2.5 max-w-xl text-xs transition-[top,left] duration-150 ease-out"
          style={{
            top: `${toolbarState.top}px`,
            left: `${toolbarState.left}px`,
          }}
        >
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-ping" />
            <span className="font-semibold text-amber-300 max-w-36 truncate text-[11px]">
              {toolbarState.activeTextSnippet || 'Editing Selection'}
            </span>
          </div>

          {renderToolbarActions()}

          {/* Pointer caret arrow pointing to the selected text */}
          <div
            className="absolute w-3 h-3 bg-stone-900 border-r border-b border-stone-600 rotate-45 pointer-events-none transition-[left] duration-150"
            style={{
              left: `${toolbarState.arrowLeft}px`,
              ...(toolbarState.placementBelow
                ? {
                    top: '-6px',
                    borderTop: '1px solid #57534e',
                    borderLeft: '1px solid #57534e',
                    borderRight: 'none',
                    borderBottom: 'none',
                  }
                : { bottom: '-6px' }),
            }}
          />
        </div>
      )}

      {/* 2. Docked Guidance Toolbar (visible when idle at top of preview) */}
      {!toolbarState.isFloating && (
        <div className="no-print sticky top-20 z-20 mb-4 bg-stone-900/95 backdrop-blur-md text-white px-3.5 py-2 rounded-xl shadow-xl border border-stone-700/80 flex flex-wrap items-center justify-between gap-2.5 max-w-4xl w-full text-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="font-semibold text-stone-200">
              Direct Edit Mode Active
            </span>
            <span className="hidden sm:inline text-[11px] text-stone-400">
              • Click or highlight any text on the pages below to edit & float toolbar directly to it
            </span>
          </div>

          {renderToolbarActions()}
        </div>
      )}

      {/* View Format Selector Bar */}
      <div className="no-print w-full max-w-4xl mb-4 flex flex-wrap items-center justify-between gap-3 bg-stone-200/80 p-2 rounded-xl text-xs">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-stone-700 px-1">Preview Layout:</span>
          <button
            type="button"
            onClick={() => setPreviewMode('pages')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              previewMode === 'pages'
                ? 'bg-white text-stone-900 shadow-xs font-semibold'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/50'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-amber-700" />
            <span>A5 E-bulletin Pages (1, 2, 3, 4)</span>
          </button>
          <button
            type="button"
            onClick={() => setPreviewMode('booklet')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              previewMode === 'booklet'
                ? 'bg-white text-amber-900 shadow-xs font-semibold'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/50'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-700" />
            <span>A4 Folded Booklet Spreads ([4|1] &amp; [2|3])</span>
          </button>
        </div>
        <div className="text-stone-500 font-mono text-[11px] hidden sm:block">
          {previewMode === 'pages' ? 'A5 Portrait (148 × 210 mm)' : 'A4 Landscape (297 × 210 mm)'}
        </div>
      </div>

      <div
        id="bulletin-document"
        className={
          previewMode === 'booklet'
            ? 'grid grid-cols-1 md:grid-cols-2 gap-x-0 gap-y-10 items-center justify-center py-4 print:p-0 print:gap-0 print:m-0 select-text max-w-[297mm] mx-auto'
            : 'flex flex-col items-center gap-8 py-4 print:p-0 print:gap-0 print:m-0 select-text'
        }
        style={{
          transform: scale !== 1 ? `scale(${scale})` : undefined,
          transformOrigin: 'top center',
        }}
      >
        {/* Sheet 1 Header (Visible in Booklet Mode) */}
        {previewMode === 'booklet' && (
          <div
            style={{ order: 0 }}
            className="col-span-full no-print w-full flex items-center justify-between pb-1.5 px-3 text-xs border-b border-stone-300 font-medium text-stone-700"
          >
            <span className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded bg-stone-800 text-amber-300 font-bold text-[10.5px]">
                Sheet 1: Outer Side (A4 Landscape)
              </span>
              <span>Fold in half along center spine • Back Cover (Page 4) &amp; Front Cover (Page 1)</span>
            </span>
            <span className="text-stone-500 font-mono text-[11px]">[ Left: Page 4 ] | [ Right: Page 1 ]</span>
          </div>
        )}

        {/* ================= PAGE 1 (A5: 148mm × 210mm) ================= */}
        <div
          data-page="1"
          className="page-sheet page-break-after-pdf w-[148mm] h-[210mm] min-h-[210mm] max-h-[210mm] bg-white text-black shadow-xl print:shadow-none flex flex-col justify-between overflow-hidden relative ring-1 ring-stone-400 print:ring-0 box-border"
          style={{
            fontFamily: FONT_GARAMOND,
            fontFeatureSettings: '"liga" 1, "kern" 1, "dlig" 1',
            order: previewMode === 'booklet' ? 2 : 1,
          }}
        >
          <div className="flex-1 flex flex-col justify-between h-full w-full overflow-hidden">
            {/* Header Banner (118px height) with full-bleed bleed margins to eliminate right-edge gap */}
            <div className="relative w-[calc(100%+4px)] -mr-1 -ml-0.5 h-[118px] bg-black overflow-hidden flex items-center justify-between px-5 select-none border-b-2 border-stone-900 shrink-0">
              {/* Background 4K Altar Consecration Image */}
              <img
                src={`${import.meta.env.BASE_URL}assets/banner-4k.png`}
                crossOrigin="anonymous"
                alt="Elevation of the Sacred Host at High Altar"
                className="absolute -inset-1 w-[calc(100%+8px)] h-[calc(100%+8px)] object-cover opacity-90 object-[center_36%] filter contrast-105 brightness-115 pointer-events-none"
              />
              {/* Refined Gradient Overlay */}
              <div className="absolute -inset-1 w-[calc(100%+8px)] h-[calc(100%+8px)] bg-gradient-to-r from-black/60 via-black/20 to-black/75 pointer-events-none" />

              {/* High-Resolution Coat of Arms on Left */}
              <div className="relative z-10 flex items-center">
                <div className="w-[74px] h-[74px] rounded-full bg-white/95 p-1 shadow-md border-2 border-stone-900 flex items-center justify-center">
                  <img
                    src={`${import.meta.env.BASE_URL}assets/crest-highres.png`}
                    crossOrigin="anonymous"
                    alt="Singapore Latin Mass Community Coat of Arms"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>

              {/* Title on Right (Directly editable on preview) */}
              <div className="relative z-10 text-right">
                <h1
                  contentEditable
                  suppressContentEditableWarning
                  className="text-white font-bold text-[18px] tracking-[0.14em] leading-[1.16] drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] uppercase cursor-text outline-none focus:ring-1 focus:ring-amber-400 rounded-xs"
                  style={{ fontFamily: FONT_GARAMOND }}
                >
                  Singapore<br />
                  Extraordinary<br />
                  Form<br />
                  Community
                </h1>
              </div>
            </div>

            {/* Page 1 Body Content - Uniform gaps between banner, general info, Sunday mass, and calendar */}
            <div className="px-5 pt-3.5 pb-6 flex-1 flex flex-col gap-3.5">
              {/* 1. General Information Box */}
              <div className="border border-stone-900 rounded-xs overflow-hidden text-black bg-white shadow-xs">
                <div className="bg-[#e5e5e5] text-center py-0.5 border-b border-stone-900">
                  <h2
                    contentEditable
                    suppressContentEditableWarning
                    className="font-bold text-[13px] tracking-widest uppercase text-black cursor-text outline-none focus:ring-1 focus:ring-amber-800 rounded-xs"
                    style={{ fontFamily: FONT_GARAMOND }}
                  >
                    General Information
                  </h2>
                </div>
                <div className="grid grid-cols-2 divide-x divide-stone-300 p-2 text-[12.5px] leading-tight">
                  {/* Left Column: Venue & Rosary */}
                  <div className="space-y-1.5 pr-2.5">
                    <div className="flex items-start justify-between">
                      <span
                        contentEditable
                        suppressContentEditableWarning
                        className="font-bold text-stone-900 uppercase tracking-wider text-[11px] cursor-text outline-none focus:ring-1 focus:ring-amber-800 rounded-xs"
                      >
                        Venue:
                      </span>
                      <div className="text-right">
                        <span
                          contentEditable
                          suppressContentEditableWarning
                          className="font-bold text-black text-[13.5px] block leading-tight cursor-text outline-none focus:ring-1 focus:ring-amber-800 rounded-xs"
                        >
                          {generalInfo.venueName}
                        </span>
                        <span
                          contentEditable
                          suppressContentEditableWarning
                          className="italic text-[12px] text-stone-700 block leading-tight cursor-text outline-none focus:ring-1 focus:ring-amber-800 rounded-xs"
                        >
                          {generalInfo.venueStreet}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-stone-200">
                      <span
                        contentEditable
                        suppressContentEditableWarning
                        className="font-bold text-stone-900 uppercase tracking-wider text-[11px] cursor-text outline-none focus:ring-1 focus:ring-amber-800 rounded-xs"
                      >
                        Rosary:
                      </span>
                      <span
                        contentEditable
                        suppressContentEditableWarning
                        className="font-bold text-black text-[13.5px] cursor-text outline-none focus:ring-1 focus:ring-amber-800 rounded-xs"
                      >
                        {generalInfo.rosaryTiming}
                      </span>
                    </div>
                  </div>

                  {/* Right Column: Mass Timing & Confessions */}
                  <div className="space-y-1.5 pl-2.5">
                    <div className="flex items-start justify-between">
                      <span
                        contentEditable
                        suppressContentEditableWarning
                        className="font-bold text-stone-900 uppercase tracking-wider text-[11px] cursor-text outline-none focus:ring-1 focus:ring-amber-800 rounded-xs"
                      >
                        Mass Timing:
                      </span>
                      <div className="text-right">
                        <span
                          contentEditable
                          suppressContentEditableWarning
                          className="font-bold text-black text-[13.5px] block leading-tight cursor-text outline-none focus:ring-1 focus:ring-amber-800 rounded-xs"
                        >
                          {generalInfo.massTiming}
                        </span>
                        <span
                          contentEditable
                          suppressContentEditableWarning
                          className="text-[10.5px] text-stone-600 block uppercase tracking-wider leading-tight cursor-text outline-none focus:ring-1 focus:ring-amber-800 rounded-xs"
                        >
                          Extraordinary Form
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-stone-200">
                      <span
                        contentEditable
                        suppressContentEditableWarning
                        className="font-bold text-stone-900 uppercase tracking-wider text-[11px] cursor-text outline-none focus:ring-1 focus:ring-amber-800 rounded-xs"
                      >
                        Confessions:
                      </span>
                      <span
                        contentEditable
                        suppressContentEditableWarning
                        className="font-bold text-black text-[13.5px] cursor-text outline-none focus:ring-1 focus:ring-amber-800 rounded-xs"
                      >
                        {generalInfo.confessionsTiming}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Selected Sunday Box & Edmund Campion Missal Pages Card (Balanced 50/50 Grid) */}
              <div className="bg-[#f4f4f4] border border-stone-900 p-2 rounded-xs shadow-xs">
                <div className="grid grid-cols-2 gap-2.5 items-stretch">
                  {/* Left Side: Sunday Title & Commemorations */}
                  <div className="flex flex-col justify-center">
                    <p
                      contentEditable
                      suppressContentEditableWarning
                      className="font-bold text-[14.5px] text-black leading-tight cursor-text outline-none focus:ring-1 focus:ring-amber-800 rounded-xs"
                    >
                      {sunday.dateFormatted}
                    </p>
                    <p
                      contentEditable
                      suppressContentEditableWarning
                      className="font-bold text-[14.5px] text-black leading-tight mt-0.5 cursor-text outline-none focus:ring-1 focus:ring-amber-800 rounded-xs"
                    >
                      {sunday.title}, {sunday.liturgicalClass}
                    </p>
                    {sunday.commemoration && (
                      <p
                        contentEditable
                        suppressContentEditableWarning
                        className="text-[12px] text-stone-800 mt-1 leading-snug cursor-text outline-none focus:ring-1 focus:ring-amber-800 rounded-xs"
                      >
                        <span className="font-bold text-black">Commemoration:</span> {sunday.commemoration}
                      </p>
                    )}
                  </div>

                  {/* Right Side: Symmetrical Edmund Campion Missal Pages Card */}
                  <div className="bg-white border border-stone-900 rounded-xs p-1.5 text-black shadow-xs flex flex-col justify-between">
                    <p
                      contentEditable
                      suppressContentEditableWarning
                      className="text-center text-[11.5px] font-bold text-black uppercase tracking-wider border-b border-stone-300 pb-0.5 mb-1 cursor-text outline-none focus:ring-1 focus:ring-amber-800 rounded-xs"
                      style={{ fontFamily: FONT_GARAMOND }}
                    >
                      Campion Missal Pages
                    </p>
                    <div className="grid grid-cols-2 divide-x divide-stone-300 text-[11.5px] leading-tight">
                      {/* Sub-column 1 */}
                      <div className="pr-1.5 space-y-1">
                        <div className="flex justify-between items-baseline">
                          <span className="text-stone-700">Order:</span>
                          <span
                            contentEditable
                            suppressContentEditableWarning
                            className="font-bold text-black text-[13px] ml-1 cursor-text outline-none focus:ring-1 focus:ring-amber-800 rounded-xs"
                          >
                            p. {massSettings.orderOfMassPage}
                          </span>
                        </div>
                        <div className="flex justify-between items-baseline">
                          <span className="text-stone-700">Propers:</span>
                          <span
                            contentEditable
                            suppressContentEditableWarning
                            className="font-bold text-black text-[13px] ml-1 cursor-text outline-none focus:ring-1 focus:ring-amber-800 rounded-xs"
                          >
                            p. {massSettings.propersPage}
                          </span>
                        </div>
                      </div>

                      {/* Sub-column 2: Displays Mass XVII and Mass XVIII cleanly */}
                      <div className="pl-1.5 space-y-1">
                        <div className="flex justify-between items-baseline">
                          <span
                            contentEditable
                            suppressContentEditableWarning
                            className="text-stone-700 whitespace-nowrap cursor-text outline-none focus:ring-1 focus:ring-amber-800 rounded-xs"
                          >
                            {shortKyrialeName}:
                          </span>
                          <span
                            contentEditable
                            suppressContentEditableWarning
                            className="font-bold text-black text-[13px] whitespace-nowrap ml-1 cursor-text outline-none focus:ring-1 focus:ring-amber-800 rounded-xs"
                          >
                            p. {massSettings.kyrialePage}
                          </span>
                        </div>
                        <div className="flex justify-between items-baseline">
                          <span
                            contentEditable
                            suppressContentEditableWarning
                            className="text-stone-700 whitespace-nowrap cursor-text outline-none focus:ring-1 focus:ring-amber-800 rounded-xs"
                          >
                            {massSettings.credoName}:
                          </span>
                          <span
                            contentEditable
                            suppressContentEditableWarning
                            className="font-bold text-black text-[13px] whitespace-nowrap ml-1 cursor-text outline-none focus:ring-1 focus:ring-amber-800 rounded-xs"
                          >
                            p. {massSettings.credoPage}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Calendar of the Week Section (Heading + Table as one unified block) */}
              <div className="flex flex-col">
                {/* Calendar of the Week Heading */}
                <div className="mb-1.5 flex items-center justify-between border-b-2 border-stone-900 pb-0.5">
                  <h2
                    contentEditable
                    suppressContentEditableWarning
                    className="font-bold text-[15px] text-black tracking-wider uppercase cursor-text outline-none focus:ring-1 focus:ring-amber-800 rounded-xs"
                    style={{ fontFamily: FONT_GARAMOND }}
                  >
                    Calendar of the Week
                  </h2>
                  <span
                    contentEditable
                    suppressContentEditableWarning
                    className="text-[11.5px] font-bold text-stone-700 uppercase tracking-wider cursor-text outline-none focus:ring-1 focus:ring-amber-800 rounded-xs"
                  >
                    1962 Roman Missal
                  </span>
                </div>

                {/* Weekdays Table (Monday through Saturday + Next Sunday) with increased box padding */}
                <div className="border border-stone-900 rounded-xs divide-y divide-stone-300 overflow-hidden bg-white shadow-xs">
                  {weekDays.map((day) => {
                    const displayTitle = day.isFeria || day.title.toLowerCase().startsWith('feria')
                      ? 'Feria'
                      : day.title;

                    return (
                      <div
                        key={day.id}
                        className="py-2 px-3.5 flex items-center justify-between hover:bg-stone-50"
                      >
                        <div className="pr-3 flex-1">
                          <p
                            contentEditable
                            suppressContentEditableWarning
                            className="font-bold text-[14px] text-black leading-tight cursor-text outline-none focus:ring-1 focus:ring-amber-800 rounded-xs"
                          >
                            {day.dateFormatted}
                          </p>
                          <p
                            contentEditable
                            suppressContentEditableWarning
                            className="text-[14px] text-stone-950 font-medium leading-tight mt-0.5 cursor-text outline-none focus:ring-1 focus:ring-amber-800 rounded-xs"
                          >
                            {displayTitle}
                          </p>
                          {day.commemoration && (
                            <p
                              contentEditable
                              suppressContentEditableWarning
                              className="text-[12px] text-stone-800 mt-0.5 italic cursor-text outline-none focus:ring-1 focus:ring-amber-800 rounded-xs"
                            >
                              Commemoration: {day.commemoration}
                            </p>
                          )}
                        </div>
                        {/* Consistent Classical Serif Roman Numeral */}
                        <div
                          contentEditable
                          suppressContentEditableWarning
                          className="text-black font-bold text-[22px] select-none min-w-9 text-right tracking-tight font-serif cursor-text outline-none focus:ring-1 focus:ring-amber-800 rounded-xs"
                          style={{ fontFamily: FONT_GARAMOND }}
                        >
                          {day.liturgicalClass}
                        </div>
                      </div>
                    );
                  })}

                  {/* Next Sunday Row */}
                  <div className="py-2 px-3.5 flex items-center justify-between bg-stone-100 border-t-2 border-stone-900">
                    <div className="pr-3 flex-1">
                      <p
                        contentEditable
                        suppressContentEditableWarning
                        className="font-bold text-[14px] text-black leading-tight cursor-text outline-none focus:ring-1 focus:ring-amber-800 rounded-xs"
                      >
                        {nextSunday.dateFormatted}
                      </p>
                      <p
                        contentEditable
                        suppressContentEditableWarning
                        className="text-[14.5px] text-black leading-tight mt-0.5 font-bold cursor-text outline-none focus:ring-1 focus:ring-amber-800 rounded-xs"
                      >
                        {nextSunday.title}
                      </p>
                    </div>
                    <div
                      contentEditable
                      suppressContentEditableWarning
                      className="text-black font-bold text-[22px] select-none min-w-9 text-right tracking-tight font-serif cursor-text outline-none focus:ring-1 focus:ring-amber-800 rounded-xs"
                      style={{ fontFamily: FONT_GARAMOND }}
                    >
                      {nextSunday.liturgicalClass}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sheet 2 Header (Visible in Booklet Mode) */}
        {previewMode === 'booklet' && (
          <div
            style={{ order: 3 }}
            className="col-span-full no-print w-full flex items-center justify-between pb-1.5 px-3 text-xs border-b border-stone-300 font-medium text-stone-700 mt-2"
          >
            <span className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded bg-stone-800 text-amber-300 font-bold text-[10.5px]">
                Sheet 2: Inner Side (A4 Landscape)
              </span>
              <span>Reverse side of Sheet 1 (flip on short edge) • Inside Left (Page 2) &amp; Inside Right (Page 3)</span>
            </span>
            <span className="text-stone-500 font-mono text-[11px]">[ Left: Page 2 ] | [ Right: Page 3 ]</span>
          </div>
        )}

        {/* ================= PAGE 2 (A5: 148mm × 210mm) ================= */}
        <div
          data-page="2"
          className={`page-sheet page-break-after-pdf w-[148mm] h-[210mm] min-h-[210mm] max-h-[210mm] bg-white text-black shadow-xl print:shadow-none flex flex-col justify-between p-5 overflow-hidden ring-1 ring-stone-400 print:ring-0 box-border ${
            previewMode === 'booklet' ? 'border-r border-dashed border-stone-300' : ''
          }`}
          style={{
            fontFamily: FONT_GARAMOND,
            fontFeatureSettings: '"liga" 1, "kern" 1, "dlig" 1',
            order: previewMode === 'booklet' ? 4 : 2,
          }}
        >
          <div className="flex-1 flex flex-col justify-between h-full">
            {/* Top Section: Priests, Socials & Announcements Title */}
            <div className="shrink-0">
              {/* Top Socials & Priests Header */}
              <div className="pb-2 text-center border-b border-stone-300">
                <SocialIcons email={generalInfo.email} linkTreeUrl={generalInfo.linkTreeUrl} />
                <p
                  className="mt-1.5 text-[13px] font-bold text-black tracking-wide uppercase"
                  style={{ fontFamily: FONT_GARAMOND }}
                >
                  Our Priests:{' '}
                  <span
                    contentEditable
                    suppressContentEditableWarning
                    className="font-normal normal-case cursor-text outline-none focus:ring-1 focus:ring-amber-800 rounded-xs"
                  >
                    {generalInfo.priests}
                  </span>
                </p>
              </div>

              {/* Announcements Banner */}
              <div className="border border-stone-900 rounded-xs mt-2 mb-1.5 overflow-hidden shadow-xs">
                <div className="bg-[#e5e5e5] text-center py-0.5 border-b border-stone-900">
                  <h2
                    contentEditable
                    suppressContentEditableWarning
                    className="text-black font-bold text-[13px] tracking-widest uppercase cursor-text outline-none focus:ring-1 focus:ring-amber-800 rounded-xs"
                    style={{ fontFamily: FONT_GARAMOND }}
                  >
                    Announcements
                  </h2>
                </div>
              </div>
            </div>

            {/* Announcements List - Directly editable on preview */}
            <div className="space-y-3 my-2">
              {announcements.map((item) => (
                <div
                  key={item.id}
                  className="border border-stone-300 rounded-xs p-3 bg-stone-50/70 shadow-xs"
                >
                  <h3
                    contentEditable
                    suppressContentEditableWarning
                    className="font-bold text-[13.5px] text-black mb-1.5 leading-snug tracking-wide cursor-text outline-none focus:ring-1 focus:ring-amber-800 rounded-xs"
                    style={{ fontFamily: FONT_GARAMOND }}
                  >
                    ❖ {item.title}
                  </h3>
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    className="text-[12.2px] leading-[1.6] text-stone-900 whitespace-pre-line font-normal cursor-text outline-none focus:ring-1 focus:ring-amber-800 rounded-xs"
                  >
                    {formatTextWithHandles(item.content)}
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom QR Code and Intention Note (Anchored cleanly at bottom) */}
            <div className="shrink-0 pt-2.5 border-t-2 border-stone-900 mt-auto">
              <div className="grid grid-cols-3 items-center text-center gap-2 mb-1.5">
                <div className="text-right pr-2">
                  <a
                    href={generalInfo.linkTreeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block hover:opacity-80 transition-opacity"
                    title="Open LinkTree"
                  >
                    <p
                      contentEditable
                      suppressContentEditableWarning
                      className="font-bold text-[11.5px] text-black leading-snug uppercase tracking-wider cursor-text outline-none focus:ring-1 focus:ring-amber-800 rounded-xs"
                      style={{ fontFamily: FONT_GARAMOND }}
                    >
                      Scan our LinkTree<br />QR Code
                    </p>
                    <p
                      contentEditable
                      suppressContentEditableWarning
                      className="text-[10px] text-stone-600 mt-0.5 italic cursor-text outline-none focus:ring-1 focus:ring-amber-800 rounded-xs"
                    >
                      Propers, Hymns & Guides
                    </p>
                  </a>
                </div>

                <div className="flex justify-center">
                  <a
                    href={generalInfo.linkTreeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block hover:opacity-90 transition-opacity"
                    title="Open LinkTree"
                  >
                    <img
                      src={qrCodeDataUrl}
                      crossOrigin="anonymous"
                      alt="LinkTree QR Code"
                      className="w-16 h-16 object-contain border-2 border-stone-900 p-0.5 rounded-xs bg-white shadow-xs"
                    />
                  </a>
                </div>

                <div className="text-left pl-2">
                  <a
                    href="https://t.me/singaporeefcommunity"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block hover:opacity-80 transition-opacity"
                    title="Open Telegram Channel"
                  >
                    <p
                      contentEditable
                      suppressContentEditableWarning
                      className="font-bold text-[11.5px] text-black leading-snug uppercase tracking-wider cursor-text outline-none focus:ring-1 focus:ring-amber-800 rounded-xs"
                      style={{ fontFamily: FONT_GARAMOND }}
                    >
                      WhatsApp &<br />Telegram Channels
                    </p>
                    <p
                      contentEditable
                      suppressContentEditableWarning
                      className="text-[10px] text-stone-600 mt-0.5 italic cursor-text outline-none focus:ring-1 focus:ring-amber-800 rounded-xs"
                    >
                      Weekly updates & news
                    </p>
                  </a>
                </div>
              </div>

              {/* Mass Intention Footer */}
              <div className="text-center pt-1 border-t border-stone-300">
                <p
                  contentEditable
                  suppressContentEditableWarning
                  className="font-bold text-[12px] text-black tracking-tight cursor-text outline-none focus:ring-1 focus:ring-amber-800 rounded-xs"
                >
                  {generalInfo.footerNotice}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ================= PAGE 3 (A5: 148mm × 210mm) ================= */}
        <div
          data-page="3"
          className="page-sheet page-break-after-pdf w-[148mm] h-[210mm] min-h-[210mm] max-h-[210mm] bg-white text-black shadow-xl print:shadow-none flex flex-col justify-between p-5 overflow-hidden ring-1 ring-stone-400 print:ring-0 box-border"
          style={{
            fontFamily: FONT_GARAMOND,
            fontFeatureSettings: '"liga" 1, "kern" 1, "dlig" 1',
            order: previewMode === 'booklet' ? 5 : 3,
          }}
        >
          <div className="flex-1 flex flex-col justify-between h-full overflow-hidden">
            {/* Header */}
            <div className="shrink-0 text-center pt-0.5 pb-2 border-b-2 border-stone-900 mb-2.5">
              <h2
                contentEditable
                suppressContentEditableWarning
                className="font-bold text-[15.5px] text-black tracking-wider uppercase leading-snug cursor-text outline-none focus:ring-1 focus:ring-amber-800 rounded-xs"
                style={{ fontFamily: FONT_GARAMOND }}
              >
                Meditations from “Divine Intimacy”
              </h2>
              <p
                contentEditable
                suppressContentEditableWarning
                className="text-[12.5px] text-stone-800 italic mt-0.5 font-semibold cursor-text outline-none focus:ring-1 focus:ring-amber-800 rounded-xs"
              >
                By Fr. Gabriel of St. Mary Magdalen, O.C.D. — {meditation.title} (Part I)
              </p>
            </div>

            {/* Auto-scaling Meditation with Failsafe & Direct In-Place Text Editing */}
            <AutoFitMeditation text={meditation.part1} />

            {/* Page 3 Footer */}
            <div
              contentEditable
              suppressContentEditableWarning
              className="shrink-0 text-center text-stone-700 text-[11px] font-bold pt-1.5 border-t border-stone-300 mt-2 cursor-text outline-none focus:ring-1 focus:ring-amber-800 rounded-xs"
            >
              — Page 3 —
            </div>
          </div>
        </div>

        {/* ================= PAGE 4 (A5: 148mm × 210mm) ================= */}
        <div
          data-page="4"
          className={`page-sheet w-[148mm] h-[210mm] min-h-[210mm] max-h-[210mm] bg-white text-black shadow-xl print:shadow-none flex flex-col justify-between p-5 overflow-hidden ring-1 ring-stone-400 print:ring-0 box-border ${
            previewMode === 'booklet' ? 'border-r border-dashed border-stone-300' : ''
          }`}
          style={{
            fontFamily: FONT_GARAMOND,
            fontFeatureSettings: '"liga" 1, "kern" 1, "dlig" 1',
            order: previewMode === 'booklet' ? 1 : 4,
          }}
        >
          <div className="flex-1 flex flex-col justify-between h-full overflow-hidden">
            {/* Header */}
            <div className="shrink-0 text-center pt-0.5 pb-2 border-b-2 border-stone-900 mb-2.5">
              <h2
                contentEditable
                suppressContentEditableWarning
                className="font-bold text-[15.5px] text-black tracking-wider uppercase leading-snug cursor-text outline-none focus:ring-1 focus:ring-amber-800 rounded-xs"
                style={{ fontFamily: FONT_GARAMOND }}
              >
                Meditations from “Divine Intimacy”
              </h2>
              <p
                contentEditable
                suppressContentEditableWarning
                className="text-[12.5px] text-stone-800 italic mt-0.5 font-semibold cursor-text outline-none focus:ring-1 focus:ring-amber-800 rounded-xs"
              >
                By Fr. Gabriel of St. Mary Magdalen, O.C.D. — {meditation.title} (Part II)
              </p>
            </div>

            {/* Auto-scaling Meditation with Failsafe & Direct In-Place Text Editing */}
            <AutoFitMeditation text={meditation.part2} />

            {/* Page 4 Footer */}
            <div
              contentEditable
              suppressContentEditableWarning
              className="shrink-0 text-center text-stone-700 text-[11px] font-bold pt-1.5 border-t border-stone-300 mt-2 cursor-text outline-none focus:ring-1 focus:ring-amber-800 rounded-xs"
            >
              — Page 4 —
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
