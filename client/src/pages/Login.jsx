import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { User, Lock, ArrowRight } from 'lucide-react';
import logo from '../assets/dmi_logo.png';

const Login = () => {
    const [staffData, setStaffData] = useState({ username: '', password: '' });

    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);



    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const res = await axios.post('/api/login', {
                username: staffData.username,
                password: staffData.password
            });

            const userData = res.data.user;
            login(userData);
            navigate('/');
        } catch (err) {
            console.error("Login Error", err);
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
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

                {/* Left Side - Visual & Branding */}
                <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 relative flex-col justify-center items-center p-12 text-white overflow-hidden">
                    {/* Abstract Shapes */}
                    <div className="absolute top-0 left-0 w-full h-full opacity-10">
                        <div className="absolute right-0 top-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                        <div className="absolute left-0 bottom-0 w-64 h-64 bg-black rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
                    </div>

                    <div className="relative z-10 flex flex-col items-center text-center space-y-8">
                        {/* Logo */}
                        <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20 shadow-2xl animate-in fade-in zoom-in duration-700" style={{ animationDelay: '100ms' }}>
                            <img src={logo} alt="DMI Logo" className="w-40 h-40 object-contain drop-shadow-xl" />
                        </div>

                        {/* Text Content */}
                        <div className="space-y-4">
                            <h1 className="text-4xl font-bold tracking-tight text-white leading-tight animate-in fade-in slide-in-from-bottom-8 duration-700" style={{ animationDelay: '300ms', animationFillMode: 'both' }}>
                                DMI Engineering College
                            </h1>
                            <div className="h-1 w-24 bg-blue-400 mx-auto rounded-full animate-in fade-in zoom-in duration-700" style={{ animationDelay: '500ms' }}></div>
                            <h2 className="text-blue-100 text-xl font-medium tracking-wider uppercase animate-in fade-in slide-in-from-bottom-8 duration-700" style={{ animationDelay: '700ms', animationFillMode: 'both' }}>
                                Computer Science<br />and Engineering
                            </h2>
                        </div>
                    </div>

                    {/* Footer decoration */}
                    <div className="absolute bottom-8 text-blue-200/60 text-sm font-medium tracking-widest uppercase">
                        Fully Human & Fully Alive
                    </div>
                </div>

                {/* Right Side - Login Form */}
                <div className="w-full lg:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-white/40">
                    <div className="max-w-sm mx-auto w-full space-y-8">
                        <div className="text-center lg:text-left space-y-2">
                            <div className="inline-block lg:hidden mb-4 p-3 bg-blue-50 rounded-2xl animate-in fade-in zoom-in duration-500">
                                <img src={logo} alt="Logo" className="w-12 h-12 object-contain" />
                            </div>
                            <h2 className="text-3xl font-bold text-slate-800 animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>Welcome Back</h2>
                            <p className="text-slate-500 animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: '400ms', animationFillMode: 'both' }}>Please enter your credentials to sign in.</p>
                        </div>

                        {error && (
                            <div className="bg-red-50/80 backdrop-blur-sm border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm flex items-start gap-2 animate-in fade-in slide-in-from-top-2">
                                <div className="mt-0.5 min-w-[16px]">⚠️</div>
                                <p>{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-500">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Username</label>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors duration-300" size={18} />
                                        <input
                                            type="text"
                                            className="w-full bg-white border-2 border-slate-100 rounded-xl py-3.5 pl-11 pr-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-slate-700 placeholder:text-slate-300"
                                            placeholder="Enter Username"
                                            value={staffData.username}
                                            onChange={(e) => setStaffData({ ...staffData, username: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Password</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors duration-300" size={18} />
                                        <input
                                            type="password"
                                            className="w-full bg-white border-2 border-slate-100 rounded-xl py-3.5 pl-11 pr-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-slate-700 placeholder:text-slate-300"
                                            placeholder="••••••••"
                                            value={staffData.password}
                                            onChange={(e) => setStaffData({ ...staffData, password: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="text-right">
                                        <button
                                            type="button"
                                            onClick={() => navigate('/register')}
                                            className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
                                        >
                                            First Time? Create Account
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
                                >
                                    {isLoading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            Sign In
                                            <ArrowRight size={18} />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Footer / Copyright */}
            <div className="absolute bottom-6 left-0 w-full text-center text-slate-400 text-xs font-medium">
                © {new Date().getFullYear()} DMI College of Engineering. All rights reserved.
            </div>
        </div>
    );
};

export default Login;
