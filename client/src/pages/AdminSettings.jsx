import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Settings, Calendar, GraduationCap, ArrowRight, Save, Trash2, AlertCircle, RefreshCw, Users } from 'lucide-react';

const AdminSettings = () => {
    const [settings, setSettings] = useState({});
    const [newYear, setNewYear] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            console.log("Fetching settings...");
            const res = await axios.get('/api/settings');
            console.log("Settings received:", res.data);
            setSettings(res.data || {});

            // Pre-fill next year suggestion
            if (res.data && res.data.current_academic_year) {
                try {
                    const parts = res.data.current_academic_year.split('-');
                    if (parts.length === 2) {
                        const start = parseInt(parts[0]);
                        const end = parseInt(parts[1]);
                        if (!isNaN(start) && !isNaN(end)) {
                            setNewYear(`${start + 1}-${end + 1}`);
                        }
                    }
                } catch (splitErr) {
                    console.error("Error parsing year:", splitErr);
                }
            }
        } catch (err) {
            console.error("Fetch settings error:", err);
            setStatus({ type: 'error', message: 'Failed to load system settings. Please check server connection.' });
        }
    };

    const handlePromote = async () => {
        if (!window.confirm(`CRITICAL ACTION: Are you sure you want to promote the academic year to ${newYear}? \n\nThis will:\n1. Graduate all current 4th-year students.\n2. Promote all other students to the next year.\n3. Archive all current year data.`)) {
            return;
        }

        setLoading(true);
        setStatus({ type: 'info', message: 'Processing promotion... Please wait.' });
        try {
            const res = await axios.post('/api/admin/promote-year', { newYear });
            setStatus({ type: 'success', message: res.data.message });
            fetchSettings();
        } catch (err) {
            setStatus({ type: 'error', message: err.response?.data?.message || 'Promotion failed' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl">
                    <Settings size={32} />
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-slate-800">Admin Settings</h2>
                    <p className="text-slate-500 font-medium">Manage system-wide academic configurations</p>
                </div>
            </div>

            {status.message && (
                <div className={`p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                    status.type === 'error' ? 'bg-red-50 text-red-700 border border-red-100' :
                        'bg-blue-50 text-blue-700 border border-blue-100'
                    }`}>
                    {status.type === 'error' ? <Trash2 size={20} /> : <AlertCircle size={20} />}
                    <span className="font-semibold">{status.message}</span>
                </div>
            )}

            <div className="grid gap-8">
                {/* Academic Year Management */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:shadow-md">
                    <div className="p-6 md:p-8 space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <Calendar className="text-blue-500" size={24} />
                            <h3 className="text-xl font-bold text-slate-800">Academic Year Control</h3>
                        </div>

                        <div className="flex flex-col md:flex-row gap-8 items-center bg-slate-50 p-6 rounded-2xl border border-slate-100">
                            <div className="flex-1 text-center md:text-left">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Current Academic Year</p>
                                <div className="text-4xl font-black text-blue-600">
                                    {settings.current_academic_year || 'Loading...'}
                                </div>
                            </div>

                            <div className="hidden md:block">
                                <ArrowRight className="text-slate-300" size={32} />
                            </div>

                            <div className="flex-1 w-full space-y-3">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center md:text-left mb-1">New Academic Year</p>
                                <input
                                    type="text"
                                    value={newYear}
                                    onChange={(e) => setNewYear(e.target.value)}
                                    placeholder="e.g. 2026-2027"
                                    className="w-full px-5 py-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-bold text-lg text-slate-700 placeholder:text-slate-300 shadow-inner"
                                />
                            </div>
                        </div>

                        <div className="p-5 bg-amber-50 border border-amber-100 rounded-2xl flex gap-4">
                            <div className="p-2 bg-amber-100 text-amber-600 rounded-lg h-fit">
                                <AlertCircle size={20} />
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-bold text-amber-800">Dangerous Action Required Once a Year</p>
                                <p className="text-xs text-amber-700 leading-relaxed font-medium">
                                    Clicking promote will move all students to their next respective years and graduate seniors. Previous scores and attendance will be archived automatically.
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={handlePromote}
                            disabled={loading || !newYear}
                            className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-3 group"
                        >
                            {loading ? <RefreshCw className="animate-spin" /> : <GraduationCap className="group-hover:rotate-12 transition-transform" size={24} />}
                            {loading ? 'Processing Batch...' : `Promote All Students to ${newYear}`}
                        </button>
                    </div>
                </div>

                {/* Data Backup Information */}
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100">
                        <h4 className="font-extrabold text-emerald-900 mb-2 flex items-center gap-2">
                            <Save size={18} /> Automatic Archiving
                        </h4>
                        <p className="text-sm text-emerald-800/80 leading-relaxed font-medium">
                            The system now automatically preserves all historical data. Student performance from past years can always be retrieved from the database.
                        </p>
                    </div>

                    <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100">
                        <h4 className="font-extrabold text-blue-900 mb-2 flex items-center gap-2">
                            <Users size={18} /> Student Lifecycle
                        </h4>
                        <p className="text-sm text-blue-800/80 leading-relaxed font-medium">
                            Final year students are never deleted; they are moved to a "Graduated" status to keep your alumni network records intact.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;
