import { Link } from 'react-router-dom';
import { FileText, Check, Zap, Shield, TrendingUp, Users } from 'lucide-react';

export default function LandingPage() {
    const features = [
        {
            icon: FileText,
            title: 'GST Compliant',
            description: 'Automatic CGST, SGST, and IGST calculations based on client location'
        },
        {
            icon: Zap,
            title: 'Lightning Fast',
            description: 'Create professional invoices in seconds with our intuitive interface'
        },
        {
            icon: Shield,
            title: 'Secure & Reliable',
            description: 'Your data is encrypted and stored securely with automatic backups'
        },
        {
            icon: TrendingUp,
            title: 'Track Revenue',
            description: 'Get insights into your business with comprehensive analytics'
        },
        {
            icon: Users,
            title: 'Client Management',
            description: 'Organize and manage all your clients in one place'
        },
        {
            icon: FileText,
            title: 'PDF Generation',
            description: 'Download professional PDF invoices instantly'
        }
    ];

    const plans = [
        {
            name: 'Free',
            price: '₹0',
            period: 'forever',
            features: [
                '5 invoices per month',
                'Up to 3 clients',
                'GST calculations',
                'PDF downloads',
                'Watermarked invoices'
            ],
            cta: 'Get Started',
            highlighted: false
        },
        {
            name: 'Pro',
            price: '₹299',
            period: 'per month',
            features: [
                'Unlimited invoices',
                'Unlimited clients',
                'GST calculations',
                'PDF downloads',
                'No watermark',
                'Email invoices',
                'Priority support'
            ],
            cta: 'Start Free Trial',
            highlighted: true
        },
        {
            name: 'Pro Yearly',
            price: '₹2,999',
            period: 'per year',
            features: [
                'Everything in Pro',
                'Save ₹600 per year',
                '2 months free',
                'Priority support',
                'Early access to features'
            ],
            cta: 'Best Value',
            highlighted: false
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
            {/* Navigation */}
            <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
                <div className="container-custom">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-2">
                            <FileText className="h-8 w-8 text-primary-600" />
                            <span className="text-xl font-bold text-gray-900">Invoice Generator</span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Link to="/login" className="btn btn-outline">
                                Login
                            </Link>
                            <Link to="/register" className="btn btn-primary">
                                Sign Up Free
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="py-20 px-4">
                <div className="container-custom text-center">
                    <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 animate-fade-in">
                        Professional Invoicing
                        <br />
                        <span className="text-primary-600">Made Simple</span>
                    </h1>
                    <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                        Create GST-compliant invoices in seconds. Perfect for freelancers and small businesses in India.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/register" className="btn btn-primary text-lg px-8 py-3">
                            Start Free Trial
                        </Link>
                        <a href="#features" className="btn btn-outline text-lg px-8 py-3">
                            Learn More
                        </a>
                    </div>
                    <p className="text-sm text-gray-500 mt-4">
                        No credit card required • 5 free invoices every month
                    </p>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 px-4 bg-white">
                <div className="container-custom">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            Everything You Need
                        </h2>
                        <p className="text-xl text-gray-600">
                            Powerful features to streamline your invoicing workflow
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <div key={index} className="card hover:shadow-lg transition-shadow">
                                <div className="flex items-start space-x-4">
                                    <div className="p-3 bg-primary-100 rounded-lg">
                                        <feature.icon className="h-6 w-6 text-primary-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                            {feature.title}
                                        </h3>
                                        <p className="text-gray-600">
                                            {feature.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-20 px-4">
                <div className="container-custom">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            Simple, Transparent Pricing
                        </h2>
                        <p className="text-xl text-gray-600">
                            Choose the plan that's right for your business
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {plans.map((plan, index) => (
                            <div
                                key={index}
                                className={`card ${plan.highlighted
                                        ? 'border-2 border-primary-600 shadow-xl scale-105'
                                        : ''
                                    }`}
                            >
                                {plan.highlighted && (
                                    <div className="bg-primary-600 text-white text-sm font-semibold py-1 px-4 rounded-full inline-block mb-4">
                                        Most Popular
                                    </div>
                                )}
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                    {plan.name}
                                </h3>
                                <div className="mb-6">
                                    <span className="text-4xl font-bold text-gray-900">
                                        {plan.price}
                                    </span>
                                    <span className="text-gray-600 ml-2">/{plan.period}</span>
                                </div>
                                <ul className="space-y-3 mb-8">
                                    {plan.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-start">
                                            <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                                            <span className="text-gray-700">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                                <Link
                                    to="/register"
                                    className={`w-full btn ${plan.highlighted ? 'btn-primary' : 'btn-outline'
                                        }`}
                                >
                                    {plan.cta}
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4 bg-gradient-to-r from-primary-600 to-blue-700 text-white">
                <div className="container-custom text-center">
                    <h2 className="text-4xl font-bold mb-6">
                        Ready to Get Started?
                    </h2>
                    <p className="text-xl mb-8 opacity-90">
                        Join thousands of freelancers and small businesses using Invoice Generator
                    </p>
                    <Link to="/register" className="btn bg-white text-primary-600 hover:bg-gray-100 text-lg px-8 py-3">
                        Create Your Free Account
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-400 py-12 px-4">
                <div className="container-custom text-center">
                    <div className="flex items-center justify-center space-x-2 mb-4">
                        <FileText className="h-6 w-6 text-primary-400" />
                        <span className="text-lg font-semibold text-white">Invoice Generator</span>
                    </div>
                    <p className="mb-4">
                        Professional GST-compliant invoicing for Indian businesses
                    </p>
                    <p className="text-sm">
                        © 2026 Invoice Generator. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}
