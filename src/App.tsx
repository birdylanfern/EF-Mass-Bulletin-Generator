/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BulletinData } from './types/bulletin';
import { generateBulletinForSunday, getUpcomingSunday } from './utils/liturgicalCalendar';
import { BulletinPreview } from './components/BulletinPreview';
import { BulletinForm } from './components/BulletinForm';
import { HeaderBar } from './components/HeaderBar';
import { exportBulletinToPdf, exportBookletToPdf } from './utils/pdfExport';
import { Sparkles, FileText, CheckCircle2 } from 'lucide-react';

export default function App() {
  // Default to upcoming Sunday as specified by user
  const [bulletin, setBulletin] = useState<BulletinData>(() => {
    const upcomingSunday = getUpcomingSunday();
    return generateBulletinForSunday(upcomingSunday);
  });

  const [viewMode, setViewMode] = useState<'split' | 'preview' | 'form'>('split');
  const [zoom, setZoom] = useState<number>(1.0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadType, setDownloadType] = useState<'ebulletin' | 'booklet' | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [downloadSuccessType, setDownloadSuccessType] = useState<'ebulletin' | 'booklet' | null>(null);
  const [downloadBlobUrl, setDownloadBlobUrl] = useState<string | null>(null);
  const [downloadFilename, setDownloadFilename] = useState<string>('');
  const [downloadProgress, setDownloadProgress] = useState<string>('');
  const [downloadError, setDownloadError] = useState<string | null>(null);

  // Auto-adjust default zoom for A5 display
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setZoom(0.8);
      } else if (window.innerWidth < 1440) {
        setZoom(1.0);
      } else {
        setZoom(1.15);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  /**
   * Formats E-bulletin filename as "YYYY-MM-DD (D MMMM YYYY).pdf", e.g. "2026-10-18 (18 October 2026).pdf"
   */
  const getEBulletinFilename = (data: BulletinData): string => {
    const dateStr = data.sunday.dateStr; // "YYYY-MM-DD"
    const [yearStr, monthStr, dayStr] = dateStr.split('-');
    const year = parseInt(yearStr, 10);
    const monthIdx = parseInt(monthStr, 10) - 1;
    const day = parseInt(dayStr, 10);

    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];
    const monthName = months[monthIdx] || 'October';

    return `${dateStr} (${day} ${monthName} ${year}).pdf`;
  };

  /**
   * Formats Booklet filename as "YYYY-MM-DD (D MMMM YYYY) Booklet.pdf"
   */
  const getBookletFilename = (data: BulletinData): string => {
    const dateStr = data.sunday.dateStr; // "YYYY-MM-DD"
    const [yearStr, monthStr, dayStr] = dateStr.split('-');
    const year = parseInt(yearStr, 10);
    const monthIdx = parseInt(monthStr, 10) - 1;
    const day = parseInt(dayStr, 10);

    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];
    const monthName = months[monthIdx] || 'October';

    return `${dateStr} (${day} ${monthName} ${year}) Booklet.pdf`;
  };

  // Download 4-Page A5 E-bulletin
  const handleDownloadEBulletin = async () => {
    setIsDownloading(true);
    setDownloadType('ebulletin');
    setDownloadProgress('Preparing pages...');
    setDownloadSuccess(false);
    setDownloadError(null);

    // If currently in form-only mode, temporarily switch to preview so bulletin-document is rendered
    if (viewMode === 'form') {
      setViewMode('preview');
      await new Promise((resolve) => setTimeout(resolve, 250));
    }

    try {
      const filename = getEBulletinFilename(bulletin);
      const result = await exportBulletinToPdf('bulletin-document', filename, (p) => {
        setDownloadProgress(`Page ${p.currentPage} of ${p.totalPages}...`);
      });
      setDownloadBlobUrl(result.blobUrl);
      setDownloadFilename(result.filename);
      setDownloadSuccessType('ebulletin');
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 7000);
    } catch (err) {
      console.error('E-bulletin export failed:', err);
      const msg = err instanceof Error ? err.message : 'E-bulletin export encountered an issue.';
      setDownloadError(msg);
      setTimeout(() => setDownloadError(null), 8000);
    } finally {
      setIsDownloading(false);
      setDownloadType(null);
      setDownloadProgress('');
    }
  };

  // Download Folded A4 Landscape Booklet (Side 1: Pgs 4 & 1, Side 2: Pgs 2 & 3)
  const handleDownloadBooklet = async () => {
    setIsDownloading(true);
    setDownloadType('booklet');
    setDownloadProgress('Preparing pages...');
    setDownloadSuccess(false);
    setDownloadError(null);

    // If currently in form-only mode, temporarily switch to preview so bulletin-document is rendered
    if (viewMode === 'form') {
      setViewMode('preview');
      await new Promise((resolve) => setTimeout(resolve, 250));
    }

    try {
      const filename = getBookletFilename(bulletin);
      const result = await exportBookletToPdf('bulletin-document', filename, (p) => {
        setDownloadProgress(`Page ${p.currentPage} of ${p.totalPages}...`);
      });
      setDownloadBlobUrl(result.blobUrl);
      setDownloadFilename(result.filename);
      setDownloadSuccessType('booklet');
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 7000);
    } catch (err) {
      console.error('Booklet export failed:', err);
      const msg = err instanceof Error ? err.message : 'Booklet export encountered an issue.';
      setDownloadError(msg);
      setTimeout(() => setDownloadError(null), 8000);
    } finally {
      setIsDownloading(false);
      setDownloadType(null);
      setDownloadProgress('');
    }
  };

  const handleLoadSampleBulletin = () => {
    // 18 October 2026 (the exact sample provided)
    const sampleDate = new Date(Date.UTC(2026, 9, 18));
    const sampleBulletin = generateBulletinForSunday(sampleDate);
    setBulletin(sampleBulletin);
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col font-sans">
      {/* Top Application Bar */}
      <HeaderBar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        zoom={zoom}
        onZoomChange={setZoom}
        onDownloadEBulletin={handleDownloadEBulletin}
        onDownloadBooklet={handleDownloadBooklet}
        isDownloading={isDownloading}
        downloadType={downloadType}
        downloadProgress={downloadProgress}
        downloadSuccess={downloadSuccess}
        downloadSuccessType={downloadSuccessType}
        sundayDateFormatted={bulletin.sunday.dateFormatted}
        sundayTitle={bulletin.sunday.title}
      />

      {/* Quick notice and Sample Switcher */}
      <div className="no-print bg-stone-900/90 text-stone-200 border-b border-stone-800 px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400" />
          <span>
            Extraordinary Form A5 Bulletin •{' '}
            <strong className="text-white">{bulletin.sunday.dateFormatted}</strong> ({bulletin.sunday.title})
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleLoadSampleBulletin}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-900/60 hover:bg-amber-800 text-amber-200 border border-amber-600/40 text-[11px] font-medium transition-colors"
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Load Sample (18 Oct 2026)</span>
          </button>

          <span className="text-stone-500">|</span>

          <span className="text-stone-400">
            Campion Propers: <strong className="text-amber-300">p. {bulletin.massSettings.propersPage}</strong>
          </span>
        </div>
      </div>

      {/* Main Content Viewport */}
      <main id="main-viewport" className="flex-1 max-w-[1700px] w-full mx-auto p-4 sm:p-6 overflow-hidden">
        {/* Mobile View Toggle Bar */}
        <div className="md:hidden flex rounded-lg bg-stone-200 p-1 mb-4 text-xs font-semibold">
          <button
            onClick={() => setViewMode('form')}
            className={`flex-1 py-1.5 rounded-md ${
              viewMode === 'form' ? 'bg-amber-800 text-white' : 'text-stone-700'
            }`}
          >
            Edit Form
          </button>
          <button
            onClick={() => setViewMode('preview')}
            className={`flex-1 py-1.5 rounded-md ${
              viewMode === 'preview' ? 'bg-amber-800 text-white' : 'text-stone-700'
            }`}
          >
            View A5 PDF (4 Pgs)
          </button>
        </div>

        {/* Layout Grid */}
        <div className="flex flex-col lg:flex-row gap-6 items-start justify-center">
          {/* LEFT: Bulletin Form (Editable Settings) */}
          {(viewMode === 'split' || viewMode === 'form') && (
            <div
              id="form-container"
              className={`w-full ${
                viewMode === 'split' ? 'lg:w-[460px] xl:w-[500px] 2xl:w-[540px] shrink-0' : 'max-w-3xl mx-auto'
              }`}
            >
              <BulletinForm
                bulletin={bulletin}
                onChange={setBulletin}
              />
            </div>
          )}

          {/* RIGHT: High-fidelity 4-Page A5 Document Preview */}
          <div
            className={`flex-1 w-full flex flex-col items-center overflow-auto ${
              viewMode === 'preview' ? 'max-w-4xl mx-auto' : ''
            } ${viewMode === 'form' ? 'hidden' : ''}`}
          >
            {/* Document Header Indicator */}
            <div className="no-print w-full flex items-center justify-between pb-3 px-2 text-xs text-stone-500">
              <div className="flex items-center gap-1.5 font-medium">
                <FileText className="w-4 h-4 text-stone-600" />
                <span>4-Page A5 Booklet Preview</span>
              </div>
              <span>A5 Dimensions: 148mm × 210mm</span>
            </div>

            {/* The 4-page Bulletin Component */}
            <BulletinPreview
              bulletin={bulletin}
              scale={viewMode === 'preview' ? 1.2 : zoom}
            />
          </div>
        </div>
      </main>

      {/* Floating Download Success Toast with Guaranteed Direct Download Link & View Action */}
      {downloadSuccess && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white p-4 rounded-xl shadow-2xl border border-stone-700 flex items-start gap-3 text-xs max-w-md animate-in fade-in slide-in-from-bottom-4">
          <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center justify-between">
              <p className="font-bold text-sm text-stone-100">
                {downloadSuccessType === 'booklet' ? 'A4 Print Booklet Ready!' : 'E-bulletin PDF Ready!'}
              </p>
              <button
                onClick={() => setDownloadSuccess(false)}
                className="text-stone-400 hover:text-stone-200 text-[10px] uppercase font-bold"
              >
                Dismiss
              </button>
            </div>
            <p className="text-stone-300 text-[11px] leading-relaxed">
              {downloadSuccessType === 'booklet'
                ? 'Your 2-page A4 landscape booklet (Side 1: Pages 4 & 1, Side 2: Pages 2 & 3) is ready for double-sided printing and center folding.'
                : 'Your 4-page A5 digital E-bulletin with clickable links is ready.'}
            </p>
            {downloadBlobUrl && (
              <div className="flex items-center gap-3 pt-1">
                <a
                  href={downloadBlobUrl}
                  download={downloadFilename}
                  className="px-2.5 py-1 bg-amber-700 hover:bg-amber-600 text-white rounded font-semibold text-[11px] transition-colors"
                >
                  Download File
                </a>
                <a
                  href={downloadBlobUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-300 hover:text-amber-200 underline font-medium text-[11px]"
                >
                  Open PDF in Tab
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Download Error Toast */}
      {downloadError && (
        <div className="fixed bottom-6 right-6 z-50 bg-red-950 text-white p-4 rounded-xl shadow-2xl border border-red-700 flex items-start gap-3 text-xs max-w-md animate-in fade-in slide-in-from-bottom-4">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center justify-between">
              <p className="font-bold text-sm text-red-200">PDF Download Notice</p>
              <button
                onClick={() => setDownloadError(null)}
                className="text-red-300 hover:text-white text-[10px] uppercase font-bold"
              >
                Dismiss
              </button>
            </div>
            <p className="text-red-100 text-[11px] leading-relaxed">{downloadError}</p>
            <div className="pt-1 flex items-center gap-2">
              <button
                onClick={handleDownloadEBulletin}
                className="px-2.5 py-1 bg-red-800 hover:bg-red-700 text-white rounded font-semibold text-[11px]"
              >
                Retry E-bulletin
              </button>
              <button
                onClick={handleDownloadBooklet}
                className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-amber-200 rounded font-semibold text-[11px]"
              >
                Retry Booklet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
