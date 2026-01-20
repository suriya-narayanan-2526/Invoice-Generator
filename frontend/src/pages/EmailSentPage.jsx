
import { Link } from 'react-router-dom';
import { Mail, ArrowRight } from 'lucide-react';

export default function EmailSentPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100 flex items-center justify-center px-4">
            <div className="max-w-md w-full">
                <div className="card text-center p-8">
                    <div className="bg-primary-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Mail className="h-10 w-10 text-primary-600" />
                    </div>

                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        Check Your Inbox
                    </h1>

                    <p className="text-gray-600 mb-8 text-lg">
                        We've sent a verification link to your email address.
                        Please click the link to activate your account.
                    </p>

                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-8 text-sm text-blue-800">
                        <strong>Can't find it?</strong> Check your spam folder or wait a few minutes.
                    </div>

                    <div className="flex flex-col gap-3">
                        <Link
                            to="/login"
                            className="btn btn-primary flex items-center justify-center gap-2"
                        >
                            Back to Login <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>

                <p className="text-center mt-8 text-gray-500 text-sm">
                    Did you enter the wrong email?{' '}
                    <Link to="/register" className="text-primary-600 hover:underline">
                        Register again
                    </Link>
                </p>
            </div>
        </div>
    );
}
