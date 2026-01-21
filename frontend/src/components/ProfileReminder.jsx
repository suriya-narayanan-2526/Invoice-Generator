import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowRight, X } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function ProfileReminder({ user }) {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [missingFields, setMissingFields] = useState([]);

    useEffect(() => {
        if (user) {
            checkProfileCompleteness();
        }
    }, [user]);

    // Helper function to check if a field has actual content
    const hasContent = (value) => {
        return value && typeof value === 'string' && value.trim().length > 0;
    };

    const checkProfileCompleteness = () => {
        const missing = [];

        // Check Payment Details - all three must be filled
        if (!hasContent(user.bank_name) || !hasContent(user.account_number) || !hasContent(user.ifsc_code)) {
            missing.push('Bank Details');
        }

        // Check Business Terms
        if (!hasContent(user.terms_conditions)) {
            missing.push('Terms & Conditions');
        }

        // Check Notes
        if (!hasContent(user.default_notes)) {
            missing.push('Default Notes');
        }

        setMissingFields(missing);

        // Use a user-specific key so each user gets their own reminder state
        const reminderKey = `dismissedProfileReminder_${user.id}`;
        const hasDismissed = sessionStorage.getItem(reminderKey);

        // Show dialog if fields are missing and user hasn't dismissed it this session
        if (missing.length > 0 && !hasDismissed) {
            setIsOpen(true);
        }
    };

    const handleDismiss = () => {
        setIsOpen(false);
        const reminderKey = `dismissedProfileReminder_${user.id}`;
        sessionStorage.setItem(reminderKey, 'true');

    };

    if (!isOpen || missingFields.length === 0) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all scale-100">
                <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-yellow-100 rounded-lg">
                                <AlertCircle className="h-6 w-6 text-yellow-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Complete Your Profile</h3>
                        </div>
                        <button
                            onClick={handleDismiss}
                            className="text-gray-400 hover:text-gray-500 transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <p className="text-gray-600 mb-4">
                        To generate professional invoices, we recommend adding the following details that are currently missing:
                    </p>

                    <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-100">
                        <ul className="space-y-2">
                            {missingFields.map((field, index) => (
                                <li key={index} className="flex items-center text-sm text-gray-700">
                                    <div className="h-1.5 w-1.5 rounded-full bg-yellow-500 mr-2"></div>
                                    {field}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="flex justify-end gap-3">
                        <button
                            onClick={handleDismiss}
                            className="btn btn-outline text-gray-600 hover:bg-gray-50"
                        >
                            Remind Me Later
                        </button>
                        <button
                            onClick={() => navigate('/settings')}
                            className="btn btn-primary flex items-center space-x-2"
                        >
                            <span>Update Settings</span>
                            <ArrowRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
                <div className="bg-gray-50 px-6 py-3 text-xs text-gray-500 text-center border-t border-gray-100">
                    You can always update these details later in Settings.
                </div>
            </div>
        </div>
    );
}
