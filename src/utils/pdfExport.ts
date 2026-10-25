import { jsPDF } from 'jspdf';
import { toPng } from 'html-to-image';
import { EMBEDDED_FONTS_CSS } from './bulletinFonts';

export interface PdfExportResult {
  blob: Blob;
  blobUrl: string;
  filename: string;
}

export interface PdfExportProgress {
  currentPage: number;
  totalPages: number;
  statusText: string;
}

export interface ExtractedPdfLink {
  x: number;
  y: number;
  w: number;
  h: number;
  url: string;
}

export interface CapturedBulletinPage {
  pageNumber: number; // 1, 2, 3, 4
  imgData: string;
  links: ExtractedPdfLink[];
}

/**
 * Extracts interactive links from a rendered A5 page element and converts
 * their coordinates from DOM pixels to PDF millimeters (A5: 148mm × 210mm).
 */
export function extractLinksFromPage(
  pageEl: HTMLElement,
  pageMmWidth = 148,
  pageMmHeight = 210
): ExtractedPdfLink[] {
  const pageRect = pageEl.getBoundingClientRect();
  if (pageRect.width <= 0 || pageRect.height <= 0) return [];

  const scaleX = pageMmWidth / pageRect.width;
  const scaleY = pageMmHeight / pageRect.height;

  // Find all anchor elements with an href
  const anchors = pageEl.querySelectorAll<HTMLAnchorElement>('a[href]');
  const links: ExtractedPdfLink[] = [];

  anchors.forEach((anchor) => {
    // Skip if element or parent has no-print
    if (anchor.closest('.no-print')) return;

    const rawHref = anchor.getAttribute('href') || anchor.href || '';
    const trimmed = rawHref.trim();
    if (!trimmed || trimmed === '#' || trimmed.startsWith('javascript:')) return;

    let url = trimmed;
    if (url.startsWith('//')) {
      url = `https:${url}`;
    } else if (!url.includes(':') && url.includes('@') && !url.includes('/')) {
      url = `mailto:${url}`;
    }

    // Use getClientRects to support multi-line wrapped inline links properly
    const clientRects = anchor.getClientRects();
    const rects =
      clientRects.length > 0
        ? Array.from(clientRects)
        : [anchor.getBoundingClientRect()];

    rects.forEach((rect) => {
      if (rect.width <= 0 || rect.height <= 0) return;

      const relLeft = rect.left - pageRect.left;
      const relTop = rect.top - pageRect.top;

      let x = relLeft * scaleX;
      let y = relTop * scaleY;
      let w = rect.width * scaleX;
      let h = rect.height * scaleY;

      // Comfortable hit-padding (0.4mm) to make tap and click targets responsive on touch & mouse
      const pad = 0.4;
      x = Math.max(0, x - pad);
      y = Math.max(0, y - pad);
      w = Math.min(pageMmWidth - x, w + pad * 2);
      h = Math.min(pageMmHeight - y, h + pad * 2);

      if (w > 0.5 && h > 0.5) {
        links.push({ x, y, w, h, url });
      }
    });
  });

  return links;
}

/**
 * Triggers a browser download from a Blob
 */
function triggerBlobDownload(blob: Blob, outputName: string): string {
  const blobUrl = URL.createObjectURL(blob);
  try {
    const downloadLink = document.createElement('a');
    downloadLink.href = blobUrl;
    downloadLink.download = outputName;
    downloadLink.target = '_blank';
    downloadLink.rel = 'noopener noreferrer';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    setTimeout(() => {
      try {
        if (downloadLink.parentNode) {
          document.body.removeChild(downloadLink);
        }
      } catch {
        // ignore cleanup error
      }
    }, 500);
  } catch (linkErr) {
    console.warn('Programmatic download link failed:', linkErr);
  }
  return blobUrl;
}

/**
 * Captures all 4 A5 pages from the bulletin container, guaranteed in order [Page 1, Page 2, Page 3, Page 4],
 * at razor-sharp 300+ DPI with full font embedding and interactive link extraction.
 */
