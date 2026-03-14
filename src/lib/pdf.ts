import { jsPDF } from 'jspdf';
import { Form, FormField } from './supabase';

export function generateSubmissionPDF(
  form: Form,
  data: Record<string, string>
): Buffer {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = 25;

  // Title
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text(form.title, margin, y);
  y += 10;

  // Description
  if (form.description) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120, 120, 120);
    doc.text(form.description, margin, y, { maxWidth: contentWidth });
    y += 8;
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

  // Fields and values
  doc.setTextColor(0, 0, 0);

  for (const field of form.fields) {
    // Check if we need a new page
    if (y > 260) {
      doc.addPage();
      y = 25;
    }

    // Field label
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(80, 80, 80);
    doc.text(field.label, margin, y);
    y += 6;

    // Field value
    const value = data[field.id] || '(empty)';
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 30, 30);

    if (field.type === 'textarea' && value.length > 80) {
      const lines = doc.splitTextToSize(value, contentWidth);
      doc.text(lines, margin, y);
      y += lines.length * 5.5;
    } else {
      doc.text(value, margin, y);
      y += 6;
    }

    y += 8;
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(180, 180, 180);
    doc.text(
      `FormFlow — Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  // Return as Buffer for server-side use
  const arrayBuffer = doc.output('arraybuffer');
  return Buffer.from(arrayBuffer);
}
