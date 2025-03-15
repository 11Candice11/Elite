import { jsPDF } from "jspdf";
import { store } from '/src/store/EliteStore.js';

import "jspdf-autotable";

export const PdfMixin = {
  async generatePDF(selectedDetails, clientId, portfolioRatings) {
    const doc = new jsPDF({ orientation: "landscape" }); // Landscape format

    const currencySymbols = {
      ZAR: "R",
      USD: "$",
      EUR: "€",
      GBP: "£",
      JPY: "¥",
      AUD: "A$",
      CAD: "C$",
      CHF: "CHF",
      CNY: "¥",
      INR: "₹",
      MXN: "MX$"
    };

    const formatAmount = (amount, currencyCode) => {
      const symbol = currencySymbols[currencyCode] || currencyCode; // Fallback to code if symbol not found
      return Number.isInteger(amount) ? `${symbol} ${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}` : `${symbol} ${amount}`;
    };

    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    };

    const tableOptions = {
      styles: { fontSize: 9, cellPadding: 2 }, // Smaller text for fitting more on the page
      headStyles: { fillColor: [150, 150, 150], textColor: [255, 255, 255], fontStyle: "bold", halign: "center" },
      bodyStyles: { halign: "center", fillColor: [255, 255, 255] }
    };

    // Extract DOB from ID Number
    const century = parseInt(clientId.substring(0, 2)) < 22 ? "20" : "19";
    const dob = clientId ? `${century}${clientId.substring(0, 2)}/${clientId.substring(2, 4)}/${clientId.substring(4, 6)}` : "Unknown DOB";

    // Add Client Information
    doc.setFontSize(18);
    doc.text("Morebo Wealth Client Feedback Report", 10, 20);
    doc.setFontSize(12);
    doc.text(`${selectedDetails.title} ${selectedDetails.firstNames} ${selectedDetails.surname}`, 10, 30);
    doc.text(`Policy Number: ${selectedDetails.policyNumber || "N/A"}`, 10, 38);
    doc.text(`ID Number: ${clientId}`, 10, 46);
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

      if (this.reportOptions.contributions) {
        // Contributions
        const contributionsMap = {};
        portfolio.transactionModels
          .filter(t => t.transactionType.toLowerCase().includes("contribution"))
          .forEach(t => {
            const date = t.transactionDate.split("T")[0];
            if (!contributionsMap[date]) {
              contributionsMap[date] = {
                currencyAbbreviation: t.currencyAbbreviation,
                exchangeRate: t.exchangeRate,
                transactionType: t.transactionType,
                total: 0
              };
            }
            contributionsMap[date].total += t.convertedAmount || 0;
          });

        const contributions = Object.entries(contributionsMap).map(([date, data]) => [
          date,
          data.transactionType,
          formatAmount((data.total * data.exchangeRate), data.currencyAbbreviation),
          formatAmount(data.total, "ZAR"),
          data.exchangeRate.toFixed(2)
        ]);

        if (contributions.length > 0) {
          // Correctly sum the total using the pre-aggregated values
          const totalContributions = contributions.reduce((sum, t) => sum + parseFloat(t[2].replace(/[^\d.-]/g, "")), 0);

          doc.text("Contributions", 10, startY);
          doc.autoTable({
            head: [["EFFECTIVE DATE", "TRANSACTION TYPE", "AMOUNT", "RAND VALUE", "EXCHANGE RATE"]],
            body: contributions.concat([["", "TOTAL:", formatAmount(totalContributions, "ZAR")]]),
            startY: startY + 5,
            ...tableOptions
          });
          startY = doc.lastAutoTable.finalY;
        }
      }

      if (this.reportOptions.withdrawals) {
        // Withdrawals
        const withdrawalsMap = {};
        portfolio.transactionModels.filter(t => t.transactionType.toLowerCase().includes("withdrawal") && !t.transactionType.toLowerCase().includes("regular"))
          .forEach(t => {
            const date = t.transactionDate.split("T")[0];
            if (!withdrawalsMap[date]) {
              withdrawalsMap[date] = {
                currencyAbbreviation: t.currencyAbbreviation,
                exchangeRate: t.exchangeRate,
                transactionType: t.transactionType,
                total: 0
              };
            }
            withdrawalsMap[date].total += t.convertedAmount;
          });

        const withdrawals = Object.entries(withdrawalsMap).map(([date, data]) => [
          date,
          data.transactionType,
          formatAmount((data.total * data.exchangeRate), data.currencyAbbreviation),
          formatAmount(data.total, "ZAR"),
          data.exchangeRate.toFixed(2)
        ]);
        let totalWithdrawals = withdrawals.length > 0 ? withdrawals.reduce((sum, t) => sum + t.convertedAmount, 0) : 0;
        if (withdrawals.length > 0) {
          doc.text("Withdrawals", 10, startY + 10);
          doc.autoTable({
            head: [["EFFECTIVE DATE", "TRANSACTION TYPE", "WITHDRAWAL AMOUNT", "RAND VALUE", "EXCHANGE RATE"]],
            body: withdrawals.concat([["", "TOTAL:", formatAmount(totalWithdrawals, "ZAR")]]),
            startY: startY + 15,
            ...tableOptions
          });
          startY = doc.lastAutoTable.finalY;
        }
      }

      if (this.reportOptions.regularWithdrawals) {
        // Regular Withdrawals Summary
        const hasValidRegularWithdrawals =
          (portfolio.regularWithdrawalAmount && portfolio.regularWithdrawalAmount > 0) ||
          (portfolio.regularWithdrawalPercentage && portfolio.regularWithdrawalPercentage > 0)
        // (totalWithdrawals && totalWithdrawals > 0);

        if (hasValidRegularWithdrawals) {
          doc.text("Regular Withdrawals", 10, startY + 10);

          const regularWithdrawalsBody = [
            portfolio.regularWithdrawalAmount > 0 ? ["Current Withdrawal Amount:", formatAmount(portfolio.regularWithdrawalAmount, "ZAR")] : null,
            portfolio.regularWithdrawalPercentage > 0 ? ["Withdrawal Percentage:", `${portfolio.regularWithdrawalPercentage} %`] : null,
            totalWithdrawals > 0 ? ["Withdrawal Since Inception:", formatAmount(totalWithdrawals, "ZAR")] : null
          ].filter(row => row !== null); // Remove null entries

          // Add total row if there's data
          if (regularWithdrawalsBody.length > 0) {
            const totalAmount = (totalWithdrawals || 0) + (portfolio.regularWithdrawalAmount || 0);
            regularWithdrawalsBody.push(["Total:", formatAmount(totalAmount, "ZAR")]);
          }

          if (regularWithdrawalsBody.length > 0) {
            doc.autoTable({
              head: [["TRANSACTION TYPE", "WITHDRAWAL AMOUNT"]],
              body: regularWithdrawalsBody,
              startY: startY + 15,
              ...tableOptions
            });
            startY = doc.lastAutoTable.finalY;
          }
        }
      }

      if (this.reportOptions.interactionHistory) {
        // Interaction History
        const interactionHistory = portfolio.rootValueDateModels.filter(interaction => interaction.valueModels.length > 0);
        if (interactionHistory.length > 0) {
          doc.setFontSize(12);
          doc.text("Interaction History", 10, startY + 10); // MOVES HEADER AWAY FROM PREVIOUS TABLE
          startY += 10; // SPACE BETWEEN HEADER AND TABLE
          interactionHistory.forEach((interaction) => {
            if (!interaction.valueModels || interaction.valueModels.length === 0) return;
            const interactionData = interaction.valueModels.map(entry => {
              const matchedPortfolio = portfolio.portfolioEntryTreeModels.find(e => e.portfolioEntryId === entry.portfolioEntryId);
              return [
                matchedPortfolio ? matchedPortfolio.instrumentName : "Unknown Fund",
                formatAmount(entry.convertedAmount || 0, "ZAR"),
                entry.portfolioSharePercentage || 0
              ];
            });

            if (interactionData.length > 0) {
              const interactionDate = interaction.valueModels[0].valueDate || "Unknown Date";
              doc.text(`Date: ${formatDate(interactionDate)}`, 10, startY + 10); // SPACE BETWEEN HEADER AND PREVIOUS TABLE

              // Calculate totals
              const totalRandValue = interactionData.reduce((sum, row) => row[1], 0);
              const totalPortfolioShare = interactionData.reduce((sum, row) => sum + row[2], 0);

              // Add totals row
              interactionData.push(["Total", totalRandValue, totalPortfolioShare.toFixed(2)]);

              doc.autoTable({
                head: [["Investment Funds", "Rand Value", "% Share per Portfolio"]],
                body: interactionData,
                startY: startY + 15,
                ...tableOptions
              });
              startY = doc.lastAutoTable.finalY;
            }
          });
        }
      }

      if (this.reportOptions.includePercentage) {

        doc.text("Performances", 10, startY + 20);

        const portfolioRatings = store.get("portfolioRatings");

        doc.autoTable({
          head: [["Instrument Name", "ISIN Number", "MorningStar ID", "One Year", "Three Years"]],
          body: [
            [portfolio.instrumentName, portfolio.isinNumber || "N/A",
            portfolio.morningStarID || "N/A",
            portfolioRatings?.oneYear || " ",  // Retrieve stored value
            portfolioRatings?.threeYears || " "]
          ],
          startY: startY + 30,
          ...tableOptions
        });
      }
    });

    const pdfBytes = doc.output("arraybuffer");
    const uint8Array = new Uint8Array(pdfBytes);
    const binaryString = new TextDecoder("utf-8").decode(uint8Array);
    return btoa(unescape(encodeURIComponent(binaryString)));
  }
};
