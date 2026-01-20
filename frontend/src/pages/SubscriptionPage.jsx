import { useState, useEffect } from 'react';
import { Check, Crown, Zap, Building2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import { subscriptionApi } from '../services/apiService';
import Toast from '../components/Toast';
import TestCardModal from '../components/TestCardModal';

export default function SubscriptionPage() {
    const [currentPlan, setCurrentPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [showTestCardModal, setShowTestCardModal] = useState(false);
    const [pendingPaymentData, setPendingPaymentData] = useState(null);

    useEffect(() => {
        loadSubscription();
    }, []);

    const loadSubscription = async () => {
        try {
            const response = await subscriptionApi.getCurrentSubscription();
            setCurrentPlan(response.data);
        } catch (error) {
            console.error('Failed to load subscription:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpgrade = async (planType) => {
        if (planType === 'free') {
            setToast({ message: 'You are already on the free plan', type: 'info' });
            return;
        }

        try {
            // Create subscription order
            const response = await subscriptionApi.createSubscription({ planType });

            // Check if it's mock mode or razorpay mode
            if (response.data.mode === 'mock') {
                setToast({ message: response.data.message || 'Subscription upgraded!', type: 'success' });
                loadSubscription();
                return;
            }

            // Razorpay mode - show test card modal first
            const { orderId, amount, currency, keyId } = response.data;

            // Store payment data and show modal
            setPendingPaymentData({ orderId, amount, currency, keyId, planType });
            setShowTestCardModal(true);

        } catch (error) {
            setToast({
                message: error.response?.data?.error || 'Failed to initiate payment',
                type: 'error'
            });
        }
    };

    const handleProceedToPayment = () => {
        if (!pendingPaymentData) return;

        const { orderId, amount, currency, keyId, planType } = pendingPaymentData;

        const options = {
            key: keyId,
            amount: amount,
            currency: currency,
            name: 'Invoice Generator',
            description: `${planType.charAt(0).toUpperCase() + planType.slice(1)} Plan Subscription`,
            order_id: orderId,
            handler: async function (response) {
                try {
                    // Verify payment
                    await subscriptionApi.verifyPayment({
                        orderId: orderId,
                        paymentId: response.razorpay_payment_id,
                        signature: response.razorpay_signature,
                        planType: planType
                    });

                    setToast({ message: 'Payment successful! Subscription activated.', type: 'success' });
                    loadSubscription();
                } catch (error) {
                    setToast({ message: 'Payment verification failed', type: 'error' });
                }
            },
            prefill: {
                name: '',
                email: '',
                contact: ''
            },
            theme: {
                color: '#667eea'
            }
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
    };

    const plans = [
        {
            name: 'Free',
            price: '₹0',
            period: 'forever',
            icon: Zap,
            color: 'text-gray-600',
            bgColor: 'bg-gray-100',
            features: [
                'Free trial: Up to 5 invoices',
                'Up to 1 client',
                'Classic template only',
                'Watermark on all invoices',
                'Single user only',
                'Email support'
            ],
            limitations: [
                'Limited invoices',
                'Force classic template'
            ]
        },
        {
            name: 'Pro',
            price: '₹499',
            period: 'per month',
            icon: Crown,
            color: 'text-primary-600',
            bgColor: 'bg-primary-100',
            popular: true,
            features: [
                'Up to 10 invoices',
                'Up to 5 clients',
                'No watermark',
                'All templates unlocked',
                'Email support',
                'Custom branding',
                'Single user'
            ]
        },
        {
            name: 'Enterprise',
            price: '₹1,999',
            period: 'per month',
            icon: Building2,
            color: 'text-purple-600',
            bgColor: 'bg-purple-100',
            features: [
                'Unlimited invoices',
                'Unlimited clients',
                'No watermark',
                'Everything in Pro',
                'Unlimited users',
                'Dedicated support',
                'White-label solution'
            ]
        }
    ];

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

            {/* Test Card Modal */}
            <TestCardModal
                isOpen={showTestCardModal}
                onClose={() => setShowTestCardModal(false)}
                onProceed={handleProceedToPayment}
            />

            <div className="container-custom py-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Choose Your Plan
                    </h1>
                    <p className="text-xl text-gray-600">
                        Select the perfect plan for your business needs
                    </p>
                </div>

                {/* Test Mode Notice */}
                <div className="max-w-4xl mx-auto mb-8">
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3 flex-1">
                                <h3 className="text-sm font-semibold text-blue-800 mb-2">
                                    Test Mode - No Real Charges
                                </h3>
                                <p className="text-sm text-blue-700 mb-2">
                                    This is a test environment. No actual money will be charged.
                                </p>
                                <div className="bg-white rounded p-3 mt-2">
                                    <p className="text-xs font-semibold text-gray-700 mb-1">Use these test card details:</p>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-gray-600">
                                        <div>
                                            <span className="font-medium">Card:</span> 5267 3181 8797 5449
                                        </div>
                                        <div>
                                            <span className="font-medium">CVV:</span> Any 3 digits (e.g., 123)
                                        </div>
                                        <div>
                                            <span className="font-medium">Expiry:</span> Any future date (e.g., 12/25)
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Current Plan Badge */}
                {currentPlan && (
                    <div className="max-w-2xl mx-auto mb-8">
                        <div className="card bg-gradient-to-r from-primary-50 to-primary-100 border-primary-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Current Plan</p>
                                    <p className="text-2xl font-bold text-primary-600 capitalize">
                                        {currentPlan.plan_type}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-600">Status</p>
                                    <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                                        {currentPlan.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Pricing Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {plans.map((plan) => {
                        const Icon = plan.icon;
                        const isCurrentPlan = currentPlan?.plan_type === plan.name.toLowerCase();

                        return (
                            <div
                                key={plan.name}
                                className={`card relative ${plan.popular ? 'ring-2 ring-primary-500 shadow-xl' : ''
                                    } ${isCurrentPlan ? 'ring-2 ring-green-500' : ''}`}
                            >
                                {/* Popular Badge */}
                                {plan.popular && !isCurrentPlan && (
                                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                        <span className="bg-primary-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                                            Most Popular
                                        </span>
                                    </div>
                                )}

                                {/* Current Plan Badge */}
                                {isCurrentPlan && (
                                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                        <span className="bg-green-600 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center space-x-1">
                                            <Check className="h-4 w-4" />
                                            <span>Your Current Plan</span>
                                        </span>
                                    </div>
                                )}

                                {/* Plan Header */}
                                <div className="text-center mb-6">
                                    <div className={`inline-flex p-3 rounded-full ${plan.bgColor} mb-4`}>
                                        <Icon className={`h-8 w-8 ${plan.color}`} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                        {plan.name}
                                    </h3>
                                    <div className="mb-4">
                                        <span className="text-4xl font-bold text-gray-900">
                                            {plan.price}
                                        </span>
                                        <span className="text-gray-600 ml-2">/{plan.period}</span>
                                    </div>
                                </div>

                                {/* Features */}
                                <ul className="space-y-3 mb-6">
                                    {plan.features.map((feature, index) => (
                                        <li key={index} className="flex items-start">
                                            <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                                            <span className="text-gray-700">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                {/* CTA Button */}
                                <button
                                    onClick={() => handleUpgrade(plan.name.toLowerCase())}
                                    disabled={isCurrentPlan}
                                    className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${isCurrentPlan
                                        ? 'bg-green-100 text-green-700 cursor-not-allowed border-2 border-green-500'
                                        : plan.popular
                                            ? 'bg-primary-600 text-white hover:bg-primary-700'
                                            : 'bg-gray-900 text-white hover:bg-gray-800'
                                        }`}
                                >
                                    {isCurrentPlan ? '✓ Current Plan' : `Upgrade to ${plan.name}`}
                                </button>
                            </div>
                        );
                    })}
                </div>

                {/* FAQ Section */}
                <div className="max-w-3xl mx-auto mt-16">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                        Frequently Asked Questions
                    </h2>
                    <div className="space-y-4">
                        <div className="card">
                            <h3 className="font-semibold text-gray-900 mb-2">
                                Can I change my plan later?
                            </h3>
                            <p className="text-gray-600">
                                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.
                            </p>
                        </div>
                        <div className="card">
                            <h3 className="font-semibold text-gray-900 mb-2">
                                What payment methods do you accept?
                            </h3>
                            <p className="text-gray-600">
                                We accept all major credit cards, debit cards, UPI, and net banking through Razorpay.
                            </p>
                        </div>
                        <div className="card">
                            <h3 className="font-semibold text-gray-900 mb-2">
                                Is there a free trial for paid plans?
                            </h3>
                            <p className="text-gray-600">
                                Yes! All paid plans come with a 14-day free trial. No credit card required.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
