import { html, css } from 'lit';
import { router } from '/src/shell/Routing.js'
import { ClientProfileService } from '/src/services/ClientProfileService.js';
import { PdfRetrievalService } from '/src/services/PdfRetrievalService.js';
import user from '/src/images/user.png';
import logo from '/src/images/page-Logo-full.png'; 
import { userInfoMixin } from '/src/views/mixins/UserInfoMixin.js';
import { store } from '/src/store/EliteStore.js';
import { ViewBase } from './common/ViewBase.js';
import { PdfMixin } from '/src/views/mixins/PDFMixin.js';
import * as XLSX from 'xlsx';
import { ExcelMixin } from '/src/views/mixins/ExcelMixin.js';
import * as fuzzball from 'fuzzball'; // You must install this with npm install fuzzball

class Dashboard extends ViewBase {
  static styles = [
    super.styles,
    css`
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

  .overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999;
  }

  .popup {
    position: fixed;
    top: 25%;
    left: 50%;
    transform: translate(-50%, -25%);
    width: 50%;
    max-width: 500px;
    background: white;
    border: 2px solid #0077b6;
    padding: 20px;
    border-radius: 8px;
    z-index: 1000;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }

  .popup-content {
    max-height: 300px; /* Adjust as needed */
    overflow-y: auto;
    padding: 10px;
    border-radius: 5px;
    background: #f9f9f9;
  }

  .popup button {
    margin-top: 10px;
    background: #0077b6;
    color: white;
    padding: 8px 15px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: logo 0.3s ease;
  }

  .popup button:hover {
    background: #005f8a;
  }

  /* Search Bar Container */
  .search-container {
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    transition: all 0.5s ease-in-out;
  }

  /* Moves search bar to top left */
  .search-container.moved {
    position: fixed;
    top: 10px;
    left: 10px;
    transform: none;
    background: #0077b6;
    padding: 10px;
    border-radius: 5px;
  }

  .search-container input {
    padding: 10px;
    border-radius: 5px;
    border: 1px solid #ccc;
    width: 300px;
    text-align: center;
    font-size: 16px;
  }

  .search-container.moved input {
    background: white;
    color: black;
  }

  .search-container button {
    margin-left: 10px;
    padding: 10px 15px;
    border: none;
    border-radius: 5px;
    background: #005f8a;
    color: white;
    cursor: pointer;
    transition: background 0.3s ease;
  }

  .search-container button:hover {
    background: #004b70;
  }

  .loading {
    font-size: 18px;
    font-weight: bold;
    color: #0077b6;
    margin-top: 60px;
  }

  .content-container {
    display: none;
    flex-direction: row;
    gap: 20px;
    padding: 20px;
    margin-top: 80px;
    width: 90%;
    transition: all 0.5s ease-in-out;
  }

  .content-container.visible {
    display: flex;
  }

  .portfolio-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .portfolio-card {
    background: #ffffff;
    border: 1px solid #dcdcdc;
    border-radius: 8px;
    padding: 15px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .portfolio-card h3 {
    color: #0077b6;
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

  .logout-button {
    position: absolute;
    top: 10px;
    right: 10px;
    background: #ff4d4d;
    color: white;
    padding: 8px 15px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background 0.3s ease;
  }

  .logout-button:hover {
    background: #cc0000;
  }
  .service-unavailable {
    font-size: 20px;
    font-weight: bold;
    color: red;
    margin-top: 20px;
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

/* Watermark Styling */
.watermark {
  position: absolute;
  top: 60%;
  left: 50%;
  transform: translate(-50%, -50%); /* Center the watermark */
  opacity: 0.05; /* Faded effect */
  z-index: 1; /* Behind the content */
  pointer-events: none; /* Ensure it's non-interactive */
}

.watermark img {
  max-width: 80%; /* Responsive size */
  height: auto;
}
.report-btn {
  margin-top: 25px;
}

.popup.excel-popup {
  position: fixed;
  top: 20%;
  left: 50%;
  transform: translate(-50%, -20%);
  width: 60%;
  max-width: 700px; /* Adjust max width */
  max-height: 80vh; /* Ensure it doesn't get too big */
  background: white;
  border: 2px solid #0077b6;
  padding: 20px;
  border-radius: 8px;
  z-index: 1000;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  overflow: hidden; /* Prevents full overflow */
  display: flex;
  flex-direction: column;
}

.popup-content.excel-content {
  flex-grow: 1; /* Allows content to take available space */
  max-height: 60vh; /* Limits the content height */
  overflow-y: auto; /* Enables scrolling if content is too large */
  padding: 10px;
  border-radius: 5px;
  background: #f9f9f9;
}

/* Overlay for dimming the background */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6); /* Semi-transparent background */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

/* Dialog Container */
.dialog-content {
  background: white;
  border-radius: 12px;
  width: 400px;
  padding: 25px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  border: 2px solid rgb(0, 50, 100);
  animation: fadeIn 0.4s ease-in-out;
}

/* Dialog Heading */
.dialog-content h3 {
  color: rgb(0, 50, 100);
  margin-bottom: 20px;
  font-size: 20px;
  text-align: center;
}

/* Options Section */
.dialog-options label {
  display: flex;
  align-items: center;
  margin: 10px 0;
  font-weight: bold;
  color: black;
}

.dialog-options input[type="checkbox"] {
  margin-right: 10px;
  accent-color: rgb(0, 50, 100); /* Checkbox color */
}

/* IRR Input Styling */
.dialog-options input[type="number"] {
  width: 70px;
  padding: 5px;
  margin-left: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  outline: none;
  transition: border 0.3s ease;
}

.dialog-options input[type="number"]:focus {
  border-color: rgb(0, 50, 100);
}

/* Action Buttons */
.dialog-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.dialog-actions button {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s ease;
}
.date-list {
  max-height: 250px; /* Adjust height to prevent overflow */
  overflow-y: auto;  /* Enables scrolling */
  padding: 0;
  margin: 10px 0;
  list-style-type: none; /* Removes bullets */
}
  .fund-facts-btn {
    // position: absolute;
    // top: 10px;
    // right: 100px;
    color: white;
    padding: 8px 15px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background 0.3s ease;
  }
  .toast {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: #0077b6;
    color: white;
    padding: 12px 20px;
    border-radius: 6px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    font-weight: bold;
    z-index: 9999;
    animation: fadeInOut 3s ease-in-out;
  }
  @keyframes fadeInOut {
    0% { opacity: 0; transform: translateX(-50%) translateY(10px); }
    10% { opacity: 1; transform: translateX(-50%) translateY(0); }
    90% { opacity: 1; }
    100% { opacity: 0; transform: translateX(-50%) translateY(10px); }
  }
    `];

