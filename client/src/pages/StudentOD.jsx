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
        <div className="max-w-6xl mx-auto space-y-8">
            <div>
                <h2 className="text-3xl font-bold text-slate-800">On Duty / Leave Management</h2>
                <p className="text-slate-500">Apply for OD or Leave and check status.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Application Form - Only for Students */}
                {isStudent && (
                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-24">
                            <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <FileText className="text-blue-600" /> New Application
                            </h3>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase">OD Type</label>
                                    <div className="flex gap-2">
                                        {['Day', 'Hour'].map(type => (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, od_type: type })}
                                                className={`flex-1 py-2 rounded-lg border text-sm font-bold transition-all ${formData.od_type === type ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-slate-600 border-slate-200'}`}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-500 uppercase">From Date</label>
                                        <input
                                            type="date"
                                            required
                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:border-blue-500"
                                            value={formData.date_from}
                                            onChange={(e) => setFormData({ ...formData, date_from: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-500 uppercase">To Date</label>
                                        <input
                                            type="date"
                                            required={formData.od_type === 'Day'}
                                            disabled={formData.od_type === 'Hour'}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:border-blue-500 disabled:opacity-50"
                                            value={formData.od_type === 'Hour' ? formData.date_from : formData.date_to}
                                            onChange={(e) => setFormData({ ...formData, date_to: e.target.value })}
                                        />
                                    </div>
                                </div>
                                {formData.od_type === 'Day' ? (
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Total Days</label>
                                        <input
                                            type="number"
                                            min="0.5"
                                            step="0.5"
                                            required
                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:border-blue-500"
                                            value={formData.no_of_days}
                                            onChange={(e) => setFormData({ ...formData, no_of_days: e.target.value })}
                                        />
                                    </div>
                                ) : (
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Number of Hours</label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="8"
                                            required
                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:border-blue-500"
                                            value={formData.hours}
                                            onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                                        />
                                    </div>
                                )}
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Reason</label>
                                    <textarea
                                        rows="3"
                                        required
                                        placeholder="e.g. Attending Symposium at XYZ College"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:border-blue-500"
                                        value={formData.reason}
                                        onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                    ></textarea>
                                </div>
                                <button type="submit" className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30 flex justify-center items-center gap-2">
                                    <Send size={18} /> Submit Request
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Requests List */}
                <div className={isStudent ? "lg:col-span-2" : "col-span-3"}>
                    <div className="space-y-4">
                        {loading ? <p>Loading...</p> : requests.length === 0 ? (
                            <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-300">
                                <p className="text-slate-500">No records found.</p>
                            </div>
                        ) : (
                            requests.map(req => (
                                <div key={req.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            {!isStudent && (
                                                <div className="mb-2">
                                                    <span className="font-bold text-slate-800 text-lg">{req.name}</span>
                                                    <span className="text-slate-500 text-sm ml-2">({req.roll_no})</span>
                                                    <p className="text-xs text-slate-400">{req.year} Yr - Sec {req.section} • {req.department}</p>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                                                <Calendar size={16} className="text-blue-500" />
                                                {new Date(req.date_from).toLocaleDateString()}
                                                {req.od_type === 'Day' && ` to ${new Date(req.date_to).toLocaleDateString()}`}
                                                <span className="px-2 py-0.5 bg-slate-100 rounded text-xs text-slate-500">
                                                    {req.od_type === 'Day' ? `${req.no_of_days} Day(s)` : `${req.hours} Hour(s)`}
                                                </span>
                                                <span className="px-2 py-0.5 bg-blue-50 rounded text-xs text-blue-600 border border-blue-100 italic">
                                                    Pending: {req.pending_with?.toUpperCase()}
                                                </span>
                                            </div>
                                        </div>
                                        <StatusBadge status={req.status} />
                                    </div>

                                    <div className="bg-slate-50 p-3 rounded-xl text-sm text-slate-700 mb-4">
                                        <span className="font-bold text-slate-500 text-xs uppercase block mb-1">Reason</span>
                                        {req.reason}
                                    </div>

                                    {req.remarks && (
                                        <div className="bg-red-50 p-3 rounded-xl text-sm text-red-700 border border-red-100 mb-4 flex gap-2">
                                            <AlertCircle size={16} className="shrink-0 mt-0.5" />
                                            <div>
                                                <span className="font-bold text-xs uppercase block mb-1">Faculty Remarks</span>
                                                {req.remarks}
                                            </div>
                                        </div>
                                    )}

                                    {/* Action Buttons for Staff/HOD/Principal based on routing */}
                                    {canApprove && req.status === 'Pending' && (user.role === req.pending_with || user.role === 'admin') && (
                                        <div className="flex gap-3 pt-4 border-t border-slate-100">
                                            <button
                                                onClick={() => handleStatus(req.id, 'Approved')}
                                                className="flex-1 py-2 bg-emerald-600 text-white text-sm font-bold rounded-lg hover:bg-emerald-700 transition"
                                            >
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleStatus(req.id, 'Rejected')}
                                                className="flex-1 py-2 bg-white text-red-600 border border-red-200 text-sm font-bold rounded-lg hover:bg-red-50 transition"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    )}

                                    {/* Delete Button for Students (Pending and Approved) */}
                                    {isStudent && (req.status === 'Pending' || req.status === 'Approved') && (
                                        <div className="flex gap-3 pt-4 border-t border-slate-100">
                                            <button
                                                onClick={() => {
                                                    console.log("OD Delete Button Clicked - req:", req);
                                                    console.log("All req fields:", Object.keys(req));
                                                    // Check all possible ID field names
                                                    const requestId = req.id || req.student_od_id || req.student_od || req.od_id || req.request_id;
                                                    console.log("Using request ID:", requestId);
                                                    if (!requestId) {
                                                        console.error("No valid ID found in request object");
                                                        alert("Error: Cannot delete request - no valid ID found");
                                                        return;
                                                    }
                                                    handleDelete(requestId);
                                                }}
                                                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-bold rounded-lg hover:bg-red-700 transition"
                                            >
                                                <Trash2 size={16} />
                                                Delete Request
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
