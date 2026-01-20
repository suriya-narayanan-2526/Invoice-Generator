import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export function generateInvoicePDF(invoiceData, businessData, clientData, isPaidPlan = false) {
    const doc = new jsPDF();
    const planType = (businessData.plan_type || 'free').toLowerCase();

    // Force classic template for free users
    let template = businessData.invoice_template || 'classic';
    if (planType === 'free') {
        template = 'classic';
    }

    // Debug: Log items
    console.log('PDF Service - Items received:', invoiceData.items);
    console.log('PDF Service - Items length:', invoiceData.items?.length);
    console.log('PDF Service - Plan Type:', planType);
    console.log('PDF Service - Using Template:', template);

    // Ensure items is an array
    if (!invoiceData.items || !Array.isArray(invoiceData.items)) {
        console.error('PDF Service - No items array found in invoiceData!');
        invoiceData.items = [];
    }

    switch (template) {
        case 'modern':
            renderModernTemplate(doc, invoiceData, businessData, clientData);
            break;
        case 'business':
            renderProfessionalTemplate(doc, invoiceData, businessData, clientData);
            break;
        case 'classic':
        default:
            renderClassicTemplate(doc, invoiceData, businessData, clientData);
            break;
    }

    // Watermark for free plan
    if (!isPaidPlan) {
        addWatermark(doc);
    }

    return doc;
}

export function generatePDFBuffer(invoiceData, businessData, clientData, isPaidPlan = false) {
    const doc = generateInvoicePDF(invoiceData, businessData, clientData, isPaidPlan);
    return Buffer.from(doc.output('arraybuffer'));
}

export function generatePDFBase64(invoiceData, businessData, clientData, isPaidPlan = false) {
    const doc = generateInvoicePDF(invoiceData, businessData, clientData, isPaidPlan);
    return doc.output('dataurlstring');
}

