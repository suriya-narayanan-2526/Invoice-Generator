import { X } from 'lucide-react';
import { ClassicInvoice, ModernInvoice, ProfessionalInvoice } from './InvoiceTemplates';

export default function TemplatePreviewModal({ isOpen, onClose, templateId, businessData, logoPreview }) {
    if (!isOpen) return null;

    // Construct preview data merging user's business data with sample invoice content
    const previewData = {
        company: {
            name: businessData.name || "Your Company Name",
            address: businessData.address || "123 Business Street",
            city: `${businessData.city || 'City'}, ${businessData.state || 'State'} ${businessData.pincode || ''}`,
            email: "email@example.com",
            phone: "+1 (555) 000-0000",
            logo: logoPreview || "https://via.placeholder.com/150"
        },
        invoice: {
            number: "INV-PREVIEW-001",
            date: new Date().toLocaleDateString('en-CA'),
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-CA')
        },
        client: {
            name: "Sample Client Ltd.",
            address: "789 Client Avenue",
            city: "New York, NY 10001",
            email: "client@example.com",
            phone: "+1 (555) 987-6543"
        },
        items: [
            { name: "Web Development", description: "Design and development services", quantity: 1, price: 5000.00 },
            { name: "Maintenance", description: "Monthly server maintenance", quantity: 2, price: 200.00 },
            { name: "Hosting", description: "Annual hosting fee", quantity: 1, price: 120.00 }
        ],
        subtotal: 5520.00,
        taxRate: 18,
        taxAmount: 993.60,
        discount: 0,
        total: 6513.60,
        payment: {
            method: businessData.payment_method || "Bank Transfer",
            bankName: businessData.bank_name || "Your Bank Name",
            accountName: businessData.account_name || "Your Account Name",
            accountNumber: businessData.account_number || "XXXXXXXXXX",
            routingNumber: businessData.ifsc_code || "IFSC0000"
        },
        notes: businessData.default_notes || "Thank you for your business!",
        terms: "Payment is due within 30 days."
    };

    const showWatermark = (businessData?.plan_type || 'free').toLowerCase() === 'free';

    const renderTemplate = () => {
        switch (templateId) {
            case 'modern':
                return <ModernInvoice invoiceData={previewData} showWatermark={showWatermark} />;
            case 'business': // 'Professional' in UI maps to 'business' in DB
                return <ProfessionalInvoice invoiceData={previewData} showWatermark={showWatermark} />;
            case 'classic':
            default:
                return <ClassicInvoice invoiceData={previewData} showWatermark={showWatermark} />;
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full my-8 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-xl shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Template Preview</h2>
                        <p className="text-sm text-gray-500">
                            Prevising: {templateId.charAt(0).toUpperCase() + templateId.slice(1)} Template
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                    >
                        <X className="h-6 w-6 text-gray-600" />
                    </button>
                </div>

                {/* Preview Content (Scrollable) */}
                <div className="flex-1 overflow-y-auto p-8 bg-gray-100 items-center flex justify-center">
                    <div className="w-full max-w-4xl shadow-lg">
                        {renderTemplate()}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 bg-white rounded-b-xl flex justify-end shrink-0">
                    <button
                        onClick={onClose}
                        className="btn btn-secondary"
                    >
                        Close Preview
                    </button>
                </div>
            </div>
        </div>
    );
}
