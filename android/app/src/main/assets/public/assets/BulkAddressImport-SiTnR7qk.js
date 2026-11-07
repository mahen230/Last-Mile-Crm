import { r as reactExports, j as jsxRuntimeExports, X, aS as CircleAlert, C as CircleCheck, b as customerService } from "./index-CuXKa_SH.js";
import { U as Upload } from "./upload-CSGvGoPF.js";
const BEATS = Array.from({ length: 34 }, (_, i) => `Beat ${i + 1}`);
function BulkAddressImport({ onClose }) {
  const [rawData, setRawData] = reactExports.useState("");
  const [status, setStatus] = reactExports.useState({ type: "", message: "" });
  const handleImport = () => {
    const lines = rawData.split("\n");
    let importedCount = 0;
    const errors = [];
    lines.forEach((line, index) => {
      const parts = line.split(",");
      if (parts.length >= 2) {
        const name = parts[0].trim();
        const contact = parts[1].trim();
        const addressPart = parts[2] ? parts[2].trim() : "";
        const beatMatch = line.match(/(?:beat)\s+(\d+)/i);
        const beatValue = beatMatch ? `Beat ${beatMatch[1]}` : "";
        if (beatValue && !BEATS.includes(beatValue)) {
          errors.push(`Line ${index + 1}: Invalid beat "${beatValue}"`);
          return;
        }
        const sectorMatch = line.match(/(?:sector)\s+([^,]+)/i);
        customerService.addOrUpdateCustomer({
          name,
          mobile: contact,
          beatNo: beatValue || "Beat 1",
          address: {
            houseNumber: addressPart,
            sectorLocality: sectorMatch ? sectorMatch[1].trim() : "Unknown",
            area: "Unknown",
            pincode: "324009"
          }
        }, "Bulk Import Tool");
        importedCount++;
      }
    });
    if (errors.length > 0) {
      setStatus({ type: "error", message: `Imported ${importedCount} records. Errors: ${errors.join(", ")}` });
    } else {
      setStatus({ type: "success", message: `Successfully imported ${importedCount} records.` });
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-2xl p-6 w-full max-w-lg", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-bold text-lg flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { size: 20, className: "text-red-700" }),
        "Bulk Address Import"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 20 }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "textarea",
      {
        value: rawData,
        onChange: (e) => setRawData(e.target.value),
        placeholder: "Paste raw data here (Format: Name, Contact, Address, Beat X)...",
        className: "w-full h-64 p-4 border rounded-xl text-xs mb-4"
      }
    ),
    status.message && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `text-xs mb-4 p-2 rounded flex items-center gap-2 ${status.type === "error" ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`, children: [
      status.type === "error" ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { size: 14 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 14 }),
      status.message
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-slate-500" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: handleImport,
          className: "px-4 py-2 bg-red-700 text-white rounded-xl text-xs font-semibold",
          children: "Import Data"
        }
      )
    ] })
  ] }) });
}
export {
  BulkAddressImport as B
};
