import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Calendar, Clock, CheckCircle, XCircle, FileText, Send, AlertCircle, Trash2 } from 'lucide-react';

const StudentOD = () => {
    const { user } = useAuth();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        date_from: '',
        date_to: '',
        reason: '',
        no_of_days: 1,
        hours: 1,
        od_type: 'Day' // 'Day' or 'Hour'
    });

    const isStudent = user?.role === 'student';
    const canApprove = ['staff', 'hod', 'admin', 'principal'].includes(user?.role);

    useEffect(() => {
        fetchRequests();
    }, [user]);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (isStudent && user.profileId) {
                params.append('student_id', user.profileId);
            }
            const res = await axios.get(`/api/od?${params.toString()}`);
            setRequests(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/od/apply', {
                student_id: user.profileId,
                ...formData
            });
            alert('OD Request Submitted');
            setFormData({ date_from: '', date_to: '', reason: '', no_of_days: 1, hours: 1, od_type: 'Day' });
            fetchRequests();
        } catch (err) {
            console.error(err);
            alert('Failed to submit: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleStatus = async (id, status) => {
        let remarks = null;
        if (status === 'Rejected') {
            remarks = window.prompt("Enter rejection reason:");
            if (!remarks) return;
        }

        try {
            await axios.put(`/api/od/${id}/status`, { status, remarks });
            fetchRequests();
        } catch (err) {
            alert('Update failed');
        }
    };

    const handleDelete = async (id) => {
        console.log("OD Delete Request - ID:", id);
        if (!window.confirm("Are you sure you want to delete this OD request?")) return;

        try {
            console.log("Sending delete request for ID:", id);
            await axios.delete(`/api/od/${id}`);
            setRequests(requests.filter(req => req.id !== id));
            alert('OD Request deleted successfully');
        } catch (err) {
            console.error("Error deleting OD request:", err);
            console.error("Error response:", err.response?.data);
            alert('Failed to delete OD request: ' + (err.response?.data?.message || err.message));
        }
    };

    const StatusBadge = ({ status }) => {
        if (status === 'Approved') return <span className="flex items-center text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded-lg"><CheckCircle size={14} className="mr-1" /> Approved</span>;
        if (status === 'Rejected') return <span className="flex items-center text-red-600 font-bold bg-red-50 px-2 py-1 rounded-lg"><XCircle size={14} className="mr-1" /> Rejected</span>;
        return <span className="flex items-center text-amber-600 font-bold bg-amber-50 px-2 py-1 rounded-lg"><Clock size={14} className="mr-1" /> Pending</span>;
    };

    return (
        <div className="space-y-12 animate-fade-in pb-16">
            {/* Contextual Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pt-4">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Operational Logistics</span>
                    </div>
                    <h2 className="text-5xl font-black text-slate-800 tracking-tighter">
                        On Duty <span className="text-blue-600">& Leave</span><span className="text-blue-600">.</span>
                    </h2>
                    <p className="text-slate-500 font-medium italic">Manage physical deployment and academic absence protocols.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Application Form - Only for Students */}
                {isStudent && (
                    <div className="lg:col-span-4">
                        <div className="glass-card p-10 rounded-[3rem] bg-white border border-slate-200 shadow-2xl shadow-slate-200/40 sticky top-32">
                            <div className="mb-10">
                                <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-600/20 mb-6">
                                    <Send size={24} />
                                </div>
                                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Post Request</h3>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Initialize Authorization Tunnel</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Engagement Type</label>
                                    <div className="flex p-1 bg-slate-100 rounded-2xl border border-slate-200 shadow-inner">
                                        {['Day', 'Hour'].map(type => (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, od_type: type })}
                                                className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.od_type === type ? 'bg-white shadow-lg text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                                            >
                                                {type} Scale
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Start Point</label>
                                        <input
                                            type="date"
                                            required
                                            className="w-full bg-slate-50 border-none rounded-xl px-4 py-4 text-sm font-bold text-slate-800 focus:ring-4 focus:ring-blue-600/10 transition-all outline-none"
                                            value={formData.date_from}
                                            onChange={(e) => setFormData({ ...formData, date_from: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">End Point</label>
                                        <input
                                            type="date"
                                            required={formData.od_type === 'Day'}
                                            disabled={formData.od_type === 'Hour'}
                                            className="w-full bg-slate-50 border-none rounded-xl px-4 py-4 text-sm font-bold text-slate-800 focus:ring-4 focus:ring-blue-600/10 transition-all outline-none disabled:opacity-30"
                                            value={formData.od_type === 'Hour' ? formData.date_from : formData.date_to}
                                            onChange={(e) => setFormData({ ...formData, date_to: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {formData.od_type === 'Day' ? (
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Operation Duration (Days)</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                min="0.5"
                                                step="0.5"
                                                required
                                                className="w-full bg-slate-50 border-none rounded-2xl px-6 py-5 text-slate-800 font-bold focus:ring-4 focus:ring-blue-600/10 transition-all outline-none"
                                                value={formData.no_of_days}
                                                onChange={(e) => setFormData({ ...formData, no_of_days: e.target.value })}
                                            />
                                            <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-blue-600 uppercase">Cycle(s)</div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Precision Duration (Hours)</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                min="1"
                                                max="8"
                                                required
                                                className="w-full bg-slate-50 border-none rounded-2xl px-6 py-5 text-slate-800 font-bold focus:ring-4 focus:ring-blue-600/10 transition-all outline-none"
                                                value={formData.hours}
                                                onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                                            />
                                            <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-blue-600 uppercase">Hour(s)</div>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Mission Rationale (Reason)</label>
                                    <textarea
                                        rows="4"
                                        required
                                        placeholder="EXPLAIN THE STRATEGIC NECESSITY..."
                                        className="w-full bg-slate-50 border-none rounded-[2rem] px-8 py-6 text-slate-600 font-medium focus:ring-4 focus:ring-blue-600/10 transition-all outline-none resize-none placeholder:text-slate-300"
                                        value={formData.reason}
                                        onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                    ></textarea>
                                </div>

                                <button type="submit" className="group w-full py-5 bg-slate-900 text-white font-black text-xs uppercase tracking-[0.3em] rounded-[2rem] shadow-2xl shadow-slate-900/40 hover:bg-blue-600 transition-all active:scale-95 flex justify-center items-center gap-4">
                                    <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /> Transmit Signal
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Requests List */}
                <div className={isStudent ? "lg:col-span-8" : "lg:col-span-12"}>
                    <div className="flex items-center gap-3 pl-1 mb-8">
                        <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Deployment Log History</h3>
                    </div>

                    <div className="space-y-8">
                        {loading ? (
                            <div className="p-32 text-center text-slate-300 font-black italic animate-pulse uppercase tracking-widest">Synchronizing Encrypted Logs...</div>
                        ) : requests.length === 0 ? (
                            <div className="glass-card p-32 text-center rounded-[3rem] border-2 border-dashed border-slate-200">
                                <p className="text-slate-300 font-black text-2xl uppercase tracking-tighter">No Active Signals Located</p>
                            </div>
                        ) : (
                            requests.map(req => (
                                <div key={req.id} className="group glass-card p-10 rounded-[3rem] bg-white border border-slate-200 shadow-xl shadow-slate-200/20 hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-500">
                                    <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-8">
                                        <div className="flex items-start gap-6">
                                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner transition-colors duration-500 ${req.status === 'Approved' ? 'bg-emerald-50 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white' : req.status === 'Rejected' ? 'bg-rose-50 text-rose-500 group-hover:bg-rose-500 group-hover:text-white' : 'bg-blue-50 text-blue-500 group-hover:bg-blue-500 group-hover:text-white'}`}>
                                                {req.od_type === 'Day' ? <Calendar size={32} /> : <Clock size={32} />}
                                            </div>
                                            <div>
                                                {!isStudent && (
                                                    <div className="mb-3">
                                                        <h4 className="font-black text-slate-800 text-2xl tracking-tighter uppercase">{req.name}</h4>
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-lg uppercase tracking-widest">{req.roll_no}</span>
                                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Year {req.year} • {req.section} • {req.department}</span>
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-500">
                                                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-4 py-2 rounded-xl">
                                                        <Calendar size={14} className="text-blue-500" />
                                                        <span className="text-slate-800">{new Date(req.date_from).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                                        {req.od_type === 'Day' && (
                                                            <>
                                                                <span className="text-slate-400 mx-1">→</span>
                                                                <span className="text-slate-800">{new Date(req.date_to).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 px-4 py-2 rounded-xl">
                                                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
                                                            Module: {req.od_type === 'Day' ? `${req.no_of_days} Cycle(s)` : `${req.hours} Precision Hour(s)`}
                                                        </span>
                                                    </div>
                                                    {req.status === 'Pending' && (
                                                        <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 px-4 py-2 rounded-xl">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div>
                                                            <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest italic">
                                                                Waiting Response: {req.pending_with?.toUpperCase()}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className={`px-8 py-3 rounded-[1.5rem] border transition-all text-[10px] font-black uppercase tracking-[0.2em] shadow-sm ${req.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-200/20' :
                                                req.status === 'Rejected' ? 'bg-rose-50 text-rose-600 border-rose-100 shadow-rose-200/20' :
                                                    'bg-blue-50 text-blue-600 border-blue-100 shadow-blue-200/20'
                                            }`}>
                                            {req.status}
                                        </div>
                                    </div>

                                    <div className="relative p-8 bg-slate-50/50 rounded-[2rem] border border-slate-100 mb-8 overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4 opacity-[0.03] rotate-12">
                                            <FileText size={80} />
                                        </div>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] block mb-4">Engagement Objective</span>
                                        <p className="text-slate-700 font-medium leading-relaxed italic">"{req.reason}"</p>
                                    </div>

                                    {(req.remarks || (canApprove && req.status === 'Pending' && (user.role === req.pending_with || user.role === 'admin'))) && (
                                        <div className="pt-8 border-t border-slate-100 space-y-8">
                                            {req.remarks && (
                                                <div className="flex gap-6 p-6 bg-rose-50/50 border border-rose-100 rounded-[2rem]">
                                                    <div className="w-12 h-12 bg-rose-100 rounded-2xl flex items-center justify-center text-rose-500 shrink-0">
                                                        <AlertCircle size={24} />
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] font-black text-rose-400 uppercase tracking-[0.2em] block mb-2">Security Override Remarks</span>
                                                        <p className="text-rose-800 font-bold tracking-tight">{req.remarks}</p>
                                                    </div>
                                                </div>
                                            )}

                                            {canApprove && req.status === 'Pending' && (user.role === req.pending_with || user.role === 'admin') && (
                                                <div className="flex gap-6">
                                                    <button
                                                        onClick={() => handleStatus(req.id, 'Rejected')}
                                                        className="flex-1 py-4 bg-white border-2 border-slate-200 text-slate-400 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all active:scale-95"
                                                    >
                                                        Deny Entry
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatus(req.id, 'Approved')}
                                                        className="flex-1 py-4 bg-slate-900 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-slate-900/30 hover:bg-emerald-600 transition-all active:scale-95"
                                                    >
                                                        Authorize Deployment
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Delete Button for Students */}
                                    {isStudent && (
                                        <div className="pt-8 border-t border-slate-100 flex justify-end">
                                            <button
                                                onClick={() => handleDelete(req.id)}
                                                className="group flex items-center gap-3 px-8 py-3.5 bg-slate-50 border border-slate-200 text-slate-400 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all active:scale-95"
                                            >
                                                <Trash2 size={16} className="group-hover:rotate-12 transition-transform" />
                                                Terminate Protocol
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentOD;
