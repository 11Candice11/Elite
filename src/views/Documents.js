import { LitElement, html, css } from 'lit';
import { router } from '/src/Routing';
import { ViewBase } from '../ViewBase.js';
// import { sharedStyles } from '../../styles/shared-styles.js';
import * as pdfjsLib from 'pdfjs-dist';
import 'pdfjs-dist/build/pdf.worker.entry';
import { PDFDocument, rgb } from 'pdf-lib';
import { store } from '/src/EliteStore';
import { clientInfo } from '/src/constants/ClientInfo'

import { TAX_FREE } from '/src/constants/TaxFree';
import { INVESTMENT_POLICY } from '/src/constants/InvestmentPolicy';
import { LIVING_ANNUITY } from '/src/constants/LivingAnnuity';
import { RETIREMENT_ANNUITY } from '/src/constants/RetirementAnnuity';
// import { DIRECT_INVESTMENT } from '/src/constants/DirectInvestment';
// import { INVESTO } from '/src/constants/Investo';
// import { LIFESTYLE_PROTECTOR } from '/src/constants/LifestyleProtector';
// import { CLASSIC_INVESTMENT } from '/src/constants/ClassicInvestment';
// import { LINKED_LIFE_ANNUITY } from '/src/constants/LinkedLifeAnnuity';
// import { STANLIB } from '/src/constants/Stanlib';

export class Documents extends ViewBase {
  static styles = [
    css`
      /* General styles */
      body {
        background-color: #f9f9f9;
        margin: 0;
        padding: 0;
      }

      .client-profile-container {
        margin: 0 auto;
        padding: 20px;
        max-width: 1200px;
      }

      .header {
        display: flex;
        align-items: center;
        margin-bottom: 20px;
      }

      .back-button {
        font-size: 24px;
        background: none;
        border: none;
        cursor: pointer;
        margin-right: 10px;
      }

      h2 {
        margin: 0;
        font-size: 24px;
      }

      .profile-section {
        display: flex;
        align-items: end;
        margin-bottom: 40px;
        background-color: #fff;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        flex-direction: column;
      }

      .profile-picture .placeholder {
        width: 100px;
        height: 100px;
        background-color: #e0e0e0;
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        margin-bottom: 20px;
      }

      .profile-details {
        display: flex;
        flex-wrap: wrap;
        margin-left: 20px;
        flex: 1;
      }

      .profile-details h3 {
        width: 100%;
        margin: 0 0 10px;
        font-size: 22px;
        color: #333;
      }

      .profile-details .detail-item {
        justify-content: space-between;
        margin: 5px 0;
        width: 45%;
        flex-wrap: wrap;
      }

      .profile-details .detail-item strong {
        font-weight: 600;
        margin-right: 10px;
      }

       /* Documents Section */
      .documents-section {
        margin-top: 30px;
      }

      .documents-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
      }

      .documents-header h3 {
        margin: 0;
      }

      .documents-header .arrow {
        font-size: 24px;
        cursor: pointer;
        margin: 0 10px;
      }

      .document-list {
        display: flex;
        flex-direction: column;
      }

      .document-item {
        display: flex;
        align-items: center;
        padding: 10px;
        border: 1px solid #e0e0e0;
        border-radius: 10px;
        margin: 10px 0px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        background-color: #fff;
      }

      .document-icon .icon-placeholder {
        width: 50px;
        height: 50px;
        background-color: #e0e0e0;
        border-radius: 10px;
        margin-right: 15px;
      }

      .document-info h4 {
        margin: 0;
        font-size: 18px;
      }

      .document-info p {
        margin: 5px 0 0;
        color: #777;
      }

      /* Status Icon Styles */
      .status-icon {
        width: 12px;
        height: 12px;
        background-color: green;
        border-radius: 50%;
        margin-left: 10px;
      }

      /* Popup Styles */
      .popup-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: none;
        justify-content: center;
        align-items: center;
      }

      .popup-overlay.show {
        display: flex;
      }

      .popup-content {
        background-color: white;
        padding: 20px;
        border-radius: 8px;
        width: 90%;
        max-width: 600px;
        position: relative;
      }

      .popup-content h3 {
        margin-top: 0;
        font-size: 24px;
      }

      .close-button {
        background: none;
        border: none;
        font-size: 18px;
        cursor: pointer;
        float: right;
      }

      #pdfCanvas {
        margin-top: 20px;
        border: 2px solid black;
        width: 100%;
        height: auto;
        max-height: 750px;
      }

      .arrow-left,
      .arrow-right {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        font-size: 24px;
        cursor: pointer;
        z-index: 10;
        background-color: #F3E5F5;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        display: flex;
        justify-content: center;
        align-items: center;
      }

      .arrow-left {
        left: -60px;
      }

      .arrow-right {
        right: -60px;
      }

      .footer {
        display: flex;
        justify-content: space-between;
        margin-top: 20px;
        flex-wrap: wrap;
      }

      .button {
        background-color: #6A1B9A;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 20px;
        cursor: pointer;
        font-size: 11px;
        margin-top: 10px;
      }

      .button.cancel {
        background-color: #D32F2F;
      }

      @media (min-width: 768px) {
        .profile-section {
          flex-direction: row;
        }

        .profile-picture {
          margin-right: 20px;
        }

        .profile-details {
          margin-left: 20px;
        }
      }

      @media (min-width: 1024px) {
        .client-profile-container {
          max-width: 1200px;
          // box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .arrow-left {
          left: -80px;
        }

        .arrow-right {
          right: -80px;
        }
      }
    `
  ];

