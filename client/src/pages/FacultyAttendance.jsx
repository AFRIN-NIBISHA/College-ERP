import { useState, useEffect } from 'react';
import { Calendar, UserCheck, UserX, AlertCircle, Save } from 'lucide-react';
import axios from 'axios';

const FacultyAttendance = () => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [staff, setStaff] = useState([]);
    const [attendance, setAttendance] = useState({}); // { staffId: { status: 'Present'|'Absent'|'On Duty', substituteId: null } }
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        try {
            const res = await axios.get('/api/staff');
            setStaff(res.data);

            // Init attendance
            const initAttd = {};
            res.data.forEach(s => {
                initAttd[s.id] = { status: 'Present', substituteId: '' };
            });
            setAttendance(initAttd);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching staff", err);
        }
    };

    const handleStatusChange = (id, status) => {
        setAttendance(prev => ({
            ...prev,
            [id]: { ...prev[id], status }
        }));
    };

    const handleSubstituteChange = (id, subId) => {
        setAttendance(prev => ({
            ...prev,
            [id]: { ...prev[id], substituteId: subId }
        }));
    };

    const submitAttendance = async () => {
        const records = Object.entries(attendance).map(([staffId, data]) => ({
            staffId,
            status: data.status,
            substituteId: data.status === 'Absent' ? data.substituteId : null
        }));

        try {
            await axios.post('/api/attendance/faculty', {
                date,
                records
            });
            alert("Faculty Attendance Saved Successfully!");
        } catch (err) {
            console.error("Error saving attendance", err);
            alert("Failed to save.");
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800">Faculty Attendance</h2>
                    <p className="text-slate-500">Manage daily attendance and substitutions.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                    </div>
                    <button
                        onClick={submitAttendance}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-semibold shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2"
                    >
                        <Save size={18} /> Save Records
                    </button>
                </div>
            </div>

            <div className="glass-card rounded-2xl overflow-hidden bg-white/60 border border-slate-200 shadow-sm">
                <table className="w-full">
                    <thead>
                        <tr className="bg-slate-50/50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                            <th className="p-4">Faculty Name</th>
                            <th className="p-4">Designation</th>
                            <th className="p-4 text-center">Status</th>
                            <th className="p-4">Substitute (If Absent)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr><td colSpan="4" className="p-8 text-center text-slate-500">Loading staff...</td></tr>
                        ) : staff.map((s) => (
                            <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                                <td className="p-4">
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-slate-800">{s.name}</span>
                                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">{s.staff_id}</span>
                                    </div>
                                </td>
                                <td className="p-4 text-slate-500 text-sm">{s.designation}</td>
                                <td className="p-4">
                                    <div className="flex justify-center gap-2">
                                        {['Present', 'Absent', 'On Duty'].map((status) => (
                                            <button
                                                key={status}
                                                onClick={() => handleStatusChange(s.id, status)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${attendance[s.id]?.status === status
                                                    ? status === 'Present' ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                                                        : status === 'Absent' ? 'bg-rose-100 text-rose-700 border-rose-200'
                                                            : 'bg-amber-100 text-amber-700 border-amber-200' // OD
                                                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-100'
                                                    }`}
                                            >
                                                {status}
                                            </button>
                                        ))}
                                    </div>
                                </td>
                                <td className="p-4">
                                    {attendance[s.id]?.status === 'Absent' ? (
                                        <select
                                            className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                                            value={attendance[s.id]?.substituteId || ''}
                                            onChange={(e) => handleSubstituteChange(s.id, e.target.value)}
                                        >
                                            <option value="">Select Substitute</option>
                                            {staff.filter(st => st.id !== s.id).map(st => (
                                                <option key={st.id} value={st.id}>{st.name} ({st.staff_id})</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <span className="text-slate-300 text-sm italic">Not applicable</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default FacultyAttendance;
