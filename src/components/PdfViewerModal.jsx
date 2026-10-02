import React, { useState, useEffect, useRef } from 'react';
import { 
  X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2, 
  Download, Loader2, AlertCircle, FileText, Layers, RefreshCw 
} from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import { FILES_BASE_URL, SITE_CONFIG } from '../config';

// Configure PDF.js worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.10.38'}/pdf.worker.min.mjs`;
}

export function PdfViewerModal({ note, isOpen, onClose }) {
  const [pdfDoc, setPdfDoc] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1.2);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const canvasRef = useRef(null);
  const renderTaskRef = useRef(null);
  const containerRef = useRef(null);

  const pdfUrl = note ? `${FILES_BASE_URL}${note.file}` : '';

  // Reset states when note changes
  useEffect(() => {
    if (!isOpen || !note) {
      setPdfDoc(null);
      setCurrentPage(1);
      setNumPages(0);
      setLoading(true);
      setError(null);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);
    setCurrentPage(1);

    // Responsive initial scale on mobile
    if (window.innerWidth < 640) {
      setScale(0.85);
    } else {
      setScale(1.25);
    }

    const loadPdf = async () => {
      try {
        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        const doc = await loadingTask.promise;
        if (!isMounted) return;
        setPdfDoc(doc);
        setNumPages(doc.numPages);
        setLoading(false);
      } catch (err) {
        console.error('Error loading PDF:', err);
        if (!isMounted) return;
        setError('Failed to load PDF file. You can still download it directly below.');
        setLoading(false);
      }
    };

    loadPdf();

    return () => {
      isMounted = false;
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
    };
  }, [isOpen, note, pdfUrl]);

  // Render current page to canvas
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;

    let isCancelled = false;

    const renderPage = async () => {
      try {
        // Cancel existing render if in progress
        if (renderTaskRef.current) {
          await renderTaskRef.current.cancel().catch(() => {});
        }

        const page = await pdfDoc.getPage(currentPage);
        if (isCancelled) return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const context = canvas.getContext('2d');

        const pixelRatio = window.devicePixelRatio || 1;
        const viewport = page.getViewport({ scale });

        // High DPI scaling
        canvas.width = Math.floor(viewport.width * pixelRatio);
        canvas.height = Math.floor(viewport.height * pixelRatio);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;

        context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        const renderTask = page.render(renderContext);
        renderTaskRef.current = renderTask;
        await renderTask.promise;
      } catch (err) {
        if (err?.name !== 'RenderingCancelledException') {
          console.warn('Canvas render error:', err);
        }
      }
    };

    renderPage();

    return () => {
      isCancelled = true;
    };
  }, [pdfDoc, currentPage, scale]);

  // Keyboard navigation inside modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        setCurrentPage(p => Math.min(numPages, p + 1));
      }
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        setCurrentPage(p => Math.max(1, p - 1));
      }
      if (e.key === '+' || e.key === '=') {
        setScale(s => Math.min(2.5, +(s + 0.15).toFixed(2)));
      }
      if (e.key === '-') {
        setScale(s => Math.max(0.6, +(s - 0.15).toFixed(2)));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, numPages, onClose]);

  if (!isOpen || !note) return null;

  const handlePrevPage = () => setCurrentPage(p => Math.max(1, p - 1));
  const handleNextPage = () => setCurrentPage(p => Math.min(numPages, p + 1));
  const handleZoomIn = () => setScale(s => Math.min(2.5, +(s + 0.15).toFixed(2)));
  const handleZoomOut = () => setScale(s => Math.max(0.6, +(s - 0.15).toFixed(2)));
  const handleFitWidth = () => {
    if (!containerRef.current) return;
    const containerWidth = containerRef.current.clientWidth - 40;
    // Typical letter width is ~612pt
    const targetScale = Math.max(0.6, Math.min(2.0, containerWidth / 612));
    setScale(+targetScale.toFixed(2));
  };

  return (
    <div className="pdf-modal-backdrop" onClick={onClose}>
      <div 
        className="pdf-modal-card glass-panel" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Top Control Header */}
        <div className="pdf-modal-header">
          <div className="pdf-title-group">
            <span className="pdf-modal-subject">{note.subject}</span>
            <span className="pdf-modal-unit mono">{note.unit}</span>
            <h3 className="pdf-modal-title" title={note.title}>{note.title}</h3>
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
              <span>Download PDF</span>
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

        {/* Toolbar Bar: Page Nav & Zoom */}
        <div className="pdf-toolbar-bar">
          {/* Page navigation */}
          <div className="pdf-toolbar-group">
            <button 
              className="toolbar-btn" 
              onClick={handlePrevPage} 
              disabled={currentPage <= 1 || loading}
              title="Previous Page (Left Arrow)"
            >
              <ChevronLeft size={18} />
            </button>

            <div className="page-indicator mono">
              <span>Page</span>
              <input
                type="number"
                min={1}
                max={numPages || 1}
                value={currentPage}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (val >= 1 && val <= numPages) setCurrentPage(val);
                }}
                className="page-input mono"
              />
              <span>of {numPages || '—'}</span>
            </div>

            <button 
              className="toolbar-btn" 
              onClick={handleNextPage} 
              disabled={currentPage >= numPages || loading}
              title="Next Page (Right Arrow)"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Zoom controls */}
          <div className="pdf-toolbar-group">
            <button 
              className="toolbar-btn" 
              onClick={handleZoomOut} 
              title="Zoom Out (-)"
              disabled={scale <= 0.6}
            >
              <ZoomOut size={16} />
            </button>
            <span className="zoom-label mono">{Math.round(scale * 100)}%</span>
            <button 
              className="toolbar-btn" 
              onClick={handleZoomIn} 
              title="Zoom In (+)"
              disabled={scale >= 2.5}
            >
              <ZoomIn size={16} />
            </button>
            <button 
              className="toolbar-btn fit-btn" 
              onClick={handleFitWidth} 
              title="Fit to Width"
            >
              <Maximize2 size={15} />
              <span className="hide-on-mobile">Fit</span>
            </button>
          </div>
        </div>

        {/* Canvas Body Viewport */}
        <div className="pdf-canvas-viewport" ref={containerRef}>
          {loading && (
            <div className="pdf-state-box">
              <Loader2 size={36} className="animate-spin text-neon-cyan" />
              <p>Rendering high-res page {currentPage}...</p>
            </div>
          )}

          {error && (
            <div className="pdf-state-box error-state">
              <AlertCircle size={36} className="text-neon-red" />
              <p>{error}</p>
              <a 
                href={pdfUrl} 
                download 
                className="btn-neon-red"
                style={{ marginTop: '12px' }}
              >
                <Download size={16} />
                <span>Download PDF directly</span>
              </a>
            </div>
          )}

          <div 
            className="canvas-wrapper-relative"
            style={{ display: loading || error ? 'none' : 'inline-block' }}
          >
            <canvas ref={canvasRef} className="pdf-rendered-canvas" />
          </div>
        </div>

        {/* Bottom Status bar */}
        <div className="pdf-modal-footer">
          <span className="watermark-note mono">
            {SITE_CONFIG.name} • Free Student Notes • Watermarked
          </span>
          <span className="keyboard-shortcuts-hint">
            <kbd>←</kbd> <kbd>→</kbd> Navigate • <kbd>+</kbd> <kbd>-</kbd> Zoom
          </span>
        </div>
      </div>
    </div>
  );
}
