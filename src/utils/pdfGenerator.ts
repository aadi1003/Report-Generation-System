import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ReportData } from "@/types/report";

export const generatePDF = (data: ReportData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header
  doc.setFillColor(0, 85, 164);
  doc.rect(0, 0, pageWidth, 35, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text(data.reportType, pageWidth / 2, 15, { align: "center" });
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, 25, { align: "center" });
  
  let yPos = 45;
  
  // Report Information
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("REPORT INFORMATION", 15, yPos);
  yPos += 8;
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Date: ${data.date}`, 15, yPos);
  doc.text(`Engineer: ${data.engineerName}`, 105, yPos);
  yPos += 6;
  
  doc.text(`Site: ${data.site}`, 15, yPos);
  yPos += 6;
  
  doc.text(`Machine: ${data.machine}`, 15, yPos);
  yPos += 6;
  
  if (data.projectCode) {
    doc.text(`Project Code: ${data.projectCode}`, 15, yPos);
    yPos += 6;
  }
  
  if (data.location) {
    doc.text(`Location: ${data.location}`, 15, yPos);
    yPos += 6;
  }
  
  doc.setFont("helvetica", "bold");
  doc.text(`Total Hours: ${data.hoursWorked} hrs`, 15, yPos);
  yPos += 12;
  
  // Labor Details Table
  if (data.laborDetails.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("LABOR DETAILS", 15, yPos);
    yPos += 5;
    
    const tableData = data.laborDetails.map((entry) => [
      entry.name,
      entry.role,
      `${entry.hours} hrs`,
      entry.task,
    ]);
    
    autoTable(doc, {
      startY: yPos,
      head: [["Worker Name", "Role", "Hours", "Task"]],
      body: tableData,
      theme: "grid",
      headStyles: {
        fillColor: [0, 85, 164],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 10,
      },
      bodyStyles: {
        fontSize: 9,
      },
      alternateRowStyles: {
        fillColor: [245, 247, 250],
      },
      margin: { left: 15, right: 15 },
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 12;
  }
  
  // Remarks
  if (data.remarks) {
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("REMARKS", 15, yPos);
    yPos += 8;
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const remarksLines = doc.splitTextToSize(data.remarks, pageWidth - 30);
    doc.text(remarksLines, 15, yPos);
  }
  
  // Footer
  const pageCount = doc.internal.pages.length - 1;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" }
    );
  }
  
  // Generate filename
  const filename = `${data.reportType.replace(/\s+/g, "_")}_${data.date}_${data.site.split(" ")[0]}.pdf`;
  
  // Save the PDF
  doc.save(filename);
};
