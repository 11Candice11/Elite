import { jsPDF } from "jspdf";
import "jspdf-autotable";

export const PdfMixin = {

  async generatePDF(selectedDetails) {
    const doc = new jsPDF({ orientation: "landscape" });
    
    const formatAmount = (amount) => {
      return `${amount.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
  };

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

        // --- CONTRIBUTIONS ---
        const contributions = portfolio.transactionModels
            .filter(t => t.transactionType.toLowerCase().includes("contribution") && t.convertedAmount > 0)
            .map(t => [t.transactionDate.split("T")[0], t.transactionType, `R ${formatAmount(t.convertedAmount.toFixed(2))}`]);

        if (contributions.length > 0) {
            // Section Header
            doc.setFillColor(200, 200, 200);
            doc.rect(10, 30, 190, 8, "F");
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(12);
            doc.text("CONTRIBUTIONS", 12, 35);

            // Table Headers (grey background)
            doc.autoTable({
                head: [["EFFECTIVE DATE", "TRANSACTION TYPE", "GROSS AMOUNT"]],
                body: contributions,
                startY: 40,
                ...tableOptions
            });

            // Total row
            doc.autoTable({
                body: [["", "TOTAL:", `R ${contributions.reduce((sum, t) => sum + parseFloat(t[2].replace("R ", "")), 0).toFixed(2)}`]],
                startY: doc.lastAutoTable.finalY,
                styles: { fontStyle: "bold", halign: "center" },
                ...tableOptions
            });
        }

        // --- WITHDRAWALS ---
        const withdrawals = portfolio.transactionModels
            .filter(t => t.transactionType.toLowerCase().includes("withdrawal") || t.convertedAmount < 0)
            .map(t => [t.transactionDate.split("T")[0], t.transactionType, `R ${formatAmount(t.convertedAmount.toFixed(2))}`]);

        if (withdrawals.length > 0) {
            const startY = doc.lastAutoTable.finalY + 15;

            // Section Header
            doc.setFillColor(200, 200, 200);
            doc.rect(10, startY - 10, 190, 8, "F");
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(12);
            doc.text("WITHDRAWALS", 12, startY - 4);

            // Table Headers (grey background)
            doc.autoTable({
                head: [["EFFECTIVE DATE", "TRANSACTION TYPE", "WITHDRAWAL AMOUNT"]],
                body: withdrawals,
                startY: startY,
                ...tableOptions
            });

            // Total row
            doc.autoTable({
                body: [["", "TOTAL:", `R ${withdrawals.reduce((sum, t) => sum + parseFloat(t[2].replace("R ", "")), 0).toFixed(2)}`]],
                startY: doc.lastAutoTable.finalY,
                styles: { fontStyle: "bold", halign: "center" },
                ...tableOptions
            });
        }
    });

    const pdfBytes = doc.output("arraybuffer");
    return btoa(String.fromCharCode(...new Uint8Array(pdfBytes)));
  }
};