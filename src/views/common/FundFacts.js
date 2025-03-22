import { LitElement, html, css } from 'lit';
import { router } from '/src/shell/Routing.js';
import uploadingImage from '/src/images/upload.svg';
import viewImage from '/src/images/view.svg';
import addImage from '/src/images/add.svg';
import { ViewBase } from '/src/views/common/ViewBase.js';
import { PdfRetrievalService } from '/src/services/PdfRetrievalService.js';
import { store } from '/src/store/EliteStore.js';
import * as XLSX from 'xlsx';
import '@lottiefiles/lottie-player';
import { ExcelMixin } from '/src/views/mixins/ExcelMixin.js';
import * as pdfjsLib from 'pdfjs-dist/build/pdf.js';

pdfjsLib.GlobalWorkerOptions.workerSrc =
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.15.349/pdf.worker.min.js';

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
      background: #0077b6;
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

    .disabled {
        background: #ccc;
        color: black;
        cursor: not-allowed;
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
        store.set('pdfSrc', (null));
        router.navigate('/dashboard');
    }

    // Called when "Upload Excel" button is clicked
    async _uploadExcel() {
        this.isLoadingUpload = true;

        const file = await new Promise((resolve) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.xls,.xlsx';
            input.addEventListener('change', () => {
                resolve(input.files[0]);
            });
            input.click();
        });

        if (!file) {
            console.warn("No file selected.");
            this.isLoadingUpload = false;
            return;
        }

        try {
            const base64String = await this.fileToBase64(file);
            const arrayBuffer = this.base64ToArrayBuffer(base64String);
            const workbook = XLSX.read(arrayBuffer, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

            for (const row of sheet) {
                const name = row["Name"] || row["Fund Fact Sheets"] || "Unknown";
                let rawLink = row["Link"] || row["Links"] || "";

                if (!rawLink) {
                  // Try to find it in any property that contains a URL
                  for (const value of Object.values(row)) {
                    if (typeof value === "string" && value.includes("http")) {
                      rawLink = value;
                      break;
                    }
                  }
                }

                const links = rawLink
                .split(',')
                .map(link => {
                  const match = link.match(/https?:\/\/[^\s]+/); // extract first http/https URL
                  return match ? match[0] : null;
                })
                .filter(Boolean);
                
                for (const link of links) {
                    try {
                        const pdfBlob = await this.pdfProxyService.fetchPdf(link);
                        const arrayBuffer = await pdfBlob.arrayBuffer();
                        const pdfBytes = new Uint8Array(arrayBuffer);
                        const pdf = await pdfjsLib.getDocument({ data: pdfBytes }).promise;

                        let fullText = '';
                        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                          const page = await pdf.getPage(pageNum);
                          const textContent = await page.getTextContent();
                          const pageText = textContent.items.map(item => item.str).join(' ');
                          fullText += pageText + '\n';
                        }

                        // Try to extract the "1 Year" return value
                        let oneYearValue = null;
                        const match = fullText.match(/1 Year\s+([\d,.]+)/i);
                        if (match) {
                          oneYearValue = match[1];
                          console.log(`📊 "${name}" - 1 Year Return: ${oneYearValue}`);
                        } else {
                          console.warn(`⚠️ "${name}" - Could not find '1 Year' return value.`);
                        }
                        
                        // Extract "6 Months" return value
                        const match6M = fullText.match(/6 Months\s+([\d,.]+)/i);
                        if (match6M) {
                          const sixMonthValue = match6M[1];
                          console.log(`📊 "${name}" - 6 Months Return: ${sixMonthValue}`);
                        } else {
                          console.warn(`⚠️ "${name}" - Could not find '6 Months' return value.`);
                        }

                        // Extract "3 Years Annualised" return value
                        const match3Y = fullText.match(/3 Years Annualised\s+([\d,.]+)/i);
                        if (match3Y) {
                          const threeYearValue = match3Y[1];
                          console.log(`📊 "${name}" - 3 Years Annualised Return: ${threeYearValue}`);
                        } else {
                          console.warn(`⚠️ "${name}" - Could not find '3 Years Annualised' return value.`);
                        }
                    } catch (pdfErr) {
                        console.error(`❌ Failed to fetch PDF for "${name}" from ${link}`, pdfErr);
                    }
                }
            }
        } catch (err) {
            console.error("❌ Error reading Excel file:", err);
        } finally {
            this.isLoadingUpload = false;
        }
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

            store.set('pdfSrc', ({ data: pdfBytes }));
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

    _apply() {
        console.log("Apply Report clicked");
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
        <button ?disabled=${false} class="button" @click="${this._viewFundFactSheet}">
          <img class="icon" src="${viewImage}" alt="Fund Fact Sheet Icon" />
            ${this.isLoading ? 'Loading...' : 'View Fund Fact Sheet'}
        </button>
        <!-- <button ?disabled=${true}  class="button disabled" @click="${this._addToReport}">
          <img class="icon" src="${addImage}" alt="Add to Report Icon" />
          Add to Report
        </button> -->
        <button ?disabled=${false}  class="button" @click="${this._apply}">
          <img class="icon" src="${addImage}" alt="Add to Report Icon" />
          Apply
        </button>
      </div>
    `;
    }
}

customElements.define('fund-facts', FundFacts);