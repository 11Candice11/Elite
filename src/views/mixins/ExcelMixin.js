import * as XLSX from 'xlsx';
import { store } from '/src/store/EliteStore.js';

/**
 * ExcelMixin
 * A mixin to handle Excel file uploads, conversion to base64, extraction of data,
 * and optional rendering as an HTML table.
 *
 */
export const ExcelMixin = {

    /**
     * Converts a File object to a base64 string.
     * @param {File} file - The file to convert.
     * @returns {Promise<string>} - The base64 string representation.
     */
    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                // Split off the Data URL prefix if present.
                const result = reader.result;
                const base64 = result.includes(',') ? result.split(',')[1] : result;
                resolve(base64);
            };
            reader.onerror = (error) => reject(error);
            reader.readAsDataURL(file);
        });
    },

    /**
     * Converts a base64 string into an ArrayBuffer.
     * @param {string} base64 - The base64 string to convert.
     * @returns {ArrayBuffer} - The resulting ArrayBuffer.
     */
    base64ToArrayBuffer(base64) {
        const binaryString = atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    },

    /**
     * Loads an Excel file from a base64-encoded string and returns its sheet data as JSON.
     * @param {string} excelBase64 - The base64 string of the Excel file.
     * @returns {Promise<Array>} - An array of JSON objects representing the first sheet.
     */
    async loadExcelFromBase64(excelBase64) {
        try {
            // Convert the base64 string to an ArrayBuffer.
            const arrayBuffer = this.base64ToArrayBuffer(excelBase64);
            // Read the workbook using XLSX.
            const workbook = XLSX.read(arrayBuffer, { type: 'array' });
            // Get the first sheet name.
            const sheetName = workbook.SheetNames[0];
            // Convert the first sheet to JSON.
            const sheet = workbook.Sheets[sheetName];
            const sheetData = XLSX.utils.sheet_to_json(sheet);
            return sheetData;
        } catch (error) {
            console.error("Error loading Excel:", error);
            throw error;
        }
    },

    /**
     * Renders the given sheet data as an HTML table.
     * @param {Array} sheetData - The JSON data extracted from the Excel sheet.
     * @returns {string} - An HTML string representing the table.
     */
    renderExcelTable(sheetData) {
        if (!sheetData || sheetData.length === 0) {
            return '<p>No data available.</p>';
        }
        let tableHtml = `<table border="1" class="excel-table"><thead><tr>`;
        const headers = Object.keys(sheetData[0]);
        headers.forEach((header) => {
            tableHtml += `<th>${header}</th>`;
        });
        tableHtml += `</tr></thead><tbody>`;
        sheetData.forEach((row) => {
            tableHtml += `<tr>`;
            Object.values(row).forEach((cell) => {
                tableHtml += `<td>${cell}</td>`;
            });
            tableHtml += `</tr>`;
        });
        tableHtml += `</tbody></table>`;
        return tableHtml;
    },

    /**
     * Placeholder for additional data extraction logic.
     * Override this method in your consuming class if needed.
     * @param {Array} sheetData - The JSON data from the Excel file.
     * @returns {any} - Processed data.
     */
    extractDataFromExcel(sheetData) {
        // By default, return the raw sheet data.
        return sheetData;
    },
    
    // updatePortfolioRatings(portfolioId, period, value) {
    //     if (!this.portfolioRatings[portfolioId]) {
    //       this.portfolioRatings[portfolioId] = {
    //         Key: portfolioId,
    //         IsinNumber: portfolioId.split('::')[1] || 'N/A',
    //         InstrumentName: portfolioId.split('::')[0] || '',
    //         ClientId: this.clientID,
    //         LastUpdated: new Date().toISOString(),
    //         Rating6Months: '',
    //         Rating1Year: '',
    //         Rating3Years: ''
    //       };
    //     }
      
    //     if (period === 0.5) {
    //       this.portfolioRatings[portfolioId].Rating6Months = value;
    //     } else if (period === 1) {
    //       this.portfolioRatings[portfolioId].Rating1Year = value;
    //     } else if (period === 3) {
    //       this.portfolioRatings[portfolioId].Rating3Years = value;
    //     }
      
    //     this.portfolioRatings[portfolioId].LastUpdated = new Date().toISOString();
    //     store.set('portfolioRatings', this.portfolioRatings);
    //     this.requestUpdate();
    //   }
};

//   async _uploadExcel() {
//     this.isLoadingUpload = true;
//     console.log("Upload Excel triggered");

//     try {
//         const file = await this.selectExcelFile();
//         if (!file) {
//             console.warn("No file selected");
//             return;
//         }

//         const base64String = await this.fileToBase64(file);
//         const sheetData = await this.loadExcelFromBase64(base64String);

//         for (const row of sheetData) {
//             const name = row["Name"] || "";
//             const linkList = row["Links"] || "";

//             if (!name || !linkList) continue;

//             const links = linkList.split(',').map(link => link.trim());

//             for (const link of links) {
//                 try {
//                     const pdfBlob = await this.pdfProxyService.fetchPdf(link);
//                     const arrayBuffer = await pdfBlob.arrayBuffer();
//                     const pdfBytes = new Uint8Array(arrayBuffer);
//                     const pdf = await pdfjsLib.getDocument({ data: pdfBytes }).promise;

//                     let extractedText = '';
//                     for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
//                         const page = await pdf.getPage(pageNumber);
//                         const textContent = await page.getTextContent();
//                         const pageText = textContent.items.map(item => item.str).join(' ');
//                         extractedText += pageText + '\n';
//                     }

