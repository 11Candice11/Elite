import { LitElement, html, css } from 'lit';
import { ClientProfileService } from '/src/services/ClientProfileService.js';
import { store } from '/src/store/EliteStore.js';
import { ViewBase } from './common/ViewBase.js';
import user from '/src/images/user.png';
// import { sharedStyles } from '../../styles/shared-styles.js';
import * as pdfjsLib from 'pdfjs-dist';
// import 'pdfjs-dist/build/pdf.worker.entry';
import { PDFDocument, rgb } from 'pdf-lib';

pdfjsLib.GlobalWorkerOptions.workerSrc =
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.15.349/pdf.worker.min.js';

import { TAX_FREE } from '/src/constants/TaxFree.js';
import { INVESTMENT_POLICY } from '/src/constants/InvestmentPolicy.js';
import { LIVING_ANNUITY } from '/src/constants/LivingAnnuity.js';
import { RETIREMENT_ANNUITY } from '/src/constants/RetirementAnnuity.js';
import { DIRECT_INVESTMENT } from '/src/constants/DirectInvestment.js';
import { INVESTO } from '/src/constants/Investo.js';
import { LIFESTYLE_PROTECTOR } from '/src/constants/LifestyleProtector.js';
import { CLASSIC_INVESTMENT } from '/src/constants/ClassicInvestment.js';
import { LINKED_LIFE_ANNUITY } from '/src/constants/LinkedLifeAnnuity.js';
import { STANLIB } from '/src/constants/Stanlib.js';

