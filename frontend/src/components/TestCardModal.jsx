import { X, CreditCard, Copy, CheckCircle } from 'lucide-react';
import { useState } from 'react';

export default function TestCardModal({ isOpen, onClose, onProceed }) {
    const [copied, setCopied] = useState(false);

    if (!isOpen) return null;

    const cardNumber = '5267 3181 8797 5449';

    const copyToClipboard = () => {
        navigator.clipboard.writeText(cardNumber.replace(/\s/g, ''));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-fadeIn">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-t-2xl relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                    <div className="flex items-center space-x-3">
                        <div className="bg-white bg-opacity-20 p-3 rounded-full">
                            <CreditCard className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Test Mode Payment</h2>
                            <p className="text-blue-100 text-sm">No real charges will be made</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-semibold text-green-800">This is a test environment</p>
                            <p className="text-xs text-green-700 mt-1">
                                Use the test card details below. No actual money will be charged to any account.
                            </p>
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                        <p className="text-sm font-semibold text-gray-700">Test Card Details:</p>

                        {/* Card Number */}
                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Card Number</p>
                                    <p className="text-lg font-mono font-semibold text-gray-900">{cardNumber}</p>
                                </div>
                                <button
                                    onClick={copyToClipboard}
                                    className="ml-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                    title="Copy card number"
                                >
                                    {copied ? (
                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                    ) : (
                                        <Copy className="h-5 w-5 text-gray-600" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* CVV and Expiry */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-white rounded-lg p-3 border border-gray-200">
                                <p className="text-xs text-gray-500 mb-1">CVV</p>
                                <p className="text-base font-mono font-semibold text-gray-900">123</p>
                            </div>
                            <div className="bg-white rounded-lg p-3 border border-gray-200">
                                <p className="text-xs text-gray-500 mb-1">Expiry Date</p>
                                <p className="text-base font-mono font-semibold text-gray-900">12/25</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                            <p className="text-xs text-gray-500 mb-1">Cardholder Name</p>
                            <p className="text-base font-semibold text-gray-900">Any Name</p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 pt-0 flex space-x-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            onClose();
                            onProceed();
                        }}
                        className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                        Proceed to Payment
                    </button>
                </div>
            </div>
        </div>
    );
}
