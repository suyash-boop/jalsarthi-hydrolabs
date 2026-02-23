export function exportToCSV(
  data: Record<string, unknown>[],
  columns: { key: string; label: string }[],
  filename: string
) {
  const header = columns.map((c) => c.label).join(",");
  const rows = data.map((row) =>
    columns
      .map((c) => {
        const val = row[c.key];
        const str = val === null || val === undefined ? "" : String(val);
        // Escape commas and quotes in CSV
        if (str.includes(",") || str.includes('"') || str.includes("\n")) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      })
      .join(",")
  );
  const csv = [header, ...rows].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export async function exportToPDF(elementId: string, filename: string) {
  const element = document.getElementById(elementId);
  if (!element) return;

  const html2canvas = (await import("html2canvas")).default;
  const { jsPDF } = await import("jspdf");

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: "#ffffff",
  });

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF("landscape", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 10;
  const contentWidth = pageWidth - margin * 2;

  const imgWidth = canvas.width;
  const imgHeight = canvas.height;
  const ratio = contentWidth / imgWidth;
  const scaledHeight = imgHeight * ratio;

  // Handle multi-page if content is tall
  let yOffset = 0;
  const usableHeight = pageHeight - margin * 2;

  while (yOffset < scaledHeight) {
    if (yOffset > 0) {
      pdf.addPage();
    }

    pdf.addImage(
      imgData,
      "PNG",
      margin,
      margin - yOffset,
      contentWidth,
      scaledHeight
    );

    yOffset += usableHeight;
  }

  pdf.save(`${filename}.pdf`);
}
