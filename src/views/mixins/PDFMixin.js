import { jsPDF } from "jspdf";
import "jspdf-autotable";

export const PdfMixin = {
  async generatePDF(selectedDetails) {
    const doc = new jsPDF({ orientation: "landscape" }); // Landscape format
    const tableOptions = {
      styles: { fontSize: 12, cellPadding: 4 },
      headStyles: { fillColor: [150, 150, 150], textColor: [255, 255, 255], fontStyle: "bold", halign: "center" },
      bodyStyles: { halign: "center", fontStyle: "bold", fillColor: [255, 255, 255] }
    };
    const formatAmount = (amount) => `R ${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;

    // Group rootValueDateModels by date
    const interactionHistory = {};
    selectedDetails.detailModels.forEach((portfolio) => {
      portfolio.rootValueDateModels.forEach((interaction) => {
        const date = new Date(interaction.convertedValueDate).toLocaleDateString("en-GB", {
          weekday: "long",
          day: "2-digit",
          month: "long",
          year: "numeric",
        });

        if (!interactionHistory[date]) {
          interactionHistory[date] = [];
        }
        interactionHistory[date].push(interaction);
      });
    });

    // Generate Portfolios first
    selectedDetails.detailModels.forEach((portfolio, index) => {
      if (index !== 0) doc.addPage(); // New page for each portfolio

      doc.setFontSize(16);
      doc.text(portfolio.instrumentName, 10, 20);

      // Define shared table styles
      const tableOptions = {
        styles: { fontSize: 12, cellPadding: 4 },
        headStyles: { fillColor: [150, 150, 150], textColor: [255, 255, 255], fontStyle: "bold", halign: "center" },
        bodyStyles: { halign: "center", fontStyle: "bold", fillColor: [255, 255, 255] }
      };

      // CONTRIBUTIONS
      const contributions = portfolio.transactionModels
        .filter(t => t.transactionType.toLowerCase().includes("contribution") && t.convertedAmount > 0)
        .map(t => [t.transactionDate.split("T")[0], t.transactionType, formatAmount(t.convertedAmount)]);

      if (contributions.length > 0) {
        doc.autoTable({
          head: [["EFFECTIVE DATE", "TRANSACTION TYPE", "GROSS AMOUNT"]],
          body: contributions,
          startY: 40,
          ...tableOptions
        });
      }

      // WITHDRAWALS
      const withdrawals = portfolio.transactionModels
        .filter(t => t.transactionType.toLowerCase().includes("withdrawal") || t.convertedAmount < 0)
        .map(t => [t.transactionDate.split("T")[0], t.transactionType, formatAmount(t.convertedAmount)]);

      if (withdrawals.length > 0) {
        doc.autoTable({
          head: [["EFFECTIVE DATE", "TRANSACTION TYPE", "WITHDRAWAL AMOUNT"]],
          body: withdrawals,
          startY: doc.lastAutoTable.finalY + 10,
          ...tableOptions
        });
      }
    });

    // Generate Interaction History AFTER portfolios
    doc.addPage();
    doc.setFontSize(18);
    doc.text("Interaction History", 10, 20);

    Object.keys(interactionHistory).forEach((date, index) => {
      if (index !== 0) doc.addPage();

      doc.setFontSize(16);
      doc.text(date, 10, 30);

      interactionHistory[date].forEach((interaction) => {
        const interactionData = interaction.valueModels.map(entry => {
          // Map portfolioEntryId to instrumentName
          const matchedPortfolio = selectedDetails.detailModels
            .flatMap(p => p.portfolioEntryTreeModels)
            .find(e => e.portfolioEntryId === entry.portfolioEntryId);
          return [
            matchedPortfolio ? matchedPortfolio.instrumentName : "Unknown Fund",
            formatAmount(entry.convertedAmount || 0),
            entry.exchangeRate ? entry.exchangeRate.toFixed(2) : "0.00",
          ];
        });

        doc.autoTable({
          head: [["Investment Funds", "Rand Value", "% Share per Portfolio"]],
          body: interactionData,
          startY: doc.lastAutoTable.finalY + 10,
          ...tableOptions
        });
      });
    });

    const pdfBytes = doc.output("arraybuffer");
    const uint8Array = new Uint8Array(pdfBytes);
    const binaryString = new TextDecoder("utf-8").decode(uint8Array);
    return btoa(unescape(encodeURIComponent(binaryString)));
  }
};