// ================================
// CLASSIC TEMPLATE
// Matches: border-b-2 border-black, gray-100 table header, black border totals box
// ================================
function renderClassicTemplate(doc, invoiceData, businessData, clientData) {
    const pageWidth = doc.internal.pageSize.width;
    let yPos = 20;

    // --- Header Section ---
    // Logo
    if (businessData.logo_url) {
        addImageSafe(doc, businessData.logo_url, 15, yPos, 40, 15);
        yPos += 25; // Increased from 18 to prevent overlap with large font
    }


    // Company Name (bold, large)
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(17, 24, 39); // gray-900
    doc.text(String(businessData.business_name || businessData.name || 'Business Name'), 15, yPos);
    yPos += 7;

    // Company Details
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(55, 65, 81); // gray-700
    if (businessData.address) { doc.text(String(businessData.address), 15, yPos); yPos += 5; }
    if (businessData.city) { doc.text(`${businessData.city}, ${businessData.state || ''} ${businessData.pincode || ''}`, 15, yPos); yPos += 5; }
    if (businessData.email) { doc.text(String(businessData.email), 15, yPos); yPos += 5; }
    if (businessData.phone) { doc.text(String(businessData.phone), 15, yPos); yPos += 5; }

    // INVOICE Title (right side)
    doc.setFontSize(32);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('INVOICE', pageWidth - 15, 30, { align: 'right' });

    // Invoice meta (right side)
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`Invoice #: ${invoiceData.invoice_number || ''}`, pageWidth - 15, 42, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.text(`Date: ${formatDate(invoiceData.invoice_date)}`, pageWidth - 15, 48, { align: 'right' });
    doc.text(`Due Date: ${formatDate(invoiceData.due_date)}`, pageWidth - 15, 54, { align: 'right' });

    // Border line below header
    yPos = Math.max(yPos, 62);
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.75);
    doc.line(15, yPos, pageWidth - 15, yPos);

    // --- Bill To Section ---
    yPos += 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('BILL TO', 15, yPos);

    // Border under BILL TO
    doc.setDrawColor(209, 213, 219); // gray-300
    doc.setLineWidth(0.3);
    doc.line(15, yPos + 2, 60, yPos + 2);

    yPos += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(17, 24, 39);
    doc.text(clientData.name || '', 15, yPos);
    yPos += 5;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(55, 65, 81);
    if (clientData.address) { doc.text(String(clientData.address), 15, yPos); yPos += 5; }
    if (clientData.city) { doc.text(`${clientData.city}, ${clientData.state || ''} ${clientData.pincode || ''}`, 15, yPos); yPos += 5; }
    if (clientData.email) { doc.text(clientData.email, 15, yPos); yPos += 5; }
    if (clientData.phone) { doc.text(clientData.phone, 15, yPos); yPos += 5; }

    // --- Items Table (5 columns: ITEM, DESCRIPTION, QTY, PRICE, TOTAL) ---
    const tableStartY = yPos + 8;
    const tableData = invoiceData.items.map(item => {
        const itemTotal = parseFloat(item.amount) || (item.quantity * parseFloat(item.rate));
        return [
            item.name || item.description || 'Item',
            item.description || '',
            item.quantity.toString(),
            `Rs.${parseFloat(item.rate).toFixed(2)}`,
            `Rs.${itemTotal.toFixed(2)}`
        ];
    });

    doc.autoTable({
        startY: tableStartY,
        head: [['ITEM', 'DESCRIPTION', 'QTY', 'PRICE', 'TOTAL']],
        body: tableData,
        theme: 'grid',
        headStyles: {
            fillColor: [243, 244, 246], // gray-100
            textColor: [0, 0, 0],
            fontStyle: 'bold',
            fontSize: 9,
            halign: 'left'
        },
        styles: { cellPadding: 4, fontSize: 9, textColor: [55, 65, 81] },
        columnStyles: {
            0: { cellWidth: 50, halign: 'left' },
            1: { cellWidth: 50, halign: 'left', textColor: [107, 114, 128] },
            2: { cellWidth: 20, halign: 'center' },
            3: { cellWidth: 30, halign: 'right' },
            4: { cellWidth: 30, halign: 'right', fontStyle: 'bold' }
        },
        margin: { left: 15, right: 15 }
    });

    // --- Totals Section ---
    let totalsY = doc.lastAutoTable.finalY + 10;
    const totalsX = pageWidth - 95;
    const totalsWidth = 80;

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);

    // Subtotal
    doc.setFont('helvetica', 'bold');
    doc.text('Subtotal:', totalsX, totalsY);
    doc.setFont('helvetica', 'normal');
    doc.text(`Rs.${parseFloat(invoiceData.subtotal).toFixed(2)}`, pageWidth - 15, totalsY, { align: 'right' });
    doc.setDrawColor(209, 213, 219);
    doc.line(totalsX, totalsY + 2, pageWidth - 15, totalsY + 2);

    // Tax
    totalsY += 8;
    const taxRate = invoiceData.tax_rate || 18;
    const taxAmount = invoiceData.tax_amount || (Number(invoiceData.cgst || 0) + Number(invoiceData.sgst || 0) + Number(invoiceData.igst || 0));
    doc.setFont('helvetica', 'bold');
    doc.text(`Tax (${taxRate}%):`, totalsX, totalsY);
    doc.setFont('helvetica', 'normal');
    doc.text(`Rs.${parseFloat(taxAmount).toFixed(2)}`, pageWidth - 15, totalsY, { align: 'right' });
    doc.line(totalsX, totalsY + 2, pageWidth - 15, totalsY + 2);

    // Discount
    totalsY += 8;
    doc.setFont('helvetica', 'bold');
    doc.text('Discount:', totalsX, totalsY);
    doc.setFont('helvetica', 'normal');
    doc.text(`-Rs.${parseFloat(invoiceData.discount || 0).toFixed(2)}`, pageWidth - 15, totalsY, { align: 'right' });
    doc.line(totalsX, totalsY + 2, pageWidth - 15, totalsY + 2);

    // Total Due Box (black border, gray-100 bg)
    totalsY += 8;
    doc.setFillColor(243, 244, 246);
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.75);
    doc.rect(totalsX - 5, totalsY - 4, totalsWidth + 5, 14, 'FD');
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('TOTAL DUE:', totalsX, totalsY + 5);
    doc.text(`Rs.${parseFloat(invoiceData.total).toFixed(2)}`, pageWidth - 18, totalsY + 5, { align: 'right' });

    // --- Payment Information Box ---
    let paymentY = totalsY + 25;
    doc.setDrawColor(209, 213, 219);
    doc.setLineWidth(0.3);
    doc.rect(15, paymentY, pageWidth - 30, 30);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('PAYMENT INFORMATION', 20, paymentY + 8);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(107, 114, 128); // gray-600
    doc.text('Payment Method:', 20, paymentY + 16);
    doc.text('Bank Name:', 20, paymentY + 22);
    doc.text('Account Name:', 105, paymentY + 16);
    doc.text('Account Number:', 105, paymentY + 22);

    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text(businessData.payment_method || 'Bank Transfer', 55, paymentY + 16);
    doc.text(businessData.bank_name || '', 55, paymentY + 22);
    doc.text(businessData.account_name || '', 145, paymentY + 16);
    doc.text(businessData.account_number || '', 145, paymentY + 22);

    // --- Notes & Terms ---
    let notesY = paymentY + 40;
    if (invoiceData.notes) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text('NOTES', 15, notesY);
        notesY += 5;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(55, 65, 81);
        doc.setFontSize(9);
        const notesLines = doc.splitTextToSize(String(invoiceData.notes), pageWidth - 30);
        doc.text(notesLines, 15, notesY);
        notesY += notesLines.length * 4 + 6;
    }

    if (invoiceData.terms_conditions) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text('TERMS & CONDITIONS', 15, notesY);
        notesY += 5;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(55, 65, 81);
        doc.setFontSize(9);
        const termsLines = doc.splitTextToSize(String(invoiceData.terms_conditions), pageWidth - 30);
        doc.text(termsLines, 15, notesY);
        notesY += termsLines.length * 4 + 10;
    }

    // --- Signature Section ---
    const sigY = Math.min(notesY + 10, doc.internal.pageSize.height - 40);

    // Add signature image if available
    if (invoiceData.signature_url) {
        addImageSafe(doc, invoiceData.signature_url, 15, sigY, 50, 15);
    }

    doc.setDrawColor(156, 163, 175); // gray-400
    doc.setLineWidth(0.3);
    doc.line(15, sigY + 18, 80, sigY + 18);
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    doc.text('Authorized Signature', 30, sigY + 23);

    // Date Section on the right
    doc.line(pageWidth - 80, sigY + 18, pageWidth - 15, sigY + 18);
    doc.setTextColor(17, 24, 39); // gray-900
    doc.text(formatDate(invoiceData.invoice_date), pageWidth - 47.5, sigY + 16, { align: 'center' }); // Value ABOVE
    doc.setTextColor(107, 114, 128);
    doc.text('Date', pageWidth - 47.5, sigY + 23, { align: 'center' }); // Label BELOW
}

