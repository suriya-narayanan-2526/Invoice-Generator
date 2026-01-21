import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Mail, Phone, MapPin, Building2, X, AlertTriangle } from 'lucide-react';
import Navbar from '../components/Navbar';
import { clientApi, invoiceApi } from '../services/apiService';
import Toast from '../components/Toast';

export default function ClientsPage() {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [search, setSearch] = useState('');
    const [toast, setToast] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editingClient, setEditingClient] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        gstin: ''
    });

    useEffect(() => {
        loadClients();
        loadStats();
    }, []);

    const loadClients = async () => {
        try {
            const response = await clientApi.getClients();
            setClients(response.data);
        } catch (error) {
            setToast({ message: 'Failed to load clients', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const loadStats = async () => {
        try {
            const response = await invoiceApi.getStats();
            setStats(response.data);
        } catch (error) {
            console.error('Failed to load stats:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingClient) {
                await clientApi.updateClient(editingClient.id, formData);
                setToast({ message: 'Client updated successfully!', type: 'success' });
            } else {
                await clientApi.createClient(formData);
                setToast({ message: 'Client created successfully!', type: 'success' });
            }
            setShowModal(false);
            resetForm();
            loadClients();
            loadStats();
        } catch (error) {
            setToast({ message: error.response?.data?.error || 'Failed to save client', type: 'error' });
        }
    };

    const handleEdit = (client) => {
        setEditingClient(client);
        setFormData({
            name: client.name || '',
            email: client.email || '',
            phone: client.phone || '',
            address: client.address || '',
            city: client.city || '',
            state: client.state || '',
            pincode: client.pincode || '',
            gstin: client.gstin || ''
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this client?')) return;

        try {
            await clientApi.deleteClient(id);
            setToast({ message: 'Client deleted successfully!', type: 'success' });
            loadClients();
        } catch (error) {
            setToast({ message: error.response?.data?.error || 'Failed to delete client', type: 'error' });
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            email: '',
            phone: '',
            address: '',
            city: '',
            state: '',
            pincode: '',
            gstin: ''
        });
        setEditingClient(null);
    };

    const filteredClients = clients.filter(client =>
        client.name?.toLowerCase().includes(search.toLowerCase()) ||
        client.email?.toLowerCase().includes(search.toLowerCase()) ||
        client.phone?.includes(search)
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            {toast && <Toast {...toast} onClose={() => setToast(null)} />}

            <div className="container-custom py-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
                        <p className="text-gray-600 mt-1">Manage your client information</p>
                    </div>
                    <button
                        onClick={() => {
                            resetForm();
                            setShowModal(true);
                        }}
                        className="btn btn-primary flex items-center space-x-2"
                    >
                        <Plus className="h-5 w-5" />
                        <span>Add Client</span>
                    </button>
                </div>

                {/* Search Bar */}
                <div className="card mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search clients by name, email, or phone..."
                            className="input pl-10"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* Clients Grid */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                    </div>
                ) : filteredClients.length === 0 ? (
                    <div className="card text-center py-12">
                        <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {search ? 'No clients found' : 'No clients yet'}
                        </h3>
                        <p className="text-gray-600 mb-6">
                            {search ? 'Try adjusting your search' : 'Get started by adding your first client'}
                        </p>
                        {!search && (
                            <button
                                onClick={() => {
                                    resetForm();
                                    setShowModal(true);
                                }}
                                className="btn btn-primary inline-flex items-center space-x-2"
                            >
                                <Plus className="h-5 w-5" />
                                <span>Add Your First Client</span>
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredClients.map((client) => (
                            <div key={client.id} className="card hover:shadow-lg transition-shadow">
                                {/* Client Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-3 bg-primary-100 rounded-full">
                                            <Building2 className="h-6 w-6 text-primary-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-lg">{client.name}</h3>
                                            {client.gstin && (
                                                <p className="text-xs text-gray-500">GSTIN: {client.gstin}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Client Details */}
                                <div className="space-y-3 mb-4">
                                    {client.email && (
                                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                                            <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                            <span className="truncate">{client.email}</span>
                                        </div>
                                    )}
                                    {client.phone && (
                                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                                            <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                            <span>{client.phone}</span>
                                        </div>
                                    )}
                                    {(client.city || client.state) && (
                                        <div className="flex items-start space-x-2 text-sm text-gray-600">
                                            <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                                            <span>
                                                {[client.city, client.state].filter(Boolean).join(', ')}
                                                {client.pincode && ` - ${client.pincode}`}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex space-x-2 pt-4 border-t border-gray-200">
                                    <button
                                        onClick={() => handleEdit(client)}
                                        className="flex-1 btn btn-outline text-sm flex items-center justify-center space-x-1"
                                    >
                                        <Edit className="h-4 w-4" />
                                        <span>Edit</span>
                                    </button>
                                    <button
                                        onClick={() => handleDelete(client.id)}
                                        className="flex-1 btn bg-red-50 text-red-600 hover:bg-red-100 text-sm flex items-center justify-center space-x-1"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        <span>Delete</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-900">
                                {editingClient ? 'Edit Client' : 'Add New Client'}
                            </h2>
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    resetForm();
                                }}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="h-6 w-6 text-gray-500" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6">
                            {/* Client Limit Warning */}
                            {!editingClient && stats && stats.remainingClients !== undefined && stats.remainingClients <= 0 && (
                                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                                    <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="font-semibold text-red-800">Client Limit Reached</h4>
                                        <p className="text-sm text-red-600 mt-1">
                                            You've reached the maximum number of clients for your {stats.planType || 'free'} plan.
                                            Please upgrade your subscription to add more clients.
                                        </p>
                                        <a href="/subscription" className="text-sm font-medium text-red-700 underline mt-2 inline-block">
                                            Upgrade Now →
                                        </a>
                                    </div>
                                </div>
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Client Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        className="input"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="ABC Company Pvt Ltd"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email *
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        className="input"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="client@example.com"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Phone
                                    </label>
                                    <input
                                        type="tel"
                                        className="input"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="+91 98765 43210"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Address
                                    </label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        placeholder="Street address"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        City
                                    </label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={formData.city}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                        placeholder="Mumbai"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        State
                                    </label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={formData.state}
                                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                        placeholder="Maharashtra"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Pincode
                                    </label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={formData.pincode}
                                        onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                                        placeholder="400001"
                                        maxLength="6"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        GSTIN (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={formData.gstin}
                                        onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                                        placeholder="22AAAAA0000A1Z5"
                                        maxLength="15"
                                    />
                                </div>
                            </div>

                            <div className="flex space-x-3 mt-6 pt-6 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        resetForm();
                                    }}
                                    className="flex-1 btn btn-outline"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 btn btn-primary"
                                    disabled={!editingClient && stats && stats.remainingClients !== undefined && stats.remainingClients <= 0}
                                >
                                    {editingClient ? 'Update Client' : 'Add Client'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
