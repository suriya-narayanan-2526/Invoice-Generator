import { Link } from 'react-router-dom';
import { FileText, Users, Settings, LogOut, Menu, X, Crown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { subscriptionApi } from '../services/apiService';

export default function Navbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [currentPlan, setCurrentPlan] = useState('free');
    const { user, logout } = useAuth();

    useEffect(() => {
        loadSubscription();
    }, []);

    const loadSubscription = async () => {
        try {
            const response = await subscriptionApi.getCurrentSubscription();
            setCurrentPlan(response.data.plan_type || 'free');
        } catch (error) {
            console.error('Failed to load subscription:', error);
        }
    };

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: FileText },
        { name: 'Invoices', href: '/invoices', icon: FileText },
        { name: 'Clients', href: '/clients', icon: Users },
        { name: 'Subscription', href: '/subscription', icon: Crown },
        { name: 'Settings', href: '/settings', icon: Settings },
    ];

    return (
        <nav className="bg-white shadow-sm border-b border-gray-200">
            <div className="container-custom">
                <div className="flex justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link to="/dashboard" className="flex items-center space-x-2">
                            <FileText className="h-8 w-8 text-primary-600" />
                            <span className="text-xl font-bold text-gray-900">Invoice Generator</span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-4">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                to={item.href}
                                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                                <item.icon className="h-5 w-5" />
                                <span>{item.name}</span>
                            </Link>
                        ))}

                        <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-gray-200">
                            <div className="text-right">
                                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                                <p className="text-xs text-gray-500 capitalize">{currentPlan} Plan</p>
                            </div>
                            <button
                                onClick={logout}
                                className="p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                                title="Logout"
                            >
                                <LogOut className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2 rounded-lg text-gray-700 hover:bg-gray-100"
                        >
                            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {mobileMenuOpen && (
                <div className="md:hidden border-t border-gray-200 bg-white">
                    <div className="px-4 py-3 space-y-1">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                to={item.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100"
                            >
                                <item.icon className="h-5 w-5" />
                                <span>{item.name}</span>
                            </Link>
                        ))}
                        <button
                            onClick={() => {
                                logout();
                                setMobileMenuOpen(false);
                            }}
                            className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50"
                        >
                            <LogOut className="h-5 w-5" />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
}
