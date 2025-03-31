import { jsPDF } from "jspdf";
import { store } from '/src/store/EliteStore.js';

import "jspdf-autotable";

export const PdfMixin = {
  async generatePDF(selectedDetails, clientId, portfolioRatings) {
    let totalWithdrawals = 0;
    let totalWithdrawalsSinceInception = 0;
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

    const formatAmount = (amount, currencyCode, exchangeRate) => {
      const symbol = exchangeRate === 1 ? "R" : (currencySymbols[currencyCode] || currencyCode || "");
      return `${symbol} ${parseFloat(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
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
    doc.text(`IRR (%): ${this.reportOptions.irr ?? 'N/A'}`, 10, 86);

    if (this.reportOptions.regularContributions) {
      let latestContribution = null;
      selectedDetails.detailModels.forEach((portfolio) => {
        portfolio.transactionModels
          .filter(t => t.transactionType.toLowerCase().includes("contribution"))
          .forEach(t => {
            const date = new Date(t.transactionDate);
            if (!latestContribution || date > new Date(latestContribution.transactionDate)) {
              latestContribution = t;
            }
          });
      });

      if (latestContribution) {
        const amountFormatted = formatAmount(latestContribution.convertedAmount, this.reportOptions.currency);
        doc.text(`Last Contribution: ${amountFormatted} on ${latestContribution.transactionDate.split("T")[0]}`, 10, 94);
      } else {
        doc.text("Last Contribution: N/A", 10, 94);
      }
    }

    doc.setFontSize(14);
    doc.text(new Date().toISOString().split("T")[0].replace(/-/g, "/"), 260, 20, { align: "right" });
    doc.setFontSize(12);

    doc.addPage(); // Start portfolios on a new page

    // Generate Portfolios with Contributions, Withdrawals, and Interaction History
    selectedDetails.detailModels.forEach((portfolio, index) => {
      // Check if the portfolio has data before rendering
      const hasContributions = this.reportOptions.contributions && portfolio.transactionModels.some(t => t.transactionType.toLowerCase().includes("contribution"));
      const hasWithdrawals = this.reportOptions.withdrawals && portfolio.transactionModels.some(t => t.transactionType.toLowerCase().includes("withdrawal") && !t.transactionType.toLowerCase().includes("regular"));
      const hasRegularWithdrawals = this.reportOptions.regularWithdrawals && (portfolio.regularWithdrawalAmount > 0 || portfolio.regularWithdrawalPercentage > 0);
      const hasInteractionHistory = this.reportOptions.interactionHistory && portfolio.rootValueDateModels.some(interaction => interaction.valueModels.length > 0);

      if (!hasContributions && !hasWithdrawals && !hasRegularWithdrawals && !hasInteractionHistory && !this.reportOptions.includePercentage) {
        return; // Skip this portfolio if it has no relevant data and performance table is not requested
      }

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
                currencyAbbreviation: this.reportOptions.currency,
                exchangeRate: t.exchangeRate,
                transactionType: t.transactionType,
                total: 0
              };
            }
            contributionsMap[date].total += t.convertedAmount || 0;
          });

        const contributions = Object.entries(contributionsMap)
          .filter(([_, data]) => data.total !== 0) // Exclude contributions where rand value is 0
          .map(([date, data]) => {
            const amount = data.total / data.exchangeRate;
            return [
              date,
              data.transactionType,
              formatAmount(amount.toFixed(2), data.currencyAbbreviation, data.exchangeRate),
              formatAmount(data.total.toFixed(2), "ZAR", true),
              data.exchangeRate.toFixed(2),
              amount // Store raw numerical value separately for summing
            ];
          });

        // Sum using the raw numerical value stored in the last element of each row
        const totalContributions = contributions.reduce((sum, t) => sum + t[5], 0);
        const totalContributionsRand = contributions.reduce((sum, t) => sum + parseFloat(t[3].replace(/[^0-9.-]+/g, "")), 0);

        if (contributions.length > 0) {
          const estimatedTableHeight = contributions.length * 10 + 20; // Estimate row height
          if (startY + estimatedTableHeight > doc.internal.pageSize.height - 20) {
            doc.addPage(); // Move the header and table together
            startY = 30; // Reset position for new page
          }
          doc.text("Contributions", 10, startY);
          doc.autoTable({
            head: [["EFFECTIVE DATE", "TRANSACTION TYPE", "AMOUNT", "RAND VALUE", "EXCHANGE RATE"]],
            body: contributions.concat([
              ["", "TOTAL:", formatAmount(totalContributions, this.reportOptions.currency), formatAmount(totalContributionsRand, "ZAR")]
            ]),
            startY: startY + 5,
            ...tableOptions
          });
          startY = doc.lastAutoTable.finalY;
        }
      }

      if (this.reportOptions.withdrawals) {
        // Withdrawals
        const withdrawalsMap = {};
        portfolio.transactionModels.filter(t => {
          return t.transactionType.toLowerCase().includes("withdrawal") && !t.transactionType.toLowerCase().includes("regular")
        })
          .forEach(t => {
            const date = t.transactionDate.split("T")[0];
            if (!withdrawalsMap[date]) {
              withdrawalsMap[date] = [];
            }
            const existingIndex = withdrawalsMap[date].findIndex(trx => trx.convertedAmount === -t.convertedAmount);

            if (existingIndex !== -1) {
              // If an opposite value exists, remove it (cancels out to zero)
              withdrawalsMap[date].splice(existingIndex, 1);
            } else {
              withdrawalsMap[date].push({
                currencyAbbreviation: t.currencyAbbreviation,
                exchangeRate: t.exchangeRate,
                transactionType: t.transactionType,
                convertedAmount: t.convertedAmount
              });
            }
          });

        const withdrawals = Object.entries(withdrawalsMap)
          .flatMap(([date, transactions]) =>
            (transactions && Array.isArray(transactions))
              ? transactions.filter(t => t.convertedAmount !== 0).map(t => {
                const amount = t.convertedAmount / t.exchangeRate;
                return [
                  date,
                  t.transactionType,
                  formatAmount(amount.toFixed(2), t.currencyAbbreviation, t.exchangeRate),
                  formatAmount(t.convertedAmount.toFixed(2), "ZAR", true),
                  t.exchangeRate.toFixed(2),
                  amount
                ];
              })
              : []
          );

        totalWithdrawals = withdrawals.length > 0
          ? withdrawals.reduce((sum, t) => sum + t[5], 0)
          : 0;
        totalWithdrawalsSinceInception = portfolio.transactionModels
          .filter(t => t.transactionType.toLowerCase().includes("withdraw"))
          .reduce((sum, t) => sum + t.convertedAmount, 0);

        if (withdrawals.length > 0) {
          const estimatedTableHeight = withdrawals.length * 10 + 20; // Estimate row height
          if (startY + estimatedTableHeight > doc.internal.pageSize.height - 20) {
            doc.addPage(); // Move the header and table together
            startY = 30; // Reset position for new page
          }
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

        if (hasValidRegularWithdrawals) {
          const estimatedTableHeight = 30; // Estimate row height
          if (startY + estimatedTableHeight > doc.internal.pageSize.height - 20) {
            doc.addPage(); // Move the header and table together
            startY = 30; // Reset position for new page
          }
          doc.text("Regular Withdrawals", 10, startY + 10);

          const regularWithdrawalsBody = [
            portfolio.regularWithdrawalAmount > 0 ? ["Regular Withdrawal", formatAmount(portfolio.regularWithdrawalAmount, "ZAR"), `${portfolio.regularWithdrawalPercentage.toFixed(2)} %`, formatAmount(totalWithdrawalsSinceInception, "ZAR")] : null,
            totalWithdrawals !== 0 ? ["Withdrawal Since Inception:", formatAmount(totalWithdrawals, "ZAR"), "", formatAmount(totalWithdrawalsSinceInception, "ZAR")] : null
          ].filter(row => row !== null); // Remove null entries

          // Add total row if there's data
          if (regularWithdrawalsBody.length > 0) {
            const totalAmount = (totalWithdrawals || 0) + (portfolio.regularWithdrawalAmount || 0);
            regularWithdrawalsBody.push(["Total:", formatAmount(totalAmount, "ZAR"), ""]);
          }

          if (regularWithdrawalsBody.length > 0) {
            const estimatedTableHeight = regularWithdrawalsBody.length * 10 + 20; // Estimate row height
            if (startY + estimatedTableHeight > doc.internal.pageSize.height - 20) {
              doc.addPage(); // Move the header and table together
              startY = 30; // Reset position for new page
            }
            doc.autoTable({
              head: [["TRANSACTION TYPE", "WITHDRAWAL AMOUNT", "WITHDRAWAL PERCENTAGE", "WITHDRAWAL SINCE INCEPTION"]],
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
          startY += 10; // SPACE BETWEEN HEADER AND TABLE
          interactionHistory.forEach((interaction) => {
            if (!interaction.valueModels || interaction.valueModels.length === 0) return;
            const interactionData = interaction.valueModels.map(entry => {
              const matchedPortfolio = portfolio.portfolioEntryTreeModels.find(e => e.portfolioEntryId === entry.portfolioEntryId);
              const amount = entry.exchangeRate !== 0 ? entry.convertedAmount / entry.exchangeRate : 0;
              return [
                matchedPortfolio ? matchedPortfolio.instrumentName : "Unknown Fund",
                formatAmount(amount, entry.currencyAbbreviation, entry.exchangeRate), // Amount in original currency
                formatAmount(entry.convertedAmount, "ZAR"), // Amount in Rands
                entry.portfolioSharePercentage ? parseFloat(entry.portfolioSharePercentage).toFixed(2) : "0.00"
              ];
            });

            if (interactionData.length > 0) {
              const interactionDate = interaction.valueModels[0].valueDate || "Unknown Date";
              const estimatedTableHeight = interactionData.length * 10 + 20; // Estimate row height
              if (startY + estimatedTableHeight > doc.internal.pageSize.height - 20) {
                doc.addPage(); // Move the header and table together
                startY = 30; // Reset position for new page
              }
              doc.text(`${formatDate(interactionDate)}`, 10, startY + 10); // SPACE BETWEEN HEADER AND PREVIOUS TABLE

              // Calculate totals
              const totalRandValue = interaction.valueModels
                .filter(entry => !isNaN(entry.convertedAmount)) // Ensure valid numbers
                .reduce((sum, entry) => sum + entry.convertedAmount, 0);
              const totalValue = interaction.valueModels
                .filter(entry => !isNaN(entry.convertedAmount)) // Ensure valid numbers
                .reduce((sum, entry) => sum + (entry.convertedAmount / entry.exchangeRate), 0);
              const totalPortfolioShare = interactionData
                .filter(row => !isNaN(parseFloat(row[3]))) // Ensure valid numbers
                .reduce((sum, row) => sum + parseFloat(row[3] || 0), 0);

              // Add totals row
              interactionData.push([
                "Total",
                formatAmount(totalValue || 0, this.reportOptions.currency), // Ensure it's always a valid number
                formatAmount(totalRandValue || 0, "ZAR"), // Ensure it's always a valid number
                // !isNaN(totalPortfolioShare) ? totalPortfolioShare.toFixed(2) : "0.00"
              ]);

              doc.autoTable({
                head: [["Investment Funds", "Amount", "Rand Value", "% Share per Portfolio"]],
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
        const ratings = store.get('portfolioRatings') || {};
 
        const fundRows = portfolio.portfolioEntryTreeModels.map(entry => {
          const key = `${entry.instrumentName}::${entry.isinNumber || 'N/A'}`;
          const rating = ratings[key] || {};
 
          const sixMonths = rating.Rating6Months?.toString().trim() || 'N/A';
          const oneYear = rating.Rating1Year?.toString().trim() || 'N/A';
          const threeYears = rating.Rating3Years?.toString().trim() || 'N/A';
 
          return [
            entry.instrumentName || 'N/A',
            sixMonths.endsWith('%') ? sixMonths : `${sixMonths} %`,
            oneYear.endsWith('%') ? oneYear : `${oneYear} %`,
            threeYears.endsWith('%') ? threeYears : `${threeYears} %`
          ];
        });
 
        if (fundRows.length > 0) {
          const estimatedTableHeight = fundRows.length * 10 + 20;
          if (startY + estimatedTableHeight > doc.internal.pageSize.height - 20) {
            doc.addPage();
            startY = 30;
          }
 
          doc.text("PORTFOLIO PERFORMANCES", 10, startY + 10);
 
          doc.autoTable({
            head: [["FUND NAME", "6 MONTHS", "ANNUAL HISTORY", "LAST 3 YEARS"]],
            body: fundRows,
            startY: startY + 20,
            ...tableOptions
          });
 
          startY = doc.lastAutoTable.finalY;
        }
      }
    });

    const pdfBytes = doc.output("arraybuffer");
    const uint8Array = new Uint8Array(pdfBytes);
    const binaryString = new TextDecoder("utf-8").decode(uint8Array);
    return btoa(unescape(encodeURIComponent(binaryString)));
  }
};
