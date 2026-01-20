import { useState } from 'react';

const Watermark = () => (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden select-none opacity-[0.05] z-0">
        <span className="text-[120px] font-black transform -rotate-45 whitespace-nowrap">
            INVOICE GENERATOR
        </span>
    </div>
);

// Classic Invoice Template
export const ClassicInvoice = ({ invoiceData, showWatermark = false }) => {
    const { company, invoice, client, items, subtotal, taxRate, taxAmount, discount, total, payment, notes, terms } = invoiceData;

    return (
        <div className="relative max-w-4xl mx-auto bg-white p-8 print:p-6 overflow-hidden">
            {showWatermark && <Watermark />}
            <div className="relative z-10">
                {/* Header */}
                <div className="border-b-2 border-black pb-6 mb-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <img src={company.logo} alt={company.name} className="h-10 mb-3" />
                            <h1 className="text-3xl font-bold tracking-tight">{company.name}</h1>
                            <p className="text-sm mt-2 text-gray-700">{company.address}</p>
                            <p className="text-sm text-gray-700">{company.city}</p>
                            <p className="text-sm text-gray-700">{company.email}</p>
                            <p className="text-sm text-gray-700">{company.phone}</p>
                        </div>
                        <div className="text-right">
                            <h2 className="text-4xl font-bold">INVOICE</h2>
                            <div className="mt-4 text-sm">
                                <p className="font-semibold">Invoice #: {invoice.number}</p>
                                <p>Date: {invoice.date}</p>
                                <p>Due Date: {invoice.dueDate}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bill To */}
                <div className="mb-8">
                    <h3 className="text-lg font-bold mb-3 border-b border-gray-300 pb-1">BILL TO</h3>
                    <p className="font-semibold text-gray-900">{client.name}</p>
                    <p className="text-sm text-gray-700">{client.address}</p>
                    <p className="text-sm text-gray-700">{client.city}</p>
                    <p className="text-sm text-gray-700">{client.email}</p>
                    <p className="text-sm text-gray-700">{client.phone}</p>
                </div>

                {/* Items Table */}
                <table className="w-full mb-6 border border-gray-300">
                    <thead>
                        <tr className="bg-gray-100 border-b border-gray-300">
                            <th className="text-left p-3 font-semibold text-sm border-r border-gray-300">ITEM</th>
                            <th className="text-left p-3 font-semibold text-sm border-r border-gray-300">DESCRIPTION</th>
                            <th className="text-center p-3 font-semibold text-sm border-r border-gray-300">QTY</th>
                            <th className="text-right p-3 font-semibold text-sm border-r border-gray-300">PRICE</th>
                            <th className="text-right p-3 font-semibold text-sm">TOTAL</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, index) => (
                            <tr key={item.id} className={index !== items.length - 1 ? "border-b border-gray-300" : ""}>
                                <td className="p-3 text-sm border-r border-gray-300">{item.name}</td>
                                <td className="p-3 text-sm text-gray-600 border-r border-gray-300">{item.description}</td>
                                <td className="p-3 text-sm text-center border-r border-gray-300">{item.quantity}</td>
                                <td className="p-3 text-sm text-right border-r border-gray-300">₹{item.price.toFixed(2)}</td>
                                <td className="p-3 text-sm text-right">₹{(item.quantity * item.price).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Totals */}
                <div className="flex justify-end mb-8">
                    <div className="w-80">
                        <div className="flex justify-between py-2 border-b border-gray-300">
                            <span className="text-sm font-semibold">Subtotal:</span>
                            <span className="text-sm">₹{subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-300">
                            <span className="text-sm font-semibold">Tax ({taxRate}%):</span>
                            <span className="text-sm">₹{taxAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-300">
                            <span className="text-sm font-semibold">Discount:</span>
                            <span className="text-sm">-₹{discount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between py-3 bg-gray-100 px-3 mt-2 border-2 border-black">
                            <span className="text-lg font-bold">TOTAL DUE:</span>
                            <span className="text-lg font-bold">₹{total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Payment Info */}
                <div className="mb-6 border border-gray-300 p-4">
                    <h3 className="text-sm font-bold mb-2">PAYMENT INFORMATION</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                            <p className="text-gray-600">Payment Method:</p>
                            <p className="font-semibold">{payment.method}</p>
                        </div>
                        <div>
                            <p className="text-gray-600">Bank Name:</p>
                            <p className="font-semibold">{payment.bankName}</p>
                        </div>
                        <div>
                            <p className="text-gray-600">Account Name:</p>
                            <p className="font-semibold">{payment.accountName}</p>
                        </div>
                        <div>
                            <p className="text-gray-600">Account Number:</p>
                            <p className="font-semibold">{payment.accountNumber}</p>
                        </div>
                    </div>
                </div>

                {/* Notes and Terms */}
                <div className="mb-6 text-sm">
                    <div className="mb-4">
                        <h3 className="font-bold mb-1">NOTES</h3>
                        <p className="text-gray-700">{notes}</p>
                    </div>
                    <div>
                        <h3 className="font-bold mb-1">TERMS & CONDITIONS</h3>
                        <p className="text-gray-700">{terms}</p>
                    </div>
                </div>

                {/* Signature */}
                <div className="border-t-2 border-gray-300 pt-6 mt-8">
                    <div className="flex justify-between">
                        <div className="w-64">
                            <div className="border-b border-gray-400 mb-1 h-12"></div>
                            <p className="text-xs text-gray-600 text-center">Authorized Signature</p>
                        </div>
                        <div className="w-32 text-right">
                            <div className="border-b border-gray-400 mb-1 h-12"></div>
                            <p className="text-xs text-gray-600 text-center">Date</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Modern Invoice Template
export const ModernInvoice = ({ invoiceData, showWatermark = false }) => {
    const { company, invoice, client, items, subtotal, taxRate, taxAmount, discount, total, payment, notes, terms } = invoiceData;

    return (
        <div className="relative max-w-4xl mx-auto bg-gradient-to-br from-gray-50 to-gray-100 p-8 print:p-6 overflow-hidden">
            {showWatermark && <Watermark />}
            <div className="relative z-10 bg-white rounded-lg shadow-lg p-8">
                {/* Header */}
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <img src={company.logo} alt={company.name} className="h-10 mb-4" />
                        <h1 className="text-2xl font-bold text-gray-800">{company.name}</h1>
                        <div className="mt-3 text-sm text-gray-600 space-y-1">
                            <p>{company.address}</p>
                            <p>{company.city}</p>
                            <p className="text-indigo-600">{company.email}</p>
                            <p>{company.phone}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg">
                            <h2 className="text-2xl font-bold">INVOICE</h2>
                        </div>
                        <div className="mt-4 space-y-1 text-sm">
                            <p className="text-gray-600">Invoice <span className="font-semibold text-gray-800">{invoice.number}</span></p>
                            <p className="text-gray-600">Date: <span className="font-semibold text-gray-800">{invoice.date}</span></p>
                            <p className="text-gray-600">Due: <span className="font-semibold text-gray-800">{invoice.dueDate}</span></p>
                        </div>
                    </div>
                </div>

                {/* Bill To Card */}
                <div className="bg-gray-50 rounded-lg p-6 mb-8">
                    <h3 className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-3">Bill To</h3>
                    <p className="font-bold text-gray-900 text-lg mb-2">{client.name}</p>
                    <div className="text-sm text-gray-600 space-y-1">
                        <p>{client.address}</p>
                        <p>{client.city}</p>
                        <p>{client.email}</p>
                        <p>{client.phone}</p>
                    </div>
                </div>

                {/* Items */}
                <div className="mb-8">
                    <div className="overflow-hidden rounded-lg border border-gray-200">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-indigo-50">
                                    <th className="text-left p-4 font-semibold text-sm text-gray-700">Item</th>
                                    <th className="text-left p-4 font-semibold text-sm text-gray-700">Description</th>
                                    <th className="text-center p-4 font-semibold text-sm text-gray-700">Qty</th>
                                    <th className="text-right p-4 font-semibold text-sm text-gray-700">Price</th>
                                    <th className="text-right p-4 font-semibold text-sm text-gray-700">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {items.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50">
                                        <td className="p-4 text-sm font-medium text-gray-900">{item.name}</td>
                                        <td className="p-4 text-sm text-gray-600">{item.description}</td>
                                        <td className="p-4 text-sm text-center text-gray-700">{item.quantity}</td>
                                        <td className="p-4 text-sm text-right text-gray-700">₹{item.price.toFixed(2)}</td>
                                        <td className="p-4 text-sm text-right font-medium text-gray-900">₹{(item.quantity * item.price).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Summary */}
                <div className="flex justify-end mb-8">
                    <div className="w-80 space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Subtotal</span>
                            <span className="font-medium text-gray-900">₹{subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Tax ({taxRate}%)</span>
                            <span className="font-medium text-gray-900">₹{taxAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Discount</span>
                            <span className="font-medium text-gray-900">-₹{discount.toFixed(2)}</span>
                        </div>
                        <div className="border-t border-gray-200 pt-3">
                            <div className="flex justify-between">
                                <span className="text-lg font-bold text-gray-900">Total Due</span>
                                <span className="text-lg font-bold text-indigo-600">₹{total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Payment Info Card */}
                <div className="bg-indigo-50 rounded-lg p-6 mb-6">
                    <h3 className="text-sm font-bold text-gray-800 mb-3">Payment Information</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-gray-600 text-xs uppercase tracking-wide mb-1">Method</p>
                            <p className="font-semibold text-gray-900">{payment.method}</p>
                        </div>
                        <div>
                            <p className="text-gray-600 text-xs uppercase tracking-wide mb-1">Bank</p>
                            <p className="font-semibold text-gray-900">{payment.bankName}</p>
                        </div>
                        <div>
                            <p className="text-gray-600 text-xs uppercase tracking-wide mb-1">Account Name</p>
                            <p className="font-semibold text-gray-900">{payment.accountName}</p>
                        </div>
                        <div>
                            <p className="text-gray-600 text-xs uppercase tracking-wide mb-1">Account Number</p>
                            <p className="font-semibold text-gray-900">{payment.accountNumber}</p>
                        </div>
                    </div>
                </div>

                {/* Notes */}
                <div className="space-y-4 text-sm mb-8">
                    <div>
                        <h3 className="font-semibold text-gray-800 mb-2">Notes</h3>
                        <p className="text-gray-600 leading-relaxed">{notes}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-800 mb-2">Terms & Conditions</h3>
                        <p className="text-gray-600 leading-relaxed">{terms}</p>
                    </div>
                </div>

                {/* Signature */}
                <div className="flex justify-between items-end pt-6 border-t border-gray-200">
                    <div className="w-64">
                        <div className="border-b-2 border-gray-300 h-16 mb-2"></div>
                        <p className="text-xs text-gray-500">Authorized Signature</p>
                    </div>
                    <div className="text-right text-xs text-gray-500">
                        <p>Thank you for your business!</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Professional Invoice Template
export const ProfessionalInvoice = ({ invoiceData, showWatermark = false }) => {
    const { company, invoice, client, items, subtotal, taxRate, taxAmount, discount, total, payment, notes, terms } = invoiceData;

    return (
        <div className="relative max-w-4xl mx-auto bg-white print:p-0 overflow-hidden">
            {showWatermark && <Watermark />}
            <div className="relative z-10">
                {/* Header */}
                <div className="bg-slate-800 text-white p-8">
                    <div className="flex justify-between items-start">
                        <div>
                            <img src={company.logo} alt={company.name} className="h-10 mb-4 brightness-0 invert" />
                            <h1 className="text-3xl font-bold mb-2">{company.name}</h1>
                            <div className="text-sm text-slate-300 space-y-1">
                                <p>{company.address}</p>
                                <p>{company.city}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <h2 className="text-5xl font-light mb-4">INVOICE</h2>
                            <div className="bg-white text-slate-800 px-4 py-2 rounded inline-block">
                                <p className="text-xs text-slate-600">Invoice Number</p>
                                <p className="text-lg font-bold">{invoice.number}</p>
                            </div>
                        </div>
                    </div>
                    <div className="mt-6 grid grid-cols-3 gap-4 text-sm">
                        <div>
                            <p className="text-slate-400 text-xs uppercase tracking-wide mb-1">Email</p>
                            <p>{company.email}</p>
                        </div>
                        <div>
                            <p className="text-slate-400 text-xs uppercase tracking-wide mb-1">Phone</p>
                            <p>{company.phone}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-slate-400 text-xs uppercase tracking-wide mb-1">Due Date</p>
                            <p className="text-amber-400 font-semibold">{invoice.dueDate}</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8">
                    {/* Client Info */}
                    <div className="grid grid-cols-2 gap-8 mb-8">
                        <div>
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3 pb-2 border-b-2 border-slate-800">Invoice Date</h3>
                            <p className="text-lg font-semibold text-slate-800">{invoice.date}</p>
                        </div>
                        <div>
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3 pb-2 border-b-2 border-slate-800">Bill To</h3>
                            <p className="font-bold text-slate-900 mb-2">{client.name}</p>
                            <div className="text-sm text-slate-600 space-y-1">
                                <p>{client.address}</p>
                                <p>{client.city}</p>
                                <p>{client.email}</p>
                                <p>{client.phone}</p>
                            </div>
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="mb-8">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b-2 border-slate-800">
                                    <th className="text-left py-3 font-bold text-sm text-slate-700 uppercase tracking-wide">Item</th>
                                    <th className="text-left py-3 font-bold text-sm text-slate-700 uppercase tracking-wide">Description</th>
                                    <th className="text-center py-3 font-bold text-sm text-slate-700 uppercase tracking-wide">Qty</th>
                                    <th className="text-right py-3 font-bold text-sm text-slate-700 uppercase tracking-wide">Price</th>
                                    <th className="text-right py-3 font-bold text-sm text-slate-700 uppercase tracking-wide">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item, index) => (
                                    <tr key={item.id} className={`border-b border-slate-200 ${index % 2 === 0 ? 'bg-slate-50' : ''}`}>
                                        <td className="py-4 text-sm font-medium text-slate-900">{item.name}</td>
                                        <td className="py-4 text-sm text-slate-600">{item.description}</td>
                                        <td className="py-4 text-sm text-center text-slate-700">{item.quantity}</td>
                                        <td className="py-4 text-sm text-right text-slate-700">₹{item.price.toFixed(2)}</td>
                                        <td className="py-4 text-sm text-right font-semibold text-slate-900">₹{(item.quantity * item.price).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Summary Section */}
                    <div className="flex justify-end mb-8">
                        <div className="w-96">
                            <div className="space-y-2 mb-4">
                                <div className="flex justify-between py-2 text-sm">
                                    <span className="text-slate-600">Subtotal</span>
                                    <span className="font-medium text-slate-900">₹{subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between py-2 text-sm">
                                    <span className="text-slate-600">Tax ({taxRate}%)</span>
                                    <span className="font-medium text-slate-900">₹{taxAmount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between py-2 text-sm">
                                    <span className="text-slate-600">Discount</span>
                                    <span className="font-medium text-slate-900">-₹{discount.toFixed(2)}</span>
                                </div>
                            </div>
                            <div className="bg-slate-800 text-white p-4 rounded">
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-bold">Amount Due</span>
                                    <span className="text-2xl font-bold">₹{total.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment Details */}
                    <div className="bg-slate-50 border-l-4 border-slate-800 p-6 mb-6">
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-4">Payment Details</h3>
                        <div className="grid grid-cols-2 gap-6 text-sm">
                            <div>
                                <p className="text-slate-500 text-xs uppercase tracking-wide mb-1">Payment Method</p>
                                <p className="font-semibold text-slate-900">{payment.method}</p>
                            </div>
                            <div>
                                <p className="text-slate-500 text-xs uppercase tracking-wide mb-1">Bank Name</p>
                                <p className="font-semibold text-slate-900">{payment.bankName}</p>
                            </div>
                            <div>
                                <p className="text-slate-500 text-xs uppercase tracking-wide mb-1">Account Name</p>
                                <p className="font-semibold text-slate-900">{payment.accountName}</p>
                            </div>
                            <div>
                                <p className="text-slate-500 text-xs uppercase tracking-wide mb-1">Account Number</p>
                                <p className="font-semibold text-slate-900">{payment.accountNumber}</p>
                            </div>
                        </div>
                    </div>

                    {/* Notes and Terms */}
                    <div className="grid grid-cols-2 gap-6 mb-8 text-sm">
                        <div>
                            <h3 className="font-bold text-slate-800 mb-2 uppercase tracking-wide text-xs">Notes</h3>
                            <p className="text-slate-600 leading-relaxed">{notes}</p>
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 mb-2 uppercase tracking-wide text-xs">Terms & Conditions</h3>
                            <p className="text-slate-600 leading-relaxed">{terms}</p>
                        </div>
                    </div>

                    {/* Signature Section */}
                    <div className="pt-8 border-t border-slate-200">
                        <div className="flex justify-between items-end">
                            <div className="w-72">
                                <div className="border-b-2 border-slate-300 h-16 mb-2"></div>
                                <p className="text-xs text-slate-500 uppercase tracking-wide">Authorized Signature</p>
                                <p className="text-xs text-slate-400 mt-1">Date: _______________</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-slate-500">For questions about this invoice, please contact:</p>
                                <p className="text-sm font-semibold text-slate-800 mt-1">{company.email}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Demo Component with Template Switcher
const InvoiceTemplateDemo = ({ invoiceData }) => {
    const [activeTemplate, setActiveTemplate] = useState('classic');

    const templates = {
        classic: { component: ClassicInvoice, name: 'Classic Invoice' },
        modern: { component: ModernInvoice, name: 'Modern Invoice' },
        professional: { component: ProfessionalInvoice, name: 'Professional Invoice' }
    };

    const ActiveComponent = templates[activeTemplate].component;

    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="max-w-6xl mx-auto px-4">
                {/* Template Selector */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Invoice Template Selector</h2>
                    <div className="flex gap-4">
                        {Object.entries(templates).map(([key, { name }]) => (
                            <button
                                key={key}
                                onClick={() => setActiveTemplate(key)}
                                className={`px-6 py-3 rounded-lg font-semibold transition-all ${activeTemplate === key
                                    ? 'bg-indigo-600 text-white shadow-lg'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                            >
                                {name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Active Template Display */}
                <div className="bg-white rounded-lg shadow-xl overflow-hidden">
                    <ActiveComponent invoiceData={invoiceData} />
                </div>

                {/* Print Button */}
                <div className="mt-8 text-center">
                    <button
                        onClick={() => window.print()}
                        className="bg-slate-800 text-white px-8 py-3 rounded-lg font-semibold hover:bg-slate-700 transition-colors"
                    >
                        Print Invoice
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InvoiceTemplateDemo;
