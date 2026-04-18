
// Reusable function to export standard table data to PDF with official branding
export async function exportToPDF(
  title: string, 
  columns: string[], 
  data: (string | number | boolean | null)[][], 
  filename: string = 'Laporan.pdf',
  metadata?: Record<string, string>
) {
  // Lazy load jspdf to avoid circular structure errors during build
  const { default: jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');

  const doc = new jsPDF('landscape') as any;
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // 1. ADD BRANDING & HEADER
  doc.setFillColor(31, 41, 55); // slate-800
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.text("PREPRESS PLATINUM", 14, 18);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Official Production Report System", 14, 25);
  
  // 2. REPORT TITLE & DATE
  doc.setFontSize(16);
  doc.setTextColor(31, 41, 55);
  doc.text(title.toUpperCase(), 14, 52);
  
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 58);

  // 3. OPTIONAL METADATA (FILTERS)
  if (metadata) {
    let metaY = 52;
    Object.entries(metadata).forEach(([key, val]) => {
      doc.setFont("helvetica", "bold");
      doc.text(`${key}:`, pageWidth - 80, metaY);
      doc.setFont("helvetica", "normal");
      doc.text(String(val), pageWidth - 45, metaY);
      metaY += 6;
    });
  }

  // 4. MAIN DATA TABLE
  autoTable(doc, {
    startY: 65,
    head: [columns],
    body: data,
    theme: 'grid',
    headStyles: { 
      fillColor: [79, 70, 229], // indigo-600
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: 'bold',
      halign: 'center'
    },
    styles: { 
      fontSize: 8,
      cellPadding: 3,
      valign: 'middle'
    },
    columnStyles: {
      0: { fontStyle: 'bold' } // ID column usually
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252] // slate-50
    },
    margin: { bottom: 30 },
    didDrawPage: () => {
      // 5. FOOTER (PAGE NUMBER)
      doc.setFontSize(8);
      doc.setTextColor(150);
      const str = "Page " + doc.getNumberOfPages();
      doc.text(str, pageWidth - 30, doc.internal.pageSize.getHeight() - 10);
      doc.text("Prepress Platinum Digital System - Confidential", 14, doc.internal.pageSize.getHeight() - 10);
    }
  });

  // 6. SIGNATURE SECTION (BOTTOM OF LAST PAGE)
  const finalY = doc.lastAutoTable.finalY + 10;
  if (finalY < doc.internal.pageSize.getHeight() - 40) {
    doc.setFontSize(10);
    doc.setTextColor(31, 41, 55);
    doc.setFont("helvetica", "bold");
    
    doc.text("Disetujui Oleh,", 14, finalY + 10);
    doc.text("Dibuat Oleh,", pageWidth - 60, finalY + 10);
    
    doc.setDrawColor(200);
    doc.line(14, finalY + 35, 60, finalY + 35);
    doc.line(pageWidth - 60, finalY + 35, pageWidth - 14, finalY + 35);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("(Manager Produksi)", 14, finalY + 40);
    doc.text("(System Operator)", pageWidth - 60, finalY + 40);
  }

  doc.save(filename);
}
