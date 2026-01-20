import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { authApi } from '../services/apiService';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

export default function VerifyEmailPage() {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [message, setMessage] = useState('');
    const token = searchParams.get('token');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Invalid verification link. Token is missing.');
            return;
        }

        verifyEmail();
    }, [token]);

    const verifyEmail = async () => {
        try {
            const response = await authApi.verifyEmail(token);
            setStatus('success');
            setMessage(response.data.message || 'Email verified successfully!');
        } catch (error) {
            setStatus('error');
            setMessage(error.response?.data?.error || 'Verification failed. Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100 flex items-center justify-center px-4">
            <div className="max-w-md w-full">
                <div className="card text-center">
                    {status === 'verifying' && (
                        <>
                            <Loader className="h-16 w-16 text-primary-600 mx-auto mb-4 animate-spin" />
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                Verifying Your Email
                            </h1>
                            <p className="text-gray-600">Please wait...</p>
                        </>
                    )}

                    {status === 'success' && (
                        <>
                            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                Email Verified!
                            </h1>
                            <p className="text-gray-600 mb-6">{message}</p>
                            <Link to="/login" className="btn btn-primary">
                                Go to Login
                            </Link>
                        </>
                    )}

                    {status === 'error' && (
                        <>
                            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                Verification Failed
                            </h1>
                            <p className="text-gray-600 mb-6">{message}</p>
                            <div className="flex flex-col gap-3">
                                <Link to="/register" className="btn btn-primary">
                                    Register Again
                                </Link>
                                <Link to="/login" className="btn btn-outline">
                                    Back to Login
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