  static properties = {
    clientID: { type: String },
    clientInfo: { type: Object },
    showPopup: { type: Boolean },
    selectedDates: { type: Array },
    selectedPortfolio: { type: Object },
    rootValueDateModels: { type: Array },
    customDate: { type: String },
    searchCompleted: { type: Boolean },
    showDialog: { type: Boolean },
    showExcel: { type: Boolean },
    isLoading: { type: Boolean },
    expandedCards: { type: Object },
    transactionDateStart: { type: String },
    excelSrc: { type: String },
    transactionDateEnd: { type: String },
    serviceUnavailable: { type: Boolean },
    performanceData: { type: Object },
    portfolioRatings: { type: Object },
    currentPage: { type: Number },
    datesPerPage: { type: Number },
  };

  constructor() {
    super();
    this.clientID = '';
    this.oneYear = '';
    this.threeYears = '';
    this.clientInfo = store.get('clientInfo') || {};
    this.selectedPortfolio = store.get('selectedPortfolio') || null;
    this.showPopup = false;
    this.selectedDates = [];
    this.customDate = '';
    this.searchCompleted = false;
    this.isLoading = false;
    this.showExcel = false;
    this.expandedCards = {};
    this.changedIsins = new Set();
    this.serviceUnavailable = false;
    this.portfolioRatings = {}; // One Year, Three Year
    this.excelSrc = ``;
    this.currentPage = 0;
    this.datesPerPage = 10;
    this.toastMessage = '';
    this.reportOptions = {
      contributions: true,
      withdrawals: true,
      regularWithdrawals: true,
      regularContributions: true,
      interactionHistory: true,
      includePercentage: true,
      irr: 7.0,
      currency: "ZAR"
    };

    this.clientProfileService = new ClientProfileService();
    this.pdfProxyService = new PdfRetrievalService();
    this.transactionDateStart = new Date(new Date().setMonth(new Date().getMonth() - 3)).toISOString();
    this.transactionDateEnd = new Date().toISOString();
    Object.assign(Dashboard.prototype, PdfMixin);
    Object.assign(Dashboard.prototype, userInfoMixin);
    Object.assign(Dashboard.prototype, ExcelMixin);
  }

