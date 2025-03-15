import { LitElement, html, css } from 'lit';
// import * as pdfjsViewer from 'pdfjs-dist/web/pdf_viewer.js';
import base64PDF from '/src/constants/Base64.js';
// import { pdfjsLib } from 'pdfjs-dist/build/pdf.js';
import * as pdfjsLib from 'pdfjs-dist/build/pdf.js';
import { store } from '/src/store/EliteStore.js';
import { ViewBase } from './ViewBase.js';

pdfjsLib.GlobalWorkerOptions.workerSrc =
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.15.349/pdf.worker.min.js';

class PDFViewer extends ViewBase {
  static styles = [
    ViewBase.styles,
    css`
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
  `];

  static properties = {
    pdfSrc: { type: String },
    currentPage: { type: Number },
    totalPages: { type: Number },
    pdfDocument: { type: Object },
  };

  constructor() {
    super();
    this.base64 = ``;
    this.pdfSrc = ``;
    this.currentPage = 1;
    this.totalPages = 0;
    this.pdfDocument = null;
  }

  connectedCallback() {
    super.connectedCallback();
    this.base64 = store.get(`base64`);
    const byteCharacters = atob(this.base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const pdfBlob = new Blob([byteArray], { type: "application/pdf" });

    this.pdfSrc = URL.createObjectURL(pdfBlob);
    this.pdfSrc = `data:application/pdf;base64,${this.base64}`;
  }

  async firstUpdated() {
    this.loadPDF();
  }

  async loadPDF() {
    try {
      const loadingTask = pdfjsLib.getDocument(this.pdfSrc);
      this.pdfDoc = await loadingTask.promise;
      this.totalPages = this.pdfDoc.numPages;
      this.renderPage(1);
    } catch (error) {
      console.error('Error loading PDF:', error);
      console.error('Stack trace:', error.stack);
    }
  }

  async renderPage(pageNum) {
    const page = await this.pdfDoc.getPage(pageNum);

    // Get the original viewport
    const viewport = page.getViewport({ scale: 1.5 });

    const canvas = this.renderRoot.querySelector('canvas');
    const context = canvas.getContext('2d');

    canvas.width = viewport.width;   // Keep the width as-is for landscape
    canvas.height = viewport.height; // Keep the height as-is for landscape 

    // Clear canvas before rendering
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Render the page with the adjusted context
    const renderContext = {
      canvasContext: context,
      viewport: viewport // Using the original viewport (portrait) after rotation
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

  downloadPDF() {
    // Extract the name, surname, and current date for the file name
    const clientName = store.get('clientInfo')?.firstNames || 'Unknown';
    const clientSurname = store.get('clientInfo')?.surname || 'Unknown';
    const currentDate = new Date().toLocaleDateString('en-GB').replace(/\//g, '-'); // Format as DD-MM-YYYY

    const fileName = `${clientName}_${clientSurname}_${currentDate}_Report.pdf`;

    // Create a Blob from the Base64-encoded PDF and trigger the download
    const pdfBlob = new Blob([Uint8Array.from(atob(this.base64), (c) => c.charCodeAt(0))], {
      type: 'application/pdf',
    });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(pdfBlob);
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(link.href); // Clean up the URL
  }

  render() {
    return html`
          <div class="back-button">
        <button class="button" @click="${() => this.navigateBack()}">Back</button>
      </div>
        <h1>View Document</h1>
      <div id="pdf-container">
        <canvas id="canvas"></canvas>
      </div>
      <div class="controls">
        <button class="button" @click="${this.handlePrevPage}" ?disabled="${this.currentPage <= 1}">
          Previous
        </button>
        <span>Page ${this.currentPage} of ${this.totalPages}</span>
        <button class="button" @click="${this.handleNextPage}" ?disabled="${this.currentPage >= this.totalPages}">
          Next
        </button>
        <button class="button" @click="${this.downloadPDF}">Download</button>
      </div>
    `;
  }
}

customElements.define('pdf-viewer', PDFViewer);