import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Users, TrendingUp, Plus, DollarSign, Clock, Eye } from 'lucide-react';
import Navbar from '../components/Navbar';
import { invoiceApi, userApi } from '../services/apiService';
import Toast from '../components/Toast';
import ProfileReminder from '../components/ProfileReminder';

export default function DashboardPage() {
    const [stats, setStats] = useState(null);
    const [recentInvoices, setRecentInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [userProfile, setUserProfile] = useState(null);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            const [statsRes, invoicesRes, profileRes] = await Promise.all([
                invoiceApi.getStats(),
                invoiceApi.getInvoices({ limit: 5 }),
                userApi.getProfile()
            ]);
            setStats(statsRes.data);
            setRecentInvoices(invoicesRes.data.invoices || []);
            setUserProfile(profileRes.data);
        } catch (error) {
            setToast({ message: 'Failed to load dashboard data', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            draft: 'bg-gray-100 text-gray-700',
            finalized: 'bg-blue-100 text-blue-700',
            paid: 'bg-green-100 text-green-700',
            cancelled: 'bg-red-100 text-red-700',
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
                {status.toUpperCase()}
            </span>
        );
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

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            {toast && <Toast {...toast} onClose={() => setToast(null)} />}
            {userProfile && <ProfileReminder user={userProfile} />}

            <div className="container-custom py-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                        <p className="text-gray-600 mt-1">Welcome back! Here's your overview</p>
                    </div>
                    <Link to="/invoices/create" className="btn btn-primary flex items-center space-x-2">
                        <Plus className="h-5 w-5" />
                        <span>Create Invoice</span>
                    </Link>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="card bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-primary-700 font-medium">Total Invoices</p>
                                <p className="text-3xl font-bold text-primary-900 mt-1">{stats?.totalInvoices || 0}</p>
                                <p className="text-xs text-primary-600 mt-1">All time</p>
                            </div>
                            <div className="p-3 bg-primary-200 rounded-lg">
                                <FileText className="h-8 w-8 text-primary-700" />
                            </div>
                        </div>
                    </div>

                    <div className="card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-green-700 font-medium">This Month</p>
                                <p className="text-3xl font-bold text-green-900 mt-1">{stats?.monthInvoices || 0}</p>
                                <p className="text-xs text-green-600 mt-1">Invoices created</p>
                            </div>
                            <div className="p-3 bg-green-200 rounded-lg">
                                <TrendingUp className="h-8 w-8 text-green-700" />
                            </div>
                        </div>
                    </div>

                    <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-blue-700 font-medium">Total Revenue</p>
                                <p className="text-3xl font-bold text-blue-900 mt-1 break-words">
                                    ₹{stats?.totalRevenue?.toLocaleString('en-IN') || 0}
                                </p>
                                <p className="text-xs text-blue-600 mt-1">Lifetime earnings</p>
                            </div>
                            <div className="p-3 bg-blue-200 rounded-lg flex-shrink-0">
                                <DollarSign className="h-8 w-8 text-blue-700" />
                            </div>
                        </div>
                    </div>

                    <div className="card bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-yellow-700 font-medium">Remaining Invoices</p>
                                <p className="text-3xl font-bold text-yellow-900 mt-1">
                                    {stats?.remainingInvoices !== undefined ? stats.remainingInvoices : '...'}
                                </p>
                                <p className="text-xs text-yellow-600 mt-1 capitalize">{stats?.planType || 'free'} plan limit</p>
                            </div>
                            <div className="p-3 bg-yellow-200 rounded-lg">
                                <Clock className="h-8 w-8 text-yellow-700" />
                            </div>
                        </div>
                    </div>

                    {(stats?.planType === 'pro' || stats?.planType === 'free') && (
                        <div className="card bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-purple-700 font-medium">Remaining Clients</p>
                                    <p className="text-3xl font-bold text-purple-900 mt-1">
                                        {stats?.remainingClients !== undefined ? stats.remainingClients : '...'}
                                    </p>
                                    <p className="text-xs text-purple-600 mt-1 capitalize">{stats?.planType || 'free'} plan limit ({stats?.planType === 'pro' ? '5' : '1'})</p>
                                </div>
                                <div className="p-3 bg-purple-200 rounded-lg">
                                    <Users className="h-8 w-8 text-purple-700" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Recent Invoices */}
                    <div className="lg:col-span-2 card">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-900">Recent Invoices</h2>
                            <Link to="/invoices" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                                View All →
                            </Link>
                        </div>

                        {recentInvoices.length === 0 ? (
                            <div className="text-center py-12">
                                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-600">No invoices yet</p>
                                <Link to="/invoices/create" className="btn btn-primary mt-4 inline-flex items-center space-x-2">
                                    <Plus className="h-5 w-5" />
                                    <span>Create Your First Invoice</span>
                                </Link>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice #</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {recentInvoices.map((invoice) => (
                                            <tr key={invoice.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                                    {invoice.invoice_number}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-700">
                                                    {invoice.client_name || 'N/A'}
                                                </td>
                                                <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                                                    ₹{invoice.total.toLocaleString('en-IN')}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {getStatusBadge(invoice.status)}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <Link
                                                        to={`/invoices/${invoice.id}`}
                                                        className="text-primary-600 hover:text-primary-900"
                                                        title="View Invoice"
                                                    >
                                                        <Eye className="h-5 w-5 inline" />
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Quick Actions */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>

                        <Link to="/invoices/create" className="card hover:shadow-md transition-shadow block">
                            <div className="flex items-center space-x-4">
                                <div className="p-3 bg-primary-100 rounded-lg">
                                    <Plus className="h-6 w-6 text-primary-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">Create Invoice</h3>
                                    <p className="text-sm text-gray-600">Generate a new invoice</p>
                                </div>
                            </div>
                        </Link>

                        <Link to="/clients" className="card hover:shadow-md transition-shadow block">
                            <div className="flex items-center space-x-4">
                                <div className="p-3 bg-green-100 rounded-lg">
                                    <Users className="h-6 w-6 text-green-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">Manage Clients</h3>
                                    <p className="text-sm text-gray-600">Add or edit clients</p>
                                </div>
                            </div>
                        </Link>

                        <Link to="/invoices" className="card hover:shadow-md transition-shadow block">
                            <div className="flex items-center space-x-4">
                                <div className="p-3 bg-blue-100 rounded-lg">
                                    <FileText className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">View Invoices</h3>
                                    <p className="text-sm text-gray-600">Browse all invoices</p>
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Upgrade Banner (if free plan) */}
                {stats?.remainingInvoices !== 'unlimited' && stats?.remainingInvoices <= 2 && (
                    <div className="card bg-gradient-to-r from-primary-500 to-blue-600 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold">Running low on invoices?</h3>
                                <p className="mt-1">Upgrade to Pro for unlimited invoices and more features!</p>
                            </div>
                            <Link to="/subscription" className="btn bg-white text-primary-600 hover:bg-gray-100">
                                Upgrade Now
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
