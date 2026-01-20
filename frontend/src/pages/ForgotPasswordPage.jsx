import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import { authApi } from '../services/apiService';
import Toast from '../components/Toast';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [toast, setToast] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await authApi.forgotPassword({ email });
            setSent(true);
            setToast({
                message: 'Password reset link sent! Check your email.',
                type: 'success'
            });
        } catch (error) {
            setToast({
                message: error.response?.data?.error || 'Failed to send reset link',
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
            {toast && <Toast {...toast} onClose={() => setToast(null)} />}

            <div className="w-full max-w-md">
                <div className="card">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex p-3 rounded-full bg-primary-100 mb-4">
                            <Mail className="h-8 w-8 text-primary-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            Forgot Password?
                        </h1>
                        <p className="text-gray-600">
                            No worries! Enter your email and we'll send you reset instructions.
                        </p>
                    </div>

                    {!sent ? (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    required
                                    className="input"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    disabled={loading}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn btn-primary w-full"
                            >
                                {loading ? 'Sending...' : 'Send Reset Link'}
                            </button>

                            <div className="text-center">
                                <Link
                                    to="/login"
                                    className="inline-flex items-center space-x-2 text-sm text-primary-600 hover:text-primary-700"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    <span>Back to Login</span>
                                </Link>
                            </div>
                        </form>
                    ) : (
                        <div className="text-center space-y-6">
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <p className="text-green-800 font-medium mb-2">
                                    ✓ Email Sent Successfully!
                                </p>
                                <p className="text-green-700 text-sm">
                                    We've sent a password reset link to <strong>{email}</strong>
                                </p>
                            </div>

                            <div className="text-sm text-gray-600 space-y-2">
                                <p>Check your email and click the reset link.</p>
                                <p>The link will expire in 1 hour.</p>
                            </div>

                            <div className="pt-4 border-t border-gray-200">
                                <p className="text-sm text-gray-600 mb-3">
                                    Didn't receive the email?
                                </p>
                                <button
                                    onClick={() => setSent(false)}
                                    className="btn btn-outline w-full"
                                >
                                    Try Again
                                </button>
                            </div>

                            <Link
                                to="/login"
                                className="inline-flex items-center space-x-2 text-sm text-primary-600 hover:text-primary-700"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                <span>Back to Login</span>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Help Text */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                        Remember your password?{' '}
                        <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
