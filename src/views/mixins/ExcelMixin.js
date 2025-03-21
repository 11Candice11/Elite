import * as XLSX from 'xlsx';

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
  };