  async connectedCallback() {
    super.connectedCallback();
    const storedClientInfo = store.get('clientInfo');
    if (storedClientInfo) {
      this.isLoading = true;
      this.clientID = store.get('searchID') ?? this.clientID ?? ``;
      this.selectedDates = await this._getDates();
      this.clientInfo = storedClientInfo;
      try {
        let savedRatings = store.get('portfolioRatings');
        
        if (!savedRatings || Object.keys(savedRatings).length === 0) {
          try {
            const fetchedRatings = await this.pdfProxyService.getAllRatings();    
            const newRatings = {};
            for (const [key, data] of Object.entries(fetchedRatings)) {
              newRatings[key] = {
                ...data,
                Rating6Months: data.Rating6Months ?? data.rating6Months ?? '',
                Rating1Year: data.Rating1Year ?? data.rating1Year ?? '',
                Rating3Years: data.Rating3Years ?? data.rating3Years ?? ''
              };
            }
            this.portfolioRatings = { ...newRatings };
            store.set('portfolioRatings', this.portfolioRatings);
          } catch (e) {
            console.warn("⚠️ Could not load saved ratings from backend, keeping local store values:", e);
            this.portfolioRatings = { ...store.get('portfolioRatings') };
          }
        } else {
          this.portfolioRatings = { ...savedRatings };
        }
      } catch (e) {
        console.warn("Unexpected error while loading portfolio ratings:", e);
      }
      if (!this.portfolioRatings) this.portfolioRatings = {};
      this.searchCompleted = true;
      this.isLoading = false;
      this.updateTextfields();
      this.requestUpdate();
    }
  }

  navigateToRootTransactions(portfolio) {
    this.selectedPortfolio = portfolio;
    const detail = this.clientInfo.detailModels.find(
      (d) => d.instrumentName === this.selectedPortfolio.instrumentName
    );
    store.set('rootValueDateModels', detail?.rootValueDateModels || []);
    store.set('selectedPortfolio', this.selectedPortfolio);
    super.navigateToRootTransactions();
    // router.navigate('/transaction-history');
  }

  navigateToTransactions(portfolio) {
    this.selectedPortfolio = portfolio;
    store.set('selectedPortfolio', portfolio);
    super.navigateToTransactions()
    // router.navigate('/transactions');
  }

  navigateToStats(portfolio) {
    this.selectedPortfolio = portfolio;
    const detail = this.clientInfo.detailModels.find(
      (d) => d.instrumentName === this.selectedPortfolio.instrumentName
    );
    store.set('rootValueDateModels', detail?.rootValueDateModels || []);
    store.set('selectedPortfolio', this.selectedPortfolio);
    super.navigateToStats();
  }

  getRatingColor(lastUpdated) {
    if (!lastUpdated) return 'red';
    const updated = new Date(lastUpdated);
    const now = new Date();
    const diffMs = now - updated;
    const diffHours = diffMs / (1000 * 60 * 60);
    return diffHours <= 1 ? 'green' : 'red';
  }

  async _handleUpdateRatings(portfolio) {
    for (const entry of portfolio.portfolioEntryTreeModels) {
      const isin = entry.isinNumber || 'N/A';
      const key = `${entry.instrumentName}::${isin}`;
      const currentRatings = this.portfolioRatings[key] || {};
      const Rating6Months = currentRatings.Rating6Months.toString() ?? "0";
      const Rating1Year = currentRatings.Rating1Year.toString() ?? "0";
      const Rating3Years = currentRatings.Rating3Years.toString() ?? "0";

      const payload = {
        Key: key,
        IsinNumber: isin,
        InstrumentName: entry.instrumentName,
        ClientId: this.clientID,
        LastUpdated: new Date().toISOString(),
        Rating6Months,
        Rating1Year,
        Rating3Years
      };

      try {
        await this.pdfProxyService.updatePortfolioRatings(key, payload);

        // Save locally as well
        this.portfolioRatings[key] = {
          Key: key,
          InstrumentName: entry.instrumentName,
          ClientId: this.clientID,
          LastUpdated: payload.LastUpdated,
          Rating6Months: payload.Rating6Months,
          Rating1Year: payload.Rating1Year,
          Rating3Years: payload.Rating3Years
        };
      } catch (error) {
        console.warn(`❌ Failed to update ratings for ${isin}`, error);
      }
    }

    this.requestUpdate();
    alert("✅ Ratings updated and saved!");
    this.changedIsins.clear();
  }
  
  async searchClient() {
    if (!this.clientID.trim()) return;

    this.selectedDates = [];
    this.isLoading = true;
    this.clientInfo = null;
    this.searchCompleted = false;

    store.set('selectedDates', []);

    try {

      this.clientInfo = await this.getClientInfo(this.clientID);

      if (this.clientInfo) {
        store.set("searchID", this.clientID);
        store.set("clientInfo", this.clientInfo);
        this.searchCompleted = true;
        this.showPopup = true;
        this.selectedDates = await this._getDates();
      } else {
        console.error("Service returned no data.");
        this.serviceUnavailable = true;
        router.navigate('/service-unavailable');
      }
    } catch (error) {
      console.error("Error fetching client:", error);
      this.serviceUnavailable = true;
      router.navigate('/service-unavailable');
    } finally {
      this.isLoading = false;
      this.requestUpdate();
    }
  }