  static properties = {
    dob: { type: String },
    language: { type: String },
    company: { type: String },
    entityType: { type: String },
    status: { type: String },
    office: { type: String },
    showPopup: { type: Boolean },
    pdfIndex: { type: Number },
    currentPageIndex: { type: Number },
    totalPages: { type: Number },
    currentPDF: { type: Object }, // Store the current PDF data
    originalPDF: { type: Object }, // Store the original PDF data for resetting
    clientInfo: { type: Object } 
  }

  constructor() {
    super();
    this.showPopup = false;
    this.clientName = ``;
    this.dob = `25/01/1981`;
    this.language = `English`;
    this.company = `Morebo`;
    this.entityType = `Natural person`;
    this.status = `Potential client`;
    this.office = `Morebo Wealth`;
    this.pdfIndex = 0;
    this.currentPageIndex = 1; // Start from the first page
    this.totalPages = 0;
    this.currentPDF = null;
    this.originalPDF = null;
    this.clientInfo = {};

    this.pdfs = [
      this.base64ToArrayBuffer(TAX_FREE),
      this.base64ToArrayBuffer(INVESTMENT_POLICY),
      this.base64ToArrayBuffer(LIVING_ANNUITY),
      this.base64ToArrayBuffer(RETIREMENT_ANNUITY),
    //   this.base64ToArrayBuffer(DIRECT_INVESTMENT),
    //   this.base64ToArrayBuffer(INVESTO),
    //   this.base64ToArrayBuffer(LIFESTYLE_PROTECTOR),
    //   this.base64ToArrayBuffer(CLASSIC_INVESTMENT),
    //   this.base64ToArrayBuffer(LINKED_LIFE_ANNUITY),
    //   this.base64ToArrayBuffer(STANLIB)
    ];

    // Render the default PDF on load
    this.currentPDF = this.pdfs[this.pdfIndex].slice(0); // Clone the array buffer
    this.originalPDF = this.currentPDF.slice(0); // Save the original PDF
    this.renderPDF(this.currentPDF, this.currentPageIndex);
    this.initialise();
  }

  connectedCallback() {
    super.connectedCallback();
  }

  initialise() {
    const storedClientInfo = store.gets('clientInfo');
    if (storedClientInfo && storedClientInfo.client) {
      const fullClientInfo = clientInfo.find(client => client.passportOrId === storedClientInfo.client.IDNumber);
      if (fullClientInfo) {
        this.clientInfo = fullClientInfo;
      } else {
        console.error('Client not found in ClientInfo.js');
      }
    }
  }
  goToMore(event) {
    event.preventDefault();
    super.navigateBack();
    // router.navigate('/dashboard');
  }

  togglePopup() {
    const isMobile = window.innerWidth <= 600;
    if (!isMobile) {
      this.showPopup = !this.showPopup;
    } else {
      alert('PDF Viewer is not yet available on mobile.');
    }
  }

  base64ToArrayBuffer(base64) {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer; // Return a new buffer
  }

  async extractTextPositions(pdfData, keyWord, pageIndex) {
    const loadingTask = pdfjsLib.getDocument({ data: pdfData.slice(0) }); // Pass a fresh copy
    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(pageIndex);
    const textContent = await page.getTextContent();

    return textContent.items.find(item => item.str.toLowerCase().includes(keyWord));
  }

