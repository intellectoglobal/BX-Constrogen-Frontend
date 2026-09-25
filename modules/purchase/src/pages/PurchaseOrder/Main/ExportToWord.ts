// utils/generateWordFromData.ts

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
} from "docx";
import { saveAs } from "file-saver";

// Type definitions for your data
interface Item {
  key: number;
  descr: string;
}

interface PurchaseOrderItem {
  key: number;
  items: Item;
  brand: string | null;
  model_number: string | null;
  qty: string;
  uom: string | null;
}

interface Project {
  name: string;
  addr1: string | null;
}

interface PurchaseOrderData {
  project: Project;
  purchs_odr_items: PurchaseOrderItem[];
}

const formatQty = (qty: string): string => {
  const num = Number(qty);
  if (isNaN(num)) return qty;
  return num % 1 === 0 ? num.toString() : parseFloat(num.toString()).toString();
};

export const generateWordFromData = (data: PurchaseOrderData): void => {
  const { project, purchs_odr_items } = data;

  const headerFontSize = 32; // 16pt
  const tableFontSize = 24;  // 12pt

  const createHeaderText = (text: string, bold = true) =>
    new TextRun({ text, bold, size: headerFontSize });

  const createTableText = (text: string, bold = false) =>
    new TextRun({ text, bold, size: tableFontSize });

  // Header Paragraphs
  const headerParagraphs = [
    new Paragraph({
      children: [createHeaderText(`Project Name: ${project.name || "-"}`)],
    }),
    new Paragraph({
      children: [createHeaderText(`Project Address: ${project.addr1 || "-"}`)],
    }),
    new Paragraph({ text: "" }),
    new Paragraph({
      children: [createHeaderText("Item List")],
    }),
  ];

  // Table Header Row
  const tableHeaders = new TableRow({
    children: [
      new TableCell({
        width: { size: 25, type: WidthType.PERCENTAGE },
        children: [new Paragraph({ children: [createTableText("Item Name", true)] })],
      }),
      new TableCell({
        width: { size: 15, type: WidthType.PERCENTAGE },
        children: [new Paragraph({ children: [createTableText("Brand", true)] })],
      }),
      new TableCell({
        width: { size: 15, type: WidthType.PERCENTAGE },
        children: [new Paragraph({ children: [createTableText("Model", true)] })],
      }),
      new TableCell({
        width: { size: 15, type: WidthType.PERCENTAGE },
        children: [new Paragraph({ children: [createTableText("Qty", true)] })],
      }),
      new TableCell({
        width: { size: 15, type: WidthType.PERCENTAGE },
        children: [new Paragraph({ children: [createTableText("UOM", true)] })],
      }),
    ],
  });

  // Table Rows
  const tableRows = purchs_odr_items.map((item) => {
    return new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph({ children: [createTableText(item.items.descr)] })],
        }),
        new TableCell({
          children: [new Paragraph({ children: [createTableText(item.brand || "-")] })],
        }),
        new TableCell({
          children: [new Paragraph({ children: [createTableText(item.model_number || "-")] })],
        }),
        new TableCell({
          children: [new Paragraph({ children: [createTableText(formatQty(item.qty))] })],
        }),
        new TableCell({
          children: [new Paragraph({ children: [createTableText(item.uom || "-")] })],
        }),
      ],
    });
  });

  const doc = new Document({
    sections: [
      {
        children: [
          ...headerParagraphs,
          new Table({
            rows: [tableHeaders, ...tableRows],
            width: { size: 100, type: WidthType.PERCENTAGE },
          }),
        ],
      },
    ],
  });

  Packer.toBlob(doc).then((blob) => {
    saveAs(blob, `PO_${project.name || "Document"}.docx`);
  });
};
