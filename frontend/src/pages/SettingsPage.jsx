import { useState, useEffect } from 'react';
import { Upload, Save, Building2, Layout } from 'lucide-react';
import Navbar from '../components/Navbar';
import { userApi } from '../services/apiService';
import Toast from '../components/Toast';
import TemplatePreviewModal from '../components/TemplatePreviewModal';

export default function SettingsPage() {
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);
    const [logoFile, setLogoFile] = useState(null);
    const [previewModalOpen, setPreviewModalOpen] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        business_name: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        gstin: '',
        invoice_prefix: 'INV-',
        invoice_template: 'classic',
        bank_name: '',
        account_name: '',
        account_number: '',
        ifsc_code: '',
        payment_method: 'Bank Transfer',
        default_notes: '',
        plan_type: 'free'
    });

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const response = await userApi.getProfile();
            setFormData({
                name: response.data.name || '',
                business_name: response.data.business_name || '',
                address: response.data.address || '',
                city: response.data.city || '',
                state: response.data.state || '',
                pincode: response.data.pincode || '',
                gstin: response.data.gstin || '',
                invoice_prefix: response.data.invoice_prefix || 'INV-',
                invoice_template: response.data.invoice_template || 'classic',
                bank_name: response.data.bank_name || '',
                account_name: response.data.account_name || '',
                account_number: response.data.account_number || '',
                ifsc_code: response.data.ifsc_code || '',
                payment_method: response.data.payment_method || 'Bank Transfer',
                default_notes: response.data.default_notes || '',
                plan_type: response.data.plan_type || 'free'
            });
            if (response.data.logo_url) {
                setLogoPreview(response.data.logo_url);
            }
        } catch (error) {
            setToast({ message: 'Failed to load profile', type: 'error' });
        }
    };

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                setToast({ message: 'Logo must be less than 2MB', type: 'error' });
                return;
            }

            setLogoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Update profile
            await userApi.updateProfile(formData);

            // Upload logo if changed
            if (logoFile) {
                const logoFormData = new FormData();
                logoFormData.append('logo', logoFile);
                await userApi.uploadLogo(logoFormData);
            }

            setToast({ message: 'Settings saved successfully!', type: 'success' });
            loadProfile();
        } catch (error) {
            setToast({
                message: error.response?.data?.error || 'Failed to save settings',
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const indianStates = [
        'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
        'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
        'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
        'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
        'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
        'Delhi', 'Puducherry'
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            {toast && <Toast {...toast} onClose={() => setToast(null)} />}

            <div className="container-custom py-8">
                <div className="max-w-3xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                        <p className="text-gray-600 mt-1">Manage your business profile and preferences</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Logo Upload */}
                        <div className="card">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                                <Building2 className="h-6 w-6 text-primary-600" />
                                <span>Organization Logo</span>
                            </h2>

                            <div className="flex items-center space-x-6">
                                <div className="flex-shrink-0">
                                    {logoPreview ? (
                                        <img
                                            src={logoPreview}
                                            alt="Logo preview"
                                            className="h-24 w-24 object-contain border-2 border-gray-200 rounded-lg p-2"
                                        />
                                    ) : (
                                        <div className="h-24 w-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                                            <Building2 className="h-12 w-12 text-gray-400" />
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1">
                                    <label className="btn btn-outline cursor-pointer inline-flex items-center space-x-2">
                                        <Upload className="h-5 w-5" />
                                        <span>Upload Logo</span>
                                        <input
                                            type="file"
                                            accept="image/png,image/jpeg,image/jpg"
                                            onChange={handleLogoChange}
                                            className="hidden"
                                        />
                                    </label>
                                    <p className="text-sm text-gray-500 mt-2">
                                        PNG or JPG (max 2MB). Recommended size: 200x200px
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Invoice Template Selection */}
                        <div className="card">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                                <Layout className="h-6 w-6 text-primary-600" />
                                <span>Invoice Template</span>
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {[
                                    { id: 'classic', name: 'Classic', desc: 'Clean & Standard', free: true },
                                    { id: 'modern', name: 'Modern', desc: 'Bold & Colorful', free: false },
                                    { id: 'business', name: 'Professional', desc: 'Minimal & Professional', free: false }
                                ].map((template) => {
                                    const isFreePlan = (formData.plan_type || 'free').toLowerCase() === 'free';
                                    const isLocked = isFreePlan && !template.free;

                                    return (
                                        <div
                                            key={template.id}
                                            onClick={() => {
                                                if (!isLocked) {
                                                    setFormData({ ...formData, invoice_template: template.id });
                                                }
                                            }}
                                            className={`relative border-2 rounded-lg p-4 transition-all ${isLocked ? 'opacity-60 cursor-not-allowed bg-gray-50' : 'cursor-pointer'} ${formData.invoice_template === template.id
                                                ? 'border-primary-600 bg-primary-50'
                                                : isLocked ? 'border-gray-200' : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <span className={`font-semibold ${formData.invoice_template === template.id ? 'text-primary-700' : 'text-gray-900'}`}>
                                                    {template.name}
                                                    {isLocked && <span className="ml-2 text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded border border-amber-200 uppercase tracking-wider">Premium</span>}
                                                </span>
                                                {formData.invoice_template === template.id && (
                                                    <div className="h-3 w-3 rounded-full bg-primary-600" />
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-500">{template.desc}</p>
                                        </div>
                                    );
                                })}
                            </div>
                            {(formData.plan_type || 'free').toLowerCase() === 'free' && (
                                <p className="mt-3 text-sm text-amber-600 flex items-center gap-1.5 bg-amber-50 p-2 rounded border border-amber-100">
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                    Premium templates are available in Pro and Enterprise plans.
                                </p>
                            )}
                        </div>

                        <div className="mt-4 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setPreviewModalOpen(true)}
                                className="btn btn-outline flex items-center space-x-2 text-sm"
                            >
                                <Layout className="h-4 w-4" />
                                <span>Preview Selected Template</span>
                            </button>
                        </div>

                        {/* Business Information */}
                        <div className="card">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Business Information</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Your Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        className="input"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Business Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        className="input"
                                        value={formData.business_name}
                                        onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Address *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        className="input"
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        City *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        className="input"
                                        value={formData.city}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        State *
                                    </label>
                                    <select
                                        required
                                        className="input"
                                        value={formData.state}
                                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                    >
                                        <option value="">Select State</option>
                                        {indianStates.map(state => (
                                            <option key={state} value={state}>{state}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Pincode *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        className="input"
                                        value={formData.pincode}
                                        onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
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

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Invoice Prefix
                                    </label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={formData.invoice_prefix}
                                        onChange={(e) => setFormData({ ...formData, invoice_prefix: e.target.value })}
                                        placeholder="INV-"
                                    />
                                    <p className="text-sm text-gray-500 mt-1">
                                        Example: INV-0001, INV-0002, etc.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Payment Details */}
                        <div className="card">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Details</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Bank Name
                                    </label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={formData.bank_name}
                                        onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                                        placeholder="e.g. HDFC Bank"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Account Name
                                    </label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={formData.account_name}
                                        onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
                                        placeholder="Account Holder Name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Account Number
                                    </label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={formData.account_number}
                                        onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        IFSC / Routing Code
                                    </label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={formData.ifsc_code}
                                        onChange={(e) => setFormData({ ...formData, ifsc_code: e.target.value })}
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Payment Method Label
                                    </label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={formData.payment_method}
                                        onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                                        placeholder="e.g. Bank Transfer, UPI, PayPal"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Default Notes */}
                        <div className="card">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Default Notes & Terms</h2>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Default Notes / Terms & Conditions
                                </label>
                                <textarea
                                    className="input min-h-[100px]"
                                    value={formData.default_notes}
                                    onChange={(e) => setFormData({ ...formData, default_notes: e.target.value })}
                                    placeholder="These notes will appear on every new invoice..."
                                />
                            </div>
                        </div>

                        {/* Save Button */}
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn btn-primary flex items-center space-x-2"
                            >
                                <Save className="h-5 w-5" />
                                <span>{loading ? 'Saving...' : 'Save Settings'}</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>


            {/* Preview Modal */}
            <TemplatePreviewModal
                isOpen={previewModalOpen}
                onClose={() => setPreviewModalOpen(false)}
                templateId={formData.invoice_template}
                businessData={formData}
                logoPreview={logoPreview}
            />
        </div >
    );
}
