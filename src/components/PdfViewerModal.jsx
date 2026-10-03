import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  X, ZoomIn, ZoomOut, Maximize2, Download, 
  Loader2, AlertCircle, RefreshCw, ChevronUp, ChevronDown, ArrowLeft 
} from 'lucide-react';
import { FILES_BASE_URL, SITE_CONFIG } from '../config';

// Global cache for dynamic pdfjs-dist import to avoid bundle bloating
let pdfjsLibPromise = null;
function getPdfjsLib() {
  if (!pdfjsLibPromise) {
    pdfjsLibPromise = import('pdfjs-dist').then((lib) => {
      if (typeof window !== 'undefined') {
        lib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${lib.version || '4.10.38'}/pdf.worker.min.mjs`;
      }
      return lib;
    });
  }
  return pdfjsLibPromise;
}

// In-memory session scroll positions: noteId -> scrollTop
const sessionScrollPositions = new Map();

/**
 * Individual Page Canvas Component.
 * Mounts and renders canvas only when in range of the viewport.
 * Automatically cancels rendering and unmounts when out of range.
 */
function PageCanvas({ pdfDoc, pageNumber, width, height }) {
  const canvasRef = useRef(null);
  const [rendered, setRendered] = useState(false);

  useEffect(() => {
    let isCancelled = false;
    let renderTask = null;

    async function renderPage() {
      try {
        const page = await pdfDoc.getPage(pageNumber);
        if (isCancelled || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        // Limit devicePixelRatio to a maximum of 2 for memory efficiency
        const dpr = Math.min(window.devicePixelRatio || 1, 2);

        // Calculate scale to fit desired display width
        const unscaledViewport = page.getViewport({ scale: 1 });
        const scale = width / unscaledViewport.width;
        const viewport = page.getViewport({ scale });

        canvas.width = Math.floor(viewport.width * dpr);
        canvas.height = Math.floor(viewport.height * dpr);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        renderTask = page.render({
          canvasContext: ctx,
          viewport: viewport,
        });

        await renderTask.promise;
        if (!isCancelled) {
          setRendered(true);
        }
      } catch (err) {
        if (err?.name !== 'RenderingCancelledException') {
          console.warn(`Render cancelled or failed on page ${pageNumber}:`, err);
        }
      }
    }

    renderPage();

    return () => {
      isCancelled = true;
      if (renderTask) {
        renderTask.cancel();
      }
    };
  }, [pdfDoc, pageNumber, width]);

  return (
    <div className="pdf-page-canvas-wrapper" style={{ width: `${width}px`, height: `${height}px` }}>
      <canvas ref={canvasRef} className="pdf-rendered-canvas" />
      {!rendered && (
        <div className="pdf-page-skeleton-overlay">
          <Loader2 className="animate-spin text-neon-cyan" size={24} />
          <span className="mono">Rendering page {pageNumber}...</span>
        </div>
      )}
    </div>
  );
}

export function PdfViewerModal({ note, isOpen, onClose }) {
  const [pdfDoc, setPdfDoc] = useState(null);
  const [pagesMeta, setPagesMeta] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(0.80); // Default 80% zoom
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visiblePages, setVisiblePages] = useState(new Set());
  const [jumpPageInput, setJumpPageInput] = useState('1');

  const viewportRef = useRef(null);
  const pageRefs = useRef(new Map());

  const pdfUrl = note 
    ? (note.file.startsWith('/') || note.file.startsWith('http') ? note.file : `${FILES_BASE_URL}${note.file}`) 
    : '';

  // Measure viewport width and height
  const updateContainerDimensions = useCallback(() => {
    if (viewportRef.current) {
      setContainerDimensions({
        width: viewportRef.current.clientWidth,
        height: viewportRef.current.clientHeight,
      });
    }
  }, []);

  const [containerDimensions, setContainerDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    window.addEventListener('resize', updateContainerDimensions);
    return () => window.removeEventListener('resize', updateContainerDimensions);
  }, [updateContainerDimensions]);

  // Load PDF and pre-calculate all page dimensions for zero-layout-shift scrollbar
  const loadPdf = useCallback(async () => {
    if (!isOpen || !note) return;

    setLoading(true);
    setError(null);
    setPdfDoc(null);
    setPagesMeta([]);
    setVisiblePages(new Set());
    setCurrentPage(1);
    setZoom(0.80);

    try {
      const pdfjsLib = await getPdfjsLib();
      const loadingTask = pdfjsLib.getDocument(pdfUrl);
      const doc = await loadingTask.promise;

      setPdfDoc(doc);

      // Pre-extract aspect ratio of all pages (very fast, no canvas rendering)
      const meta = [];
      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const vp = page.getViewport({ scale: 1 });
        meta.push({
          pageNumber: i,
          width: vp.width,
          height: vp.height,
          aspectRatio: vp.height / vp.width,
        });
      }

      setPagesMeta(meta);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load PDF document:', err);
      setError('Could not load PDF document. Please check your connection or retry.');
      setLoading(false);
    }
  }, [isOpen, note, pdfUrl]);

  useEffect(() => {
    if (isOpen) {
      loadPdf();
    } else {
      setPdfDoc(null);
      setPagesMeta([]);
      setVisiblePages(new Set());
      setError(null);
    }
  }, [isOpen, loadPdf]);

  // Initial measurement once modal is rendered
  useEffect(() => {
    if (!loading && pagesMeta.length > 0) {
      updateContainerDimensions();
      // Restore scroll position if previously viewed in this session
      const savedScroll = sessionScrollPositions.get(note?.id);
      if (savedScroll && viewportRef.current) {
        requestAnimationFrame(() => {
          if (viewportRef.current) {
            viewportRef.current.scrollTop = savedScroll;
          }
        });
      }
    }
  }, [loading, pagesMeta, updateContainerDimensions, note?.id]);

  // Standard document reading width (like Adobe / Chrome / Google Drive)
  const basePageWidth = Math.min(Math.max(260, containerDimensions.width - 32), 740);
  const renderedPageWidth = Math.round(basePageWidth * zoom);

  // Setup IntersectionObserver for continuous virtualization (1-2 screens margin)
  useEffect(() => {
    if (!viewportRef.current || pagesMeta.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        setVisiblePages((prevSet) => {
          const nextSet = new Set(prevSet);
          let changed = false;

          entries.forEach((entry) => {
            const pageNum = Number(entry.target.getAttribute('data-page-number'));
            if (entry.isIntersecting) {
              if (!nextSet.has(pageNum)) {
                nextSet.add(pageNum);
                changed = true;
              }
            } else {
              if (nextSet.has(pageNum)) {
                nextSet.delete(pageNum);
                changed = true;
              }
            }
          });

          return changed ? nextSet : prevSet;
        });
      },
      {
        root: viewportRef.current,
        // 100% margin above and below (about 1-2 screens ahead of scroll)
        rootMargin: '100% 0px 100% 0px',
        threshold: 0,
      }
    );

    pageRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => {
      observer.disconnect();
    };
  }, [pagesMeta, renderedPageWidth]);

  // Handle continuous scroll: track active page & save session scroll position
  const handleScroll = () => {
    if (!viewportRef.current || pagesMeta.length === 0) return;

    const container = viewportRef.current;
    const scrollTop = container.scrollTop;

    // Save session scroll position
    if (note?.id) {
      sessionScrollPositions.set(note.id, scrollTop);
    }

    // Determine current page based on scroll position
    const containerTop = container.getBoundingClientRect().top;
    let closestPage = 1;
    let minDistance = Infinity;

    pagesMeta.forEach((p) => {
      const el = pageRefs.current.get(p.pageNumber);
      if (el) {
        const rect = el.getBoundingClientRect();
        // Distance from element top to container viewport top
        const dist = Math.abs(rect.top - containerTop - 20);
        if (dist < minDistance) {
          minDistance = dist;
          closestPage = p.pageNumber;
        }
      }
    });

    if (closestPage !== currentPage) {
      setCurrentPage(closestPage);
      setJumpPageInput(String(closestPage));
    }
  };

  // Support browser/mobile device back button to close modal
  useEffect(() => {
    if (!isOpen) return;

    window.history.pushState({ modal: 'pdf-viewer' }, '');

    const handlePopState = () => {
      onClose();
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      if (window.history.state?.modal === 'pdf-viewer') {
        window.history.back();
      }
    };
  }, [isOpen, onClose]);

  // Keyboard navigation & zoom
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();

      if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        setZoom((z) => Math.min(2.5, +(z + 0.1).toFixed(2)));
      }
      if (e.key === '-') {
        e.preventDefault();
        setZoom((z) => Math.max(0.35, +(z - 0.1).toFixed(2)));
      }
      if (e.key === '0') {
        e.preventDefault();
        setZoom(0.80);
      }
      if (e.key === 'PageDown' || e.key === 'ArrowDown') {
        // Smooth scroll downward
        if (viewportRef.current) {
          viewportRef.current.scrollBy({ top: 300, behavior: 'smooth' });
        }
      }
      if (e.key === 'PageUp' || e.key === 'ArrowUp') {
        if (viewportRef.current) {
          viewportRef.current.scrollBy({ top: -300, behavior: 'smooth' });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Jump to specific page
  const scrollToPage = (pageNum) => {
    const target = Math.max(1, Math.min(pagesMeta.length, pageNum));
    const el = pageRefs.current.get(target);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setCurrentPage(target);
      setJumpPageInput(String(target));
    }
  };

  const handleJumpSubmit = (e) => {
    e.preventDefault();
    const val = parseInt(jumpPageInput, 10);
    if (!isNaN(val)) {
      scrollToPage(val);
    }
  };

  if (!isOpen || !note) return null;

  return (
    <div className="pdf-modal-backdrop" onClick={onClose}>
      <div 
        className="pdf-modal-card glass-panel" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Sticky Top Header Bar */}
        <div className="pdf-modal-header">
          <div className="pdf-header-left-col">
            <button 
              className="btn-modal-back" 
              onClick={onClose}
              title="Back to notes library"
              aria-label="Back to notes"
            >
              <ArrowLeft size={18} />
              <span className="btn-modal-back-text">Back</span>
            </button>

            <div className="pdf-title-group">
              <span className="pdf-modal-subject">{note.subject}</span>
              <span className="pdf-modal-unit mono">{note.unit}</span>
              <h3 className="pdf-modal-title" title={note.title}>{note.title}</h3>
            </div>
          </div>

          <div className="pdf-header-actions">
            {/* Download Button */}
            <a
              href={pdfUrl}
              download={note.file.split('/').pop()}
              className="btn-modal-download"
              target="_blank"
              rel="noopener noreferrer"
              title="Download watermarked copy"
            >
              <Download size={15} />
              <span className="btn-download-text">Download</span>
            </a>

            {/* Close Button */}
            <button 
              className="btn-modal-close" 
              onClick={onClose} 
              aria-label="Close PDF reader"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Toolbar: Continuous Page Indicator & Zoom Controls */}
        <div className="pdf-toolbar-bar">
          {/* Page Indicator & Jump-to-page */}
          <div className="pdf-toolbar-group">
            <form onSubmit={handleJumpSubmit} className="page-indicator mono">
              <span>Page</span>
              <input
                type="number"
                min={1}
                max={pagesMeta.length || 1}
                value={jumpPageInput}
                onChange={(e) => setJumpPageInput(e.target.value)}
                onBlur={handleJumpSubmit}
                className="page-input mono"
                title="Type page number and press Enter"
              />
              <span>of {pagesMeta.length || '—'}</span>
            </form>

            <button 
              className="toolbar-btn" 
              onClick={() => scrollToPage(currentPage - 1)}
              disabled={currentPage <= 1}
              title="Scroll to previous page"
            >
              <ChevronUp size={16} />
            </button>
            <button 
              className="toolbar-btn" 
              onClick={() => scrollToPage(currentPage + 1)}
              disabled={currentPage >= pagesMeta.length}
              title="Scroll to next page"
            >
              <ChevronDown size={16} />
            </button>
          </div>

          {/* Zoom controls */}
          <div className="pdf-toolbar-group">
            <button 
              className="toolbar-btn" 
              onClick={() => setZoom((z) => Math.max(0.35, +(z - 0.1).toFixed(2)))} 
              title="Zoom Out (-)"
              disabled={zoom <= 0.35}
            >
              <ZoomOut size={16} />
            </button>
            <span className="zoom-label mono">{Math.round(zoom * 100)}%</span>
            <button 
              className="toolbar-btn" 
              onClick={() => setZoom((z) => Math.min(2.5, +(z + 0.1).toFixed(2)))} 
              title="Zoom In (+)"
              disabled={zoom >= 2.5}
            >
              <ZoomIn size={16} />
            </button>
            <button 
              className="toolbar-btn fit-btn" 
              onClick={() => setZoom((z) => (z === 0.80 ? 1.0 : 0.80))} 
              title={zoom === 0.80 ? "Fit Width (100%)" : "Default View (80%)"}
            >
              <Maximize2 size={15} />
              <span className="hide-on-mobile">{zoom === 0.80 ? "100%" : "80%"}</span>
            </button>
          </div>
        </div>

        {/* Continuous Vertical Scroll Viewport */}
        <div 
          className="pdf-continuous-scroll-viewport" 
          ref={viewportRef}
          onScroll={handleScroll}
        >
          {loading && (
            <div className="pdf-state-box">
              <Loader2 size={36} className="animate-spin text-neon-cyan" />
              <p>Loading document layout & preparing pages...</p>
            </div>
          )}

          {error && (
            <div className="pdf-state-box error-state">
              <AlertCircle size={40} className="text-neon-red" />
              <p>{error}</p>
              <div className="error-actions-row">
                <button className="btn-neon-blue" onClick={loadPdf}>
                  <RefreshCw size={15} />
                  <span>Retry</span>
                </button>
                <a 
                  href={pdfUrl} 
                  download 
                  className="btn-neon-red"
                >
                  <Download size={15} />
                  <span>Download PDF</span>
                </a>
              </div>
            </div>
          )}

          {/* Vertically Stacked Pages */}
          {!loading && !error && pagesMeta.length > 0 && (
            <div className="pdf-pages-stack">
              {pagesMeta.map((page) => {
                const pageHeight = Math.round(renderedPageWidth * page.aspectRatio);
                const isVisible = visiblePages.has(page.pageNumber);

                return (
                  <div
                    key={page.pageNumber}
                    ref={(el) => pageRefs.current.set(page.pageNumber, el)}
                    data-page-number={page.pageNumber}
                    className="pdf-page-container"
                    style={{
                      width: `${renderedPageWidth}px`,
                      minHeight: `${pageHeight}px`,
                    }}
                  >
                    {isVisible && pdfDoc ? (
                      <PageCanvas
                        pdfDoc={pdfDoc}
                        pageNumber={page.pageNumber}
                        width={renderedPageWidth}
                        height={pageHeight}
                      />
                    ) : (
                      /* Lightweight Skeleton Placeholder for unrendered page */
                      <div 
                        className="pdf-page-skeleton"
                        style={{ width: `${renderedPageWidth}px`, height: `${pageHeight}px` }}
                      >
                        <div className="skeleton-badge mono">
                          Page {page.pageNumber}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottom Status bar */}
        <div className="pdf-modal-footer">
          <span className="watermark-note mono">
            {SITE_CONFIG.name} • Continuous Scroll • Verified
          </span>
          <span className="keyboard-shortcuts-hint hide-on-mobile">
            <kbd>Scroll</kbd> continuously • <kbd>+</kbd> <kbd>-</kbd> Zoom • <kbd>Esc</kbd> Close
          </span>
        </div>
      </div>
    </div>
  );
}

export default PdfViewerModal;