export async function captureBulletinPages(
  containerId: string,
  onProgress?: (progress: PdfExportProgress) => void
): Promise<CapturedBulletinPage[]> {
  const container = document.getElementById(containerId);
  if (!container) {
    throw new Error('Bulletin container element not found. Please ensure the preview is active.');
  }

  // Clear any active text selection or focused outline to prevent visual artifacts
  try {
    window.getSelection()?.removeAllRanges();
    if (document.activeElement && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  } catch {
    // Ignore blur/selection errors
  }

  // Find all individual A5 page sheets in reliable order (1, 2, 3, 4)
  const p1 = container.querySelector<HTMLElement>('.page-sheet[data-page="1"]');
  const p2 = container.querySelector<HTMLElement>('.page-sheet[data-page="2"]');
  const p3 = container.querySelector<HTMLElement>('.page-sheet[data-page="3"]');
  const p4 = container.querySelector<HTMLElement>('.page-sheet[data-page="4"]');

  let pageEls: HTMLElement[] = [];
  if (p1 && p2 && p3 && p4) {
    pageEls = [p1, p2, p3, p4];
  } else {
    pageEls = Array.from(container.querySelectorAll<HTMLElement>('.page-sheet'));
  }

  if (pageEls.length === 0) {
    throw new Error('No A5 page sheets found in the bulletin container.');
  }

  // Ensure fonts are completely ready before capturing
  if (document.fonts) {
    try {
      await document.fonts.ready;
    } catch {
      // Continue even if fonts.ready rejects
    }
  }

  // Temporarily reset CSS transform on container during capture to prevent scaling glitches
  const originalTransform = container.style.transform;
  container.style.transform = 'none';
  void container.offsetHeight; // Force reflow

  const captured: CapturedBulletinPage[] = [];

  try {
    const total = pageEls.length;
    for (let i = 0; i < total; i++) {
      const pageEl = pageEls[i];
      const pageNumber = i + 1;

      onProgress?.({
        currentPage: pageNumber,
        totalPages: total,
        statusText: `Rendering Page ${pageNumber} of ${total} (High-Res 300 DPI)...`,
      });

      // Extract all interactive links on this page while in clean unscaled DOM layout
      const links = extractLinksFromPage(pageEl, 148, 210);

      // Yield briefly to ensure UI remains responsive
      await new Promise((resolve) => setTimeout(resolve, 40));

      // Convert page element to lossless 300+ DPI PNG data URL with fully embedded base64 fonts
      const imgData = await toPng(pageEl, {
        pixelRatio: 3.2, // ~308 DPI for A5 print (1790px × 2540px)
        cacheBust: false,
        backgroundColor: '#ffffff',
        fontEmbedCSS: EMBEDDED_FONTS_CSS,
        style: {
          boxShadow: 'none',
          border: 'none',
          margin: '0',
          transform: 'none',
        },
        filter: (node) => {
          if (node instanceof HTMLElement && node.classList.contains('no-print')) {
            return false;
          }
          return true;
        },
      });

      captured.push({
        pageNumber,
        imgData,
        links,
      });
    }

    return captured;
  } finally {
    // Restore original transform state
    container.style.transform = originalTransform;
  }
}

/**
 * Exports the 4-page bulletin to an exact, high-fidelity A5 PDF (148mm × 210mm)
 * for reading as an E-bulletin.
 * Sequenced as Page 1, Page 2, Page 3, Page 4.
 */
export async function exportBulletinToPdf(
  containerId: string,
  filename: string,
  onProgress?: (progress: PdfExportProgress) => void
): Promise<PdfExportResult> {
  const pages = await captureBulletinPages(containerId, onProgress);

  onProgress?.({
    currentPage: 4,
    totalPages: 4,
    statusText: 'Assembling A5 E-bulletin with interactive links...',
  });

  // Create standard A5 portrait jsPDF instance (148mm × 210mm)
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a5',
    compress: true,
  });

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    if (i > 0) {
      pdf.addPage('a5', 'portrait');
    }

    // Exact A5 dimensions: 148mm width, 210mm height, starting at (0, 0)
    pdf.addImage(page.imgData, 'PNG', 0, 0, 148, 210, undefined, 'FAST');

    // Add interactive PDF hyperlink annotations
    for (const link of page.links) {
      // In jsPDF, using y + h and -h produces an ISO 32000-1 compliant Rect [llx, lly, urx, ury] where lly < ury.
      pdf.link(link.x, link.y + link.h, link.w, -link.h, { url: link.url });
    }
  }

  const outputName = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  const blob = pdf.output('blob');
  const blobUrl = triggerBlobDownload(blob, outputName);

  return {
    blob,
    blobUrl,
    filename: outputName,
  };
}

