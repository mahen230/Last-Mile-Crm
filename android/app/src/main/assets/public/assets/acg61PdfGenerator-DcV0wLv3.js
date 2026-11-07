import { aN as E } from "./index-u5ATSoh6.js";
function formatToDottedDate(rawDate) {
  if (!rawDate) return "";
  if (rawDate.includes(".")) return rawDate;
  if (rawDate.includes("-")) {
    const parts = rawDate.split("-");
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        return `${parts[2]}.${parts[1]}.${parts[0]}`;
      }
      return `${parts[0]}.${parts[1]}.${parts[2]}`;
    }
  }
  return rawDate;
}
function downloadOfficialAcg61Pdf(data) {
  const doc = new E({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
    // 210 x 297 mm
  });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = 28;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("ACG-61", pageWidth - margin, y, { align: "right" });
  y += 14;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Department Of Posts,India", pageWidth / 2, y, { align: "center" });
  y += 18;
  const formattedDate = formatToDottedDate(data.date);
  const noonText = data.noonSection === "AM" || data.noonSection === "FORENOON" ? "FORENOON" : "AFTERNOON";
  const postTitle = (data.postName || "O/S POSTMAN").trim().toUpperCase();
  const relievedOfficer = (data.relievedOfficerName || "MAHENDRA KUMAR MEENA").trim().toUpperCase();
  const relievingOfficer = (data.relievingOfficerName || "VACANT").trim().toUpperCase();
  const placeOffice = (data.placeName || "DADABARI SO").trim().toUpperCase();
  doc.setFont("times", "normal");
  doc.setFontSize(12.5);
  doc.setLineHeightFactor(1.6);
  const mainParagraph = `Certified that the charge of the office Of ${postTitle} was made over by ${relievedOfficer} to ${relievingOfficer} at Place ${placeOffice} on the Date ${formattedDate} ${noonText} in accordance with${data.authorityOrderNo ? " " + data.authorityOrderNo : ""}.`;
  const splitLines = doc.splitTextToSize(mainParagraph, contentWidth);
  doc.text(splitLines, margin, y);
  y += splitLines.length * 8.5 + 24;
  const col1X = margin + 15;
  const col2X = pageWidth / 2 + 15;
  doc.setDrawColor(80, 80, 80);
  doc.setLineWidth(0.4);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Relieved Officer", col1X, y);
  doc.text("Relieving Officer", col2X, y);
  y += 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.text(`(${relievedOfficer})`, col1X, y);
  doc.text(`(${relievingOfficer})`, col2X, y);
  doc.setTextColor(0, 0, 0);
  y += 28;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Copy to:-", margin, y);
  y += 7;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  const defaultCopies = data.copyToList && data.copyToList.length > 0 ? data.copyToList : [
    `The SSPO's ${data.divisionName || "KOTA DIVISION"}`,
    `A/C BRANCH ${data.headOfficeName || "NGM H.O."}`,
    `ASPO's ${data.subDivisionName || "KOTA EAST"}`,
    "PF of the official"
  ];
  defaultCopies.forEach((item, index) => {
    doc.text(`${index + 1}. ${item}`, margin + 4, y);
    y += 6.5;
  });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text(
    `Form ACG-61 (India Post Field Operations CRM) · Generated on ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-GB")}`,
    margin,
    285
  );
  const safeName = relievedOfficer.replace(/[^A-Z0-9]+/gi, "_");
  const safeDate = formattedDate.replace(/\./g, "_");
  const filename = `ACG61_Charge_Report_${safeName}_${safeDate || "Document"}.pdf`;
  doc.save(filename);
}
export {
  downloadOfficialAcg61Pdf as d,
  formatToDottedDate as f
};
