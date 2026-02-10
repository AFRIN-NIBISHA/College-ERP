import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Save, Search, Filter, BookOpen } from 'lucide-react';

const Marks = () => {
    const { user } = useAuth();
    const isStaff = user?.role !== 'student';
    const isStudent = user?.role === 'student';

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
        if (user?.role === 'student' && user.year && user.section) {
            setYear(String(user.year));
            setSection(user.section);
        }
    }, [user]);

    useEffect(() => {
        fetchSubjects();
    }, [year]);

    useEffect(() => {
        if (subject || user?.role === 'student') {
            fetchMarks();
        }
    }, [year, section, subject]);

    const fetchSubjects = async () => {
        try {
            const res = await axios.get(`/api/subjects`);
            // Filter subjects based on year (2nd year = semester 3,4; 3rd year = semester 5,6)
            const yearSemesters = year === '2' ? [3, 4] : year === '3' ? [5, 6] : year === '1' ? [1, 2] : year === '4' ? [7, 8] : [];
            const filteredSubjects = res.data.filter(s => yearSemesters.includes(s.semester));
            setSubjects(filteredSubjects);

            // Handle subject selection after year change
            if (filteredSubjects.length > 0) {
                // If current subject is not in the new year's subjects, or no subject is selected
                if (!subject || !filteredSubjects.some(s => s.subject_code === subject)) {
                    if (isStaff) {
                        setSubject(filteredSubjects[0].subject_code);
                    } else {
                        setSubject('');
                    }
                }
            } else {
                setSubject('');
            }
        } catch (err) {
            console.error("Error fetching subjects", err);
        }
    };

    const fetchMarks = async () => {
        setIsLoading(true);
        try {
            let url = `/api/marks?year=${year}&section=${section}`;

            if (subject) {
                url += `&subject_code=${subject}`;
            }

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
        <div className="space-y-4 md:space-y-6 h-[calc(100vh-120px)] sm:h-[calc(100vh-140px)] flex flex-col pb-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">Internal Marks</h2>
                    <p className="text-xs sm:text-sm text-slate-500">
                        {isStudent ? `Academic Record for ${user.name} (${user.username})` : 'Manage internal assessments & assignments'}
                    </p>
                </div>
                {isStaff && (
                    <button
                        onClick={handleSave}
                        disabled={isSaving || !subject}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-5 sm:px-6 py-2 sm:py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50 text-sm sm:text-base font-semibold"
                        title={!subject ? "Select a subject to enable saving" : ""}
                    >
                        <Save size={18} className="sm:w-5 sm:h-5" />
                        {isSaving ? 'Saving...' : 'Save Marks'}
                    </button>
                )}
            </div>

            {/* Filters - Only for Staff */}
            {isStaff && (
                <div className="glass-card p-3 sm:p-4 rounded-xl flex flex-col md:flex-row gap-3 sm:gap-4 items-center bg-white/60 shadow-sm border border-slate-200">
                    <div className="flex gap-2 w-full md:w-auto relative">
                        <button
                            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 sm:py-2.5 border rounded-xl transition-all text-sm font-semibold ${subject || year || section ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                        >
                            <Filter size={16} />
                            <span className="truncate max-w-[150px]">{subject ? `Filter: ${subject}` : 'All Subjects'}</span>
                        </button>

                        {showFilterDropdown && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setShowFilterDropdown(false)}></div>
                                <div className="absolute top-full left-0 mt-2 w-[calc(100vw-2rem)] sm:w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 p-4 sm:p-5 shadow-blue-900/10 scale-in-center">
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Select Subject</p>
                                            <select
                                                value={subject}
                                                onChange={(e) => setSubject(e.target.value)}
                                                className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3 py-2.5 outline-none focus:border-blue-500 text-sm font-medium"
                                            >
                                                <option value="">All Subjects (View Only)</option>
                                                {subjects.map(s => (
                                                    <option key={s.id} value={s.subject_code}>{s.subject_code} - {s.subject_name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Year</p>
                                                <select
                                                    value={year}
                                                    onChange={(e) => setYear(e.target.value)}
                                                    className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3 py-2.5 outline-none focus:border-blue-500 text-sm font-medium"
                                                >
                                                    <option value="1">1st Year</option>
                                                    <option value="2">2nd Year</option>
                                                    <option value="3">3rd Year</option>
                                                    <option value="4">4th Year</option>
                                                </select>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Section</p>
                                                <select
                                                    value={section}
                                                    onChange={(e) => setSection(e.target.value)}
                                                    className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3 py-2.5 outline-none focus:border-blue-500 text-sm font-medium"
                                                >
                                                    <option value="A">Sec A</option>
                                                    <option value="B">Sec B</option>
                                                    <option value="C">Sec C</option>
                                                </select>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => setShowFilterDropdown(false)}
                                            className="w-full py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]"
                                        >
                                            Apply Filters
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="h-4 md:h-6 w-px bg-slate-200 hidden md:block"></div>

                    <div className="text-xs sm:text-sm text-slate-500 font-medium text-center md:text-left">
                        {subject ? (
                            <>Showing <span className="text-blue-600 font-bold">{students.length}</span> Students in <span className="text-slate-700 font-bold">Year {year}{section}</span></>
                        ) : (
                            <>Showing <span className="text-blue-600 font-bold">All Subject</span> Marks</>
                        )}
                    </div>
                </div>
            )}

            {/* Hint for mobile */}
            <div className="md:hidden flex items-center justify-center gap-2 py-1">
                <div className="w-8 h-px bg-slate-200"></div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider animate-pulse flex items-center gap-1">
                    <BookOpen size={12} /> Scroll right to view marks
                </p>
                <div className="w-8 h-px bg-slate-200"></div>
            </div>

            {/* Excel Grid Table */}
            <div className="flex-1 glass-card rounded-2xl overflow-hidden bg-white/80 border border-slate-200 shadow-sm flex flex-col min-h-0">
                <div className="flex-1 overflow-x-auto scroll-hint">
                    <table className="w-full text-left border-collapse min-w-[900px]">
                        <thead className="bg-slate-50/90 sticky top-0 z-30 shadow-sm">
                            <tr>
                                <th className="p-3 sm:p-4 border-b border-r border-slate-200 w-48 sm:w-64 sticky left-0 bg-slate-50 z-40 text-slate-600 font-bold text-xs sm:text-sm">
                                    <div className="flex items-center gap-2">
                                        <BookOpen size={14} className="text-slate-400" />
                                        {subject ? 'Student Info' : 'Subject Info'}
                                    </div>
                                </th>
                                <th className="p-2 border-b border-r border-slate-200 w-24 text-center text-slate-600 font-bold text-[10px] sm:text-xs bg-blue-50/50 uppercase tracking-wider">IA 1 (50)</th>
                                <th className="p-2 border-b border-r border-slate-200 w-24 text-center text-slate-600 font-bold text-[10px] sm:text-xs bg-blue-50/50 uppercase tracking-wider">IA 2 (50)</th>
                                <th className="p-2 border-b border-r border-slate-200 w-24 text-center text-slate-600 font-bold text-[10px] sm:text-xs bg-blue-50/50 uppercase tracking-wider">IA 3 (50)</th>
                                <th className="p-2 border-b border-r border-slate-200 w-24 text-center text-slate-600 font-bold text-[10px] sm:text-xs bg-amber-50/50 uppercase tracking-wider">Assign 1</th>
                                <th className="p-2 border-b border-r border-slate-200 w-24 text-center text-slate-600 font-bold text-[10px] sm:text-xs bg-amber-50/50 uppercase tracking-wider">Assign 2</th>
                                <th className="p-2 border-b border-r border-slate-200 w-24 text-center text-slate-600 font-bold text-[10px] sm:text-xs bg-amber-50/50 uppercase tracking-wider">Assign 3</th>
                                <th className="p-2 border-b border-slate-200 w-24 text-center text-slate-600 font-bold text-[10px] sm:text-xs bg-amber-50/50 uppercase tracking-wider">Assign 4</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {isLoading ? (
                                <tr><td colSpan="8" className="p-20 text-center text-slate-400 font-medium">Loading marks data...</td></tr>
                            ) : students.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="p-20 text-center text-slate-500 bg-slate-50/30">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                                                <Search size={32} className="text-slate-300" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="font-bold text-slate-800 text-lg">No students found</p>
                                                <p className="text-sm text-slate-400">Try changing the filters or check student records.</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                students.map((student) => (
                                    <tr key={student.id} className="hover:bg-blue-50/30 transition-colors group">
                                        <td className="p-3 border-r border-slate-100 sticky left-0 bg-white group-hover:bg-blue-50/30 z-20 border-b">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-800 text-sm truncate max-w-[150px] sm:max-w-full">
                                                    {subject ? student.name : student.subject_name}
                                                </span>
                                                <span className="text-[10px] sm:text-xs text-slate-400 font-mono tracking-tighter">
                                                    {subject ? student.roll_no : student.subject_code}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Internal Assessment Columns */}
                                        {['ia1', 'ia2', 'ia3'].map((field) => (
                                            <td key={field} className="p-1 border-r border-slate-100 text-center border-b">
                                                <input
                                                    type="number"
                                                    value={student[field]}
                                                    onChange={(e) => handleMarkChange(student.id, field, e.target.value)}
                                                    disabled={!isStaff}
                                                    className={`w-full h-10 text-center text-sm rounded-lg focus:bg-blue-50 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-bold ${!isStaff ? 'bg-transparent text-slate-600' : 'bg-slate-50/50 text-slate-800 focus:shadow-inner'}`}
                                                    placeholder="-"
                                                />
                                            </td>
                                        ))}

                                        {/* Assignment Columns */}
                                        {['assign1', 'assign2', 'assign3', 'assign4'].map((field) => (
                                            <td key={field} className="p-1 border-r border-slate-100 text-center border-b last:border-r-0">
                                                <input
                                                    type="number"
                                                    value={student[field]}
                                                    onChange={(e) => handleMarkChange(student.id, field, e.target.value)}
                                                    disabled={!isStaff}
                                                    className={`w-full h-10 text-center text-sm rounded-lg focus:bg-amber-50 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all font-bold ${!isStaff ? 'bg-transparent text-slate-600' : 'bg-slate-50/50 text-slate-800 focus:shadow-inner'}`}
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