/**
 * Exports the bulletin as a folded A4 landscape booklet (297mm × 210mm).
 * Imposition layout:
 * - Sheet 1 (Outer spread): Page 4 (left: back cover) and Page 1 (right: front cover).
 * - Sheet 2 (Inner spread): Page 2 (left: inside reading) and Page 3 (right: inside notices).
 * When printed double-sided (duplex flip on short edge) and folded down the center,
 * it forms a professional 4-page folded parish bulletin booklet.
 */
export async function exportBookletToPdf(
  containerId: string,
  filename: string,
  onProgress?: (progress: PdfExportProgress) => void
): Promise<PdfExportResult> {
  const pages = await captureBulletinPages(containerId, onProgress);

  if (pages.length < 4) {
    throw new Error('A 4-page bulletin is required to generate an A4 landscape booklet.');
  }

  onProgress?.({
    currentPage: 4,
    totalPages: 4,
    statusText: 'Imposing pages into A4 landscape booklet format...',
  });

  // Create A4 Landscape jsPDF instance (297mm width × 210mm height)
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const pageWidth = 297;
  const pageHeight = 210;
  const halfWidth = 148.5; // Exact half of A4 width
  const scaleX = halfWidth / 148; // Scale links from nominal 148mm to 148.5mm

  const p1 = pages[0]; // Front Cover
  const p2 = pages[1]; // Meditations
  const p3 = pages[2]; // Announcements
  const p4 = pages[3]; // Back Cover

  // ================= SHEET 1: OUTER SPREAD (Side 1) =================
  // Left half: Page 4 (Back Cover) [0 to 148.5mm]
  // Right half: Page 1 (Front Cover) [148.5 to 297mm]
  pdf.addImage(p4.imgData, 'PNG', 0, 0, halfWidth, pageHeight, undefined, 'FAST');
  for (const link of p4.links) {
    pdf.link(link.x * scaleX, link.y + link.h, link.w * scaleX, -link.h, { url: link.url });
  }

  pdf.addImage(p1.imgData, 'PNG', halfWidth, 0, halfWidth, pageHeight, undefined, 'FAST');
  for (const link of p1.links) {
    pdf.link(halfWidth + (link.x * scaleX), link.y + link.h, link.w * scaleX, -link.h, { url: link.url });
  }

  // ================= SHEET 2: INNER SPREAD (Side 2) =================
  // Left half: Page 2 (Meditations) [0 to 148.5mm]
  // Right half: Page 3 (Announcements) [148.5 to 297mm]
  pdf.addPage('a4', 'landscape');

  pdf.addImage(p2.imgData, 'PNG', 0, 0, halfWidth, pageHeight, undefined, 'FAST');
  for (const link of p2.links) {
    pdf.link(link.x * scaleX, link.y + link.h, link.w * scaleX, -link.h, { url: link.url });
  }

  pdf.addImage(p3.imgData, 'PNG', halfWidth, 0, halfWidth, pageHeight, undefined, 'FAST');
  for (const link of p3.links) {
    pdf.link(halfWidth + (link.x * scaleX), link.y + link.h, link.w * scaleX, -link.h, { url: link.url });
  }

  const outputName = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  const blob = pdf.output('blob');
  const blobUrl = triggerBlobDownload(blob, outputName);

  return {
    blob,
    blobUrl,
    filename: outputName,
  };
}
