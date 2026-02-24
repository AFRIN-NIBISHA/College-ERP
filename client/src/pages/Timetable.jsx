import { useState, useEffect } from 'react';
import { Calendar, Clock, BookOpen, Save, Trash2 } from 'lucide-react';
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
                staffNameText: t.staff_name || '',
                // If it's a known subject, use its details, otherwise use manual text
                subjectCodeText: t.subjectCodeText || (t.subject_code !== 'Custom' ? t.subject_code : undefined),
                subjectCreditText: t.subjectCreditText
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
                        staffId: entry.staffId || null,
                        subjectNameText: entry.subjectNameText || null,
                        staffNameText: entry.staffNameText || null,
                        subjectCodeText: entry.subjectCodeText || null,
                        subjectCreditText: entry.subjectCreditText || null
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
    // -- Summary Table Handlers --
    const handleSummaryChange = (oldSubjectName, field, newValue) => {
        setTimetable(prev => prev.map(t => {
            if (t.subjectNameText === oldSubjectName) {
                if (field === 'subject') {
                    return {
                        ...t,
                        subjectNameText: newValue,
                        subjectId: subjects.find(s => s.name === newValue)?.id || null, // re-link if known
                        subject_id: subjects.find(s => s.name === newValue)?.id || null
                    };
                } else if (field === 'staff') {
                    return {
                        ...t,
                        staffNameText: newValue,
                        staffId: staff.find(s => s.name === newValue)?.id || null, // re-link if known
                        staff_id: staff.find(s => s.name === newValue)?.id || null
                    };
                } else if (field === 'code') {
                    return { ...t, subjectCodeText: newValue };
                } else if (field === 'credits') {
                    return { ...t, subjectCreditText: newValue };
                }
            }
            return t;
        }));
    };

    const handleDeleteSubject = async (subjectName) => {
        if (!window.confirm(`Are you sure you want to delete '${subjectName}' and its schedule?`)) return;

        try {
            // Optimistic update
            setTimetable(prev => prev.filter(t => t.subjectNameText !== subjectName));

            // Server-side delete (optional, or rely on Save)
            // But user asked to delete subject, so immediate delete might be better:
            await axios.delete('/api/timetable/subject', {
                data: { year, section, subjectName }
            });

        } catch (err) {
            console.error(err);
            alert("Failed to delete subject entries.");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-800">Class Timetable</h2>
                    <p className="text-sm text-slate-500">{isStudent ? `Year ${year} - ${section}` : 'Manage weekly schedule for all classes.'}</p>
                </div>
                {!isStudent && (
                    <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                        <div className="flex gap-2 w-full sm:w-auto">
                            <select
                                value={year} onChange={(e) => setYear(e.target.value)}
                                className="flex-1 sm:w-32 bg-white border border-slate-200 rounded-xl px-4 py-2 font-medium text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20"
                            >
                                <option value="1">1st Year</option>
                                <option value="2">2nd Year</option>
                                <option value="3">3rd Year</option>
                                <option value="4">4th Year</option>
                            </select>
                            <select
                                value={section} onChange={(e) => setSection(e.target.value)}
                                className="flex-1 sm:w-32 bg-white border border-slate-200 rounded-xl px-4 py-2 font-medium text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20"
                            >
                                <option value="A">Section A</option>
                                <option value="B">Section B</option>
                                <option value="C">Section C</option>
                            </select>
                        </div>
                        <button
                            onClick={saveTimetable}
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2"
                        >
                            <Save size={18} /> {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                )}
            </div>

            {/* Timetable View */}
            <div className="space-y-4">
                {/* Desktop View (Table) */}
                <div className="hidden lg:block glass-card rounded-2xl overflow-hidden bg-white/60 border border-slate-200 overflow-x-auto">
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
                                            const meta = subjects.find(s => s.id == (entry.subject_id || entry.subjectId)) || {};
                                            const subCode = entry.subjectCodeText || meta.code || (entry.subjectNameText ? 'Custom' : '-');
                                            const subName = entry.subjectNameText || meta.name || '-';
                                            const staffName = entry.staffNameText || staff.find(s => s.id == (entry.staff_id || entry.staffId))?.name || (subName !== '-' ? 'TBA' : '-');

                                            return (
                                                <td key={period} className="p-2 border-r border-slate-100 min-w-[120px] text-center">
                                                    {subName !== '-' ? (
                                                        <div className="p-2 rounded-lg bg-blue-50/50 border border-blue-100/50 hover:bg-white hover:shadow-sm transition-all cursor-default relative group">
                                                            <p className="text-xs font-bold text-blue-700 truncate">{subCode !== 'Custom' ? subCode : subName}</p>
                                                            <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wide truncate">{staffName}</p>
                                                            <div className="absolute hidden group-hover:block bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-[10px] rounded shadow-lg pointer-events-none whitespace-nowrap z-50">
                                                                {subName}
                                                            </div>
                                                        </div>
                                                    ) : <span className="text-slate-300">-</span>}
                                                </td>
                                            );
                                        }
                                        return (
                                            <td key={period} className="p-2 border-r border-slate-100 min-w-[140px]">
                                                <div className="space-y-1">
                                                    <input
                                                        list="subject-options"
                                                        className="w-full text-[11px] font-semibold bg-blue-50/50 border-none rounded p-1 text-blue-900 truncate placeholder-blue-300 focus:ring-1 focus:ring-blue-500"
                                                        placeholder="Subject"
                                                        value={entry.subjectNameText || ''}
                                                        onChange={(e) => handleEntryChange(day, period, 'subject', e.target.value)}
                                                    />
                                                    <input
                                                        list="staff-options"
                                                        className="w-full text-[10px] bg-slate-50/50 border-none rounded p-1 text-slate-600 truncate placeholder-slate-400 focus:ring-1 focus:ring-slate-400"
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
                    </table>
                </div>

                {/* Mobile & Tablet View (Cards) */}
                <div className="lg:hidden space-y-6">
                    {days.map(day => (
                        <div key={day} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center gap-2">
                                <Calendar size={16} className="text-blue-600" />
                                <h3 className="font-bold text-slate-800">{day}</h3>
                            </div>
                            <div className="divide-y divide-slate-100">
                                {periods.map(period => {
                                    const entry = getEntry(day, period);
                                    if (isStudent) {
                                        const meta = subjects.find(s => s.id == (entry.subject_id || entry.subjectId)) || {};
                                        const subCode = entry.subjectCodeText || meta.code || (entry.subjectNameText ? 'Custom' : '-');
                                        const subName = entry.subjectNameText || meta.name || '-';
                                        const staffName = entry.staffNameText || staff.find(s => s.id == (entry.staff_id || entry.staffId))?.name || (subName !== '-' ? 'TBA' : '-');

                                        return (
                                            <div key={period} className="px-4 py-3 flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-[10px] font-bold text-slate-400 border border-slate-100">
                                                        P{period}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-800">{subCode !== 'Custom' ? subCode : subName}</p>
                                                        {subName !== '-' && <p className="text-xs text-slate-500">{subName}</p>}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    {subName !== '-' && (
                                                        <span className="text-[10px] font-medium px-2 py-1 rounded bg-blue-50 text-blue-600 uppercase tracking-wide">
                                                            {staffName}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    }
                                    return (
                                        <div key={period} className="px-4 py-3 flex items-center gap-4">
                                            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-[10px] font-bold text-slate-400 border border-slate-100 shrink-0">
                                                P{period}
                                            </div>
                                            <div className="flex-1 grid grid-cols-2 gap-2">
                                                <input
                                                    list="subject-options"
                                                    className="w-full text-xs font-semibold bg-blue-50/50 border border-blue-100 rounded-lg p-2 text-blue-900 outline-none focus:ring-1 focus:ring-blue-500"
                                                    placeholder="Subject"
                                                    value={entry.subjectNameText || ''}
                                                    onChange={(e) => handleEntryChange(day, period, 'subject', e.target.value)}
                                                />
                                                <input
                                                    list="staff-options"
                                                    className="w-full text-xs bg-slate-50 px-2 rounded-lg border border-slate-200 outline-none focus:ring-1 focus:ring-slate-400"
                                                    placeholder="Faculty"
                                                    value={entry.staffNameText || ''}
                                                    onChange={(e) => handleEntryChange(day, period, 'staff', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <datalist id="subject-options">
                {subjects.map(s => <option key={s.id} value={s.name}>{s.code}</option>)}
            </datalist>
            <datalist id="staff-options">
                {staff.map(s => <option key={s.id} value={s.name}>{s.staff_id}</option>)}
            </datalist>

            {/* Course Details Summary Table */}
            <div className="mt-8">
                <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <BookOpen size={20} className="text-blue-600" />
                    Course Details & Staff Allocation
                </h3>
                <div className="glass-card rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto scroll-hint">
                        <table className="w-full text-sm text-left min-w-[650px]">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 font-bold text-slate-700 w-16 text-center">Sl. No.</th>
                                    <th className="px-6 py-4 font-bold text-slate-700 border-l border-slate-100 uppercase text-[10px] tracking-wider">Course Code</th>
                                    <th className="px-6 py-4 font-bold text-slate-700 border-l border-slate-100 uppercase text-[10px] tracking-wider">Course Name</th>
                                    <th className="px-6 py-4 font-bold text-slate-700 border-l border-slate-100 uppercase text-[10px] tracking-wider">Staff</th>
                                    <th className="px-6 py-4 font-bold text-slate-700 w-20 text-center border-l border-slate-100 uppercase text-[10px] tracking-wider">Credit</th>
                                    {!isStudent && <th className="px-6 py-4 font-bold text-slate-700 w-16 text-center border-l border-slate-100 uppercase text-[10px] tracking-wider">Action</th>}
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

                                            // Use manual text if available, else fallback to meta or 'Custom'
                                            const code = t.subjectCodeText || meta.code || 'Custom';
                                            const credits = t.subjectCreditText || meta.credits || '-';

                                            uniqueSubjects.push({
                                                name: t.subjectNameText,
                                                code,
                                                credits
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
                                                <td colSpan={!isStudent ? "6" : "5"} className="px-6 py-8 text-center text-slate-400 font-medium">
                                                    No subjects assigned in the timetable yet.
                                                </td>
                                            </tr>
                                        );
                                    }

                                    return summaryData.map((row, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4 text-center font-medium text-slate-600">{idx + 1}</td>

                                            {/* Editable Course Code */}
                                            <td className="px-6 py-2 border-l border-slate-100 font-bold text-slate-800">
                                                {isStudent ? row.code : (
                                                    <input
                                                        type="text"
                                                        value={row.code === 'Custom' ? '' : row.code}
                                                        placeholder="Code"
                                                        onChange={(e) => handleSummaryChange(row.name, 'code', e.target.value)}
                                                        className="w-full bg-transparent border-b border-transparent focus:border-blue-500 focus:outline-none hover:border-slate-300 transition-colors py-1 font-bold"
                                                    />
                                                )}
                                            </td>

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
                                            <td className="px-6 py-2 text-slate-700 border-l border-slate-100 font-medium whitespace-nowrap">
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

                                            {/* Editable Credits */}
                                            <td className="px-6 py-2 text-center text-slate-600 border-l border-slate-100 font-bold">
                                                {isStudent ? row.credits : (
                                                    <input
                                                        type="text"
                                                        value={row.credits === '-' ? '' : row.credits}
                                                        placeholder="-"
                                                        onChange={(e) => handleSummaryChange(row.name, 'credits', e.target.value)}
                                                        className="w-12 text-center bg-transparent border-b border-transparent focus:border-blue-500 focus:outline-none hover:border-slate-300 transition-colors py-1 font-bold"
                                                    />
                                                )}
                                            </td>

                                            {!isStudent && (
                                                <td className="px-4 py-2 border-l border-slate-100 text-center">
                                                    <button
                                                        onClick={() => handleDeleteSubject(row.name)}
                                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Delete Subject"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    ));
                                })()}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Timetable;
