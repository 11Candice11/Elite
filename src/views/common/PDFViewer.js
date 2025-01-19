import { LitElement, html, css } from 'lit';
// import * as pdfjsViewer from 'pdfjs-dist/web/pdf_viewer.js';
import base64PDF from '/src/constants/Base64.js';
// import { pdfjsLib } from 'pdfjs-dist/build/pdf.js';
import * as pdfjsLib from 'pdfjs-dist/build/pdf.js';

pdfjsLib.GlobalWorkerOptions.workerSrc =
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.15.349/pdf.worker.min.js';

class PDFViewer extends LitElement {
  static styles = css`
    :host {
      display: block;
      padding: 20px;
    }
    #pdf-container {
      width: 100%;
      height: 600px;
      overflow: auto;
      background-color: #f0f0f0;
      position: relative;
    }
    canvas {
      display: block;
      margin: 10px auto;
    }
    .controls {
      text-align: center;
      margin-top: 10px;
    }
    .controls button {
      margin: 0 10px;
      padding: 5px 15px;
      font-size: 16px;
    }
  `;

  static properties = {
    pdfSrc: { type: String },
    currentPage: { type: Number },
    totalPages: { type: Number },
    pdfDocument: { type: Object },
  };

  constructor() {
    super();
    this.pdfSrc = `data:application/pdf;base64,${base64PDF}`;
    this.currentPage = 1;
    this.totalPages = 0;
    this.pdfDocument = null;
  }

  async firstUpdated() {
    this.loadPDF();
  }

  async loadPDF() {
    try {
      const loadingTask = pdfjsLib.getDocument(this.pdfSrc);
      this.pdfDoc = await loadingTask.promise;
      this.renderPage(1);
    } catch (error) {
      console.error('Error loading PDF:', error);
      console.error('Stack trace:', error.stack);
    }
  }


  async renderPage(pageNum) {
    const page = await this.pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.5 });
    const canvas = this.renderRoot.querySelector('canvas');
    const context = canvas.getContext('2d');

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    };

    await page.render(renderContext).promise;
  }

  handlePrevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.renderPage(this.currentPage);
    }
  }

  handleNextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.renderPage(this.currentPage);
    }
  }

  render() {
    return html`
      <div id="pdf-container">
        <canvas id="canvas"></canvas>
      </div>
      <div class="controls">
        <button @click="${this.handlePrevPage}" ?disabled="${this.currentPage <= 1}">
          Previous
        </button>
        <span>Page ${this.currentPage} of ${this.totalPages}</span>
        <button @click="${this.handleNextPage}" ?disabled="${this.currentPage >= this.totalPages}">
          Next
        </button>
      </div>
    `;
  }
}

customElements.define('pdf-viewer', PDFViewer);