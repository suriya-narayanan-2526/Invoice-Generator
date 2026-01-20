import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Download, Eye, Send, Trash2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import { invoiceApi } from '../services/apiService';
import Toast from '../components/Toast';
import ConfirmationModal from '../components/ConfirmationModal';

export default function InvoiceListPage() {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [toast, setToast] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    useEffect(() => {
        loadInvoices();
    }, [statusFilter]);

    const loadInvoices = async () => {
        try {
            const response = await invoiceApi.getInvoices({ status: statusFilter, search });
            setInvoices(response.data.invoices);
        } catch (error) {
            setToast({ message: 'Failed to load invoices', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        loadInvoices();
    };

    const finalizeInvoice = async (id) => {
        try {
            await invoiceApi.finalizeInvoice(id);
            setToast({ message: 'Invoice finalized successfully!', type: 'success' });
            loadInvoices();
        } catch (error) {
            setToast({ message: error.response?.data?.error || 'Failed to finalize invoice', type: 'error' });
        }
    };

    const downloadPDF = async (id, invoiceNumber) => {
        try {
            const response = await invoiceApi.downloadPDF(id);
            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `invoice-${invoiceNumber}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            setToast({ message: 'PDF downloaded successfully', type: 'success' });
        } catch (error) {
            setToast({ message: error.response?.data?.error || 'Failed to download PDF', type: 'error' });
        }
    };

    const handleDelete = async (id) => {
        try {
            await invoiceApi.deleteInvoice(id);
            setToast({ message: 'Invoice deleted successfully', type: 'success' });
            loadInvoices();
        } catch (error) {
            setToast({ message: error.response?.data?.error || 'Failed to delete invoice', type: 'error' });
        }
    };

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
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
                        <p className="text-gray-600 mt-1">Manage all your invoices</p>
                    </div>
                    <Link to="/invoices/create" className="btn btn-primary flex items-center space-x-2">
                        <Plus className="h-5 w-5" />
                        <span>Create Invoice</span>
                    </Link>
                </div>

                {/* Filters */}
                <div className="card mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                            <input
                                type="text"
                                placeholder="Search by invoice number or client..."
                                className="input flex-1"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <button type="submit" className="btn btn-primary">
                                <Search className="h-5 w-5" />
                            </button>
                        </form>

                        <select
                            className="input md:w-48"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="">All Status</option>
                            <option value="draft">Draft</option>
                            <option value="finalized">Finalized</option>
                            <option value="paid">Paid</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                </div>

                {/* Invoice List */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                    </div>
                ) : invoices.length === 0 ? (
                    <div className="card text-center py-12">
                        <p className="text-gray-600">No invoices found</p>
                        <Link to="/invoices/create" className="btn btn-primary mt-4 inline-flex items-center space-x-2">
                            <Plus className="h-5 w-5" />
                            <span>Create Your First Invoice</span>
                        </Link>
                    </div>
                ) : (
                    <div className="card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Invoice #
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Client
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Amount
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {invoices.map((invoice) => (
                                        <tr key={invoice.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {invoice.invoice_number}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {invoice.client_name || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {new Date(invoice.invoice_date).toLocaleDateString('en-IN')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                ₹{invoice.total.toLocaleString('en-IN')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(invoice.status)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end space-x-3">
                                                    {/* View Button - Always show */}
                                                    <Link
                                                        to={`/invoices/${invoice.id}`}
                                                        className="text-primary-600 hover:text-primary-900"
                                                        title="View Invoice"
                                                    >
                                                        <Eye className="h-5 w-5" />
                                                    </Link>

                                                    {/* Finalize or Download */}
                                                    {invoice.status === 'draft' ? (
                                                        <button
                                                            onClick={() => finalizeInvoice(invoice.id)}
                                                            className="text-blue-600 hover:text-blue-900"
                                                            title="Finalize Invoice"
                                                        >
                                                            <Send className="h-5 w-5" />
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => downloadPDF(invoice.id, invoice.invoice_number)}
                                                            className="text-green-600 hover:text-green-900"
                                                            title="Download PDF"
                                                        >
                                                            <Download className="h-5 w-5" />
                                                        </button>
                                                    )}

                                                    {/* Delete Button */}
                                                    <button
                                                        onClick={() => {
                                                            setDeleteId(invoice.id);
                                                            setIsDeleteModalOpen(true);
                                                        }}
                                                        className="text-red-600 hover:text-red-900"
                                                        title="Delete Invoice"
                                                    >
                                                        <Trash2 className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={() => {
                    if (deleteId) {
                        handleDelete(deleteId);
                    }
                }}
                title="Delete Invoice"
                message="Are you sure you want to delete this invoice? This action cannot be undone."
                confirmText="Delete Invoice"
                confirmStyle="danger"
            />
        </div>
    );
}
