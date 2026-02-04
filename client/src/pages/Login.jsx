import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import logo from '../assets/dmi_logo.png';

const Login = () => {
    // Current flow state: 'ROLE_SELECT' -> 'CREDENTIALS' (Students) OR 'MOBILE_INPUT' (Others) -> 'OTP' -> 'SET_PASSWORD' -> 'LOGIN_PASSWORD'
    const [step, setStep] = useState('ROLE_SELECT');

    // Core state
    const [role, setRole] = useState('student'); // 'student', 'staff', 'hod', 'principal', 'office'
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    // Student Data
    const [studentData, setStudentData] = useState({ username: '', password: '' });

    // New Auth Flow Data
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [userId, setUserId] = useState(null); // For referencing user during setup
    const [loginPassword, setLoginPassword] = useState(''); // For returning users

    useEffect(() => {
        setError('');
        // Reset flow when role changes at top level
        if (role === 'student') {
            setStep('CREDENTIALS');
        } else {
            setStep('MOBILE_INPUT');
        }
    }, [role]);

    // --- HANDLERS ---

    // 1. Student Login (Legacy)
    const handleStudentLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const res = await axios.post('/api/login', {
                username: studentData.username,
                password: studentData.password,
                role: 'student'
            });
            login({ ...res.data.user, role: 'student' });
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed.');
        } finally {
            setIsLoading(false);
        }
    };

    // 2. Check Mobile (Staff/HOD/etc)
    const handleCheckMobile = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const res = await axios.post('/api/auth/check-user', { role, phone });
            setUserId(res.data.userId);

            if (res.data.status === 'SETUP_REQUIRED') {
                setStep('OTP');
                alert("Demo OTP: 123456");
            } else {
                setStep('LOGIN_PASSWORD');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Mobile verification failed.');
        } finally {
            setIsLoading(false);
        }
    };

    // 3. Verify OTP
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await axios.post('/api/auth/verify-otp', { userId, otp });
            setStep('SET_PASSWORD');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid OTP.');
        } finally {
            setIsLoading(false);
        }
    };

    // 4. Set Password
    const handleSetPassword = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await axios.post('/api/auth/setup-password', { userId, password: newPassword });
            alert("Account Setup Complete! Please Login.");
            setStep('LOGIN_PASSWORD');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to set password.');
        } finally {
            setIsLoading(false);
        }
    };

    // 5. Final Login with Password (Staff/etc)
    const handlePhoneLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const res = await axios.post('/api/auth/login-phone', {
                phone,
                role,
                password: loginPassword
            });
            login({ ...res.data.user, role: role.toLowerCase() }); // Ensure role consistency
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-[#f8fafc]">
            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/20 rounded-full blur-[120px] mix-blend-multiply animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-400/20 rounded-full blur-[120px] mix-blend-multiply animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            <div className="w-full max-w-5xl h-[85vh] m-4 bg-white/80 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-white/50 flex overflow-hidden relative z-10 transition-all duration-500 hover:shadow-blue-900/5">

                {/* Left Side */}
                <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 relative flex-col justify-center items-center p-12 text-white overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10">
                        <div className="absolute right-0 top-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                        <div className="absolute left-0 bottom-0 w-64 h-64 bg-black rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
                    </div>
                    <div className="relative z-10 flex flex-col items-center text-center space-y-8">
                        <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20 shadow-2xl animate-in fade-in zoom-in duration-700">
                            <img src={logo} alt="DMI Logo" className="w-40 h-40 object-contain drop-shadow-xl" />
                        </div>
                        <div className="space-y-4">
                            <h1 className="text-4xl font-bold tracking-tight text-white leading-tight">DMI Engineering College</h1>
                            <div className="h-1 w-24 bg-blue-400 mx-auto rounded-full"></div>
                            <h2 className="text-blue-100 text-xl font-medium tracking-wider uppercase">Computer Science<br />and Engineering</h2>
                        </div>
                    </div>
                    <div className="absolute bottom-8 text-blue-200/60 text-sm font-medium tracking-widest uppercase">
                        Fully Human & Fully Alive
                    </div>
                </div>

                {/* Right Side - Dynamic Form Form */}
                <div className="w-full lg:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-white/40">
                    <div className="max-w-sm mx-auto w-full space-y-8">

                        <div className="text-center lg:text-left">
                            <h2 className="text-3xl font-bold text-slate-800">
                                {step === 'OTP' ? 'Verification' : step === 'SET_PASSWORD' ? 'Set Password' : 'Welcome Back'}
                            </h2>
                            <p className="text-slate-500 mt-2">
                                {step === 'OTP' ? 'Enter the OTP sent to your mobile' :
                                    step === 'SET_PASSWORD' ? 'Create a secure password' : 'Enter your credentials to access the portal.'}
                            </p>
                        </div>

                        {error && (
                            <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                {error}
                            </div>
                        )}

                        <div className="space-y-5">
                            {/* Role Select - Always Visible at Setup */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Role</label>
                                <div className="relative">
                                    <select
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                        className="w-full bg-white border-2 border-slate-100 rounded-xl py-3.5 px-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-slate-700 appearance-none"
                                        disabled={step === 'OTP' || step === 'SET_PASSWORD'}
                                    >
                                        <option value="student">Student</option>
                                        <option value="staff">Staff</option>
                                        <option value="hod">HOD</option>
                                        <option value="office">Office</option>
                                        <option value="principal">Principal</option>
                                    </select>
                                    <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 rotate-90 pointer-events-none" size={16} />
                                </div>
                            </div>

                            {/* --- STUDENT FLOW --- */}
                            {role === 'student' && (
                                <form onSubmit={handleStudentLogin} className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Name</label>
                                        <input
                                            type="text"
                                            className="w-full bg-white border-2 border-slate-100 rounded-xl py-3.5 px-4 outline-none focus:border-blue-500"
                                            placeholder="Enter Name"
                                            value={studentData.username}
                                            onChange={(e) => setStudentData({ ...studentData, username: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Roll Number</label>
                                        <input
                                            type="password"
                                            className="w-full bg-white border-2 border-slate-100 rounded-xl py-3.5 px-4 outline-none focus:border-blue-500"
                                            placeholder="Enter Roll No"
                                            value={studentData.password}
                                            onChange={(e) => setStudentData({ ...studentData, password: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/30 transition-all mt-2">
                                        {isLoading ? 'Processing...' : 'Login'}
                                    </button>
                                </form>
                            )}

                            {/* --- STAFF/HOD FLOW --- */}
                            {role !== 'student' && (
                                <>
                                    {/* Step 1: Mobile */}
                                    {step === 'MOBILE_INPUT' && (
                                        <form onSubmit={handleCheckMobile} className="space-y-4 animate-in fade-in slide-in-from-right-4">
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Mobile Number</label>
                                                <input
                                                    type="tel"
                                                    className="w-full bg-white border-2 border-slate-100 rounded-xl py-3.5 px-4 outline-none focus:border-blue-500"
                                                    placeholder="Enter 10 digit mobile"
                                                    value={phone}
                                                    onChange={(e) => setPhone(e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/30 transition-all mt-2">
                                                {isLoading ? 'Checking...' : 'Continue'}
                                            </button>
                                        </form>
                                    )}

                                    {/* Step 2A: OTP */}
                                    {step === 'OTP' && (
                                        <form onSubmit={handleVerifyOtp} className="space-y-4 animate-in fade-in slide-in-from-right-4">
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Enter OTP</label>
                                                <input
                                                    type="text"
                                                    className="w-full bg-white border-2 border-slate-100 rounded-xl py-3.5 px-4 outline-none focus:border-blue-500 text-center tracking-[1em] font-bold"
                                                    maxLength={6}
                                                    placeholder="••••••"
                                                    value={otp}
                                                    onChange={(e) => setOtp(e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <button type="submit" disabled={isLoading} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-500/30 transition-all mt-2">
                                                {isLoading ? 'Verifying...' : 'Verify OTP'}
                                            </button>
                                        </form>
                                    )}

                                    {/* Step 2B: Set Password */}
                                    {step === 'SET_PASSWORD' && (
                                        <form onSubmit={handleSetPassword} className="space-y-4 animate-in fade-in slide-in-from-right-4">
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Create New Password</label>
                                                <input
                                                    type="password"
                                                    className="w-full bg-white border-2 border-slate-100 rounded-xl py-3.5 px-4 outline-none focus:border-blue-500"
                                                    placeholder="Enter secure password"
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <button type="submit" disabled={isLoading} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-purple-500/30 transition-all mt-2">
                                                {isLoading ? 'Setting...' : 'Set Password & Login'}
                                            </button>
                                        </form>
                                    )}

                                    {/* Step 2C: Enter Password (Login) */}
                                    {step === 'LOGIN_PASSWORD' && (
                                        <form onSubmit={handlePhoneLogin} className="space-y-4 animate-in fade-in slide-in-from-right-4">
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Mobile Number</label>
                                                <input
                                                    type="tel"
                                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3.5 px-4 outline-none text-slate-500 cursor-not-allowed"
                                                    value={phone}
                                                    readOnly
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Password</label>
                                                <input
                                                    type="password"
                                                    className="w-full bg-white border-2 border-slate-100 rounded-xl py-3.5 px-4 outline-none focus:border-blue-500"
                                                    placeholder="Enter your password"
                                                    value={loginPassword}
                                                    onChange={(e) => setLoginPassword(e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/30 transition-all mt-2">
                                                {isLoading ? 'Logging in...' : 'Secure Login'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => { setStep('MOBILE_INPUT'); setPhone(''); }}
                                                className="w-full text-blue-600 text-sm font-medium hover:underline text-center"
                                            >
                                                Not you? Switch Account
                                            </button>
                                        </form>
                                    )}
                                </>
                            )}

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