  updateOption(e, option) {
    const { type, checked, value } = e.target;
    if (type === `text`) {
      this.reportOptions.currency = value;
    } else {
      this.reportOptions = {
        ...this.reportOptions,
        [option]: type === 'checkbox' ? checked : parseFloat(value),
      };
    }
  }

  toggleExpand(index) {
    this.expandedCards = {
      ...this.expandedCards,
      [index]: !this.expandedCards[index],
    };
  }

  togglePopup() {
    this.showPopup = !this.showPopup;
    this.isLoading = false;
  }

  async _getDates() {
    const storeDates = store.get('selectedDates');
    if (storeDates !== undefined && storeDates.length > 0) return storeDates;
    this.showPopup = true;
    const dates = [
      "2022-05-14",
      "2023-09-23",
      "2024-01-08"
    ];

    try {

      const returnValue = await this.clientProfileService.getClientData(this.clientID);
      if (returnValue[0]?.listDates) {
        this.isLoading = false;
        return returnValue[0].listDates;
      }
      this.isLoading = false;
      return dates;
    } catch (error) {
      console.error("Error fetching client:", error);
      this.isLoading = false;
      return dates;
    }
  }

  handleDateSelection(option) {
    const earliestInceptionDate = this.clientInfo?.detailModels
      ?.map(detail => new Date(detail.inceptionDate)) // Convert to Date objects
      .reduce((earliest, current) => (current < earliest ? current : earliest), new Date());

    const inceptionDate = new Date(earliestInceptionDate);
    const today = new Date();
    const dates = [];

    const months = {
      'Jan': [0],
      'Jan|Jun': [0, 5],
      'Jan|Jun|Oct': [0, 5, 9]
    };

    for (let year = today.getFullYear(); year >= inceptionDate.getFullYear(); year--) {
      months[option].forEach(month => {
        const date = new Date(year, month, 1);
        if (date >= inceptionDate && date <= today) {
          dates.push(date.toISOString().split('T')[0]);
        }
      });
    }

    this.selectedDates = [...new Set([...this.selectedDates, ...dates])];
    this.requestUpdate();
  }

  addCustomDate() {
    if (this.customDate && !this.selectedDates.includes(this.customDate)) {
      this.selectedDates = [...this.selectedDates, this.customDate];
      this.customDate = '';
    }
  }

  async handleNext() {
    this.isLoading = true;

    const earliestInceptionDate = this.clientInfo?.detailModels
      ?.map(detail => new Date(detail.inceptionDate)) // Convert to Date objects
      .reduce((earliest, current) => (current < earliest ? current : earliest), new Date());

    this.clientInfo = await this.getClientInfo(this.clientID, earliestInceptionDate.toISOString().split('T')[0], this.selectedDates.map(date => `${date}T00:00:00`));

    // store.set('selectedDates', this.selectedDates);

    const dates = store.get('selectedDates');
    if (dates === undefined || JSON.stringify(dates) != JSON.stringify(this.selectedDates)) {
      store.set('selectedDates', this.selectedDates);
      const consultant = localStorage.getItem("username"); // store.get('username');
      try {
        await this.clientProfileService.addClientData(this.clientID, this.selectedDates, consultant);
      } catch (error) {
        this.isLoading = false;
        console.error("Error updating client data:", error);
      }
    }

    this.showPopup = false;

    try {
      const savedRatings = await this.pdfProxyService.getSavedRatings();
      if (savedRatings && typeof savedRatings === 'object') {
        const newRatings = {};
        for (const [isin, data] of Object.entries(savedRatings)) {
          const key = data.Key ?? isin;
          newRatings[key] = {
            ...data,
            Rating6Months: data.Rating6Months ?? data.rating6Months ?? '',
            Rating1Year: data.Rating1Year ?? data.rating1Year ?? '',
            Rating3Years: data.Rating3Years ?? data.rating3Years ?? ''
          };
        }
        this.portfolioRatings = { ...newRatings };
        store.set('portfolioRatings', this.portfolioRatings);
      }
    } catch (e) {
      console.warn("⚠️ Could not load saved ratings from backend:", e);
    }
    this.requestUpdate();

    this.isLoading = false;
  }