// ================================
// MODERN TEMPLATE
// Matches: rounded-lg shadow, indigo-600 badge, indigo-50 table, gray-50 bill-to card
// ================================
function renderModernTemplate(doc, invoiceData, businessData, clientData) {
    const pageWidth = doc.internal.pageSize.width;
    const indigo600 = [79, 70, 229];
    const gray50 = [249, 250, 251];
    const indigo50 = [238, 242, 255];
    let yPos = 20;

    // Logo
    if (businessData.logo_url) {
        addImageSafe(doc, businessData.logo_url, 15, yPos, 35, 12);
        yPos += 22; // Increased from 16 to prevent overlap
    }

    // Company Name
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(31, 41, 55); // gray-800
    doc.text(String(businessData.business_name || businessData.name), 15, yPos);
    yPos += 6;

    // Company Details
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(75, 85, 99); // gray-600
    if (businessData.address) { doc.text(String(businessData.address), 15, yPos); yPos += 4; }
    if (businessData.city) { doc.text(`${businessData.city}, ${businessData.state || ''}`, 15, yPos); yPos += 4; }
    doc.setTextColor(...indigo600);
    if (businessData.email) { doc.text(String(businessData.email), 15, yPos); yPos += 4; }
    doc.setTextColor(75, 85, 99);
    if (businessData.phone) { doc.text(String(businessData.phone), 15, yPos); yPos += 4; }

    // INVOICE Badge (right, indigo-600 rounded)
    doc.setFillColor(...indigo600);
    doc.roundedRect(pageWidth - 55, 18, 40, 14, 2, 2, 'F');
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('INVOICE', pageWidth - 35, 28, { align: 'center' });

    // Invoice meta
    doc.setFontSize(9);
    doc.setTextColor(75, 85, 99);
    doc.text(`Invoice `, pageWidth - 55, 40);
    doc.setTextColor(31, 41, 55);
    doc.setFont('helvetica', 'bold');
    doc.text(invoiceData.invoice_number || '', pageWidth - 35, 40);

    doc.setTextColor(75, 85, 99);
    doc.setFont('helvetica', 'normal');
    doc.text(`Date: `, pageWidth - 55, 46);
    doc.setTextColor(31, 41, 55);
    doc.setFont('helvetica', 'bold');
    doc.text(formatDate(invoiceData.invoice_date), pageWidth - 35, 46);

    doc.setTextColor(75, 85, 99);
    doc.setFont('helvetica', 'normal');
    doc.text(`Due: `, pageWidth - 55, 52);
    doc.setTextColor(31, 41, 55);
    doc.setFont('helvetica', 'bold');
    doc.text(formatDate(invoiceData.due_date), pageWidth - 35, 52);

    // Bill To Card (gray-50 rounded)
    yPos = Math.max(yPos + 5, 65);
    doc.setFillColor(...gray50);
    doc.roundedRect(15, yPos, pageWidth - 30, 35, 3, 3, 'F');

    let cardY = yPos + 8;
    doc.setTextColor(...indigo600);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('BILL TO', 20, cardY);

    cardY += 6;
    doc.setTextColor(17, 24, 39);
    doc.setFontSize(12);
    doc.text(clientData.name || '', 20, cardY);

    cardY += 5;
    doc.setTextColor(75, 85, 99);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    if (clientData.address) { doc.text(String(clientData.address), 20, cardY); cardY += 4; }
    doc.text(`${clientData.city || ''}, ${clientData.state || ''}`, 20, cardY); cardY += 4;
    if (clientData.email) doc.text(clientData.email, 20, cardY); cardY += 4;
    if (clientData.phone) doc.text(clientData.phone, 20, cardY);

    // Items Table (indigo-50 header, rounded)
    const tableStartY = yPos + 42;
    const tableData = invoiceData.items.map(item => {
        const itemTotal = parseFloat(item.amount) || (item.quantity * parseFloat(item.rate));
        return [
            item.name || item.description || 'Item',
            item.description || '',
            item.quantity.toString(),
            `Rs.${parseFloat(item.rate).toFixed(2)}`,
            `Rs.${itemTotal.toFixed(2)}`
        ];
    });

    doc.autoTable({
        startY: tableStartY,
        head: [['Item', 'Description', 'Qty', 'Price', 'Total']],
        body: tableData,
        theme: 'striped',
        headStyles: {
            fillColor: indigo50,
            textColor: [55, 65, 81],
            fontStyle: 'bold',
            fontSize: 9,
            halign: 'left'
        },
        styles: { cellPadding: 5, fontSize: 9 },
        columnStyles: {
            0: { cellWidth: 50, fontStyle: 'bold', textColor: [17, 24, 39], halign: 'left' },
            1: { cellWidth: 50, textColor: [75, 85, 99], halign: 'left' },
            2: { cellWidth: 20, halign: 'center' },
            3: { cellWidth: 30, halign: 'right' },
            4: { cellWidth: 30, halign: 'right', fontStyle: 'bold', textColor: [17, 24, 39] }
        },
        margin: { left: 15, right: 15 }
    });

    // Totals
    let totalsY = doc.lastAutoTable.finalY + 10;
    const totalsX = pageWidth - 95;

    doc.setFontSize(10);
    doc.setTextColor(75, 85, 99);
    doc.text('Subtotal', totalsX, totalsY);
    doc.setTextColor(17, 24, 39);
    doc.setFont('helvetica', 'bold');
    doc.text(`Rs.${parseFloat(invoiceData.subtotal).toFixed(2)}`, pageWidth - 15, totalsY, { align: 'right' });

    totalsY += 7;
    const taxRate = invoiceData.tax_rate || 18;
    const taxAmount = invoiceData.tax_amount || (Number(invoiceData.cgst || 0) + Number(invoiceData.sgst || 0) + Number(invoiceData.igst || 0));
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(75, 85, 99);
    doc.text(`Tax (${taxRate}%)`, totalsX, totalsY);
    doc.setTextColor(17, 24, 39);
    doc.setFont('helvetica', 'bold');
    doc.text(`Rs.${parseFloat(taxAmount).toFixed(2)}`, pageWidth - 15, totalsY, { align: 'right' });

    totalsY += 7;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(75, 85, 99);
    doc.text('Discount', totalsX, totalsY);
    doc.setTextColor(17, 24, 39);
    doc.setFont('helvetica', 'bold');
    doc.text(`-Rs.${parseFloat(invoiceData.discount || 0).toFixed(2)}`, pageWidth - 15, totalsY, { align: 'right' });

    // Total line
    totalsY += 5;
    doc.setDrawColor(229, 231, 235);
    doc.line(totalsX, totalsY, pageWidth - 15, totalsY);

    totalsY += 8;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(17, 24, 39);
    doc.text('Total Due', totalsX, totalsY);
    doc.setTextColor(...indigo600);
    doc.text(`Rs.${parseFloat(invoiceData.total).toFixed(2)}`, pageWidth - 15, totalsY, { align: 'right' });

    // Payment Info Card (indigo-50)
    let paymentY = totalsY + 15;
    doc.setFillColor(...indigo50);
    doc.roundedRect(15, paymentY, pageWidth - 30, 30, 3, 3, 'F');

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(31, 41, 55);
    doc.text('Payment Information', 20, paymentY + 8);

    doc.setFontSize(8);
    doc.setTextColor(75, 85, 99);
    doc.text('METHOD', 20, paymentY + 15);
    doc.text('BANK', 60, paymentY + 15);
    doc.text('ACCOUNT NAME', 100, paymentY + 15);
    doc.text('ACCOUNT NUMBER', 150, paymentY + 15);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(17, 24, 39);
    doc.text(businessData.payment_method || 'Bank Transfer', 20, paymentY + 22);
    doc.text(businessData.bank_name || '', 60, paymentY + 22);
    doc.text(businessData.account_name || '', 100, paymentY + 22);
    doc.text(businessData.account_number || '', 150, paymentY + 22);

    // Notes & Terms
    let notesY = paymentY + 40;
    if (invoiceData.notes) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(31, 41, 55);
        doc.text('Notes', 15, notesY);
        notesY += 5;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(75, 85, 99);
        doc.setFontSize(9);
        const lines = doc.splitTextToSize(String(invoiceData.notes), pageWidth - 30);
        doc.text(lines, 15, notesY);
        notesY += lines.length * 4 + 6;
    }

    if (invoiceData.terms_conditions) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(31, 41, 55);
        doc.text('Terms & Conditions', 15, notesY);
        notesY += 5;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(75, 85, 99);
        doc.setFontSize(9);
        const lines = doc.splitTextToSize(String(invoiceData.terms_conditions), pageWidth - 30);
        doc.text(lines, 15, notesY);
        notesY += lines.length * 4 + 10;
    }

    // Signature
    const sigY = Math.min(notesY + 10, doc.internal.pageSize.height - 35);

    // Add signature image if available
    if (invoiceData.signature_url) {
        addImageSafe(doc, invoiceData.signature_url, 15, sigY, 50, 15);
    }

    doc.setDrawColor(209, 213, 219);
    doc.setLineWidth(0.5);
    doc.line(15, sigY + 10, 80, sigY + 10);
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    doc.text('Authorized Signature', 25, sigY + 15);

    // Add Symmetrical Date Box on the right
    doc.line(pageWidth - 80, sigY + 10, pageWidth - 15, sigY + 10);
    doc.setTextColor(31, 41, 55); // gray-800
    doc.text(formatDate(invoiceData.invoice_date), pageWidth - 47.5, sigY + 8, { align: 'center' }); // ABOVE
    doc.setTextColor(107, 114, 128);
    doc.text('Date', pageWidth - 47.5, sigY + 15, { align: 'center' }); // BELOW
}

