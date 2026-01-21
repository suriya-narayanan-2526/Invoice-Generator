import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';

export default function RegisterPage() {
    const navigate = useNavigate();
    const { register, isAuthenticated, loading: authLoading } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        if (!authLoading && isAuthenticated) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, authLoading, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setToast(null);

        // Validate passwords match
        if (formData.password !== formData.confirmPassword) {
            setToast({ message: 'Passwords do not match', type: 'error' });
            return;
        }

        // Validate password requirements
        if (formData.password.length < 8) {
            setToast({ message: 'Password must be at least 8 characters long', type: 'error' });
            return;
        }

        if (!/[A-Z]/.test(formData.password)) {
            setToast({ message: 'Password must contain at least one uppercase letter', type: 'error' });
            return;
        }

        if (!/[0-9]/.test(formData.password)) {
            setToast({ message: 'Password must contain at least one number', type: 'error' });
            return;
        }

        setLoading(true);

        try {
            await register({
                name: formData.name,
                email: formData.email,
                password: formData.password
            });

            setToast({
                message: 'Registration successful! Please check your email to verify your account.',
                type: 'success'
            });

            setTimeout(() => {
                navigate('/email-sent');
            }, 1000);
        } catch (error) {
            // Show specific error from backend or validation errors
            const errorMessage = error.response?.data?.errors
                ? error.response.data.errors.map(err => err.msg).join(', ')
                : error.response?.data?.error || 'Registration failed. Please try again.';

            setToast({
                message: errorMessage,
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100 flex items-center justify-center px-4">
            {toast && <Toast {...toast} onClose={() => setToast(null)} />}

            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Create Account</h1>
                    <p className="text-gray-600">Start generating professional invoices</p>
                </div>

                <div className="card">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Full Name
                            </label>
                            <input
                                type="text"
                                required
                                className="input"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="John Doe"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                required
                                className="input"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="you@example.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                required
                                className="input"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                placeholder="••••••••"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Must be at least 8 characters with one uppercase letter and one number
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                required
                                className="input"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn btn-primary"
                        >
                            {loading ? 'Creating account...' : 'Create Account'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Already have an account?{' '}
                            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
