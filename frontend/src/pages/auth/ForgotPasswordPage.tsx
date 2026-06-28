import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, Copy, CheckCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import toast from 'react-hot-toast';

// ✅ Yeh line pehle `.env` ka link dhoondegi, agar nahi mila toh fallback local chalayegi
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5243';

export const ForgotPasswordPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [resetToken, setResetToken] = useState('');  // backend se aaya hua token
    const [copied, setCopied] = useState(false);
    const navigate = useNavigate();

    // Step 1: Email submit karo — backend token generate karke return karta hai
    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        setIsLoading(true);

        try {
            const res = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.message || 'Something went wrong');

            // ✅ Token state mein save kiya
            setResetToken(data.resetToken);

            // ✅ Auto-copy token to clipboard
            navigator.clipboard.writeText(data.resetToken).then(() => {
                toast.success('Token generated & copied to clipboard! Redirecting...');
            }).catch(() => {
                toast.success('Token generated! Please copy it.');
            });

            // ✅ 3 seconds baad automatically reset page pe redirect kiya
            setTimeout(() => {
                navigate(`/reset-password?token=${data.resetToken}&email=${encodeURIComponent(email)}`);
            }, 3000);

        } catch (err) {
            toast.error((err as Error).message);
        } finally {
            setIsLoading(false);
        }
    };

    // Token copy karo clipboard mein
    const handleCopy = () => {
        navigator.clipboard.writeText(resetToken);
        setCopied(true);
        toast.success('Token copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
    };

    // Reset page pe jao — token URL mein bhejo
    const handleContinue = () => {
        navigate(`/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`);
    };

    // ---- Token show hone ke baad ka screen ----
    if (resetToken) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="text-center">
                        <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                            Token is Ready!
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            This is your password reset token — copy it and use it in the next step.
                        </p>
                    </div>

                    <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 space-y-4">
                        {/* Token display box */}
                        <div className="bg-gray-100 rounded-lg p-4 break-all text-sm font-mono text-gray-800 border border-gray-300">
                            {resetToken}
                        </div>

                        {/* Copy button */}
                        <Button
                            variant="outline"
                            fullWidth
                            leftIcon={copied ? <CheckCircle size={18} className="text-green-500" /> : <Copy size={18} />}
                            onClick={handleCopy}
                        >
                            {copied ? 'Copied!' : 'Copy Token'}
                        </Button>

                        {/* Continue to reset page */}
                        <Button fullWidth onClick={handleContinue}>
                            Set New Password
                        </Button>

                        <Link to="/login">
                            <Button variant="ghost" fullWidth leftIcon={<ArrowLeft size={18} />}>
                                Back to Login
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // ---- Email form ----
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="text-center">
                    <Mail className="mx-auto h-12 w-12 text-primary-600" />
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        Forgot your password?
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Enter your registered email address to receive your reset token.
                    </p>
                </div>

                <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={handleEmailSubmit}>
                        <Input
                            label="Email address"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            fullWidth
                            startAdornment={<Mail size={18} />}
                        />

                        <Button type="submit" fullWidth isLoading={isLoading}>
                            Get Reset Token
                        </Button>

                        <Link to="/login">
                            <Button variant="ghost" fullWidth leftIcon={<ArrowLeft size={18} />}>
                                Back to Login
                            </Button>
                        </Link>
                    </form>
                </div>
            </div>
        </div>
    );
};