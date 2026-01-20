import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Download, ArrowLeft, Mail } from 'lucide-react';
import Navbar from '../components/Navbar';
import { invoiceApi } from '../services/apiService';
import Toast from '../components/Toast';

export default function InvoiceViewPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        loadInvoice();
    }, [id]);

    const loadInvoice = async () => {
        try {
            const response = await invoiceApi.getInvoice(id);
            setInvoice(response.data);
        } catch (error) {
            setToast({ message: 'Failed to load invoice', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const downloadPDF = async () => {
        try {
            const response = await invoiceApi.downloadPDF(id);
            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `invoice-${invoice.invoice_number}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            setToast({ message: 'PDF downloaded successfully', type: 'success' });
        } catch (error) {
            console.error('Download error:', error);
            setToast({ message: 'Failed to download PDF. Please try again.', type: 'error' });
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="flex items-center justify-center h-96">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
            </div>
        );
    }

    if (!invoice) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="container-custom py-8">
                    <div className="card text-center py-12">
                        <p className="text-gray-600">Invoice not found</p>
                        <button onClick={() => navigate('/invoices')} className="btn btn-primary mt-4">
                            Back to Invoices
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const getStatusBadge = (status) => {
        const styles = {
            draft: 'badge badge-warning',
            finalized: 'badge badge-info',
            paid: 'badge badge-success',
            cancelled: 'badge badge-danger',
        };
        return <span className={styles[status] || 'badge'}>{status.toUpperCase()}</span>;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            {toast && <Toast {...toast} onClose={() => setToast(null)} />}

            <div className="container-custom py-8">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <button
                            onClick={() => navigate('/invoices')}
                            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
                        >
                            <ArrowLeft className="h-5 w-5" />
                            <span>Back to Invoices</span>
                        </button>
                        <div className="flex space-x-3">
                            {invoice.status !== 'draft' && (
                                <button onClick={downloadPDF} className="btn btn-primary flex items-center space-x-2">
                                    <Download className="h-5 w-5" />
                                    <span>Download PDF</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Invoice Preview */}
                    <div className="card">
                        {/* Invoice Header */}
                        <div className="border-b border-gray-200 pb-6 mb-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                        {invoice.invoice_number}
                                    </h1>
                                    {getStatusBadge(invoice.status)}
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-600">Invoice Date</p>
                                    <p className="font-semibold">{new Date(invoice.invoice_date).toLocaleDateString('en-IN')}</p>
                                    <p className="text-sm text-gray-600 mt-2">Due Date</p>
                                    <p className="font-semibold">{new Date(invoice.due_date).toLocaleDateString('en-IN')}</p>
                                </div>
                            </div>
                        </div>

                        {/* Client Info */}
                        <div className="mb-6">
                            <h3 className="text-sm font-semibold text-gray-600 mb-2">BILL TO:</h3>
                            <p className="font-semibold text-gray-900">{invoice.client_name}</p>
                            {invoice.client_address && (
                                <p className="text-sm text-gray-600">
                                    {invoice.client_address}, {invoice.client_city}, {invoice.client_state} - {invoice.client_pincode}
                                </p>
                            )}
                            {invoice.client_gstin && (
                                <p className="text-sm text-gray-600">GSTIN: {invoice.client_gstin}</p>
                            )}
                        </div>

                        {/* Line Items */}
                        <div className="mb-6">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-y border-gray-200">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Description</th>
                                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Qty</th>
                                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Rate</th>
                                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {invoice.items && invoice.items.map((item, index) => (
                                        <tr key={index}>
                                            <td className="px-4 py-3 text-sm text-gray-900">{item.description}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600 text-right">{item.quantity}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600 text-right">₹{parseFloat(item.rate).toFixed(2)}</td>
                                            <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                                                ₹{parseFloat(item.amount).toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Totals */}
                        <div className="flex justify-end">
                            <div className="w-64 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Subtotal:</span>
                                    <span className="font-medium">₹{parseFloat(invoice.subtotal || 0).toFixed(2)}</span>
                                </div>
                                {parseFloat(invoice.cgst || 0) > 0 && (
                                    <>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">CGST ({((parseFloat(invoice.cgst) / parseFloat(invoice.subtotal)) * 100).toFixed(1)}%):</span>
                                            <span className="font-medium">₹{parseFloat(invoice.cgst).toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">SGST ({((parseFloat(invoice.sgst) / parseFloat(invoice.subtotal)) * 100).toFixed(1)}%):</span>
                                            <span className="font-medium">₹{parseFloat(invoice.sgst).toFixed(2)}</span>
                                        </div>
                                    </>
                                )}
                                {parseFloat(invoice.igst || 0) > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">IGST ({((parseFloat(invoice.igst) / parseFloat(invoice.subtotal)) * 100).toFixed(1)}%):</span>
                                        <span className="font-medium">₹{parseFloat(invoice.igst).toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-lg font-bold border-t border-gray-300 pt-2">
                                    <span>Total:</span>
                                    <span className="text-primary-600">₹{parseFloat(invoice.total || 0).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Notes */}
                        {invoice.notes && (
                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <h3 className="text-sm font-semibold text-gray-600 mb-2">NOTES:</h3>
                                <p className="text-sm text-gray-700">{invoice.notes}</p>
                            </div>
                        )}

                        {/* Terms */}
                        {invoice.terms_conditions && (
                            <div className="mt-4">
                                <h3 className="text-sm font-semibold text-gray-600 mb-2">TERMS & CONDITIONS:</h3>
                                <p className="text-sm text-gray-700">{invoice.terms_conditions}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
