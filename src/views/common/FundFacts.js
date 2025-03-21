import { LitElement, html, css } from 'lit';
import { router } from '/src/shell/Routing.js';
import uploadingImage from '/src/images/upload.svg';
import viewImage from '/src/images/view.svg';
import addImage from '/src/images/add.svg';
import { ViewBase } from '/src/views/common/ViewBase.js';
import { PdfRetrievalService } from '/src/services/PdfRetrievalService.js';
import { store } from '/src/store/EliteStore.js';

import '@lottiefiles/lottie-player';
import { ExcelMixin } from '/src/views/mixins/ExcelMixin.js';

class FundFacts extends ViewBase {
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
      transition: all 0.5s ease-in-out;
    }

    /* Header with back button */
    .header {
      position: fixed;
      top: 10px;
      left: 10px;
      width: 100%;
      display: flex;
      align-items: center;
      padding: 0 20px;
      box-sizing: border-box;
    }

    .back-button {
      background: #ff4d4d;
      color: white;
      padding: 8px 15px;
      border: none;
      border-radius: 5px;
      cursor: pointer;
    }

    /* Main content container */
    .content {
      display: flex;
      flex-direction: column;
      gap: 20px;
      align-items: center;
      margin-top: 60px; /* space for header */
    }

    /* Button styling */
    .button {
      display: flex;
      align-items: center;
      gap: 10px;
      background: #0077b6;
      color: white;
      padding: 10px 20px;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-size: 16px;
      transition: background 0.3s ease;
    }

    .button:hover {
      background: #005f8a;
    }

    /* Icon styling */
    .icon {
      width: 20px;
      height: 20px;
    }
  `;

  constructor() {
    super();
    this.isLoading = false;
    this.isLoadingUpload = false;

    this.pdfProxyService = new PdfRetrievalService();
    Object.assign(FundFacts.prototype, ExcelMixin);
  }

  static properties = {
    isLoading: { type: Boolean },
    isLoadingUpload: { type: Boolean },
  };

  // Navigate back to the Dashboard
  _goBack() {
    store.set('pdfSrc', null);
    router.navigate('/dashboard');
  }

  // Called when "Upload Excel" button is clicked
  _uploadExcel() {
    this.isLoadingUpload = true;
    // Create a temporary file input element for Excel files.
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xls,.xlsx';
    input.addEventListener('change', async (event) => {
      const file = event.target.files[0];
      if (!file) return;
      try {
        // Use ExcelMixin's fileToBase64 method to convert the file.
        const base64String = await this.fileToBase64(file);
        // Load the Excel data from the base64 string.
        const sheetData = await this.loadExcelFromBase64(base64String);
        // Optionally process the data (this method can be overridden in your component).
        const processedData = this.extractDataFromExcel(sheetData);
        // Render the Excel data as an HTML table.
        const tableHtml = this.renderExcelTable(processedData);
        // For demonstration, open a new window and display the table.
        const popup = window.open("", "_blank", "width=600,height=400");
        popup.document.write(tableHtml);
      } catch (error) {
        console.error("Error processing Excel file:", error);
        alert("There was an error processing the Excel file.");
      }
    });
    // Trigger the file dialog.
    input.click();
    this.isLoadingUpload = false;
  }

  // Called when "View Fund Fact Sheet" button is clicked
  async _viewFundFactSheet() {
    this.isLoading = true;
    const pdfUrl = "https://gllt.morningstar.com/awpurzgf31/snapshotpdf/default.aspx?SecurityToken=F00001GPT3]2]1]FOZAF$$ONS_2428&ClientFund=1&LanguageId=en-GB&CurrencyId=ZAR";
    try {
      // Call the backend endpoint via your service method to fetch the PDF data
      const pdfBlob = await this.pdfProxyService.fetchPdf(pdfUrl);
      const arrayBuffer = await pdfBlob.arrayBuffer();
      const pdfBytes = new Uint8Array(arrayBuffer);

      store.set('pdfSrc', { data: pdfBytes });
      router.navigate('/pdf');
    } catch (error) {
      console.error("Failed to fetch PDF:", error);
      // Handle error accordingly, e.g., show an alert to the user
    } finally {
      this.isLoading = false;
    }
  }

  // Called when "Add to Report" button is clicked
  _addToReport() {
    console.log("Add to Report clicked");
    // Implement functionality here
  }

  render() {
    return html`
      <!-- Header with back button -->
      <div class="header">
        <button class="back-button" @click="${this._goBack}">Back</button>
      </div>

      <!-- Main content with three action buttons -->
      <div class="content">
        <lottie-player
            src="https://assets4.lottiefiles.com/packages/lf20_pwohahvd.json"
            background="transparent"
            speed="1"
            style="width: 300px; height: 300px;"
            loop
            autoplay
        ></lottie-player>
        <button class="button" @click="${this._uploadExcel}">
          <img class="icon" src="${uploadingImage}" alt="Upload Icon" />
          ${this.isLoadingUpload ? 'Uploading...' : 'Upload Excel'}
        </button>
        <button class="button" @click="${this._viewFundFactSheet}">
          <img class="icon" src="${viewImage}" alt="Fund Fact Sheet Icon" />
            ${this.isLoading ? 'Loading...' : 'View Fund Fact Sheet'}
        </button>
        <button class="button" @click="${this._addToReport}">
          <img class="icon" src="${addImage}" alt="Add to Report Icon" />
          Add to Report
        </button>
      </div>
    `;
  }
}

customElements.define('fund-facts', FundFacts);