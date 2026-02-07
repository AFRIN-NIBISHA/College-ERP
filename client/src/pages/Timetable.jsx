import { useState, useEffect } from 'react';
import { Calendar, Clock, BookOpen, Save } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Timetable = () => {
    const { user } = useAuth();
    const isStudent = user?.role === 'student';
    const [year, setYear] = useState(isStudent ? 2 : 2);
    const [section, setSection] = useState(isStudent ? 'A' : 'A');
    const [timetable, setTimetable] = useState([]);
    const [loading, setLoading] = useState(false);

    const [subjects, setSubjects] = useState([]);
    const [staff, setStaff] = useState([]);

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const periods = [1, 2, 3, 4, 5, 6, 7, 8];

    // Defined outside useEffect to be accessible by Seed Button
    const fetchMetadata = async () => {
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
        } catch (e) { console.error("Metadata Fetch Error", e); }
    };

    useEffect(() => {
        if (isStudent && user) {
            setYear(user.year);
            setSection(user.section);
        }
    }, [user, isStudent]);

    useEffect(() => {
        fetchMetadata();
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

    // ... (rest of methods)

    // Helper for manual trigger
    const handlePopulate = async () => {
        if (!window.confirm("Are you sure? This will overwrite existing entries for the standard schedule.")) return;
        try {
            setLoading(true);
            const res = await axios.post('/api/admin/seed-timetable');

            // Critical: Refresh Metadata first (in case new subjects/staff were added)
            await fetchMetadata();

            // Then refresh timetable
            await fetchTimetable();

            alert(`Success: ${res.data.message}`);
        } catch (e) {
            alert("Error seeding: " + (e.response?.data?.message || e.message));
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
        <div className="space-y-8 animate-fade-in">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                        Class <span className="text-blue-600">Timetable</span>
                    </h2>
                    <p className="text-slate-500 font-medium">
                        {isStudent ? `Academic Schedule for Year ${year} - Section ${section}` : 'Configure and manage weekly class schedules'}
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {!isStudent && (
                        <>
                            <div className="flex bg-white/80 backdrop-blur-md p-1 rounded-xl border border-slate-200 shadow-sm">
                                <select
                                    value={year} onChange={(e) => setYear(e.target.value)}
                                    className="bg-transparent border-none text-sm font-bold text-slate-700 focus:ring-0 px-3 py-1.5 cursor-pointer"
                                >
                                    {[1, 2, 3, 4].map(y => <option key={y} value={y}>{y}{y === 1 ? 'st' : y === 2 ? 'nd' : y === 3 ? 'rd' : 'th'} Year</option>)}
                                </select>
                                <div className="w-px h-4 bg-slate-200 self-center mx-1"></div>
                                <select
                                    value={section} onChange={(e) => setSection(e.target.value)}
                                    className="bg-transparent border-none text-sm font-bold text-slate-700 focus:ring-0 px-3 py-1.5 cursor-pointer"
                                >
                                    {['A', 'B', 'C'].map(s => <option key={s} value={s}>Sec {s}</option>)}
                                </select>
                            </div>
                            <button
                                onClick={saveTimetable}
                                disabled={loading}
                                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2 text-sm"
                            >
                                <Save size={18} /> {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block glass-card rounded-3xl overflow-hidden border border-slate-200/60 shadow-xl shadow-slate-200/50">
                <div className="overflow-x-auto scroll-hint">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-200">
                                <th className="p-5 w-32 text-left font-extrabold text-slate-500 uppercase text-[10px] tracking-widest border-r border-slate-100/50">Day</th>
                                {periods.map(p => (
                                    <th key={p} className="p-5 text-center font-extrabold text-slate-500 text-[10px] tracking-widest border-r border-slate-100/50 last:border-r-0">
                                        Period {p}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {days.map(day => (
                                <tr key={day} className="group hover:bg-blue-50/30 transition-colors">
                                    <td className="p-5 font-bold text-slate-700 bg-slate-50/30 border-r border-slate-100/50 group-hover:text-blue-600 transition-colors">{day}</td>
                                    {periods.map(period => {
                                        const entry = getEntry(day, period);
                                        if (isStudent) {
                                            const sub = subjects.find(s => s.id == (entry.subject_id || entry.subjectId));
                                            const staffMember = staff.find(s => s.id == (entry.staff_id || entry.staffId));
                                            return (
                                                <td key={period} className="p-3 border-r border-slate-100/50 min-w-[140px] last:border-r-0">
                                                    {sub ? (
                                                        <div className="p-3 rounded-xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-default relative group/item">
                                                            <p className="text-xs font-bold text-slate-800">{sub.code}</p>
                                                            <p className="text-[10px] text-slate-400 mt-1 font-medium truncate uppercase tracking-tighter">
                                                                {staffMember?.name || 'Faculty'}
                                                            </p>
                                                            <div className="absolute opacity-0 group-hover/item:opacity-100 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-slate-900 text-white text-[10px] font-bold rounded-lg shadow-xl pointer-events-none whitespace-nowrap z-50 transition-all transform translate-y-2 group-hover/item:translate-y-0">
                                                                {sub.name}
                                                            </div>
                                                        </div>
                                                    ) : <span className="text-slate-200 flex justify-center">-</span>}
                                                </td>
                                            );
                                        }
                                        return (
                                            <td key={period} className="p-2 border-r border-slate-100/50 min-w-[150px] last:border-r-0">
                                                <div className="space-y-1.5">
                                                    <select
                                                        className="w-full text-[10px] font-bold bg-blue-50/50 border-blue-100/50 rounded-lg focus:ring-2 focus:ring-blue-500/20 py-1 px-2 text-blue-800 truncate cursor-pointer appearance-none border transition-all"
                                                        value={entry.subject_id || entry.subjectId || ''}
                                                        onChange={(e) => handleEntryChange(day, period, 'subjectId', e.target.value)}
                                                    >
                                                        <option value="">Subject</option>
                                                        {subjects.map(s => <option key={s.id} value={s.id}>{s.code}</option>)}
                                                    </select>
                                                    <select
                                                        className="w-full text-[10px] bg-slate-50/50 border-slate-100/50 rounded-lg focus:ring-2 focus:ring-slate-400/20 py-1 px-2 text-slate-500 truncate cursor-pointer appearance-none border transition-all"
                                                        value={entry.staff_id || entry.staffId || ''}
                                                        onChange={(e) => handleEntryChange(day, period, 'staffId', e.target.value)}
                                                    >
                                                        <option value="">Faculty</option>
                                                        {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
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

            {/* Mobile Card View */}
            <div className="md:hidden space-y-6">
                {days.map(day => (
                    <div key={day} className="space-y-3">
                        <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 pl-1">{day}</h4>
                        <div className="grid grid-cols-1 gap-3">
                            {periods.map(period => {
                                const entry = getEntry(day, period);
                                const sub = subjects.find(s => s.id == (entry.subject_id || entry.subjectId));
                                const staffMember = staff.find(s => s.id == (entry.staff_id || entry.staffId));

                                return (
                                    <div key={period} className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm">
                                        <div className="flex items-center gap-4">
                                            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-[10px] font-bold text-slate-400 border border-slate-100">
                                                {period}
                                            </div>
                                            <div>
                                                {sub ? (
                                                    <>
                                                        <p className="text-sm font-bold text-slate-800">{sub.code}</p>
                                                        <p className="text-[10px] text-slate-500 font-medium uppercase tracking-tighter">{staffMember?.name || 'Staff'}</p>
                                                    </>
                                                ) : <p className="text-sm text-slate-300 font-medium italic">Leisure Period</p>}
                                            </div>
                                        </div>
                                        {!isStudent && (
                                            <div className="flex flex-col gap-1 w-24">
                                                <select
                                                    className="w-full text-[9px] font-bold bg-blue-50 text-blue-700 border-none rounded-md py-1"
                                                    value={entry.subject_id || entry.subjectId || ''}
                                                    onChange={(e) => handleEntryChange(day, period, 'subjectId', e.target.value)}
                                                >
                                                    <option value="">Sub</option>
                                                    {subjects.map(s => <option key={s.id} value={s.id}>{s.code}</option>)}
                                                </select>
                                                <select
                                                    className="w-full text-[9px] bg-slate-50 text-slate-500 border-none rounded-md py-1"
                                                    value={entry.staff_id || entry.staffId || ''}
                                                    onChange={(e) => handleEntryChange(day, period, 'staffId', e.target.value)}
                                                >
                                                    <option value="">Fac</option>
                                                    {staff.map(s => <option key={s.id} value={s.id}>{s.name.split(' ')[0]}</option>)}
                                                </select>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Allocation Summary */}
            <div className="mt-12 bg-white/40 backdrop-blur-md rounded-[2.5rem] p-6 lg:p-10 border border-white/60 shadow-inner">
                <h3 className="text-2xl font-bold text-slate-800 mb-8 flex items-center gap-3">
                    <div className="p-2 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-500/20">
                        <BookOpen size={24} />
                    </div>
                    Course & Faculty Allocation
                </h3>

                <div className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white/80 shadow-sm overflow-x-auto scroll-hint">
                    <table className="w-full text-sm text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-200">
                                <th className="px-6 py-4 font-bold text-slate-500 uppercase text-[10px] tracking-widest text-center w-20">#</th>
                                <th className="px-6 py-4 font-bold text-slate-500 uppercase text-[10px] tracking-widest border-l border-slate-100/50">Details</th>
                                <th className="px-6 py-4 font-bold text-slate-500 uppercase text-[10px] tracking-widest border-l border-slate-100/50">Faculty Assignment</th>
                                <th className="px-6 py-4 font-bold text-slate-500 uppercase text-[10px] tracking-widest border-l border-slate-100/50 w-24 text-center">Credit</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {(() => {
                                const visibleSubjectIds = [...new Set(timetable.filter(t => t.subject_id || t.subjectId).map(t => t.subject_id || t.subjectId))];
                                const summaryData = visibleSubjectIds.map(subId => {
                                    const subject = subjects.find(s => s.id == subId) || {};
                                    const assignedStaffIds = [...new Set(timetable
                                        .filter(t => (t.subject_id || t.subjectId) == subId && (t.staff_id || t.staffId))
                                        .map(t => t.staff_id || t.staffId))];
                                    const staffNames = assignedStaffIds.map(sid => staff.find(st => st.id == sid)?.name).filter(Boolean).join(', ');

                                    return {
                                        code: subject.code || 'N/A',
                                        name: subject.name || 'Unknown',
                                        staff: staffNames || 'Unassigned',
                                        credits: 3,
                                        isValid: !!subject.id
                                    };
                                }).filter(item => item.isValid).sort((a, b) => a.code.localeCompare(b.code));

                                if (summaryData.length === 0) {
                                    return <tr><td colSpan="4" className="px-6 py-12 text-center text-slate-400 font-medium italic">No allocation data available for current selection.</td></tr>;
                                }

                                return summaryData.map((row, idx) => (
                                    <tr key={row.code} className="group hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-5 text-center font-bold text-slate-400 group-hover:text-blue-500 transition-colors">{idx + 1}</td>
                                        <td className="px-6 py-5 border-l border-slate-100/50">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-800 text-sm tracking-tight">{row.code}</span>
                                                <span className="text-xs text-slate-500 mt-0.5">{row.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 border-l border-slate-100/50 font-bold text-slate-600 text-sm tracking-tight">{row.staff}</td>
                                        <td className="px-6 py-5 border-l border-slate-100/50 text-center font-black text-slate-700">{row.credits}</td>
                                    </tr>
                                ));
                            })()}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Timetable;
