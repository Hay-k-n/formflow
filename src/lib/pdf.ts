import { jsPDF } from 'jspdf';
import { Form } from './supabase';

export function generateSubmissionPDF(
  form: Form,
  data: Record<string, string>
): Buffer {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  const bottomMargin = pageHeight - 20;
  let y = 25;

  function ensureSpace(needed: number) {
    if (y + needed > bottomMargin) {
      doc.addPage();
      y = 25;
    }
  }

  // Title
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  ensureSpace(12);
  doc.text(form.title, margin, y);
  y += 10;

  // Description
  if (form.description) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120, 120, 120);
    const descLines = doc.splitTextToSize(form.description, contentWidth);
    ensureSpace(descLines.length * 5 + 3);
    doc.text(descLines, margin, y);
    y += descLines.length * 5 + 3;
  }

  // Divider line
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, pageWidth - margin, y);
  y += 12;

  // Submission date
  doc.setFontSize(9);
  doc.setTextColor(150, 150, 150);
  doc.text(`Submitted: ${new Date().toLocaleString()}`, margin, y);
  y += 14;

  // Fields
  for (const field of form.fields) {
    if (field.type === 'page_break') continue;

    const raw = data[field.id] || '';
    let displayLines: string[];

    if (!raw) {
      displayLines = ['(empty)'];
    } else if (field.type === 'multiselect') {
      const selections = raw.split('\n').filter(Boolean);
      displayLines = selections.length > 0 ? selections : ['(empty)'];
    } else {
      displayLines = [raw];
    }

    // Pre-calculate heights
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    const labelLines = doc.splitTextToSize(field.label, contentWidth);
    const labelH = labelLines.length * 5.5;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    // Wrap each display line individually then flatten
    const wrappedValueLines: string[] = displayLines.flatMap((line) =>
      doc.splitTextToSize(line, contentWidth)
    );
    const valueH = wrappedValueLines.length * 5.5;

    // Add new page if the whole block doesn't fit
    ensureSpace(labelH + valueH + 12);

    // Label
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(80, 80, 80);
    doc.text(labelLines, margin, y);
    y += labelH + 1;

    // Value
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 30, 30);
    doc.text(wrappedValueLines, margin, y);
    y += valueH + 10;
  }

  // Footer on every page
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(180, 180, 180);
    doc.text(
      `Ucena Technologies — Page ${i} of ${pageCount}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  return Buffer.from(doc.output('arraybuffer'));
}
