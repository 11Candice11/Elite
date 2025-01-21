import { PDFDocument, rgb } from 'pdf-lib';
import { store } from '/src/store/EliteStore.js';

export const PdfMixin = {
    async generatePDF(clientInfo, selectedDetailModel, irrPercentage, IDNumber) {
        const pdfDoc = await PDFDocument.create();
        let page = pdfDoc.addPage([595, 842]);
      
        const font = await pdfDoc.embedFont('Helvetica-Bold');
        const normalFont = await pdfDoc.embedFont('Helvetica');
      
        const leftMargin = 50;
        const rightMargin = 545;
        let yPosition = 800;
      
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
      
        yPosition -= 40;
      
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
      
        yPosition -= 20;
      
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
      
        yPosition -= 20;
      
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
      
        yPosition -= 40;
      
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
        yPosition -= 30;
      
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
      
        yPosition -= 20;
      
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
      
        yPosition -= 20;
      
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
      
        yPosition -= 20;
      
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
      
        yPosition -= 40;
      
        // Transaction History Section
        const groupedTransactions = this.groupTransactionsByDate(transactionModels);
      
        page.drawText('Transaction History', {
          x: leftMargin,
          y: yPosition,
          size: 12,
          font,
          color: rgb(0, 0, 0),
        });
      
        yPosition -= 20;
      
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
      
          yPosition -= 30;
      
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
      
          yPosition -= 20;
      
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
      
            yPosition -= 20;
          });
      
          yPosition -= 20; // Additional spacing between grouped transactions
        });
      
        const pdfBytes = await pdfDoc.save();
        return btoa(String.fromCharCode(...new Uint8Array(pdfBytes)));
                              
        //   const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        //   const link = document.createElement('a');
        //   link.href = URL.createObjectURL(blob);
        //   link.download = 'Client_Report.pdf';
        //   document.body.appendChild(link);
        //   link.click();
        //   document.body.removeChild(link);
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