// ================================
// PROFESSIONAL TEMPLATE
// Matches: slate-800 header, white invoice box, amber-400 due date, slate-50 border-l-4
// ================================
function renderProfessionalTemplate(doc, invoiceData, businessData, clientData) {
    const pageWidth = doc.internal.pageSize.width;
    const slate800 = [30, 41, 59];
    const slate300 = [203, 213, 225];
    const slate50 = [248, 250, 252];
    const amber400 = [251, 191, 36];

    // Header Background (slate-800)
    doc.setFillColor(...slate800);
    doc.rect(0, 0, pageWidth, 60, 'F');

    let yPos = 15;

    // Logo (inverted for dark bg)
    if (businessData.logo_url) {
        addImageSafe(doc, businessData.logo_url, 15, yPos, 30, 10);
        yPos += 22; // Increased from 18 to ensure a safe gap
    }

    // Company Name (white, bold)
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(String(businessData.business_name || businessData.name), 15, yPos);
    yPos += 6;

    // Company Details (slate-300)
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...slate300);
    if (businessData.address) { doc.text(String(businessData.address), 15, yPos); yPos += 4; }
    if (businessData.city) { doc.text(`${businessData.city}, ${businessData.state || ''}`, 15, yPos); }

    // INVOICE Title (right, white, large light font)
    doc.setFontSize(36);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(255, 255, 255);
    doc.text('INVOICE', pageWidth - 15, 28, { align: 'right' });

    // Invoice Number Box (white rounded)
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(pageWidth - 60, 35, 45, 15, 2, 2, 'F');
    doc.setTextColor(100, 116, 139); // slate-500
    doc.setFontSize(7);
    doc.text('Invoice Number', pageWidth - 55, 40);
    doc.setTextColor(...slate800);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(invoiceData.invoice_number || '', pageWidth - 55, 47);

    // Grid header info (Email, Phone, Due)
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text('EMAIL', 15, 52);
    doc.text('PHONE', 60, 52);
    doc.text('DUE DATE', pageWidth - 45, 52, { align: 'right' });

    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text(businessData.email || '', 15, 57);
    doc.text(businessData.phone || '', 60, 57);
    doc.setTextColor(...amber400);
    doc.setFont('helvetica', 'bold');
    doc.text(formatDate(invoiceData.due_date), pageWidth - 15, 57, { align: 'right' });

    // Content Section (below header)
    yPos = 70;

    // Invoice Date (left column)
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text('INVOICE DATE', 15, yPos);
    doc.setDrawColor(...slate800);
    doc.setLineWidth(0.75);
    doc.line(15, yPos + 2, 55, yPos + 2);
    doc.setFontSize(12);
    doc.setTextColor(...slate800);
    doc.text(formatDate(invoiceData.invoice_date), 15, yPos + 10);

    // Bill To (right column)
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text('BILL TO', 80, yPos);
    doc.line(80, yPos + 2, 120, yPos + 2);
    doc.setFontSize(11);
    doc.setTextColor(17, 24, 39);
    doc.text(clientData.name || '', 80, yPos + 10);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(75, 85, 99);
    let clientY = yPos + 15;
    if (clientData.address) { doc.text(String(clientData.address), 80, clientY); clientY += 4; }
    if (clientData.city) { doc.text(`${clientData.city}, ${clientData.state || ''}`, 80, clientY); clientY += 4; }
    if (clientData.email) { doc.text(clientData.email, 80, clientY); clientY += 4; }
    if (clientData.phone) { doc.text(clientData.phone, 80, clientY); }

    // Items Table (Professional style: header border-b-2, alternating rows)
    const tableStartY = yPos + 40;
    const tableData = invoiceData.items.map(item => {
        const itemTotal = parseFloat(item.amount) || (item.quantity * parseFloat(item.rate));
        return [
            item.name || item.description || 'Item',
            item.description || '',
            item.quantity.toString(),
            `Rs.${parseFloat(item.rate).toFixed(2)}`,
            `Rs.${itemTotal.toFixed(2)}`
        ];
    });

    doc.autoTable({
        startY: tableStartY,
        head: [['ITEM', 'DESCRIPTION', 'QTY', 'PRICE', 'AMOUNT']],
        body: tableData,
        theme: 'plain',
        headStyles: {
            fillColor: false,
            textColor: [51, 65, 85], // slate-700
            fontStyle: 'bold',
            fontSize: 9,
            halign: 'left'
        },
        styles: { cellPadding: 5, fontSize: 9 },
        columnStyles: {
            0: { cellWidth: 50, fontStyle: 'bold', textColor: [17, 24, 39], halign: 'left' },
            1: { cellWidth: 50, textColor: [75, 85, 99], halign: 'left' },
            2: { cellWidth: 20, halign: 'center' },
            3: { cellWidth: 30, halign: 'right' },
            4: { cellWidth: 30, halign: 'right', fontStyle: 'bold', textColor: [17, 24, 39] }
        },
        margin: { left: 15, right: 15 },
        didDrawCell: (data) => {
            // Draw header border
            if (data.section === 'head') {
                doc.setDrawColor(...slate800);
                doc.setLineWidth(0.75);
                doc.line(data.cell.x, data.cell.y + data.cell.height, data.cell.x + data.cell.width, data.cell.y + data.cell.height);
            }
            // Alternating row bg
            if (data.section === 'body' && data.row.index % 2 === 0) {
                doc.setFillColor(...slate50);
                doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F');
            }
        },
        willDrawCell: (data) => {
            // Border bottom for each row
            if (data.section === 'body') {
                doc.setDrawColor(226, 232, 240); // slate-200
                doc.setLineWidth(0.3);
                doc.line(data.cell.x, data.cell.y + data.cell.height, data.cell.x + data.cell.width, data.cell.y + data.cell.height);
            }
        }
    });

    // Totals (right aligned, slate-800 total box)
    let totalsY = doc.lastAutoTable.finalY + 10;
    const totalsX = pageWidth - 110;

    doc.setFontSize(10);
    doc.setTextColor(75, 85, 99);
    doc.text('Subtotal', totalsX, totalsY);
    doc.setTextColor(17, 24, 39);
    doc.setFont('helvetica', 'bold');
    doc.text(`Rs.${parseFloat(invoiceData.subtotal).toFixed(2)}`, pageWidth - 15, totalsY, { align: 'right' });

    totalsY += 7;
    const taxRate = invoiceData.tax_rate || 18;
    const taxAmount = invoiceData.tax_amount || (Number(invoiceData.cgst || 0) + Number(invoiceData.sgst || 0) + Number(invoiceData.igst || 0));
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(75, 85, 99);
    doc.text(`Tax (${taxRate}%)`, totalsX, totalsY);
    doc.setTextColor(17, 24, 39);
    doc.setFont('helvetica', 'bold');
    doc.text(`Rs.${parseFloat(taxAmount).toFixed(2)}`, pageWidth - 15, totalsY, { align: 'right' });

    totalsY += 7;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(75, 85, 99);
    doc.text('Discount', totalsX, totalsY);
    doc.setTextColor(17, 24, 39);
    doc.setFont('helvetica', 'bold');
    doc.text(`-Rs.${parseFloat(invoiceData.discount || 0).toFixed(2)}`, pageWidth - 15, totalsY, { align: 'right' });

    // Amount Due Box (slate-800 bg)
    totalsY += 10;
    doc.setFillColor(...slate800);
    doc.roundedRect(totalsX - 5, totalsY - 4, 100, 16, 2, 2, 'F');
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('Amount Due', totalsX, totalsY + 6);
    doc.setFontSize(16);
    doc.text(`Rs.${parseFloat(invoiceData.total).toFixed(2)}`, pageWidth - 18, totalsY + 6, { align: 'right' });

    // Payment Details (slate-50 bg, border-l-4 slate-800)
    let paymentY = totalsY + 25;
    doc.setFillColor(...slate50);
    doc.rect(15, paymentY, pageWidth - 30, 28, 'F');
    doc.setFillColor(...slate800);
    doc.rect(15, paymentY, 2, 28, 'F');

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...slate800);
    doc.text('PAYMENT DETAILS', 22, paymentY + 7);

    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text('PAYMENT METHOD', 22, paymentY + 14);
    doc.text('BANK NAME', 65, paymentY + 14);
    doc.text('ACCOUNT NAME', 110, paymentY + 14);
    doc.text('ACCOUNT NUMBER', 155, paymentY + 14);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(17, 24, 39);
    doc.text(businessData.payment_method || 'Bank Transfer', 22, paymentY + 21);
    doc.text(businessData.bank_name || '', 65, paymentY + 21);
    doc.text(businessData.account_name || '', 110, paymentY + 21);
    doc.text(businessData.account_number || '', 155, paymentY + 21);

    // Notes & Terms (two columns)
    let notesY = paymentY + 38;
    const colWidth = (pageWidth - 40) / 2;

    if (invoiceData.notes) {
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...slate800);
        doc.text('NOTES', 15, notesY);
        notesY += 4;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(75, 85, 99);
        doc.setFontSize(8);
        const lines = doc.splitTextToSize(String(invoiceData.notes), colWidth);
        doc.text(lines, 15, notesY);
    }

    if (invoiceData.terms_conditions) {
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...slate800);
        doc.text('TERMS & CONDITIONS', pageWidth / 2 + 5, paymentY + 38);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(75, 85, 99);
        doc.setFontSize(8);
        const lines = doc.splitTextToSize(String(invoiceData.terms_conditions), colWidth);
        doc.text(lines, pageWidth / 2 + 5, paymentY + 42);
    }

    // Signature Section
    const sigY = doc.internal.pageSize.height - 35;

    // Add signature image if available
    if (invoiceData.signature_url) {
        addImageSafe(doc, invoiceData.signature_url, 15, sigY, 50, 15);
    }

    doc.setDrawColor(...slate300);
    doc.setLineWidth(0.5);
    doc.line(15, sigY + 5, 80, sigY + 5);
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text('AUTHORIZED SIGNATURE', 15, sigY + 10);

    // Add Date Section on the right
    doc.line(pageWidth - 80, sigY + 5, pageWidth - 15, sigY + 5);
    doc.setTextColor(...slate800);
    doc.text(formatDate(invoiceData.invoice_date), pageWidth - 47.5, sigY + 3.5, { align: 'center' }); // ABOVE
    doc.setTextColor(100, 116, 139);
    doc.text('DATE', pageWidth - 47.5, sigY + 10, { align: 'center' }); // BELOW

    doc.text('For questions about this invoice, please contact:', pageWidth - 80, sigY + 25);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...slate800);
    doc.text(businessData.email || '', pageWidth - 80, sigY + 30);
}

