import { jsPDF } from "jspdf";
import "jspdf-autotable";

export const PdfMixin = {
  async generatePDF(selectedDetails, clientInfo) {
    const doc = new jsPDF({ orientation: "landscape" }); // Landscape format

    const formatAmount = (amount) => `R ${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;

    const tableOptions = {
        styles: { fontSize: 9, cellPadding: 2 }, // Smaller text for fitting more on the page
        headStyles: { fillColor: [150, 150, 150], textColor: [255, 255, 255], fontStyle: "bold", halign: "center" },
        bodyStyles: { halign: "center", fillColor: [255, 255, 255] }
    };

    // Extract DOB from ID Number
    const dob = clientInfo ? `19${clientInfo.substring(0, 2)}/${clientInfo.substring(2, 4)}/${clientInfo.substring(4, 6)}` : "Unknown DOB";
    
    // Add Client Information
    doc.setFontSize(18);
    doc.text("Morebo Wealth Client Feedback Report", 10, 20);
    doc.setFontSize(12);
    doc.text(`${selectedDetails.title} ${selectedDetails.firstNames} ${selectedDetails.surname}`, 10, 30);
    doc.text(`Policy Number: ${selectedDetails.policyNumber || "N/A"}`, 10, 38);
    doc.text(`ID Number: ${clientInfo}`, 10, 46);
    doc.text(`DOB: ${dob}`, 10, 54);
    doc.text(`Advisor: ${selectedDetails.advisorName || "N/A"}`, 10, 62);
    doc.text(`Email: ${selectedDetails.email || "N/A"}`, 10, 70);
    doc.text(`Cellphone: ${selectedDetails.cellPhoneNumber || "N/A"}`, 10, 78);
    
    doc.setFontSize(14);
    doc.text(new Date().toISOString().split("T")[0].replace(/-/g, "/"), 260, 20, { align: "right" });
    doc.setFontSize(12);
    
    
    
    doc.addPage(); // Start portfolios on a new page

    // Generate Portfolios with Contributions, Withdrawals, and Interaction History
    selectedDetails.detailModels.forEach((portfolio, index) => {
      if (index !== 0) doc.addPage(); // New page for each portfolio
      doc.setFontSize(12);
      doc.text(portfolio.instrumentName, 10, 20);
      let startY = 30;

      // Contributions
      const contributions = portfolio.transactionModels.filter(t => t.transactionType.toLowerCase().includes("contribution"));
      if (contributions.length > 0) {
        const totalContributions = contributions.reduce((sum, t) => sum + t.convertedAmount, 0);
        doc.text("Contributions", 10, startY);
        doc.autoTable({
          head: [["EFFECTIVE DATE", "TRANSACTION TYPE", "GROSS AMOUNT"]],
          body: contributions.map(t => [t.transactionDate.split("T")[0], t.transactionType, formatAmount(t.convertedAmount)]).concat([["", "TOTAL:", formatAmount(totalContributions)]]),
          startY: startY + 5,
          ...tableOptions
        });
        startY = doc.lastAutoTable.finalY + 10;
      }

      // Withdrawals
      const withdrawals = portfolio.transactionModels.filter(t => t.transactionType.toLowerCase().includes("withdrawal") && !t.transactionType.toLowerCase().includes("regular"));
      let totalWithdrawals = withdrawals.length > 0 ? withdrawals.reduce((sum, t) => sum + t.convertedAmount, 0) : 0;
      if (withdrawals.length > 0) {
        doc.text("Withdrawals", 10, startY);
        doc.autoTable({
          head: [["EFFECTIVE DATE", "TRANSACTION TYPE", "WITHDRAWAL AMOUNT"]],
          body: withdrawals.map(t => [t.transactionDate.split("T")[0], t.transactionType, formatAmount(t.convertedAmount)]).concat([["", "TOTAL:", formatAmount(totalWithdrawals)]]),
          startY: startY + 5,
          ...tableOptions
        });
        startY = doc.lastAutoTable.finalY + 10;
      }

      // Regular Withdrawals Summary
      doc.text("Regular Withdrawals", 10, startY);
      doc.autoTable({
        head: [["TRANSACTION TYPE", "WITHDRAWAL AMOUNT"]],
        body: [
          ["Current Withdrawal Amount:", formatAmount(portfolio.regularWithdrawalAmount || 0)],
          ["Withdrawal Percentage:", `${portfolio.regularWithdrawalPercentage || 0} %`],
          ["Withdrawal Since Inception:", formatAmount(totalWithdrawals + (portfolio.regularWithdrawalAmount || 0))]
        ],
        startY: startY,
        ...tableOptions
      });
      startY = doc.lastAutoTable.finalY + 15;

      // Interaction History
      const interactionHistory = portfolio.rootValueDateModels.filter(interaction => interaction.valueModels.length > 0);
      if (interactionHistory.length > 0) {
        doc.setFontSize(12);
        doc.text("Interaction History", 10, startY);
        startY += 20;
        interactionHistory.forEach((interaction) => {
          if (!interaction.valueModels || interaction.valueModels.length === 0) return;
          const interactionData = interaction.valueModels.map(entry => {
            const matchedPortfolio = portfolio.portfolioEntryTreeModels.find(e => e.portfolioEntryId === entry.portfolioEntryId);
            return [
              matchedPortfolio ? matchedPortfolio.instrumentName : "Unknown Fund",
              formatAmount(entry.convertedAmount || 0),
              formatAmount(entry.portfolioSharePercentage || 0),
            ];
          });

          if (interactionData.length > 0) {
            doc.autoTable({
              head: [["Investment Funds", "Rand Value", "% Share per Portfolio"]],
              body: interactionData,
              startY: doc.lastAutoTable.finalY + 25,
              ...tableOptions
            });
            startY = doc.lastAutoTable.finalY + 15;
          }
        });
      }
    });

    const pdfBytes = doc.output("arraybuffer");
    const uint8Array = new Uint8Array(pdfBytes);
    const binaryString = new TextDecoder("utf-8").decode(uint8Array);
    return btoa(unescape(encodeURIComponent(binaryString)));
  }
};
