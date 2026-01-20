// GST calculation service

export function calculateGST(items, businessState, clientState) {
    // Validate items is an array
    if (!Array.isArray(items)) {
        throw new Error('Items must be an array');
    }

    // Calculate subtotal
    const subtotal = items.reduce((sum, item) => {
        return sum + (item.quantity * item.rate);
    }, 0);

    let cgst = 0;
    let sgst = 0;
    let igst = 0;

    // If same state: CGST + SGST (9% + 9% = 18%)
    // If different state: IGST (18%)
    if (businessState && clientState && businessState.toLowerCase() === clientState.toLowerCase()) {
        cgst = subtotal * 0.09;
        sgst = subtotal * 0.09;
    } else {
        igst = subtotal * 0.18;
    }

    const total = subtotal + cgst + sgst + igst;

    return {
        subtotal: parseFloat(subtotal.toFixed(2)),
        cgst: parseFloat(cgst.toFixed(2)),
        sgst: parseFloat(sgst.toFixed(2)),
        igst: parseFloat(igst.toFixed(2)),
        total: parseFloat(total.toFixed(2))
    };
}

export function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2
    }).format(amount);
}
