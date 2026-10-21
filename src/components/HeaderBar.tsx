import React from 'react';
import { Download, Layout, Eye, Edit3, ZoomIn, ZoomOut, Check, BookOpen } from 'lucide-react';

interface HeaderBarProps {
  viewMode: 'split' | 'preview' | 'form';
  onViewModeChange: (mode: 'split' | 'preview' | 'form') => void;
  zoom: number;
  onZoomChange: (newZoom: number) => void;
  onDownloadEBulletin: () => void;
  onDownloadBooklet: () => void;
  isDownloading: boolean;
  downloadType?: 'ebulletin' | 'booklet' | null;
  downloadProgress?: string;
  downloadSuccess: boolean;
  downloadSuccessType?: 'ebulletin' | 'booklet' | null;
  sundayDateFormatted: string;
  sundayTitle: string;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  viewMode,
  onViewModeChange,
  zoom,
  onZoomChange,
  onDownloadEBulletin,
  onDownloadBooklet,
  isDownloading,
  downloadType,
  downloadProgress,
  downloadSuccess,
  downloadSuccessType,
  sundayDateFormatted,
  sundayTitle,
}) => {
  return (
    <header className="bg-stone-900 text-stone-100 border-b border-stone-800 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Left: Branding & Current Selection */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-white p-0.5 border border-stone-400 flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
            <img
              src="/assets/crest-highres.png"
              alt="Coat of Arms"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-semibold tracking-wide text-white truncate font-serif">
                Singapore EF Bulletin Generator
              </h1>
              <span className="hidden sm:inline-flex px-1.5 py-0.5 text-[9.5px] uppercase font-bold tracking-wider rounded bg-stone-800 text-stone-300 border border-stone-700">
                E-Bulletin &amp; Booklet
              </span>
            </div>
            <p className="text-xs text-stone-400 truncate">
              {sundayDateFormatted} • <span className="text-amber-200/90">{sundayTitle}</span>
            </p>
          </div>
        </div>

        {/* Center: View Mode Switcher */}
        <div className="hidden md:flex items-center bg-stone-800/80 p-1 rounded-lg border border-stone-700/60 text-xs font-medium">
          <button
            onClick={() => onViewModeChange('split')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
              viewMode === 'split'
                ? 'bg-amber-800 text-white shadow-xs'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            <Layout className="w-3.5 h-3.5" />
            <span>Split View</span>
          </button>

          <button
            onClick={() => onViewModeChange('preview')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
              viewMode === 'preview'
                ? 'bg-amber-800 text-white shadow-xs'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>PDF Preview</span>
          </button>

          <button
            onClick={() => onViewModeChange('form')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
              viewMode === 'form'
                ? 'bg-amber-800 text-white shadow-xs'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Form Controls</span>
          </button>
        </div>

        {/* Right: Zoom & Export Actions */}
        <div className="flex items-center gap-2">
          {/* Zoom controls for preview */}
          {viewMode !== 'form' && (
            <div className="hidden sm:flex items-center bg-stone-800/80 rounded-lg border border-stone-700/60 p-0.5 text-xs text-stone-300 mr-1">
              <button
                onClick={() => onZoomChange(Math.max(0.4, zoom - 0.1))}
                className="p-1.5 hover:text-white hover:bg-stone-700/50 rounded"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 font-mono text-[11px] min-w-10 text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={() => onZoomChange(Math.min(1.4, zoom + 0.1))}
                className="p-1.5 hover:text-white hover:bg-stone-700/50 rounded"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Action 1: Download E-bulletin Button */}
          <button
            onClick={onDownloadEBulletin}
            disabled={isDownloading}
            title="Download 4-page A5 digital E-bulletin with interactive links"
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold text-xs tracking-wide transition-all shadow-sm ${
              downloadSuccess && downloadSuccessType === 'ebulletin'
                ? 'bg-emerald-700 text-white'
                : 'bg-amber-700 hover:bg-amber-600 active:bg-amber-800 text-white disabled:opacity-50'
            }`}
          >
            {isDownloading && downloadType === 'ebulletin' ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
                <span className="truncate max-w-[120px]">{downloadProgress || 'Exporting...'}</span>
              </>
            ) : downloadSuccess && downloadSuccessType === 'ebulletin' ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Downloaded!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span><span className="hidden sm:inline">Download </span>E-bulletin</span>
              </>
            )}
          </button>

          {/* Action 2: Download Booklet Button */}
          <button
            onClick={onDownloadBooklet}
            disabled={isDownloading}
            title="Download A4 landscape 2-page print booklet (Side 1: Pgs 4 & 1, Side 2: Pgs 2 & 3)"
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold text-xs tracking-wide transition-all shadow-sm ${
              downloadSuccess && downloadSuccessType === 'booklet'
                ? 'bg-emerald-700 text-white'
                : 'bg-stone-800 hover:bg-stone-700 active:bg-stone-900 text-amber-200 border border-amber-600/50 hover:border-amber-400 disabled:opacity-50'
            }`}
          >
            {isDownloading && downloadType === 'booklet' ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-amber-200/30 border-t-amber-200 rounded-full animate-spin shrink-0" />
                <span className="truncate max-w-[120px]">{downloadProgress || 'Exporting...'}</span>
              </>
            ) : downloadSuccess && downloadSuccessType === 'booklet' ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Booklet Done!</span>
              </>
            ) : (
              <>
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span><span className="hidden sm:inline">Download </span>Booklet</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