//                     const { oneYearValue } = this.extractReturns(extractedText);
//                     console.log(`Name: ${name}`);
//                     console.log(`Link: ${link}`);
//                     console.log(`1 Year Value: ${oneYearValue}`);
//                 } catch (error) {
//                     console.error(`Error processing PDF for ${name} at ${link}:`, error);
//                 }
//             }
//         }
//     } catch (error) {
//         console.error("Error processing Excel file:", error);
//         alert("There was an error processing the Excel file.");
//     } finally {
//         this.isLoadingUpload = false;
//     }
// }

// selectExcelFile() {
//     return new Promise((resolve) => {
//         const input = document.createElement('input');
//         input.type = 'file';
//         input.accept = '.xls,.xlsx';
//         input.style.display = 'none';
//         document.body.appendChild(input);

//         input.addEventListener('change', () => {
//             const file = input.files[0];
//             document.body.removeChild(input);
//             resolve(file);
//         });

//         input.click();
//     });
// }

// async processAllPdfs(linkValues) {
//     // Map each link to a promise that fetches and processes the PDF
//     const pdfPromises = linkValues.map(async (link) => {
//         try {
//             // Fetch the PDF blob for this link
//             const pdfBlob = await this.pdfProxyService.fetchPdf(link);
//             // Convert the Blob to an ArrayBuffer and then to a Uint8Array for PDF.js
//             const arrayBuffer = await pdfBlob.arrayBuffer();
//             const pdfBytes = new Uint8Array(arrayBuffer);

//             // Load the PDF document using pdfjsLib
//             const pdf = await pdfjsLib.getDocument({ data: pdfBytes }).promise;

//             // Extract text from each page of the PDF
//             let extractedText = '';
//             for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
//                 const page = await pdf.getPage(pageNumber);
//                 const textContent = await page.getTextContent();
//                 const pageText = textContent.items.map(item => item.str).join(' ');
//                 extractedText += pageText + '\n';
//             }

//             // Now extract 1 Year and 3 Years Annualised from the combined text
//             const { oneYearValue, threeYearValue } = this.extractReturns(extractedText);
//             console.log("Full PDF text:", extractedText);
//             console.log("1 Year Return:", oneYearValue);
//             console.log("3 Years Annualised Return:", threeYearValue);

//             console.log(`Processed PDF from link: ${link}`);
//             return { link, extractedText };
//         } catch (error) {
//             console.error(`Error processing PDF for link ${link}:`, error);
//             return null;
//         }
//     });

//     // Wait for all PDF processes to complete concurrently
//     const results = await Promise.all(pdfPromises);
//     // Filter out any null results (from errors)
//     const successfulResults = results.filter(result => result !== null);
//     console.log("All PDFs processed:", successfulResults);
//     return successfulResults;
// }

// extractFundFactsData(sheetData) {
//     console.log("Processing FundFacts Excel Data...");
//     // Get clientInfo from store (it should already be set)
//     const clientInfo = store.get('clientInfo');
//     if (!clientInfo || !clientInfo.detailModels) {
//         console.error("No clientInfo or detailModels available for matching.");
//         return;
//     }

//     // Initialize an empty ratings object.
//     const ratings = {};

//     // Define a simple fuzzy match function.
//     const fuzzyMatch = (str1, str2) => {
//         return str1.toLowerCase().includes(str2.toLowerCase()) || str2.toLowerCase().includes(str1.toLowerCase());
//     };

//     // Process each row from the excel.
//     sheetData.forEach(row => {
//         const name = row["Name"] || "";
//         const oneYear = row["1 Year"] || "";
//         const threeYear = row["3 Years Annualised"] || "";

//         console.log(`Processing row: Name = ${name}, 1 Year = ${oneYear}, 3 Years = ${threeYear}`);

//         // For each detail in clientInfo, check if instrumentName fuzzy matches the excel Name.
//         clientInfo.detailModels.forEach(detail => {
//             if (fuzzyMatch(detail.instrumentName, name)) {
//                 // Use the instrumentName as a unique key.
//                 ratings[detail.instrumentName] = {
//                     1: oneYear,
//                     3: threeYear,
//                 };
//                 console.log(`Matched "${detail.instrumentName}" with "${name}": 1 Year = ${oneYear}, 3 Years = ${threeYear}`);
//             }
//         });
//     });

//     // Store the mapped ratings to shared state.
//     store.set("portfolioRatings", (ratings));
//     return ratings;
// }

// extractReturns(extractedText) {
//     // If the PDF has "3 Years Annualised - - -", there's no numeric.
//     // You can store a default or skip.

//     // Example: a line-based approach

//     console.log("Extracting returns from PDF text...");
//     const lines = extractedText.split('\n');
//     let oneYearValue = "";
//     let threeYearValue = "";

//     for (const line of lines) {
//         if (line.toLowerCase().includes("1 year")) {    
//             // e.g. line: "1 Year 5.06 -5.61 1.07"
//             const parts = line.trim().split(/\s+/);
//             const idx = parts.findIndex(x => x.toLowerCase().includes("year"));
//             // The next token might be the 1-year return
//             oneYearValue = parts[idx + 1] ?? "";
//             // If it's "-", we can treat it as empty
//             if (oneYearValue === "-") oneYearValue = "";
//         }
//         if (line.toLowerCase().includes("3 years annualised")) {
//             // e.g. line: "3 Years Annualised - - -"
//             const parts = line.trim().split(/\s+/);
//             const idx = parts.findIndex(x => x.toLowerCase().includes("annualised"));
//             threeYearValue = parts[idx + 1] ?? "";
//             if (threeYearValue === "-") threeYearValue = "";
//         }
//     }
//     console.log("1 Year Return:", oneYearValue);
//     console.log("3 Years Annualised Return:", threeYearValue);

//     return { oneYearValue, threeYearValue };
// }