  updatePortfolioRatings(portfolioId, period, value) {
    if (!this.portfolioRatings) this.portfolioRatings = {};
  
    const existing = this.portfolioRatings[portfolioId] || {
      Rating6Months: '',
      Rating1Year: '',
      Rating3Years: '',
      Key: portfolioId,
      InstrumentName: '',  // you can fill this properly if needed
      IsinNumber: '',
      ClientID: this.clientID,
      LastUpdated: new Date().toISOString()
    };
  
    // Update correct rating field
    if (period === 0.5) existing.Rating6Months = value || "0";
    else if (period === 1) existing.Rating1Year = value || "0";
    else if (period === 3) existing.Rating3Years = value || "0";
  
    existing.LastUpdated = new Date().toISOString();
  
    this.portfolioRatings[portfolioId] = { ...existing };
    
    store.set('portfolioRatings', this.portfolioRatings);
    this.requestUpdate();
  }

  logout() {
    store.set("clientInfo", null);
    store.set("searchID", null);
    store.set('selectedDates', null);
    store.set("username", null);
    this.clientID = '';
    this.clientInfo = null;
    this.searchCompleted = false;
    this.isLoading = false;
    super.navigateToLogin();
    // router.navigate('/login');
  }

  async handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Detect file type
    const fileType = file.name.endsWith('.pdf') ? 'pdf' : file.name.endsWith('.xls') || file.name.endsWith('.xlsx') ? 'excel' : 'unknown';

    if (fileType === 'unknown') {
      alert('Unsupported file format! Please upload a PDF or Excel file.');
      return;
    }

    const base64String = await this.fileToBase64(file);