  async modifyAndRenderPDF(pdfData) {
    const pdfDoc = await PDFDocument.load(pdfData.slice(0)); // Ensure a fresh copy is passed
    const pages = pdfDoc.getPages();

    // Loop through all pages to add text
    for (let i = 0; i < pages.length; i++) {
      const currentPage = pages[i];

      // await this.addText(currentPage, pdfData, pdfDoc, 'title', this.clientInfo.title, 5, 3, i + 1);
      await this.addText(currentPage, pdfData, pdfDoc, 'title', 'Mr', 5, 3, i + 1);
      await this.addText(currentPage, pdfData, pdfDoc, 'surname', this.clientInfo.surname, 5, 3, i + 1);
      await this.addText(currentPage, pdfData, pdfDoc, 'first name', this.clientInfo.firstName, 5, 3, i + 1);
      await this.addText(currentPage, pdfData, pdfDoc, 'id or passport number', this.clientInfo.passportOrId, 5, 3, i + 1);
      await this.addText(currentPage, pdfData, pdfDoc, 'date of birth', this.clientInfo.dateOfBirth, 5, 3, i + 1);
      // await this.addText(currentPage, pdfData, pdfDoc, 'residential address', this.clientInfo.residentialAddress, -250, -268, i + 1);
      // await this.addText(currentPage, pdfData, pdfDoc, 'postal address', this.clientInfo.postalAddress, -160, -50, i + 1);
      // await this.addText(currentPage, pdfData, pdfDoc, 'email', this.clientInfo.email, 5, 3, i + 1);
      // await this.addText(currentPage, pdfData, pdfDoc, 'telephone number', this.clientInfo.telephoneNumber, 10, 3, i + 1);
      // await this.addText(currentPage, pdfData, pdfDoc, 'work number', this.clientInfo.workNumber, 5, 3, i + 1);
    }

    // Save the modified PDF and set it as the current PDF
    this.currentPDF = await pdfDoc.save();
    this.renderPDF(this.currentPDF, this.currentPageIndex);
  }

  async addText(page, pdfData, pdfDoc, keyWord, text, xAdjust = 10, yAdjust = -10, pageIndex) {
    const titlePosition = await this.extractTextPositions(pdfData.slice(0), keyWord, pageIndex);

    if (!titlePosition) {
      return;
    }

    const { transform, width, height } = titlePosition;
    const [scaleX, , , scaleY, translateX, translateY] = transform;

    const xPos = translateX + width + xAdjust;
    const yPos = translateY + yAdjust;

    page.drawText(text, {
      x: xPos,
      y: yPos,
      size: 10,
      color: rgb(0, 0, 0),
    });
  }

  async handleSelectTemplate() {
    const currentPDF = this.pdfs[this.pdfIndex].slice(0); // Clone to avoid detaching the buffer
    await this.modifyAndRenderPDF(currentPDF);
  }

  async clearTemplate() {
    // Restore the original PDF and re-render it
    this.currentPDF = this.originalPDF.slice(0); // Ensure it's a copy
    this.renderPDF(this.currentPDF, this.currentPageIndex);
  }

  switchPDF(direction) {
    this.pdfIndex = (this.pdfIndex + direction + this.pdfs.length) % this.pdfs.length;
    this.currentPageIndex = 1; // Reset to the first page of the new PDF
    this.currentPDF = this.pdfs[this.pdfIndex].slice(0); // Load a fresh copy of the selected PDF
    this.originalPDF = this.currentPDF.slice(0); // Save the original PDF again
    this.renderPDF(this.currentPDF, this.currentPageIndex);
  }

  changePage(direction) {
    this.currentPageIndex = Math.min(Math.max(this.currentPageIndex + direction, 1), this.totalPages);
    this.renderPDF(this.currentPDF, this.currentPageIndex);
  }

  renderPDF(pdfData, pageIndex) {
    const loadingTask = pdfjsLib.getDocument({ data: pdfData.slice(0) }); // Clone to avoid issues
    loadingTask.promise.then(pdf => {
      this.totalPages = pdf.numPages;
      pdf.getPage(pageIndex).then(page => {
        const viewport = page.getViewport({ scale: 1.0 });
        const canvas = this.shadowRoot.getElementById('pdfCanvas');
        const ctx = canvas.getContext('2d');

        // Clear the canvas before rendering
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const renderContext = {
          canvasContext: ctx,
          viewport: viewport
        };
        page.render(renderContext);
      });
    });
  }

