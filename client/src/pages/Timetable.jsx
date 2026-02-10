import { useState, useEffect } from 'react';
import { Calendar, Clock, BookOpen, Save } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Timetable = () => {
    const { user } = useAuth();
    const isStudent = user?.role === 'student';
    const [year, setYear] = useState('');
    const [section, setSection] = useState('');
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
                code: s.subject_code,
                semester: s.semester,
                credits: s.credits
            })));
        } catch (e) { console.error("Metadata Fetch Error", e); }
    };

    useEffect(() => {
        if (isStudent && user) {
            setYear(user.year);
            setSection(user.section);
        } else if (!isStudent) {
            setYear('2');
            setSection('A');
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
            setTimetable(res.data.map(t => ({
                ...t,
                subjectNameText: t.subject_name || '',
                staffNameText: t.staff_name || ''
            })));
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
        setTimetable(prev => {
            const existing = prev.find(t => t.day === day && t.period === period);

            // Helper to resolve ID from text
            const resolveId = (text, type) => {
                if (type === 'subject') {
                    const match = subjects.find(s => s.name === text || s.code === text);
                    return match ? match.id : null;
                }
                if (type === 'staff') {
                    const match = staff.find(s => s.name === text || s.staff_id === text);
                    return match ? match.id : null;
                }
                return null;
            };

            const updateLogic = (t) => {
                const updated = { ...t };
                if (field === 'subject') {
                    updated.subjectNameText = value;
                    updated.subjectId = resolveId(value, 'subject');
                    // Clear legacy field if needed or keep sync
                    updated.subject_id = updated.subjectId;
                } else if (field === 'staff') {
                    updated.staffNameText = value;
                    updated.staffId = resolveId(value, 'staff');
                    updated.staff_id = updated.staffId;
                }
                return updated;
            };

            if (existing) {
                return prev.map(t => (t.day === day && t.period === period) ? updateLogic(t) : t);
            } else {
                const newEntry = { day, period, year, section };
                return [...prev, updateLogic(newEntry)];
            }
        });
    };

    const saveTimetable = async () => {
        setLoading(true);
        const records = [];
        days.forEach(day => {
            periods.forEach(period => {
                const entry = timetable.find(t => t.day === day && t.period === period);
                if (entry && (entry.subjectNameText || entry.staffNameText)) {
                    records.push({
                        day,
                        period,
                        subjectId: entry.subjectId || null,
                        staffId: entry.staffId || null,
                        subjectNameText: entry.subjectNameText || null,
                        staffNameText: entry.staffNameText || null
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

    // -- Summary Table Handlers --
    const handleSummaryChange = (oldSubjectName, field, newValue) => {
        setTimetable(prev => prev.map(t => {
            if (t.subjectNameText === oldSubjectName) {
                if (field === 'subject') {
                    // Update Subject Name
                    return {
                        ...t,
                        subjectNameText: newValue,
                        // If renamed, we lose the ID linkage unless it matches a known subject
                        subjectId: subjects.find(s => s.name === newValue)?.id || null,
                        subject_id: subjects.find(s => s.name === newValue)?.id || null
                    };
                } else if (field === 'staff') {
                    // Update Staff Name
                    return {
                        ...t,
                        staffNameText: newValue,
                        // Try to resolve staff ID
                        staffId: staff.find(s => s.name === newValue)?.id || null,
                        staff_id: staff.find(s => s.name === newValue)?.id || null
                    };
                }
            }
            return t;
        }));
    };

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
                                                    <div className="p-2 rounded-lg bg-blue-50/50 border border-blue-100/50 hover:bg-white hover:shadow-sm transition-all cursor-default relative group">
                                                        <p className="text-xs font-bold text-blue-700">{subName}</p>
                                                        <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wide truncate">{staffName}</p>
                                                        {/* Tooltip for full details */}
                                                        <div className="absolute opacity-0 group-hover:opacity-100 bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-xs rounded shadow-lg pointer-events-none whitespace-nowrap z-10 transition-opacity">
                                                            {subjects.find(s => s.id == (entry.subject_id || entry.subjectId))?.name}
                                                        </div>
                                                    </div>
                                                ) : <span className="text-slate-300">-</span>}
                                            </td>
                                        );
                                    }

                                    return (
                                        <td key={period} className="p-2 border-r border-slate-100 min-w-[140px]">
                                            <div className="space-y-2">
                                                <input
                                                    list="subject-options"
                                                    className="w-full text-xs font-semibold bg-blue-50/50 border-none rounded focus:ring-1 focus:ring-blue-500 p-1 text-blue-900 truncate placeholder-blue-300"
                                                    placeholder="Subject"
                                                    value={entry.subjectNameText || ''}
                                                    onChange={(e) => handleEntryChange(day, period, 'subject', e.target.value)}
                                                />
                                                <input
                                                    list="staff-options"
                                                    className="w-full text-xs bg-slate-50/50 border-none rounded focus:ring-1 focus:ring-slate-400 p-1 text-slate-600 truncate placeholder-slate-400"
                                                    placeholder="Faculty"
                                                    value={entry.staffNameText || ''}
                                                    onChange={(e) => handleEntryChange(day, period, 'staff', e.target.value)}
                                                />
                                            </div>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>

                    <datalist id="subject-options">
                        {subjects.map(s => (
                            <option key={s.id} value={s.name}>{s.code}</option>
                        ))}
                    </datalist>
                    <datalist id="staff-options">
                        {staff.map(s => (
                            <option key={s.id} value={s.name}>{s.staff_id}</option>
                        ))}
                    </datalist>                </table>
            </div>

            {/* Course Details Summary Table */}
            <div className="mt-8">
                <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <BookOpen size={20} className="text-blue-600" />
                    Course Details & Staff Allocation
                </h3>
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 font-bold text-slate-700 w-16 text-center">Sl. No.</th>
                                <th className="px-6 py-4 font-bold text-slate-700 border-l border-slate-200">Course Code</th>
                                <th className="px-6 py-4 font-bold text-slate-700 border-l border-slate-200">Course Name</th>
                                <th className="px-6 py-4 font-bold text-slate-700 border-l border-slate-200">Name of the Staff</th>
                                <th className="px-6 py-4 font-bold text-slate-700 w-24 text-center border-l border-slate-200">Credit</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {(() => {
                                // Extract all unique subjects from the timetable (including custom ones)
                                const uniqueSubjects = [];
                                const seenSubjects = new Set();

                                timetable.forEach(t => {
                                    if (t.subjectNameText && !seenSubjects.has(t.subjectNameText)) {
                                        seenSubjects.add(t.subjectNameText);

                                        // Try to find metadata
                                        const meta = subjects.find(s => s.name === t.subjectNameText) || {};

                                        uniqueSubjects.push({
                                            name: t.subjectNameText,
                                            code: meta.code || 'Custom',
                                            credits: meta.credits || '-',
                                        });
                                    }
                                });

                                if (uniqueSubjects.length === 0) {
                                    // Fallback to relevant subjects if timetable is empty but data exists (optional, or just show empty)
                                    const currentSem = parseInt(year) * 2;
                                    if (timetable.length === 0) {
                                        // Show standard list if no timetable entries
                                        subjects.filter(s => s.semester === currentSem).forEach(s => {
                                            uniqueSubjects.push({ name: s.name, code: s.code, credits: s.credits });
                                        });
                                    }
                                }

                                const summaryData = uniqueSubjects.map(sub => {
                                    // Find staff for this subject
                                    const staffForSub = [...new Set(timetable
                                        .filter(t => t.subjectNameText === sub.name && t.staffNameText)
                                        .map(t => t.staffNameText)
                                    )];

                                    return {
                                        code: sub.code,
                                        name: sub.name,
                                        staff: staffForSub.join(', ') || 'TBA',
                                        credits: sub.credits
                                    };
                                }).sort((a, b) => a.name.localeCompare(b.name));

                                if (summaryData.length === 0) {
                                    return (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-8 text-center text-slate-400">
                                                No subjects assigned in the timetable yet.
                                            </td>
                                        </tr>
                                    );
                                }

                                return summaryData.map((row, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 text-center font-medium text-slate-600">{idx + 1}</td>
                                        <td className="px-6 py-4 font-bold text-slate-800 border-l border-slate-100">{row.code}</td>

                                        {/* Editable Course Name */}
                                        <td className="px-6 py-2 text-slate-700 border-l border-slate-100">
                                            {isStudent ? row.name : (
                                                <input
                                                    type="text"
                                                    value={row.name}
                                                    onChange={(e) => handleSummaryChange(row.name, 'subject', e.target.value)}
                                                    className="w-full bg-transparent border-b border-transparent focus:border-blue-500 focus:outline-none hover:border-slate-300 transition-colors py-1"
                                                />
                                            )}
                                        </td>

                                        {/* Editable Staff Name */}
                                        <td className="px-6 py-2 text-slate-700 border-l border-slate-100 font-medium">
                                            {isStudent ? row.staff : (
                                                <input
                                                    type="text"
                                                    value={row.staff === 'TBA' ? '' : row.staff}
                                                    placeholder="Assign Staff"
                                                    onChange={(e) => handleSummaryChange(row.name, 'staff', e.target.value)}
                                                    className="w-full bg-transparent border-b border-transparent focus:border-blue-500 focus:outline-none hover:border-slate-300 transition-colors py-1"
                                                />
                                            )}
                                        </td>

                                        <td className="px-6 py-4 text-center text-slate-600 border-l border-slate-100">{row.credits}</td>
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
