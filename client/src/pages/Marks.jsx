import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Save, Search, Filter, BookOpen } from 'lucide-react';

const Marks = () => {
    const { user } = useAuth();
    const isStaff = user?.role === 'staff' || user?.role === 'admin';

    // Filters
    const [year, setYear] = useState('2');
    const [section, setSection] = useState('A');
    const [subject, setSubject] = useState(''); // Will be set after subjects are fetched

    const [students, setStudents] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);

    useEffect(() => {
        fetchSubjects();
    }, [year]);

    useEffect(() => {
        if (subject) {
            fetchMarks();
        }
    }, [year, section, subject]);

    const fetchSubjects = async () => {
        try {
            const res = await axios.get(`/api/subjects`);
            // Filter subjects based on year (2nd year = semester 3,4; 3rd year = semester 5,6)
            const yearSemesters = year === '2' ? [3, 4] : year === '3' ? [5, 6] : year === '1' ? [1, 2] : [7, 8];
            const filteredSubjects = res.data.filter(s => yearSemesters.includes(s.semester));
            setSubjects(filteredSubjects);

            // Set default subject if available
            if (filteredSubjects.length > 0 && !subject) {
                setSubject(filteredSubjects[0].subject_code);
            }
        } catch (err) {
            console.error("Error fetching subjects", err);
        }
    };

    const fetchMarks = async () => {
        setIsLoading(true);
        try {
            let url = `/api/marks?year=${year}&section=${section}&subject_code=${subject}`;

            // Privacy: Student sees only own marks
            if (user?.role === 'student' && user?.profileId) {
                url += `&student_id=${user.profileId}`;
            }

            const res = await axios.get(url);
            setStudents(res.data);
        } catch (err) {
            console.error("Error fetching marks", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleMarkChange = (id, field, value) => {
        if (!isStaff) return; // Read-only for students

        // Validate input (0-100)
        let numValue = parseInt(value);
        if (value === '') numValue = '';
        else if (isNaN(numValue)) return;
        else if (numValue < 0) numValue = 0;
        else if (numValue > 100) numValue = 100;

        setStudents(prev => prev.map(s => s.id === id ? { ...s, [field]: numValue } : s));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const marksData = students.map(s => ({
                student_id: s.id,
                ia1: s.ia1 === '' ? 0 : s.ia1,
                ia2: s.ia2 === '' ? 0 : s.ia2,
                ia3: s.ia3 === '' ? 0 : s.ia3,
                assign1: s.assign1 === '' ? 0 : s.assign1,
                assign2: s.assign2 === '' ? 0 : s.assign2,
                assign3: s.assign3 === '' ? 0 : s.assign3,
                assign4: s.assign4 === '' ? 0 : s.assign4,
            }));

            await axios.post('/api/marks', {
                subject_code: subject,
                marksData
            });
            alert("Marks saved successfully!");
        } catch (err) {
            console.error("Error saving marks", err);
            alert("Failed to save marks");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in flex flex-col h-full min-h-[600px]">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                        Internal <span className="text-blue-600">Marks</span>
                    </h2>
                    <p className="text-slate-500 font-medium italic">Track academic performance across semesters</p>
                </div>
                {isStaff && (
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-blue-500/30 disabled:opacity-70 font-bold active:scale-95"
                    >
                        <Save size={20} />
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                )}
            </div>

            {/* Filter Bar */}
            <div className="glass-card p-4 lg:p-6 rounded-3xl flex flex-col md:flex-row gap-6 items-center bg-white/40 backdrop-blur-xl border border-white/60 shadow-inner">
                <div className="flex gap-3 w-full md:w-auto relative">
                    <button
                        onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                        className={`group flex items-center gap-3 px-6 py-3 border rounded-2xl transition-all text-sm font-bold ${subject ? 'bg-slate-900 text-white border-slate-900 shadow-xl' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-400'}`}
                    >
                        <Filter size={18} className={subject ? "text-blue-400" : "text-slate-400 group-hover:text-blue-500"} />
                        {subject ? `Subject: ${subject}` : 'Filter Standards'}
                    </button>

                    {showFilterDropdown && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setShowFilterDropdown(false)}></div>
                            <div className="absolute top-full left-0 mt-3 w-80 bg-white/95 backdrop-blur-2xl rounded-[2rem] shadow-2xl border border-slate-100 z-50 p-6 animate-in zoom-in-95 duration-200">
                                <div className="space-y-5">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block px-1">Academic Year</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {['1', '2', '3', '4'].map(y => (
                                                <button
                                                    key={y} onClick={() => setYear(y)}
                                                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${year === y ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                                                >
                                                    {y}{y === '1' ? 'st' : y === '2' ? 'nd' : y === '3' ? 'rd' : 'th'} Year
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block px-1">Section</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {['A', 'B', 'C'].map(s => (
                                                <button
                                                    key={s} onClick={() => setSection(s)}
                                                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${section === s ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                                                >
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block px-1">Target Subject</label>
                                        <select
                                            value={subject}
                                            onChange={(e) => setSubject(e.target.value)}
                                            className="w-full bg-slate-100 border-none text-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 text-xs font-bold appearance-none cursor-pointer"
                                        >
                                            <option value="">Select Subject Code</option>
                                            {subjects.map(s => (
                                                <option key={s.id} value={s.subject_code}>{s.subject_code} - {s.subject_name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <button
                                        onClick={() => setShowFilterDropdown(false)}
                                        className="w-full py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl active:scale-95"
                                    >
                                        Apply Filters
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <div className="hidden md:block h-10 w-px bg-slate-200/60 mx-2"></div>

                <div className="flex-1 flex items-center gap-4 text-sm font-bold text-slate-400">
                    <Search size={18} />
                    <span>
                        Viewing <span className="text-slate-700">{students.length}</span> students in <span className="text-blue-600">Year {year}{section}</span>
                    </span>
                </div>
            </div>

            {/* Hint for mobile */}
            <div className="md:hidden flex items-center justify-center gap-2 py-2 bg-blue-50/50 rounded-xl border border-blue-100 text-[10px] font-bold text-blue-500 animate-pulse">
                Scroll Table Horizontally <Filter size={10} />
            </div>

            {/* Data Grid */}
            <div className="flex-1 bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/50 overflow-hidden flex flex-col">
                <div className="overflow-x-auto scroll-hint flex-1">
                    <table className="w-full text-left border-collapse min-w-[1200px]">
                        <thead className="bg-slate-50/80 sticky top-0 z-10 backdrop-blur-md">
                            <tr>
                                <th className="p-6 border-b border-slate-100 w-80 sticky left-0 bg-slate-50/95 z-20 text-slate-500 font-black text-[10px] uppercase tracking-widest">Student Information</th>
                                <th className="p-4 border-b border-slate-100 text-center text-blue-600 font-black text-[10px] uppercase tracking-widest bg-blue-50/30">IA - 1 (50)</th>
                                <th className="p-4 border-b border-slate-100 text-center text-blue-600 font-black text-[10px] uppercase tracking-widest bg-blue-50/40">IA - 2 (50)</th>
                                <th className="p-4 border-b border-slate-100 text-center text-blue-600 font-black text-[10px] uppercase tracking-widest bg-blue-50/50">IA - 3 (50)</th>
                                <th className="p-4 border-b border-slate-100 text-center text-amber-600 font-black text-[10px] uppercase tracking-widest bg-amber-50/30">Assign 1</th>
                                <th className="p-4 border-b border-slate-100 text-center text-amber-600 font-black text-[10px] uppercase tracking-widest bg-amber-50/40">Assign 2</th>
                                <th className="p-4 border-b border-slate-100 text-center text-amber-600 font-black text-[10px] uppercase tracking-widest bg-amber-50/50">Assign 3</th>
                                <th className="p-4 border-b border-slate-100 text-center text-amber-600 font-black text-[10px] uppercase tracking-widest bg-amber-50/60">Assign 4</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                <tr><td colSpan="8" className="p-32 text-center text-slate-300 font-bold italic">Gathering academic records...</td></tr>
                            ) : students.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="p-32 text-center text-slate-400">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                                                <BookOpen size={32} />
                                            </div>
                                            <p className="font-extrabold text-xl text-slate-300 uppercase tracking-tighter">No Classroom Data Found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                students.map((stu) => (
                                    <tr key={stu.id} className="group hover:bg-slate-50 transition-all">
                                        <td className="p-4 lg:p-6 border-r border-slate-100 sticky left-0 bg-white group-hover:bg-slate-50 z-10">
                                            <div className="flex flex-col">
                                                <span className="font-extrabold text-slate-800 text-sm tracking-tight group-hover:text-blue-600 transition-colors uppercase">{stu.name}</span>
                                                <span className="text-[10px] text-slate-400 font-mono font-bold mt-1 select-all">{stu.roll_no}</span>
                                            </div>
                                        </td>

                                        {/* Inputs */}
                                        {['ia1', 'ia2', 'ia3', 'assign1', 'assign2', 'assign3', 'assign4'].map((f) => (
                                            <td key={f} className={`p-2 border-r border-slate-50 text-center ${f.includes('ia') ? 'bg-blue-50/5' : 'bg-amber-50/5'}`}>
                                                <input
                                                    type="number"
                                                    value={stu[f]}
                                                    onChange={(e) => handleMarkChange(stu.id, f, e.target.value)}
                                                    disabled={!isStaff}
                                                    className={`w-full h-12 text-center rounded-2xl border-2 transition-all font-black text-sm outline-none ${!isStaff ? 'bg-transparent border-transparent text-slate-600' : 'bg-white border-transparent focus:border-blue-500 hover:border-slate-200 shadow-sm focus:shadow-blue-500/10'}`}
                                                    placeholder="-"
                                                />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Marks;