  firstUpdated() {
    this.checkIfMobile();
    window.addEventListener('resize', () => this.checkIfMobile());
  }

  checkIfMobile() {
    const pdfButton = this.shadowRoot.getElementById('pdfButton');
    const isMobile = window.innerWidth <= 600;

    if (isMobile) {
      pdfButton.disabled = true;
      pdfButton.style.backgroundColor = '#ccc';
      pdfButton.style.cursor = 'not-allowed';
    } else {
      pdfButton.disabled = false;
      pdfButton.style.cursor = 'pointer';
    }
  }

  render() {
    return html`
      <div class="client-profile-container">
        <!-- Header and Back Button -->
        <div class="header">
          <button class="back-button" @click="${(e) => this.goBack(e)}">←</button>
          <h2>Client Profile</h2>
        </div>

        <!-- Profile Section -->
        <div class="profile-section">
          <div class="profile-picture">
            <div class="placeholder"></div>
          </div>
          <div class="profile-details">
            <h3>${this.clientInfo.firstName} ${this.clientInfo.surname}</h3>
            <div class="detail-item">
              <strong>ID Number:</strong>
              <span>${this.clientInfo.passportOrId}</span>
            </div>
            <div class="detail-item">
              <strong>Entity ID:</strong>
              <span>${this.clientInfo.entityId}</span>
            </div>
            <div class="detail-item">
              <strong>Client Code:</strong>
              <span>${this.clientInfo.clientCode}</span>
            </div>
            <div class="detail-item">
              <strong>Company:</strong>
              <span>${this.clientInfo.company}</span>
            </div>
            <div class="detail-item">
              <strong>Date of Birth:</strong>
              <span>${this.clientInfo.dateOfBirth}</span>
            </div>
            <div class="detail-item">
              <strong>Language:</strong>
              <span>${this.clientInfo.homeLanguage}</span>
            </div>
            <div class="detail-item">
              <strong>Last interaction date:</strong>
              <span>${this.clientInfo.lastInteractionDate}</span>
            </div>
            </div>
            <button class="my-button" @click="${(e) => this.goToMore(e)}">View More</button>
        </div>

        <!-- Documents Section -->
        <div class="documents-section">
          <div class="documents-header">
            <h3>Documents</h3>
          </div>

          <div class="document-list">
            <div class="document-item" id="pdfButton" @click="${this.togglePopup}">
              <div class="document-icon">
                <div class="icon-placeholder"></div>
              </div>
              <div class="document-info">
                <h4>Get PDF</h4>
                <p>Populate your PDF template with this client's information</p>
              </div>
            </div>
            <div class="document-item" @click="${this.togglePopup}">
              <div class="document-icon">
                <div class="icon-placeholder"></div>
              </div>
              <div class="document-info">
                <h4>Meeting notes</h4>
                <p>Populate your PDF template with this client's information</p>
              </div>
            </div>
            <div class="document-item" @click="${this.togglePopup}">
              <div class="document-icon">
                <div class="icon-placeholder"></div>
              </div>
              <div class="document-info">
                <h4>New meeting</h4>
                <p>Populate your PDF template with this client's information</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Popup Overlay -->
        <div class="popup-overlay ${this.showPopup ? 'show' : ''}">
          <div class="popup-content">
            <button class="close-button" @click="${this.togglePopup}">✖</button>
            <h3>Select template PDF for ${this.clientInfo.firstName} ${this.clientInfo.surname}</h3>
            <span class="arrow-left" @click="${() => this.switchPDF(-1)}">←</span>
            <span class="arrow-right" @click="${() => this.switchPDF(1)}">→</span>
            <canvas id="pdfCanvas"></canvas>
            <div class="footer">
              <button class="my-button" @click="${() => this.changePage(-1)}">Previous Page</button>
              <button class="my-button" @click="${() => this.changePage(1)}">Next Page</button>
              <button class="my-button" @click="${() => this.changePage(1)}">Download</button>
              <button class="my-button" @click="${this.handleSelectTemplate}">Select template</button>
              <button class="my-button cancel" @click="${this.clearTemplate}">Clear Template</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define('my-documents', Documents);