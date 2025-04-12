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
import * as fuzzball from 'fuzzball';

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
        this.portfolioRatings = {};

        this.pdfProxyService = new PdfRetrievalService();
        Object.assign(FundFacts.prototype, ExcelMixin);
    }

    static properties = {
        isLoading: { type: Boolean },
        isLoadingUpload: { type: Boolean },
        portfolioRatings: { type: Object },
    };

    // Navigate back to the Dashboard
    _goBack() {
        if (this.isLoadingUpload)
            return;

        store.set('pdfSrc', (null));
        router.navigate('/dashboard');
    }

    // Called when "Upload Excel" button is clicked
    async _uploadExcel() {
        this.isLoadingUpload = true;
        this.portfolioRatings = store.get('portfolioRatings') || {};

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
            const worksheet = workbook.Sheets[sheetName];
            const range = XLSX.utils.decode_range(worksheet['!ref']);
            let startRow = 0;

            for (let row = range.s.r; row <= range.e.r; row++) {
                for (let col = range.s.c; col <= range.e.c; col++) {
                    const cellAddress = { r: row, c: col };
                    const cellRef = XLSX.utils.encode_cell(cellAddress);
                    const cell = worksheet[cellRef];
                    if (cell?.v === 'Text') {
                        startRow = row;
                        break;
                    }
                }
                if (startRow) break;
            }

            const sheet = XLSX.utils.sheet_to_json(worksheet, { range: startRow });

            for (const row of sheet) {
                const isinFromExcel = row["Text"]?.trim();
                let rawLink = row["Link"] || row["Links"] || "";
                if (!rawLink) {
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

                const key = Object.keys(this.portfolioRatings).find(k => k.endsWith(`::${isinFromExcel}`));
                let fallbackKey = null;
                if (!key && row["Name"]) {
                    const fundName = row["Name"].trim().toLowerCase();
                    let bestScore = 0;
                    for (const k of Object.keys(this.portfolioRatings)) {
                        const namePart = k.split("::")[0].trim().toLowerCase();
                        const score = fuzzball.token_set_ratio(fundName, namePart);
                        if (score > bestScore && score > 80) {
                            bestScore = score;
                            fallbackKey = k;
                        }
                    }
                }
                const finalKey = key || fallbackKey;
                if (!finalKey) continue;

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

                        const oneYearMatch = fullText.match(/1 Year\s+([\d,.]+)/i);
                        const oneYearValue = oneYearMatch ? oneYearMatch[1] : null;

                        const sixMonthMatch = fullText.match(/6 Months\s+([\d,.]+)/i);
                        const sixMonthValue = sixMonthMatch ? sixMonthMatch[1] : null;

                        const threeYearMatch = fullText.match(/3 Years Annualised\s+([\d,.]+)/i);
                        const threeYearValue = threeYearMatch ? threeYearMatch[1] : null;

                        const ratingObj = this.portfolioRatings[finalKey] || {};

                        if (oneYearValue && oneYearValue !== "N/A" && oneYearValue.trim() !== "") {
                            ratingObj.Rating1Year = oneYearValue;
                        } else if (!ratingObj.Rating1Year) {
                            ratingObj.Rating1Year = ratingObj.Rating1Year || '';
                        }

                        if (threeYearValue && threeYearValue !== "N/A" && threeYearValue.trim() !== "") {
                            ratingObj.Rating3Years = threeYearValue;
                        } else if (!ratingObj.Rating3Years) {
                            ratingObj.Rating3Years = ratingObj.Rating3Years || '';
                        }

                        if (sixMonthValue && sixMonthValue !== "N/A" && sixMonthValue.trim() !== "") {
                            ratingObj.Rating6Months = sixMonthValue;
                        } else if (!ratingObj.Rating6Months) {
                            ratingObj.Rating6Months = ratingObj.Rating6Months || '';
                        }

                        const existingRatings = this.portfolioRatings[finalKey] || {};
                        this.portfolioRatings[finalKey] = {
                          ...existingRatings,
                          Rating6Months: (ratingObj.Rating6Months && ratingObj.Rating6Months.trim() !== '') ? ratingObj.Rating6Months : existingRatings.Rating6Months,
                          Rating1Year: (ratingObj.Rating1Year && ratingObj.Rating1Year.trim() !== '') ? ratingObj.Rating1Year : existingRatings.Rating1Year,
                          Rating3Years: (ratingObj.Rating3Years && ratingObj.Rating3Years.trim() !== '') ? ratingObj.Rating3Years : existingRatings.Rating3Years
                        };

                        this.requestUpdate();
                    } catch (error) {
                        console.error(`❌ Failed to process PDF for ISIN ${isinFromExcel}:`, error);
                    }
                }
            }

            store.set('portfolioRatings', this.portfolioRatings);
            this.requestUpdate();
        } catch (err) {
            console.error("❌ Error reading Excel file:", err);
        } finally {
            this.isLoadingUpload = false;
        }
    }

    // updateTextFieldsWithExtractedData(ratingsMap) {
    //     const clientInfo = store.get("clientInfo");
    //     if (!clientInfo?.detailModels) return;

    //     for (const detail of clientInfo.detailModels) {
    //         for (const entry of detail.portfolioEntryTreeModels || []) {
    //             const isin = entry.isinNumber;
    //             const rating = ratingsMap[isin];

    //             if (rating) {
    //                 if (rating["1"]) {
    //                     this.portfolioRatings[isin] = this.portfolioRatings[isin] || {};
    //                     this.portfolioRatings[isin][1] = rating["1"];
    //                 }
    //                 if (rating["3"]) {
    //                     this.portfolioRatings[isin] = this.portfolioRatings[isin] || {};
    //                     this.portfolioRatings[isin][3] = rating["3"];
    //                 }
    //                 if (rating["6m"]) {
    //                     this.portfolioRatings[isin] = this.portfolioRatings[isin] || {};
    //                     this.portfolioRatings[isin][0.5] = rating["6m"];
    //                 }
    //             }
    //         }
    //     }

    //     store.set('portfolioRatings', this.portfolioRatings);
    //     this.requestUpdate();
    // }

    // Called when "View Fund Fact Sheet" button is clicked
    async _viewFundFactSheet() {
        this.isLoading = true;
        const pdfUrl = "https://gllt.morningstar.com/awpurzgf31/snapshotpdf/default.aspx?SecurityToken=F00001GPT3]2]1]FOZAF$$ONS_2428&ClientFund=1&LanguageId=en-GB&CurrencyId=ZAR";
        try {
            const pdfBlob = await this.pdfProxyService.fetchPdf(pdfUrl);
            const arrayBuffer = await pdfBlob.arrayBuffer();
            const pdfBytes = new Uint8Array(arrayBuffer);

            store.set('pdfSrc', ({ data: pdfBytes }));
            router.navigate('/pdf');
        } catch (error) {
            console.error("Failed to fetch PDF:", error);
        } finally {
            this.isLoading = false;
        }
    }

    // Called when "Add to Report" button is clicked
    _addToReport() {
        console.log("Add to Report clicked");
    }

    _apply() {
        console.log("Apply Report clicked");
    }

    render() {
        return html`
      <!-- Header with back button -->
      <div class="header">
        <button ?diabled="${this.isLoadingUpload}" class="back-button ${this.isLoadingUpload ? `disabled` : ``}" @click="${this._goBack}">Back</button>
      </div>

      <!-- Main content with three action buttons -->
      <div class="content">
        ${this.isLoadingUpload ? this._renderLoading() : this._renderLottie()}
        <button class="button" @click="${this._uploadExcel}">
          <img class="icon" src="${uploadingImage}" alt="Upload Icon" />
          ${this.isLoadingUpload ? 'Uploading...' : 'Upload Excel'}
        </button>
        <button ?disabled=${false} class="button" @click="${this._viewFundFactSheet}">
          <img class="icon" src="${viewImage}" alt="Fund Fact Sheet Icon" />
            ${this.isLoading ? 'Loading...' : 'View Fund Fact Sheet'}
        </button>
        <button ?disabled=${false}  class="button" @click="${this._apply}">
          <img class="icon" src="${addImage}" alt="Add to Report Icon" />
          Apply
        </button>
      </div>
    `;
    }

    _renderLoading() {
        return html`
        <lottie-player
            src="https://assets4.lottiefiles.com/packages/lf20_myejiggj.json"
            background="transparent"
            speed="1"
            style="width: 300px; height: 300px;"
            loop
            autoplay
        ></lottie-player>
        `;
    }

    _renderLottie() {
        return html`
        <lottie-player
            src="https://assets4.lottiefiles.com/packages/lf20_pwohahvd.json"
            background="transparent"
            speed="1"
            style="width: 300px; height: 300px;"
            loop
            autoplay
        ></lottie-player>
        `;
    }
}

customElements.define('fund-facts', FundFacts);