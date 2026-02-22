import React, { useState } from 'react';
import axios from 'axios';
import { ArrowLeft, User, Phone, Lock, CheckCircle, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/dmi_logo.png';

const Register = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        mobile: '',
        role: 'staff',
        otp: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post('/api/auth/register-check', {
                name: formData.name,
                mobile: formData.mobile,
                role: formData.role
            });
            alert('OTP Sent! Check server console (for Demo).');
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyAndRegister = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);
        try {
            await axios.post('/api/auth/register-verify', {
                name: formData.name,
                mobile: formData.mobile,
                otp: formData.otp,
                password: formData.password,
                role: formData.role
            });
            alert('Registration Successful! Please Login.');
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration Failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/10 rounded-full blur-[120px] mix-blend-multiply"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-400/10 rounded-full blur-[120px] mix-blend-multiply"></div>
            </div>

            <div className="w-full max-w-md bg-white/80 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-white/50 overflow-hidden relative z-10 animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
                    <div className="flex justify-center mb-4">
                        <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20 shadow-xl">
                            <img src={logo} alt="DMI Logo" className="w-16 h-16 object-contain" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Staff Registration</h2>
                    <p className="text-blue-100 text-sm mt-1 font-medium">Create your administrative account</p>
                </div>

                <div className="p-8">
                    {/* Role Selection */}
                    <div className="flex justify-center flex-wrap gap-4 mb-8">
                        {['staff', 'hod', 'principal', 'driver'].map((r) => (
                            <button
                                key={r}
                                onClick={() => setFormData({ ...formData, role: r })}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${formData.role === r
                                    ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-500'
                                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                    } capitalize`}
                            >
                                {r}
                            </button>
                        ))}
                    </div>

                    {step === 1 ? (
                        <form onSubmit={handleSendOTP} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 text-slate-400" size={18} />
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                                        placeholder="Enter your name"
                                        value={formData.name}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Mobile Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-3 text-slate-400" size={18} />
                                    <input
                                        type="tel"
                                        name="mobile"
                                        required
                                        className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                                        placeholder="9876543210"
                                        value={formData.mobile}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            {error && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
                            >
                                {loading ? 'Sending...' : 'Get OTP'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyAndRegister} className="space-y-5">
                            <div className="bg-blue-50 p-4 rounded-xl mb-4 border border-blue-100">
                                <p className="text-sm text-blue-800 flex items-center gap-2">
                                    <CheckCircle size={16} /> OTP sent to {formData.mobile}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Enter OTP</label>
                                <div className="relative">
                                    <Shield className="absolute left-3 top-3 text-slate-400" size={18} />
                                    <input
                                        type="text"
                                        name="otp"
                                        required
                                        className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                                        placeholder="123456"
                                        value={formData.otp}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Create Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
                                    <input
                                        type="password"
                                        name="password"
                                        required
                                        className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                                        placeholder="Min 6 characters"
                                        value={formData.password}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        required
                                        className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                                        placeholder="Confirm password"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            {error && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 transition-all shadow-lg shadow-green-500/30"
                            >
                                {loading ? 'Verifying...' : 'Set Password & Login'}
                            </button>
                        </form>
                    )}

                    <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                        <button
                            onClick={() => navigate('/login')}
                            className="text-slate-500 hover:text-blue-600 font-medium flex items-center justify-center gap-2 mx-auto transition-colors"
                        >
                            <ArrowLeft size={16} /> Back to Login
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