export class FillDocument extends ViewBase {
    static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      font-family: Arial, sans-serif;
      background: #f5f7fa;
      min-height: 100vh;
      color: #333;
      align-items: center;
      justify-content: center;
    }
  
    /* Client Card Animation */
    .client-card {
        background: rgb(215, 180, 120);
        border-radius: 8px;
        max-width: 420px;
        margin: 20px auto;
        padding: 8px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        transform: translateY(-50px);
        opacity: 0;
        transition: all 0.6s ease;
      }
    
      .client-card.visible {
        transform: translateY(0);
        opacity: 1;
        height: 400px;
        text-align: center;
      }
    
    /* Client Card Header */
    .client-card-header {
      background: rgb(0, 50, 100);
      color: white;
      padding: 15px;
      border-radius: 8px 8px 0 0;
      display: flex;
      align-items: center;
    }
    
    .client-card-header img {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      margin-right: 15px;
    }
    
    /* Client Card Content */
    .client-card-content {
      padding: 15px;
      color: black;
      background-color: rgb(200, 200, 200);
      border-radius: 0 0 8px 8px;
    }
    
    .client-card-content p {
      margin: 8px 0;
      font-size: 14px;
      color: black;
      line-height: 1.5;
    }
    
    /* Client Card Buttons */
    .client-card-actions {
      display: flex;
      justify-content: space-around;
      padding: 15px;
      background-color: rgb(140, 120, 80);
      border-radius: 0 0 8px 8px;
    }
    
    .client-card-actions button {
      background-color: rgb(215, 180, 120);
      color: white;
      padding: 10px 15px;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-weight: bold;
      transition: background-color 0.3s ease;
      height: 50px;
      font-size: 13px;
      width: 120px;
    }
    
    .client-card-actions button:hover {
      background-color: rgb(140, 120, 80);
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

    .show { 
        display: flex
    }
  
    .popup-content {
      background: white;
      padding: 20px;
      border-radius: 8px;
      width: 90%;
      max-width: 600px;
      text-align: center;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }
  
    .popup-content h3 {
      color: #0077b6;
    }
  
    .close-button {
      background: none;
      border: none;
      font-size: 18px;
      cursor: pointer;
      float: right;
    }
  
    /* PDF Carousel Styling */
    .pdf-carousel {
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      width: 600px;
      height: 800px;
      overflow: hidden;
    }
  
    .pdf-slide-container {
      display: flex;
      transition: transform 0.5s ease-in-out;
    }
  
    .pdf-slide {
      min-width: 600px;
      height: 800px;
      transition: opacity 0.3s;
    }
  
    /* Navigation Arrows */
    .arrow {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      font-size: 24px;
      cursor: pointer;
      z-index: 10;
      background-color: rgba(0, 0, 0, 0.5);
      color: white;
      padding: 10px;
      border-radius: 50%;
    }
  
    .arrow-left {
      left: 10px;
      margin-right: 20px;
      height: 50px;
      width: 50px;
    }
  
    .arrow-right {
      right: 10px;
      margin-left: 20px;
      height: 50px;
      width: 50px;
    }
    .pdfCanvas {
        height: 720px;
    }
    button {
        background: #0077b6;
        color: white;
        padding: 8px 15px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        margin: 5px 0;
      }
    
      button:hover {
        background: #005f8a;
      }
    
    `;

    static properties = {
        isLoading: { type: Boolean },
        dob: { type: String },
        language: { type: String },
        company: { type: String },
        entityType: { type: String },
        showPopup: { type: Boolean },
        pdfIndex: { type: Number },
        currentPageIndex: { type: Number },
        totalPages: { type: Number },
        currentPDF: { type: Object }, // Store the current PDF data
        originalPDF: { type: Object }, // Store the original PDF data for resetting
        clientInfo: { type: Object }
    };

    constructor() {
        super();
        this.showPopup = false;
        this.clientName = ``;
        this.dob = `25/01/1981`;
        this.language = `English`;
        this.company = `Morebo`;
        this.entityType = `Natural person`;
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
            this.base64ToArrayBuffer(DIRECT_INVESTMENT),
            this.base64ToArrayBuffer(INVESTO),
            this.base64ToArrayBuffer(LIFESTYLE_PROTECTOR),
            this.base64ToArrayBuffer(CLASSIC_INVESTMENT),
            this.base64ToArrayBuffer(LINKED_LIFE_ANNUITY),
            this.base64ToArrayBuffer(STANLIB)
        ];

        // Render the default PDF on load
        this.currentPDF = this.pdfs[this.pdfIndex].slice(0); // Clone the array buffer
        this.originalPDF = this.currentPDF.slice(0); // Save the original PDF
        this.renderPDF(this.currentPDF, this.currentPageIndex);

        this.isLoading = false;
        this.clientProfileService = new ClientProfileService(); // Initialize service

        this.initialise();
    }

    initialise() {
        this.clientInfo = store.get('clientInfo');

        const idNumber = store.get('searchID');
        const century = parseInt(idNumber.substring(0, 2)) < 22 ? "20" : "19";
        const dob = idNumber ? `${century}${idNumber.substring(0, 2)}/${idNumber.substring(2, 4)}/${idNumber.substring(4, 6)}` : "Unknown DOB";

        this.showPopup = true;
        this.clientName = `${this.clientInfo.firstNames} ${this.clientInfo.surname}`;
        this.dob = dob;
        this.entityType = `Natural person`;
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

    togglePopup() {
        const isMobile = window.innerWidth <= 600;
        if (!isMobile) {
            this.showPopup = !this.showPopup;
        } else {
            alert('PDF Viewer is not yet available on mobile.');
        }
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

        const idNumber = store.get('searchID');
        const century = parseInt(idNumber.substring(0, 2)) < 22 ? "20" : "19";
        const dob = idNumber ? `${century}${idNumber.substring(0, 2)}/${idNumber.substring(2, 4)}/${idNumber.substring(4, 6)}` : "Unknown DOB";

        // Loop through all pages to add text
        for (let i = 0; i < pages.length; i++) {
            const currentPage = pages[i];

            // await this.addText(currentPage, pdfData, pdfDoc, 'title', this.clientInfo.title, 5, 3, i + 1);
            await this.addText(currentPage, pdfData, pdfDoc, 'title', this.clientInfo.title, 5, 3, i + 1);
            await this.addText(currentPage, pdfData, pdfDoc, 'surname', this.clientInfo.surname, 5, 3, i + 1);
            await this.addText(currentPage, pdfData, pdfDoc, 'first name', this.clientInfo.firstNames, 5, 3, i + 1);
            await this.addText(currentPage, pdfData, pdfDoc, 'id or passport number', idNumber, 5, 3, i + 1);
            await this.addText(currentPage, pdfData, pdfDoc, 'date of birth', dob, 5, 3, i + 1);
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
        this.isLoading = true;
        const currentPDF = this.pdfs[this.pdfIndex].slice(0); // Clone to avoid detaching the buffer this.currentPDF; 
        await this.modifyAndRenderPDF(currentPDF);
        this.isLoading = false;
    }

    async clearTemplate() {
        // Restore the original PDF and re-render it
        this.currentPDF = this.originalPDF.slice(0); // Ensure it's a copy
        this.renderPDF(this.currentPDF, this.currentPageIndex);
    }

    switchPDF(direction) {
        this.isLoading = false;
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

    downloadPDF() {
        // Extract the name, surname, and current date for the file name
        const clientName = store.get('clientInfo')?.firstNames || 'Unknown';
        const clientSurname = store.get('clientInfo')?.surname || 'Unknown';
        const currentDate = new Date().toLocaleDateString('en-GB').replace(/\//g, '-'); // Format as DD-MM-YYYY

        const fileName = `${clientName}_${clientSurname}_${currentDate}_Report.pdf`;

        // Create a Blob from the Base64-encoded PDF and trigger the download
        const pdfBlob = new Blob([this.currentPDF], { type: "application/pdf" });

        const link = document.createElement('a');
        link.href = URL.createObjectURL(pdfBlob);
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(link.href); // Clean up the URL
    }

    // async handlePDFUpload(event) {
    //     const file = event.target.files[0];
    //     if (!file) return;
    
    //     this.showPopup = true;

    //     const reader = new FileReader();
    //     reader.onload = async (e) => {
    //         const arrayBuffer = e.target.result;
    //         this.currentPDF = arrayBuffer;
    //         this.originalPDF = arrayBuffer;
    //         this.renderPDF(this.currentPDF, 1); // Render first page
    //     };
    //     reader.readAsArrayBuffer(file);
    //     // await this.modifyAndRenderPDF(currentPDF);
    // }

    renderPDF(pdfData, pageIndex) {
        const loadingTask = pdfjsLib.getDocument({ data: pdfData.slice(0) }); // Clone to avoid issues
        loadingTask.promise.then(pdf => {
            this.totalPages = pdf.numPages;
            pdf.getPage(pageIndex).then(page => {
                const viewport = page.getViewport({ scale: 1.0 });
                const canvas = this.shadowRoot.getElementById('pdfCanvasId');
                if (!canvas) return;
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

    renderClientCard() {
        return html`
        <div class="client-card visible">
          <div class="client-card-header">
            <img src="${user}" alt="User Icon" class="client-card-icon" />
            <h3>${this.clientInfo.firstNames} ${this.clientInfo.surname}</h3>
          </div>
          <div class="client-card-content">
            <p><strong>Title:</strong> ${this.clientInfo.title}</p>
            <p><strong>Registered Name:</strong> ${this.clientInfo.registeredName}</p>
            <p><strong>Nickname:</strong> ${this.clientInfo.nickname}</p>
            <p><strong>Advisor Name:</strong> ${this.clientInfo.advisorName}</p>
            <p><strong>Email:</strong> ${this.clientInfo.email}</p>
            <p><strong>Cell Phone Number:</strong> ${this.clientInfo.cellPhoneNumber}</p>
          </div>
        </div>
        `;
    }

    render() {
        return html`
    <div class="client-profile-container">
        <!-- Header and Back Button -->
        <div class="header">
          <button class="" @click="${(e) => this.navigateHome()}">← Back</button>
          <h2>Client Profile</h2>
        </div>

        <!-- Profile Section -->
         ${this.renderClientCard()}


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
          </div>
        </div>

        <div class="upload-section">
    <input type="file" id="pdfUpload" accept="application/pdf" @change="${this.handlePDFUpload}" hidden />
    <button class="upload-button" @click="${() => this.shadowRoot.getElementById('pdfUpload').click()}">
        Upload PDF
    </button>
</div>

        <!-- Popup Overlay -->
        <div class="popup-overlay ${this.showPopup ? 'show' : ''}">
            <button class="arrow-left" @click="${() => this.changePage(-1)}">←</button>
            <div class="popup-content">
                <button class="" @click="${this.togglePopup}">✖</button>
                <h3>Select template PDF for ${this.clientInfo.firstName} ${this.clientInfo.surname}</h3>
                <canvas id="pdfCanvasId" class="pdfCanvas"></canvas>
                <div class="footer">
                    <button class="my-button" @click="${() => this.switchPDF(-1)}">Previous PDF</button>
                    <button class="my-button" @click="${() => this.switchPDF(1)}">Next PDF</button>
                    <button class="my-button" @click="${() => this.downloadPDF()}">Download</button>
                    <button class="my-button" ?disabled="${this.isLoading}" @click="${this.handleSelectTemplate}">${this.isLoading ? `Loading...` : `Select template`}</button>
                    <button class="my-button cancel" @click="${this.clearTemplate}">Clear Template</button>
                </div>
            </div>
            <button class="arrow-right" @click="${() => this.changePage(1)}">→</button>
        </div>
    </div>
    `;
    }
}

customElements.define('documents-view', FillDocument);
