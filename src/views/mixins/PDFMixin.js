import { PDFDocument, rgb } from 'pdf-lib';
import { store } from '/src/store/EliteStore.js';

export const PdfMixin = {

  checkPageBreak(pdfDoc, currentPage, yPosition) {
    if (yPosition < 50) { // Check if we're near the bottom
      const newPage = pdfDoc.addPage([842, 595]); // Add a new landscape page
      yPosition = 550; // Reset Y position for the new page
      return { page: newPage, yPosition };
    }
    return { page: currentPage, yPosition };
  },

  async generatePDF(clientInfo, selectedDetailModel, irrPercentage, IDNumber) {
    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage([842, 595]); // Landscape mode (A4 size rotated)

    const font = await pdfDoc.embedFont('Helvetica-Bold');
    const normalFont = await pdfDoc.embedFont('Helvetica');

    const leftMargin = 50;
    const rightMargin = 750;
    let yPosition = 450; // Moves everything down by 20 units

    yPosition -= 20; // Adds extra padding above the header
    // Header
    page.drawText('Morebo Wealth Client Feedback Report', {
      x: leftMargin,
      y: yPosition,
      size: 16,
      font,
      color: rgb(0, 0, 0),
    });

    const currentDate = new Date().toLocaleDateString('en-GB');
    page.drawText(currentDate, {
      x: rightMargin - font.widthOfTextAtSize(currentDate, 12),
      y: yPosition,
      size: 12,
      font,
      color: rgb(0, 0, 0),
    });

    yPosition -= 50;

    // Client Info Section
    const { title, firstNames, surname } = clientInfo;
    const { instrumentName, referenceNumber, inceptionDate, regularWithdrawalAmount, regularWithdrawalPercentage, transactionModels = [] } =
      selectedDetailModel || {};

    page.drawText(`${title} ${firstNames} ${surname}`, {
      x: leftMargin,
      y: yPosition,
      size: 14,
      font,
      color: rgb(0, 0, 0),
    });

    page.drawText(instrumentName || 'N/A', {
      x: rightMargin - font.widthOfTextAtSize(instrumentName || 'N/A', 12),
      y: yPosition,
      size: 12,
      font,
      color: rgb(0, 0, 0),
    });

    yPosition -= 20;

    page.drawText(`Policy Number: ${referenceNumber || 'N/A'}`, {
      x: leftMargin,
      y: yPosition,
      size: 12,
      font: normalFont,
      color: rgb(0, 0, 0),
    });

    const formattedInceptionDate = inceptionDate
      ? new Date(inceptionDate).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
      : 'N/A';

    page.drawText(`Inception Date: ${formattedInceptionDate}`, {
      x: rightMargin - font.widthOfTextAtSize(`Inception Date: ${formattedInceptionDate}`, 12),
      y: yPosition,
      size: 12,
      font: normalFont,
      color: rgb(0, 0, 0),
    });

    yPosition -= 30;

    const idNumber = IDNumber || 'N/A';
    page.drawText(`ID Number: ${idNumber}`, {
      x: leftMargin,
      y: yPosition,
      size: 12,
      font: normalFont,
      color: rgb(0, 0, 0),
    });

    page.drawText(`IRR Percentage: ${irrPercentage}%`, {
      x: rightMargin - font.widthOfTextAtSize(`IRR Percentage: ${irrPercentage}%`, 12),
      y: yPosition,
      size: 12,
      font: normalFont,
      color: rgb(0, 0, 0),
    });

    yPosition -= 30;

    const dob = idNumber.length >= 6
      ? `DOB: ${idNumber.substring(0, 2)}-${idNumber.substring(2, 4)}-${idNumber.substring(4, 6)}`
      : 'DOB: N/A';

    page.drawText(dob, {
      x: leftMargin,
      y: yPosition,
      size: 12,
      font: normalFont,
      color: rgb(0, 0, 0),
    });

    yPosition -= 50;
    ({ page, yPosition } = this.checkPageBreak(pdfDoc, page, yPosition));

    // Contributions Section
    yPosition -= 40; // Add spacing before contributions
    page.drawText('Regular Contributions', {
      x: leftMargin,
      y: yPosition,
      size: 12,
      font,
      color: rgb(0, 0, 0),
    });

    // Add space below the header
    yPosition -= 40;
    page.drawRectangle({
      x: leftMargin,
      y: yPosition,
      width: 495,
      height: 20,
      color: rgb(0.8, 0.8, 0.8), // Light gray background
    });

    page.drawText('EFFECTIVE DATE', {
      x: leftMargin + 10,
      y: yPosition + 5,
      size: 10,
      font,
      color: rgb(0, 0, 0),
    });

    page.drawText('TRANSACTION TYPE', {
      x: 180,
      y: yPosition + 5,
      size: 10,
      font,
      color: rgb(0, 0, 0),
    });

    page.drawText('GROSS AMOUNT', {
      x: 350,
      y: yPosition + 5,
      size: 10,
      font,
      color: rgb(0, 0, 0),
    });

    yPosition -= 20;

    // Example Contribution Entry from Provided Data
    const initialContributionAmount = selectedDetailModel.initialContributionAmount || 0;
    const initialContributionCurrency = selectedDetailModel.initialContributionCurrencyAbbreviation || 'ZAR';
    const regularContributionAmount = selectedDetailModel.regularContributionAmount || 0;
    const regularContributionCurrency = selectedDetailModel.regularContributionCurrencyAbbreviation || 'ZAR';
    const contributionFrequency = selectedDetailModel.regularContributionFrequency || 'N/A';
    const escalationPercentage = selectedDetailModel.regularContributionEscalationPercentage?.toFixed(2) || '0.00%';

    // Initial Contribution
    page.drawText('2021/01/21', {
      x: leftMargin + 10,
      y: yPosition,
      size: 10,
      font: normalFont,
      color: rgb(0, 0, 0),
    });

    page.drawText('Initial Contribution', {
      x: 180,
      y: yPosition,
      size: 10,
      font: normalFont,
      color: rgb(0, 0, 0),
    });

    page.drawText(`${initialContributionCurrency} ${initialContributionAmount.toFixed(2)}`, {
      x: 350,
      y: yPosition,
      size: 10,
      font: normalFont,
      color: rgb(0, 0, 0),
    });

    yPosition -= 20; // Add spacing before contributions

    // Regular Contribution
    page.drawText('2024/01/01', {
      x: leftMargin + 10,
      y: yPosition,
      size: 10,
      font: normalFont,
      color: rgb(0, 0, 0),
    });

    page.drawText(`Regular Contribution (${contributionFrequency})`, {
      x: 180,
      y: yPosition,
      size: 10,
      font: normalFont,
      color: rgb(0, 0, 0),
    });

    page.drawText(`${regularContributionCurrency} ${regularContributionAmount.toFixed(2)}`, {
      x: 350,
      y: yPosition,
      size: 10,
      font: normalFont,
      color: rgb(0, 0, 0),
    });

    yPosition -= 20;

    // Escalation Percentage (Optional)
    page.drawText('Escalation Percentage:', {
      x: leftMargin + 10,
      y: yPosition,
      size: 10,
      font: normalFont,
      color: rgb(0, 0, 0),
    });

    page.drawText(`${escalationPercentage}%`, {
      x: 350,
      y: yPosition,
      size: 10,
      font: normalFont,
      color: rgb(0, 0, 0),
    });

    yPosition -= 20;

    // Total Contributions
    const totalContributions = initialContributionAmount + regularContributionAmount;

    page.drawText('TOTAL:', {
      x: 180,
      y: yPosition,
      size: 10,
      font,
      color: rgb(0, 0, 0),
    });

    page.drawText(`${initialContributionCurrency} ${totalContributions.toFixed(2)}`, {
      x: 350,
      y: yPosition,
      size: 10,
      font,
      color: rgb(0, 0, 0),
    });

    yPosition -= 40; // Add spacing before contributions

    ({ page, yPosition } = this.checkPageBreak(pdfDoc, page, yPosition));

    // Regular Withdrawals Section
    const withdrawalSinceInception = this.calculateWithdrawAmount(selectedDetailModel);

    page.drawText('Regular Withdrawals', {
      x: leftMargin,
      y: yPosition,
      size: 12,
      font,
      color: rgb(0, 0, 0),
    });

    // Add space below the header
    yPosition -= 40;

    page.drawRectangle({
      x: leftMargin,
      y: yPosition,
      width: 495,
      height: 20,
      color: rgb(0.8, 0.8, 0.8),
    });

    page.drawText('TRANSACTION TYPE', {
      x: leftMargin + 10,
      y: yPosition + 5,
      size: 10,
      font,
      color: rgb(0, 0, 0),
    });

    page.drawText('WITHDRAWAL AMOUNT', {
      x: 300,
      y: yPosition + 5,
      size: 10,
      font,
      color: rgb(0, 0, 0),
    });

    yPosition -= 30;

    page.drawText('Current Withdrawal Amount:', {
      x: leftMargin + 10,
      y: yPosition,
      size: 10,
      font: normalFont,
      color: rgb(0, 0, 0),
    });
    page.drawText(`R ${regularWithdrawalAmount?.toFixed(2) || '0.00'}`, {
      x: 300,
      y: yPosition,
      size: 10,
      font: normalFont,
      color: rgb(0, 0, 0),
    });

    yPosition -= 30;

    page.drawText('Withdrawal Percentage:', {
      x: leftMargin + 10,
      y: yPosition,
      size: 10,
      font: normalFont,
      color: rgb(0, 0, 0),
    });
    page.drawText(`${regularWithdrawalPercentage?.toFixed(2) || '0.00'}%`, {
      x: 300,
      y: yPosition,
      size: 10,
      font: normalFont,
      color: rgb(0, 0, 0),
    });

    yPosition -= 30;

    page.drawText('Withdrawal Since Inception:', {
      x: leftMargin + 10,
      y: yPosition,
      size: 10,
      font: normalFont,
      color: rgb(0, 0, 0),
    });
    page.drawText(`R ${withdrawalSinceInception.toFixed(2)}`, {
      x: 300,
      y: yPosition,
      size: 10,
      font: normalFont,
      color: rgb(0, 0, 0),
    });

    yPosition -= 50;

    // Transaction History Section
    const groupedTransactions = this.groupTransactionsByDate(transactionModels);

    page.drawText('Transaction History', {
      x: leftMargin,
      y: yPosition,
      size: 12,
      font,
      color: rgb(0, 0, 0),
    });

    yPosition -= 30;

    Object.keys(groupedTransactions).forEach((date) => {
      if (yPosition < 100) {
        page = pdfDoc.addPage([595, 842]);
        yPosition = 800;
      }

      page.drawText(date, {
        x: leftMargin,
        y: yPosition,
        size: 12,
        font,
        color: rgb(0, 0, 0),
      });

      yPosition -= 40;

      page.drawRectangle({
        x: leftMargin,
        y: yPosition,
        width: 495,
        height: 20,
        color: rgb(0.8, 0.8, 0.8),
      });

      page.drawText('Investment Funds', {
        x: leftMargin + 10,
        y: yPosition + 5,
        size: 10,
        font,
        color: rgb(0, 0, 0),
      });

      page.drawText('Rand Value', {
        x: 300,
        y: yPosition + 5,
        size: 10,
        font,
        color: rgb(0, 0, 0),
      });

      yPosition -= 30;

      groupedTransactions[date].forEach((transaction) => {
        const randValue = transaction.convertedAmount
          ? `R ${transaction.convertedAmount.toFixed(2)}`
          : 'N/A';
        page.drawText('Cash - USD', {
          x: leftMargin + 10,
          y: yPosition,
          size: 10,
          font: normalFont,
          color: rgb(0, 0, 0),
        });
        page.drawText(randValue, {
          x: 300,
          y: yPosition,
          size: 10,
          font: normalFont,
          color: rgb(0, 0, 0),
        });

        yPosition -= 30;
      });

      yPosition -= 30; // Additional spacing between grouped transactions
    });

    ({ page, yPosition } = this.checkPageBreak(pdfDoc, page, yPosition));

    const pdfBytes = await pdfDoc.save();
    return btoa(String.fromCharCode(...new Uint8Array(pdfBytes)));
  },

  formatTransactionDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  },

  calculateWithdrawAmount(selectedDetailModel) {
    if (!selectedDetailModel || !selectedDetailModel.transactionModels) return 0;

    const totalWithdrawals = selectedDetailModel.transactionModels
      .filter((transaction) =>
        transaction.transactionType.toLowerCase().includes('withdrawal')
      )
      .reduce((total, transaction) => total + (transaction.amount || 0), 0);

    return selectedDetailModel.initialContributionAmount - totalWithdrawals;
  },

  groupTransactionsByDate(transactionModels) {
    const grouped = {};

    transactionModels.forEach((transaction) => {
      const date = this.formatTransactionDate(transaction.transactionDate);
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(transaction);
    });

    return grouped;
  }
};