    if (fileType === 'pdf') {
      this.pdfSrc = `data:application/pdf;base64,${base64String}`;
      this.generateReport(); // Call function to load PDF
    } else if (fileType === 'excel') {
      this.excelSrc = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${base64String}`;
      this.loadExcel(); // Call function to process Excel
      this.populateDashboardFieldsFromExcel(); // New method to match fields by name
    }
  }


  async loadExcel() {
    try {
      // Convert Base64 to ArrayBuffer
      const arrayBuffer = this.base64ToArrayBuffer(this.excelSrc.split(",")[1]);

      // Read Excel data
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0]; // Get the first sheet
      const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
      this.renderedSheetData = sheet; // Store for later field mapping

      if (sheet.length === 0) {
        console.error("❌ Excel file is empty.");
        return;
      }

      // Store the extracted values in `portfolioRatings`
      this.extractPortfolioRatings(sheet);

      this.showExcel = true;
      await this.requestUpdate();
      this.renderExcel(sheet);

    } catch (error) {
      console.error("❌ Error loading Excel:", error);
    }
  }

  populateDashboardFieldsFromExcel() {
    const sheetData = this.renderedSheetData;
    if (!sheetData || sheetData.length === 0) return;

    for (const row of sheetData) {
      const name = row["Name"]?.trim();
      const value = row["12 Month Return"] || row["1 Year"] || "";
      const threeYear = row["36 Month Return (ann)"] || row["3 Years Annualised"] || "";

      if (!name) continue;

      // Find matching portfolio entry by Name
      for (const detail of this.clientInfo.detailModels || []) {
        if (!detail.portfolioEntryTreeModels) continue;

        for (const entry of detail.portfolioEntryTreeModels) {
          if (entry.instrumentName?.trim() === name) {
            const isin = entry.isinNumber;
            const key = `${entry.instrumentName}::${isin || 'N/A'}`;
            this.updatePortfolioRatings(key, 1, value);
            this.updatePortfolioRatings(key, 3, threeYear);
          }
        }
      }
    }

    this.requestUpdate();
  }

  extractPortfolioRatings(sheetData) {
    const portfolioRatings = this.portfolioRatings || {};
    const allEntries = this.clientInfo?.detailModels?.flatMap(d => d.portfolioEntryTreeModels || []) || [];

    sheetData.forEach(row => {
      const oneYear = row["12 Month Return"] || row["1 Year"] || "";
      const threeYears = row["36 Month Return (ann)"] || row["3 Years Annualised"] || "";
      const extractedIsin = row["ExportFile_TenforeId"]?.substring(5)?.trim();
      const rowName = (row["Legal Name"] || row["Name"] || "").trim();

      let matchedEntry = null;

      // Try to match by ISIN first
      if (extractedIsin) {
        matchedEntry = allEntries.find(e => e.isinNumber === extractedIsin);
      }

      // If ISIN not matched, fallback to fuzzy matching by name
      if (!matchedEntry && rowName) {
        let bestScore = 0;
        for (const entry of allEntries) {
          const score = fuzzball.token_set_ratio(entry.instrumentName.toLowerCase(), rowName.toLowerCase());
          if (score > bestScore && score > 80) {
            bestScore = score;
            matchedEntry = entry;
          }
        }
      }

      if (matchedEntry) {
        const key = `${matchedEntry.instrumentName}::${matchedEntry.isinNumber || 'N/A'}`;
        portfolioRatings[key] = {
          ...(portfolioRatings[key] || {}),
          Rating1Year: oneYear,
          Rating3Years: threeYears,
          InstrumentName: matchedEntry.instrumentName,
          IsinNumber: matchedEntry.isinNumber,
          Key: key,
          LastUpdated: new Date().toISOString()
        };
      }
    });

    this.portfolioRatings = portfolioRatings;
    store.set('portfolioRatings', this.portfolioRatings);
    this.requestUpdate();
  }

  updateTextfields() {
    const ratings = store.get("portfolioRatings");
    if (ratings) {
      this.portfolioRatings = ratings;
      this.requestUpdate();
    } else {
      console.warn("No portfolioRatings found in store.");
    }
  }

  async generateReport(portfolio = null) {
    this.showDialog = !this.showDialog;

    this.selectedPortfolio = portfolio ?? this.selectedPortfolio;

    if (!this.showDialog) {
      let clientInformation = JSON.parse(JSON.stringify(this.clientInfo)); // Deep copy to avoid mutation
      if (this.selectedPortfolio) {
        clientInformation.detailModels = [this.selectedPortfolio]; // Modify only the copy
      }
      store.set(`reportOptions`, this.reportOptions);
      var base64 = await this.generatePDF(clientInformation, this.clientID, this.portfolioRatings); // Generate the PDF
      store.set('base64', base64);
      store.set('currentRoute', 'dashboard');
      router.navigate(`/pdf`); // Navigate to the PDF viewer  
    }
  }

  generateClientReport() {
    this.showDialog = false;
  }

  fundFacts() {
    this.showDialog = false;
    this.isLoading = true;
    store.set('selectedPortfolio', this.selectedPortfolio);
    store.set('currentRoute', 'fund-facts');
    router.navigate('/fund-facts');
  }

  getPaginatedDates() {
    const start = this.currentPage * this.datesPerPage;
    return this.selectedDates.slice(start, start + this.datesPerPage);
  }

  changePage(direction) {
    const maxPage = Math.ceil(this.selectedDates.length / this.datesPerPage) - 1;
    if (direction === "next" && this.currentPage < maxPage) {
      this.currentPage++;
    } else if (direction === "prev" && this.currentPage > 0) {
      this.currentPage--;
    }
    this.requestUpdate();
  }

  acceptExcel() {
    this.showExcel = false;

    // TODO
    // add logic to read from Excel

    // check if logic already exists
    // I think it does. this should just save the value

    // const oneYear = this.getFromExcel(`oneYear`);
    // const threeYears = this.getFromExcel(`threeYears`);
  }

  async renderExcel(sheetData) {

    if (!sheetData || sheetData.length === 0) {
      console.error("❌ No Excel data to render.");
      return;
    }

    let tableHtml = `<table border="1" class="excel-table"><thead><tr>`;

    // Log headers to check if they exist
    const headers = Object.keys(sheetData[0]);
    headers.forEach((header) => {
      tableHtml += `<th>${header}</th>`;
    });

    tableHtml += `</tr></thead><tbody>`;

    // Log rows to check if data exists
    sheetData.forEach((row, index) => {
      tableHtml += `<tr>`;
      Object.values(row).forEach((cell) => {
        tableHtml += `<td>${cell}</td>`;
      });
      tableHtml += `</tr>`;
    });

    tableHtml += `</tbody></table>`;

    this.showExcel = true; // Ensure popup opens
    await this.requestUpdate();

    setTimeout(() => {
      const popupContainer = this.shadowRoot?.querySelector('.popup #excelContainer');

      if (popupContainer) {
        popupContainer.innerHTML = tableHtml;
      } else {
        console.error("❌ `excelContainer` inside the popup not found.");
      }
    }, 100); // Delay to ensure UI is ready
  }

  renderPopup() {
    return html`
      <div class="overlay" @click="${this.togglePopup}"></div>
      <div class="popup" @click="${(e) => e.stopPropagation()}">
        <h3>Select Dates</h3>
        
        <input type="date" .value="${this.customDate}" 
          @input="${(e) => this.customDate = e.target.value}" />
        <button @click="${this.addCustomDate}">Add Date</button>
        
        <div>
          <button @click="${() => this.handleDateSelection('Jan')}">Jan</button>
          <button @click="${() => this.handleDateSelection('Jan|Jun')}">Jan | Jun</button>
          <button @click="${() => this.handleDateSelection('Jan|Jun|Oct')}">Jan | Jun | Oct</button>
        </div>
  
        <h4>Selected Dates:</h4>
        <div class="popup-content">
          <ul class="date-list">
            ${this.getPaginatedDates().map(date => html`<li>${date}</li>`)}
          </ul>
        </div>
  
        ${Math.ceil(this.selectedDates.length / this.datesPerPage) > 1 ? html`
          <div class="pagination-controls">
            <button @click="${() => this.changePage('prev')}" ?disabled="${this.currentPage === 0}">
              Previous
            </button>
            <span>Page ${this.currentPage + 1} of ${Math.ceil(this.selectedDates.length / this.datesPerPage)}</span>
            <button @click="${() => this.changePage('next')}" ?disabled="${(this.currentPage + 1) * this.datesPerPage >= this.selectedDates.length}">
              Next
            </button>
          </div>
        ` : ''}
  
        <button @click="${this.handleNext}" ?disabled="${this.isLoading}">
          ${this.isLoading ? 'Processing...' : 'Confirm'}
        </button>
      </div>
    `;
  }

  _renderPortfolios() {
    return html`
      <div class="portfolio-container">
        <div class="watermark">
            <img src="${logo}"/>
        </div>
        ${this.clientInfo.detailModels?.length
        ? this.clientInfo.detailModels.map((portfolio, index) => html`
            <div class="portfolio-card">
              <h3>${portfolio.instrumentName}</h3>
              <button @click="${() => this.navigateToTransactions(portfolio)}">Transaction History</button>
              <button @click="${() => this.navigateToRootTransactions(portfolio)}">Interaction History</button>
              <button @click="${() => this.generateReport(portfolio)}">Generate Report</button>
              <button @click="${() => this.navigateToStats(portfolio)}">View Stats</button>
              <button @click=${() => this.toggleExpand(index)}>
                ${this.expandedCards[index] ? 'Hide Info' : 'More Information'}
              </button>
              ${this.expandedCards[index] ? html`
                <button @click=${() => this._handleUpdateRatings(portfolio)}>Update</button>
              ` : ''}
              <!-- ${this.expandedCards[index] &&
            portfolio.portfolioEntryTreeModels?.some(e => this.changedIsins?.has?.(e.isinNumber)) ? html`
                <button @click=${() => this._handleUpdateRatings(portfolio)}>Update</button>
              ` : ''} -->

              ${this.expandedCards[index] ? html`
                <div class="portfolio-info">
                  <h4>General Information</h4>
                  <p><strong>Reference Number:</strong> ${portfolio.referenceNumber}</p>
                  <p><strong>Inception Date:</strong> ${new Date(portfolio.inceptionDate).toLocaleDateString()}</p>
                  <p><strong>Initial Contribution:</strong> ${portfolio.initialContributionAmount} ZAR</p>
                  <p><strong>Regular Contribution:</strong> ${portfolio.regularContributionAmount} ZAR (${portfolio.regularContributionFrequency})</p>
                  <p><strong>Report Notes:</strong> ${portfolio.reportNotes || 'N/A'}</p>

                  <h4>Portfolio Entries</h4>
                  <table>
                    <tr>
                      <th>Instrument Name</th>
                      <th>ISIN Number</th>
                      <th>MorningStar ID</th>
                      <th>Six Months</th>
                      <th>One Year</th>
                      <th>Three years</th>
                    </tr>
                    ${portfolio.portfolioEntryTreeModels?.map((entry) => html`
                        <tr>
                          <td>${entry.instrumentName}</td>
                          <td>${entry.isinNumber || 'N/A'}</td>
                          <td>${entry.morningStarId || 'N/A'}</td>
                          ${(() => {
                            const key = `${entry.instrumentName}::${entry.isinNumber || 'N/A'}`;
                            return html`
                              <td>${this._renderInput(key, 0.5)}</td>
                              <td>${this._renderInput(key, 1)}</td>
                              <td>${this._renderInput(key, 3)}</td>
                            `;
                          })()}
                        </tr>
                      `)}
                  </table>
                </div>
              ` : ''}
            </div>
          `)
        : html`<p>No Portfolios Found</p>`}
      </div>
    `;
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
      <div class="upload-section">
        <button class="report-btn" @click="${() => this.generateReport()}">Generate Report</button>
        <input type="file" id="excelUpload" accept=".xls,.xlsx" @change="${this.handleFileUpload}" hidden />
        <button class="upload-button" @click="${() => this.shadowRoot.getElementById('excelUpload').click()}">
          Upload Excel
        </button>
        <button class="fund-facts-btn" @click="${() => this.fundFacts()}">Upload Fund Facts</button>
      </div>
    </div>
    `;
  }

