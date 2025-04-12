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
      let symbol;
      if (exchangeRate === 1 || currencyCode === "ZAR") {
        symbol = "R";
      } else {
        symbol = currencySymbols[currencyCode];
        if (!symbol) {
          symbol = currencySymbols[this.reportOptions.currency] || this.reportOptions.currency || "";
        }
      }
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
    // doc.text(`Policy Number: ${selectedDetails.policyNumber || "N/A"}`, 10, 38);
    doc.text(`ID Number: ${clientId}`, 10, 38);
    doc.text(`DOB: ${dob}`, 10, 46);
    doc.text(`Advisor: ${selectedDetails.advisorName || "N/A"}`, 10, 54);
    // doc.text(`Email: ${selectedDetails.email || "N/A"}`, 10, 70);
    // doc.text(`Cellphone: ${selectedDetails.cellPhoneNumber || "N/A"}`, 10, 78);
    doc.text(`IRR (%): ${this.reportOptions.irr ?? 'N/A'}`, 10, 62);

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
        doc.text(`Last Contribution: ${amountFormatted} on ${latestContribution.transactionDate.split("T")[0]}`, 10, 70);
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
      doc.text(`${portfolio.instrumentName} ${portfolio.referenceNumber}`, 10, 20);
      let startY = 30;

      if (this.reportOptions.contributions) {
        // ====== Contributions Section ======
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
          // Removed standalone Contributions header block
          const allInZAR = contributions.every(row => row[2].startsWith("R"));
          const totalLabelAmount = allInZAR
            ? formatAmount(totalContributionsRand, "ZAR")
            : formatAmount(totalContributions, this.reportOptions.currency);
          const contributionsBody = [
            [{ content: "CONTRIBUTIONS", colSpan: 5, styles: { fillColor: [150,150,150], textColor: [255,255,255], halign: "center", fontStyle: "bold" } }],
            ["EFFECTIVE DATE", "TRANSACTION TYPE", "AMOUNT", "RAND VALUE", "EXCHANGE RATE"],
            ...contributions.map(row => row.slice(0, 5)),
            ["TOTAL", "", totalLabelAmount, formatAmount(totalContributionsRand, "ZAR"), ""]
          ];
          
          doc.autoTable({
            body: contributionsBody,
            startY: startY,
            theme: 'plain',
            styles: {
              fontSize: 9,
              halign: 'center',
              cellPadding: { top: 1.5, bottom: 1.5 },
              lineWidth: 0
            },
            didParseCell: function (data) {
              const isHeaderRow = data.row.index === 1;
              const cellText = data.row.raw?.[0];
              const isTotalRow = typeof cellText === "string" && cellText.toLowerCase().includes("total");
              if (isHeaderRow || isTotalRow) {
                data.cell.styles.fillColor = [230, 230, 230];
                data.cell.styles.fontStyle = "bold";
              }
            }
          });
          startY = doc.lastAutoTable.finalY;
        }
      }

      if (this.reportOptions.withdrawals) {

        // ====== Withdrawals Section ======
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
          const requiredHeight = 30 + 2 * 10;
          if (startY + requiredHeight > doc.internal.pageSize.height - 20) {
            doc.addPage();
            startY = 30;
          }
          startY += 6;
          doc.setFontSize(11);
          // Withdrawals section
          const allWithdrawalsInZAR = withdrawals.every(row => row[2].startsWith("R"));
          const totalWithdrawalsLabelAmount = allWithdrawalsInZAR
            ? formatAmount(totalWithdrawals, "ZAR")
            : formatAmount(totalWithdrawals, this.reportOptions.currency);
          const withdrawalsBody = [
            [{ content: "WITHDRAWALS", colSpan: 5, styles: { fillColor: [150,150,150], textColor: [255,255,255], halign: "center", fontStyle: "bold" } }],
            ["EFFECTIVE DATE", "TRANSACTION TYPE", "WITHDRAWAL AMOUNT", "RAND VALUE", "EXCHANGE RATE"],
            ...withdrawals.map(row => row.slice(0, 5)),
            ["TOTAL", "", totalWithdrawalsLabelAmount, "", ""]
          ];

          doc.autoTable({
            body: withdrawalsBody,
            startY,
            theme: 'plain',
            styles: {
              fontSize: 9,
              halign: 'center',
              cellPadding: { top: 1.5, bottom: 1.5 },
              lineWidth: 0
            },
            didParseCell: function (data) {
              const cellText = data.row.raw?.[0];
              const isHeaderRow = data.row.index === 1;
              const isTotalRow = typeof cellText === "string" && cellText.toLowerCase().includes("total");
              if (isHeaderRow || isTotalRow) {
                data.cell.styles.fillColor = [230, 230, 230];
                data.cell.styles.fontStyle = "bold";
              }
            }
          });
          startY = doc.lastAutoTable.finalY;
        }
      }

      if (this.reportOptions.regularWithdrawals) {

        // ====== Regular Withdrawals Section ======
        const hasValidRegularWithdrawals =
          (portfolio.regularWithdrawalAmount && portfolio.regularWithdrawalAmount > 0) ||
          (portfolio.regularWithdrawalPercentage && portfolio.regularWithdrawalPercentage > 0)

        if (hasValidRegularWithdrawals) {
          const regularWithdrawalsBody = [
            portfolio.regularWithdrawalAmount > 0 ? ["Regular Withdrawal", formatAmount(portfolio.regularWithdrawalAmount, "ZAR"), `${portfolio.regularWithdrawalPercentage.toFixed(2)} %`, formatAmount(totalWithdrawalsSinceInception, "ZAR")] : null,
            totalWithdrawals !== 0 ? ["Withdrawal Since Inception:", formatAmount(totalWithdrawals, "ZAR"), "", formatAmount(totalWithdrawalsSinceInception, "ZAR")] : null
          ].filter(row => row !== null); // Remove null entries

          const requiredHeight = 30 + (regularWithdrawalsBody.length + 1) * 10;
          if (startY + requiredHeight > doc.internal.pageSize.height - 20) {
            doc.addPage();
            startY = 30;
          }
          startY += 6;
          doc.setFontSize(11);
          if (regularWithdrawalsBody.length > 0) {
            const totalAmount = (totalWithdrawals || 0) + (portfolio.regularWithdrawalAmount || 0);
            const allRegularInZAR = true; // Currently assumed to always be ZAR-based
            const totalRegularWithdrawals = (totalWithdrawals || 0) + (portfolio.regularWithdrawalAmount || 0);
            const totalRegularLabelAmount = allRegularInZAR
              ? formatAmount(totalRegularWithdrawals, "ZAR")
              : formatAmount(totalRegularWithdrawals, this.reportOptions.currency);
            regularWithdrawalsBody.push(["Total:", totalRegularLabelAmount, "", "TOTAL_ROW"]);
            
            const regularWithdrawalsBodyWithHeader = [
              [{ content: "REGULAR WITHDRAWALS", colSpan: 4, styles: { fillColor: [150,150,150], textColor: [255,255,255], halign: "center", fontStyle: "bold" } }],
              ["TRANSACTION TYPE", "WITHDRAWAL AMOUNT", "WITHDRAWAL PERCENTAGE", "WITHDRAWAL SINCE INCEPTION"],
              ...regularWithdrawalsBody
            ];

            doc.autoTable({
              body: regularWithdrawalsBodyWithHeader,
              startY,
              theme: 'plain',
              styles: {
                fontSize: 9,
                halign: 'center',
                cellPadding: { top: 1.5, bottom: 1.5 },
                lineWidth: 0
              },
              didParseCell: function (data) {
                const cellText = data.row.raw?.[0];
                const isHeaderRow = data.row.index === 1;
                const isTotalRow = typeof cellText === "string" && cellText.toLowerCase().includes("total");
                if (isHeaderRow || isTotalRow || data.cell.raw === "TOTAL_ROW") {
                  data.cell.styles.fillColor = [230, 230, 230];
                  data.cell.styles.fontStyle = "bold";
                }
              }
            });
            startY = doc.lastAutoTable.finalY;
          }
        }
      }

      if (this.reportOptions.interactionHistory) {
        // Avoid empty space if no previous sections rendered anything
        if (startY === 30) {
          startY = 20;
        }
        // ====== Interaction History Section ======
        const interactionHistory = portfolio.rootValueDateModels.filter(interaction => interaction.valueModels.length > 0);
        if (interactionHistory.length > 0) {
          doc.setFontSize(12);
          startY += 10; // SPACE BETWEEN HEADER AND TABLE
          const renderedDates = new Set();
          interactionHistory.forEach((interaction) => {
            const dateStr = interaction.valueModels[0].valueDate?.split("T")[0];
            if (!dateStr || renderedDates.has(dateStr)) return;
            renderedDates.add(dateStr);
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
              const requiredHeight = 30 + (interactionData.length + 1) * 10;
              if (startY + requiredHeight > doc.internal.pageSize.height - 20) {
                doc.addPage();
                startY = 30;
              }
              const formattedDateRow = [{ content: formatDate(interactionDate), colSpan: 4, styles: { fillColor: [230, 230, 230], textColor: [0, 0, 0], halign: "center", fontStyle: "bold" } }];
              interactionData.unshift(formattedDateRow);
              const headerRow = ["Investment Funds", "Amount", "Rand Value", "% Share per Portfolio"];
              interactionData.splice(1, 0, headerRow);

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
              const allInteractionInZAR = interactionData
                .filter(row => Array.isArray(row) && row.length > 1 && row[1] !== "Amount")
                .every(row => typeof row[1] === "string" && row[1].startsWith("R"));
              const totalInteractionLabelAmount = allInteractionInZAR
                ? formatAmount(totalRandValue || 0, "ZAR")
                : formatAmount(totalValue || 0, this.reportOptions.currency);

              // Add totals row
              interactionData.push([
                "Total",
                allInteractionInZAR
                  ? formatAmount(totalRandValue || 0, "ZAR")
                  : formatAmount(totalValue || 0, this.reportOptions.currency),
                formatAmount(totalRandValue || 0, "ZAR"),
                totalPortfolioShare.toFixed(2)
              ]);

              doc.autoTable({
                body: interactionData,
                startY,
                theme: 'plain',
                styles: {
                  fontSize: 9,
                  halign: 'center',
                  cellPadding: { top: 1.5, bottom: 1.5 },
                  lineWidth: 0
                },
                didParseCell: function (data) {
                  const cellText = data.row.raw?.[0];
                  const isDateRow = data.row.index === 0 && data.row.raw?.length === 1;
                  const isHeaderRow = data.row.index === 1;
                  const isTotalRow = typeof cellText === "string" && cellText.toLowerCase().includes("total");
                  if (isDateRow) {
                    data.cell.styles.fillColor = [230, 230, 230];
                    data.cell.styles.fontStyle = "bold";
                    data.cell.styles.textColor = [0, 0, 0];
                  }
                  if (isHeaderRow || isTotalRow) {
                    data.cell.styles.fillColor = [200, 200, 200];
                    data.cell.styles.fontStyle = "bold";
                  }
                }
              });
              startY = doc.lastAutoTable.finalY + 10; // Add space between interaction history tables
            }
          });
        }
      }

      // ====== Portfolio Performance Section ======
      if (this.reportOptions.includePercentage) {
        const ratings = store.get('portfolioRatings') || {};
 
        const lastInteraction = [...portfolio.rootValueDateModels].reverse().find(i => i.valueModels.length > 0);
        const includedIds = lastInteraction?.valueModels.map(vm => vm.portfolioEntryId) || [];
 
        const fundRows = portfolio.portfolioEntryTreeModels
          .filter(entry => includedIds.includes(entry.portfolioEntryId))
          .map(entry => {
            const key = `${entry.instrumentName}::${entry.isinNumber || 'N/A'}`;
            const rating = ratings[key] || {};
 
            const sixMonthsRaw = rating.Rating6Months?.toString().trim();
            const oneYearRaw = rating.Rating1Year?.toString().trim();
            const threeYearsRaw = rating.Rating3Years?.toString().trim();
 
            const sixMonths = sixMonthsRaw && sixMonthsRaw !== 'N/A' ? `${sixMonthsRaw} %` : '0 %';
            const oneYear = oneYearRaw && oneYearRaw !== 'N/A' ? `${oneYearRaw} %` : '0 %';
            const threeYears = threeYearsRaw && threeYearsRaw !== 'N/A' ? `${threeYearsRaw} %` : '0 %';
 
            // Skip rows where all values are 0 %
            if (sixMonths === '0 %' && oneYear === '0 %' && threeYears === '0 %') return null;
 
            return [
              entry.instrumentName || 'N/A',
              sixMonths,
              oneYear,
              threeYears
            ];
          })
          .filter(Boolean); // Remove null rows
 
        startY += 10; // Add space before portfolio performance section
        if (fundRows.length > 0) {
          const requiredHeight = 30 + (fundRows.length + 1) * 10; // Rough estimate of header + 1 row
          if (startY + requiredHeight > doc.internal.pageSize.height - 20) {
            doc.addPage();
            startY = 30;
          }
          startY += 6;
          doc.setFontSize(11);
          const performanceHeader = [{ content: "PORTFOLIO PERFORMANCES", colSpan: 4, styles: { fillColor: [150,150,150], textColor: [255,255,255], halign: "center", fontStyle: "bold" } }];
          fundRows.unshift(performanceHeader);
          fundRows.splice(1, 0, ["Investment Fund", "6 Months", "One Year", "Three Years"]);

          doc.autoTable({
            body: fundRows,
            startY,
            theme: 'plain',
            styles: {
              fontSize: 9,
              halign: 'center',
              cellPadding: { top: 1.5, bottom: 1.5 },
              lineWidth: 0
            },
            didParseCell: function (data) {
              const cellText = data.row.raw?.[0];
              const isTotalRow = typeof cellText === "string" && cellText.toLowerCase().includes("total");
              if (data.row.index === 1 || isTotalRow) {
                data.cell.styles.fillColor = [230, 230, 230];
                data.cell.styles.fontStyle = "bold";
              }
            }
          });

          startY = doc.lastAutoTable.finalY + 10;
        }
      }
    });

    const pdfBytes = doc.output("arraybuffer");
    const uint8Array = new Uint8Array(pdfBytes);
    const binaryString = new TextDecoder("utf-8").decode(uint8Array);
    return btoa(unescape(encodeURIComponent(binaryString)));
  }
};
 