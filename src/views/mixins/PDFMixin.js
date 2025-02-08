import { PDFDocument, rgb } from 'pdf-lib';
import { store } from '/src/store/EliteStore.js';
import { jsPDF } from "jspdf";
import "jspdf-autotable";

export const PdfMixin = {

  checkPageBreak(pdfDoc, currentPage, yPosition) {
    if (yPosition < 50) { // Check if we're near the bottom
      const newPage = pdfDoc.addPage([842, 595]); // Add a new landscape page
      yPosition = 550; // Reset Y position for the new page
      return { page: newPage, yPosition };
    }
    return { page: currentPage, yPosition };
  },

  async generatePDF(selectedDetails) {
    const doc = new jsPDF();

    selectedDetails.detailModels.forEach((portfolio, index) => {
        if (index !== 0) doc.addPage(); // Add a new page for each portfolio

        doc.setFontSize(16);
        doc.text(portfolio.instrumentName, 10, 20);

        // Define table styles
        const tableOptions = {
            startY: 30,
            theme: "grid",
            styles: { fontSize: 12, cellPadding: 4 },
            headStyles: { fillColor: [150, 150, 150], textColor: [255, 255, 255], halign: "center" },
            bodyStyles: { halign: "center" }
        };

        // Contributions Table
        const contributions = portfolio.transactionModels
            .filter(t => t.transactionType.toLowerCase().includes("contribution") && t.convertedAmount > 0)
            .map(t => [t.transactionDate.split("T")[0], t.transactionType, `R ${t.convertedAmount.toFixed(2)}`]);

        if (contributions.length > 0) {
            doc.autoTable({
                head: [["EFFECTIVE DATE", "TRANSACTION TYPE", "GROSS AMOUNT"]],
                body: contributions,
                ...tableOptions
            });

            // Add total row
            doc.autoTable({
                body: [["", "TOTAL:", `R ${contributions.reduce((sum, t) => sum + parseFloat(t[2].replace("R ", "")), 0).toFixed(2)}`]],
                ...tableOptions
            });
        } else {
            doc.text("No contributions recorded.", 10, tableOptions.startY + 10);
        }

        // Withdrawals Table
        const withdrawals = portfolio.transactionModels
            .filter(t => t.transactionType.toLowerCase().includes("withdrawal") || t.convertedAmount < 0)
            .map(t => [t.transactionDate.split("T")[0], t.transactionType, `R ${t.convertedAmount.toFixed(2)}`]);

        if (withdrawals.length > 0) {
            doc.autoTable({
                head: [["EFFECTIVE DATE", "TRANSACTION TYPE", "WITHDRAWAL AMOUNT"]],
                body: withdrawals,
                startY: doc.lastAutoTable.finalY + 10,
                ...tableOptions
            });

            // Add total row
            doc.autoTable({
                body: [["", "TOTAL:", `R ${withdrawals.reduce((sum, t) => sum + parseFloat(t[2].replace("R ", "")), 0).toFixed(2)}`]],
                startY: doc.lastAutoTable.finalY + 5,
                ...tableOptions
            });
        } else {
            // doc.text("No withdrawals recorded.", 10, doc.lastAutoTable.finalY + 10);
        }
    });

    const pdfBytes = doc.output("arraybuffer");
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