// ================================
// HELPERS
// ================================
function formatDate(dateStr) {
    if (!dateStr) return '';
    try {
        return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
        return dateStr;
    }
}

function addWatermark(doc) {
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    doc.saveGraphicsState();
    doc.setGState(new doc.GState({ opacity: 0.08 }));
    doc.setFontSize(50);
    doc.setTextColor(100);
    doc.text('INVOICE GENERATOR', pageWidth / 2, pageHeight / 2, { align: 'center', baseline: 'middle', angle: 45 });
    doc.restoreGraphicsState();
}

function addImageSafe(doc, imageUrl, x, y, w, h) {
    if (!imageUrl) return;
    try {
        let format = 'PNG'; // default usage
        // Try to detect from data URI
        if (imageUrl.startsWith('data:image/')) {
            const match = imageUrl.match(/data:image\/(\w+);base64/);
            if (match && match[1]) {
                format = match[1].toUpperCase();
                if (format === 'JPG') format = 'JPEG';
            }
        } else if (imageUrl.toLowerCase().endsWith('.jpg') || imageUrl.toLowerCase().endsWith('.jpeg')) {
            format = 'JPEG';
        }

        doc.addImage(imageUrl, format, x, y, w, h, undefined, 'FAST');
    } catch (e) {
        console.error('Failed to add image:', e);
    }
}