  renderExcelDocument() {
    return html`
    <div class="overlay" @click="${() => this.showExcel = false}"></div>
    <div class="popup excel-popup" @click="${(e) => e.stopPropagation()}">
      <h3>View Excel</h3>
      <div class="popup-content excel-content">
        <div id="excelContainer">
          <p>Loading Excel Data...</p> 
        </div>
      </div>
      <button @click="${() => this.acceptExcel()}" ?disabled="${this.isLoading}">
        ${this.isLoading ? 'Processing...' : 'Accept'}
      </button>
    </div>
  `;
  }

  render() {
    return html`
    ${this.showPopup ? this.renderPopup() : ''}
    ${this.showDialog ? this.renderDialog() : ''}
          <!-- Logout Button (Only Visible When Logged In) -->
          ${this.clientInfo ? html`
            <button class="logout-button" @click="${() => this.logout()}">Logout</button>
          ` : ''}
      <!-- Search Bar -->
      <div class="search-container ${this.searchCompleted ? 'moved' : ''}">
        <input
          type="text"
          placeholder="Enter Clients ID"
          .value="${this.clientID}"
          @input="${(e) => (this.clientID = e.target.value)}"
        />
        <button @click="${this.searchClient}">Search</button>
      </div>
  
      <!-- Loading Indicator -->
      ${this.isLoading ? html`<div class="loading">Loading...</div>` : ''}
  
      <!-- Client Profile & Portfolio (Hidden Until Search) -->
      ${this.searchCompleted && this.clientInfo ? html`
        <div class="content-container visible">
          
          ${this.clientInfo ? this.renderClientCard() : ''}

                <div id="excelContainer">
        <!-- ${this.showExcel ? html`<p>Loading Excel Data...</p>` : ""} -->
      </div>

          <!-- Portfolio List -->
           ${this._renderPortfolios()}
           ${this.showExcel ? this.renderExcelDocument() : ``}
        </div>
      ` : ''}
      ${this.toastMessage ? html`
        <div class="toast">${this.toastMessage}</div>
      ` : ''}
    `;
  }

