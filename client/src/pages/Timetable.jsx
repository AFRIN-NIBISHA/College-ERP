import { useState, useEffect } from 'react';
import { Calendar, Clock, BookOpen, Save } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Timetable = () => {
    const { user } = useAuth();
    const isStudent = user?.role === 'student';
    const [year, setYear] = useState(isStudent ? 2 : 2);
    const [section, setSection] = useState(isStudent ? 'A' : 'A');
    const [timetable, setTimetable] = useState([]); // [{ day, period, subjectId, staffId }]
    const [loading, setLoading] = useState(false);

    // Mock Data for Dropdowns (Ideally fetch from API)
    const [subjects, setSubjects] = useState([]);
    const [staff, setStaff] = useState([]);

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const periods = [1, 2, 3, 4, 5, 6, 7, 8];

    useEffect(() => {
        // Auto-set for student
        if (isStudent && user) {
            setYear(user.year);
            setSection(user.section);
        }
    }, [user, isStudent]);

    useEffect(() => {
        // Fetch Metadata
        const fetchData = async () => {
            try {
                const [staffRes, subjectRes] = await Promise.all([
                    axios.get('/api/staff'),
                    axios.get('/api/subjects'),
                ]);
                setStaff(staffRes.data);
                setSubjects(subjectRes.data.map(s => ({
                    id: s.id,
                    name: s.subject_name,
                    code: s.subject_code
                })));
            } catch (e) { console.error(e); }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (year && section) fetchTimetable();
    }, [year, section]);

    const fetchTimetable = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/timetable?year=${year}&section=${section}`);
            setTimetable(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleEntryChange = (day, period, field, value) => {
        // Optimistic update with consistent field names
        setTimetable(prev => {
            const existing = prev.find(t => t.day === day && t.period === period);
            if (existing) {
                return prev.map(t => {
                    if (t.day === day && t.period === period) {
                        const updated = { ...t };
                        if (field === 'subjectId') {
                            updated.subject_id = value;
                            updated.subjectId = value;
                        } else if (field === 'staffId') {
                            updated.staff_id = value;
                            updated.staffId = value;
                        }
                        return updated;
                    }
                    return t;
                });
            } else {
                const newEntry = { day, period, year, section };
                if (field === 'subjectId') {
                    newEntry.subject_id = value;
                    newEntry.subjectId = value;
                } else if (field === 'staffId') {
                    newEntry.staff_id = value;
                    newEntry.staffId = value;
                }
                return [...prev, newEntry];
            }
        });
    };

    const saveTimetable = async () => {
        setLoading(true);
        const records = [];
        days.forEach(day => {
            periods.forEach(period => {
                const entry = timetable.find(t => t.day === day && t.period === period);
                if (entry && (entry.subject_id || entry.subjectId) && (entry.staff_id || entry.staffId)) {
                    records.push({
                        day,
                        period,
                        subjectId: entry.subjectId || entry.subject_id,
                        staffId: entry.staffId || entry.staff_id
                    });
                }
            });
        });

        if (records.length === 0) {
            alert("No timetable entries to save!");
            setLoading(false);
            return;
        }

        try {
            await axios.post('/api/timetable', {
                year,
                section,
                entries: records
            });
            alert("Timetable Saved Successfully!");
            fetchTimetable(); // Refresh
        } catch (err) {
            console.error(err);
            alert("Error saving timetable: " + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    const getEntry = (day, period) => timetable.find(t => t.day === day && t.period === period) || {};

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800">Class Timetable</h2>
                    <p className="text-slate-500">{isStudent ? `Your Class Schedule (Year ${year} - ${section})` : 'Manage weekly schedule for all classes.'}</p>
                </div>
                {!isStudent && (
                    <div className="flex gap-4">
                        <div className="flex gap-2">
                            <select
                                value={year} onChange={(e) => setYear(e.target.value)}
                                className="bg-white border border-slate-200 rounded-xl px-4 py-2 font-medium text-slate-700"
                            >
                                <option value="1">1st Year</option>
                                <option value="2">2nd Year</option>
                                <option value="3">3rd Year</option>
                                <option value="4">4th Year</option>
                            </select>
                            <select
                                value={section} onChange={(e) => setSection(e.target.value)}
                                className="bg-white border border-slate-200 rounded-xl px-4 py-2 font-medium text-slate-700"
                            >
                                <option value="A">Section A</option>
                                <option value="B">Section B</option>
                                <option value="C">Section C</option>
                            </select>
                        </div>
                        <button
                            onClick={saveTimetable}
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2"
                        >
                            <Save size={18} /> {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                )}
            </div>

            <div className="glass-card rounded-2xl overflow-hidden bg-white/60 border border-slate-200 overflow-x-auto">
                <table className="w-full min-w-[1000px] border-collapse">
                    <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-200">
                            <th className="p-4 w-24 text-left font-bold text-slate-700 uppercase text-xs tracking-wider border-r border-slate-100">Day</th>
                            {periods.map(p => (
                                <th key={p} className="p-4 text-center font-bold text-slate-600 text-xs uppercase tracking-wider border-r border-slate-100">
                                    Period {p}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {days.map(day => (
                            <tr key={day} className="hover:bg-slate-50/50">
                                <td className="p-4 font-bold text-slate-700 bg-slate-50/30 border-r border-slate-100">{day}</td>
                                {periods.map(period => {
                                    const entry = getEntry(day, period);

                                    if (isStudent) {
                                        // Read Only View for Student
                                        const subName = subjects.find(s => s.id == (entry.subject_id || entry.subjectId))?.code || '-';
                                        const staffName = staff.find(s => s.id == (entry.staff_id || entry.staffId))?.name || (entry.subject_id ? 'Staff' : '-');

                                        return (
                                            <td key={period} className="p-2 border-r border-slate-100 min-w-[140px] text-center">
                                                {subName !== '-' ? (
                                                    <div className="p-2 rounded-lg bg-blue-50/50 border border-blue-100/50 hover:bg-white hover:shadow-sm transition-all cursor-default">
                                                        <p className="text-xs font-bold text-blue-700">{subName}</p>
                                                        <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wide">{staffName}</p>
                                                    </div>
                                                ) : <span className="text-slate-300">-</span>}
                                            </td>
                                        );
                                    }

                                    return (
                                        <td key={period} className="p-2 border-r border-slate-100 min-w-[140px]">
                                            <div className="space-y-2">
                                                <select
                                                    className="w-full text-xs font-semibold bg-blue-50/50 border-none rounded focus:ring-1 focus:ring-blue-500 p-1 text-blue-900 truncate cursor-pointer appearance-auto"
                                                    value={entry.subject_id || entry.subjectId || ''}
                                                    onChange={(e) => handleEntryChange(day, period, 'subjectId', e.target.value)}
                                                >
                                                    <option value="">Select Subject</option>
                                                    {Array.isArray(subjects) && subjects.map(s => (
                                                        <option key={s.id} value={s.id}>{s.code}</option>
                                                    ))}
                                                </select>
                                                <select
                                                    className="w-full text-xs bg-slate-50/50 border-none rounded focus:ring-1 focus:ring-slate-400 p-1 text-slate-600 truncate cursor-pointer appearance-auto"
                                                    value={entry.staff_id || entry.staffId || ''}
                                                    onChange={(e) => handleEntryChange(day, period, 'staffId', e.target.value)}
                                                >
                                                    <option value="">Select Faculty</option>
                                                    {Array.isArray(staff) && staff.map(s => (
                                                        <option key={s.id} value={s.id}>{s.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Timetable;
