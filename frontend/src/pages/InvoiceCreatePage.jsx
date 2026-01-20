import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Save, Send, Eye, EyeOff, Upload, X } from 'lucide-react';
import Navbar from '../components/Navbar';
import { clientApi, invoiceApi, userApi } from '../services/apiService';
import Toast from '../components/Toast';
import { ClassicInvoice, ModernInvoice, ProfessionalInvoice } from '../components/InvoiceTemplates';

export default function InvoiceCreatePage() {
    const navigate = useNavigate();
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const [showPreview, setShowPreview] = useState(false);
    const [profileData, setProfileData] = useState(null);
    const [signature, setSignature] = useState(null);
    const [signaturePreview, setSignaturePreview] = useState(null);
    const signatureInputRef = useRef(null);

    const [formData, setFormData] = useState({
        clientId: '',
        invoiceDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: '',
        terms_conditions: 'Payment due within 30 days',
        discount: 0
    });

    const [items, setItems] = useState([
        { name: '', description: '', quantity: 1, rate: 0 }
    ]);

    useEffect(() => {
        loadClients();
        loadProfileDefaults();
    }, []);

    const loadProfileDefaults = async () => {
        try {
            const response = await userApi.getProfile();
            setProfileData(response.data);
            setFormData(prev => ({
                ...prev,
                notes: response.data.default_notes || '',
                terms_conditions: response.data.terms_conditions || 'Payment due within 30 days'
            }));
        } catch (error) {
            console.error('Failed to load profile defaults', error);
        }
    };

    const loadClients = async () => {
        try {
            const response = await clientApi.getClients();
            setClients(response.data);
        } catch (error) {
            setToast({ message: 'Failed to load clients', type: 'error' });
        }
    };

    const addItem = () => {
        setItems([...items, { name: '', description: '', quantity: 1, rate: 0 }]);
    };

    const handleSignatureUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                setToast({ message: 'Please upload an image file', type: 'error' });
                return;
            }
            if (file.size > 2 * 1024 * 1024) {
                setToast({ message: 'Signature image must be less than 2MB', type: 'error' });
                return;
            }
            setSignature(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setSignaturePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeSignature = () => {
        setSignature(null);
        setSignaturePreview(null);
        if (signatureInputRef.current) {
            signatureInputRef.current.value = '';
        }
    };

    const removeItem = (index) => {
        if (items.length === 1) {
            setToast({ message: 'At least one item is required', type: 'error' });
            return;
        }
        setItems(items.filter((_, i) => i !== index));
    };

    const updateItem = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;
        setItems(newItems);
    };

    const calculateSubtotal = () => {
        if (!Array.isArray(items)) return 0;
        return items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
    };

    const calculateGST = () => {
        const subtotal = calculateSubtotal();
        // Simplified: 18% GST (9% CGST + 9% SGST for same state)
        return subtotal * 0.18;
    };

    const calculateTotal = () => {
        return calculateSubtotal() + calculateGST() - formData.discount;
    };

    // Build invoice data for template preview
    const getPreviewData = () => {
        const selectedClient = clients.find(c => c.id.toString() === formData.clientId.toString());
        return {
            company: {
                name: profileData?.business_name || profileData?.name || 'Your Business',
                address: profileData?.address || '',
                city: `${profileData?.city || ''}, ${profileData?.state || ''} ${profileData?.pincode || ''}`,
                email: profileData?.email || '',
                phone: profileData?.phone || '',
                logo: profileData?.logo_url || ''
            },
            invoice: {
                number: 'INV-PREVIEW',
                date: formData.invoiceDate,
                dueDate: formData.dueDate
            },
            client: {
                name: selectedClient?.name || 'Select a client',
                address: selectedClient?.address || '',
                city: `${selectedClient?.city || ''}, ${selectedClient?.state || ''}`,
                email: selectedClient?.email || '',
                phone: selectedClient?.phone || ''
            },
            items: items.map((item, index) => ({
                id: index + 1,
                name: item.name || 'Item',
                description: item.description || '',
                quantity: item.quantity,
                price: item.rate
            })),
            subtotal: calculateSubtotal(),
            taxRate: 18,
            taxAmount: calculateGST(),
            discount: formData.discount,
            total: calculateTotal(),
            payment: {
                method: profileData?.payment_method || 'Bank Transfer',
                bankName: profileData?.bank_name || '',
                accountName: profileData?.account_name || '',
                accountNumber: profileData?.account_number || '',
                routingNumber: profileData?.ifsc_code || ''
            },
            notes: formData.notes,
            terms: formData.terms_conditions
        };
    };

    const renderPreviewTemplate = () => {
        const previewData = getPreviewData();
        const planType = (profileData?.plan_type || 'free').toLowerCase();

        // Force classic for free tier
        let template = profileData?.invoice_template || 'classic';
        if (planType === 'free') {
            template = 'classic';
        }

        const showWatermark = planType === 'free';

        switch (template) {
            case 'modern':
                return <ModernInvoice invoiceData={previewData} showWatermark={showWatermark} />;
            case 'business':
                return <ProfessionalInvoice invoiceData={previewData} showWatermark={showWatermark} />;
            default:
                return <ClassicInvoice invoiceData={previewData} showWatermark={showWatermark} />;
        }
    };

    const handleSubmit = async (finalize = false) => {
        if (!formData.clientId) {
            setToast({ message: 'Please select a client', type: 'error' });
            return;
        }

        if (items.some(item => !item.description || item.quantity <= 0 || item.rate <= 0)) {
            setToast({ message: 'Please fill in all item details', type: 'error' });
            return;
        }

        setLoading(true);
        try {
            // Upload signature if provided
            let signatureUrl = null;
            if (signature) {
                const formDataUpload = new FormData();
                formDataUpload.append('signature', signature);

                try {
                    const uploadResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/upload/signature`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        },
                        body: formDataUpload
                    });

                    if (uploadResponse.ok) {
                        const uploadData = await uploadResponse.json();
                        signatureUrl = uploadData.url;
                    }
                } catch (uploadError) {
                    console.error('Signature upload failed:', uploadError);
                    // Continue without signature
                }
            }

            const invoiceData = {
                clientId: formData.clientId,
                invoiceDate: formData.invoiceDate,
                dueDate: formData.dueDate,
                items: items,
                notes: formData.notes,
                terms_conditions: formData.terms_conditions,
                signature_url: signatureUrl
            };

            const response = await invoiceApi.createInvoice(invoiceData);

            if (finalize) {
                await invoiceApi.finalizeInvoice(response.data.id);
                setToast({ message: 'Invoice created and finalized!', type: 'success' });
            } else {
                setToast({ message: 'Invoice saved as draft', type: 'success' });
            }

            setTimeout(() => {
                navigate('/invoices');
            }, 1500);
        } catch (error) {
            setToast({
                message: error.response?.data?.error || error.response?.data?.message || 'Failed to create invoice',
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            {toast && <Toast {...toast} onClose={() => setToast(null)} />}

            <div className="container-custom py-8">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Create Invoice</h1>
                        <p className="text-gray-600 mt-1">Generate a new invoice for your client</p>
                    </div>

                    <div className="card">
                        <form className="space-y-6">
                            {/* Client Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Select Client *
                                </label>
                                <select
                                    required
                                    className="input"
                                    value={formData.clientId}
                                    onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                                >
                                    <option value="">Choose a client</option>
                                    {clients.map(client => (
                                        <option key={client.id} value={client.id}>
                                            {client.name} - {client.email}
                                        </option>
                                    ))}
                                </select>
                                {clients.length === 0 && (
                                    <p className="text-sm text-gray-500 mt-1">
                                        No clients found. <a href="/clients" className="text-primary-600 hover:underline">Add a client first</a>
                                    </p>
                                )}
                            </div>

                            {/* Dates */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Invoice Date *
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        className="input"
                                        value={formData.invoiceDate}
                                        onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Due Date *
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        className="input"
                                        value={formData.dueDate}
                                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Line Items */}
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Line Items *
                                    </label>
                                    <button
                                        type="button"
                                        onClick={addItem}
                                        className="btn btn-outline flex items-center space-x-2 text-sm"
                                    >
                                        <Plus className="h-4 w-4" />
                                        <span>Add Item</span>
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {items.map((item, index) => (
                                        <div key={index} className="p-3 bg-gray-50 rounded-lg space-y-2">
                                            <div className="flex gap-2 items-start">
                                                <div className="w-40">
                                                    <input
                                                        type="text"
                                                        placeholder="Item Name *"
                                                        className="input"
                                                        value={item.name}
                                                        onChange={(e) => updateItem(index, 'name', e.target.value)}
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <input
                                                        type="text"
                                                        placeholder="Description (optional)"
                                                        className="input"
                                                        value={item.description}
                                                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                                                    />
                                                </div>
                                                <div className="w-20">
                                                    <input
                                                        type="number"
                                                        placeholder="Qty"
                                                        min="1"
                                                        className="input text-center"
                                                        value={item.quantity}
                                                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                                                    />
                                                </div>
                                                <div className="w-28">
                                                    <input
                                                        type="number"
                                                        placeholder="Rate"
                                                        min="0"
                                                        step="0.01"
                                                        className="input text-right"
                                                        value={item.rate}
                                                        onChange={(e) => updateItem(index, 'rate', parseFloat(e.target.value) || 0)}
                                                    />
                                                </div>
                                                <div className="w-28">
                                                    <input
                                                        type="text"
                                                        className="input bg-white text-right font-medium"
                                                        value={`₹${(item.quantity * item.rate).toFixed(2)}`}
                                                        readOnly
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeItem(index)}
                                                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                                                >
                                                    <Trash2 className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Calculation Summary */}
                            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Subtotal:</span>
                                    <span className="font-medium">₹{calculateSubtotal().toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">GST (18%):</span>
                                    <span className="font-medium">₹{calculateGST().toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm items-center">
                                    <span className="text-gray-600">Discount:</span>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        className="input w-28 text-right"
                                        value={formData.discount}
                                        onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>
                                <div className="flex justify-between text-lg font-bold border-t border-gray-300 pt-2">
                                    <span>Total:</span>
                                    <span className="text-primary-600">₹{calculateTotal().toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Notes (Optional)
                                </label>
                                <textarea
                                    className="input"
                                    rows="3"
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    placeholder="Any additional notes for the client..."
                                />
                            </div>

                            {/* Terms & Conditions */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Terms & Conditions
                                </label>
                                <textarea
                                    className="input"
                                    rows="2"
                                    value={formData.terms_conditions}
                                    onChange={(e) => setFormData({ ...formData, terms_conditions: e.target.value })}
                                />
                            </div>

                            {/* Signature Upload (Optional) */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Signature (Optional)
                                </label>
                                <div className="flex items-start gap-4">
                                    {signaturePreview ? (
                                        <div className="relative">
                                            <div className="border-2 border-gray-200 rounded-lg p-3 bg-white">
                                                <img
                                                    src={signaturePreview}
                                                    alt="Signature preview"
                                                    className="h-16 max-w-[200px] object-contain"
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={removeSignature}
                                                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="flex flex-col items-center justify-center w-48 h-20 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-500 hover:bg-gray-50 transition-colors">
                                            <Upload className="h-6 w-6 text-gray-400 mb-1" />
                                            <span className="text-sm text-gray-500">Upload Signature</span>
                                            <input
                                                ref={signatureInputRef}
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleSignatureUpload}
                                            />
                                        </label>
                                    )}
                                    <p className="text-xs text-gray-500 mt-2">
                                        Upload your signature image (PNG, JPG). Max 2MB.
                                        <br />This will appear on the invoice PDF.
                                    </p>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-between pt-4 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={() => setShowPreview(!showPreview)}
                                    className="btn btn-outline flex items-center space-x-2"
                                >
                                    {showPreview ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    <span>{showPreview ? 'Hide Preview' : 'Show Preview'}</span>
                                </button>
                                <div className="flex space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => navigate('/invoices')}
                                        className="btn btn-secondary"
                                        disabled={loading}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleSubmit(false)}
                                        className="btn btn-outline flex items-center space-x-2"
                                        disabled={loading}
                                    >
                                        <Save className="h-5 w-5" />
                                        <span>Save as Draft</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleSubmit(true)}
                                        className="btn btn-primary flex items-center space-x-2"
                                        disabled={loading}
                                    >
                                        <Send className="h-5 w-5" />
                                        <span>{loading ? 'Creating...' : 'Create & Finalize'}</span>
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Live Preview Section */}
                    {showPreview && (
                        <div className="mt-8">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Invoice Preview</h2>
                            <div className="bg-gray-100 p-4 rounded-lg overflow-auto">
                                <div className="max-w-4xl mx-auto">
                                    {renderPreviewTemplate()}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