  _renderInput(portfolioId, year) {
    const rating = this.portfolioRatings[portfolioId];
    let value = '';
    if (year === 0.5) value = rating?.Rating6Months || '';
    else if (year === 1) value = rating?.Rating1Year || '';
    else if (year === 3) value = rating?.Rating3Years || '';
    const updatedAt = this.portfolioRatings[portfolioId]?.lastUpdated;
    const color = this.getRatingColor(updatedAt);
    return html`
      <input
          type="text"
          placeholder=""
          style="color: ${color};"
          title="${updatedAt ? `Last updated: ${new Date(updatedAt).toLocaleString()}` : 'No update info'}"
          value="${value}"
          @input="${(e) => {
        this.updatePortfolioRatings(portfolioId, year, e.target.value);
        this.changedIsins = this.changedIsins || new Set();
        this.changedIsins.add(portfolioId);
 
        const key = portfolioId || `${year}-${Math.random()}`; // if you want to force uniqueness
        this.changedIsins.add(key);
      }}"
      />
    `;
  }

  renderDialog() {
    return html`
      <div class="dialog-overlay">
        <div class="dialog-content">
          <h3>📊 Generate Report</h3>
          <div class="dialog-options">
            <label><input type="checkbox" .checked="${this.reportOptions.contributions}" @change="${(e) => this.updateOption(e, 'contributions')}" /> Contributions</label>
            <label><input type="checkbox" .checked="${this.reportOptions.withdrawals}" @change="${(e) => this.updateOption(e, 'withdrawals')}" /> Withdrawals</label>
            <label><input type="checkbox" .checked="${this.reportOptions.regularWithdrawals}" @change="${(e) => this.updateOption(e, 'regularWithdrawals')}" /> Regular Withdrawals</label>
            <label><input type="checkbox" .checked="${this.reportOptions.regularContributions}" @change="${(e) => this.updateOption(e, 'regularContributions')}" /> Regular Contributions</label>
            <label><input type="checkbox" .checked="${this.reportOptions.interactionHistory}" @change="${(e) => this.updateOption(e, 'interactionHistory')}" /> Interaction History</label>
            <label><input type="checkbox" .checked="${this.reportOptions.includePercentage}" @change="${(e) => this.updateOption(e, 'includePercentage')}" /> Include Percentage</label>
            <label>
              IRR (%):
              <input type="number" value="${this.reportOptions.irr}" step="0.1" @input="${(e) => this.updateOption(e, 'irr')}" />
            </label>
            <label>
              Currency (eg. USD):
              <input type="text" value="${this.reportOptions.currency}" @input="${(e) => this.updateOption(e, 'currency')}" />
            </label>
          </div>
          <div class="dialog-actions">
            <button class="cancel-btn" @click="${() => (this.showDialog = false)}">Cancel</button>
            <button class="generate-btn" @click="${() => this.generateReport()}">Generate Report</button>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define('dashboard-view', Dashboard);
