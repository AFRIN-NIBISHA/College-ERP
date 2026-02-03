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
        <div className="space-y-6 h-[calc(100vh-140px)] flex flex-col">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800">Internal Marks</h2>
                    <p className="text-slate-500">Manage internal assessments & assignments</p>
                </div>
                {isStaff && (
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-blue-500/25 disabled:opacity-70"
                    >
                        <Save size={20} />
                        {isSaving ? 'Saving...' : 'Save Marks'}
                    </button>
                )}
            </div>

            {/* Filters */}
            <div className="glass-card p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center bg-white/60">
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <BookOpen size={20} className="text-slate-400" />
                    <select
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="bg-white border border-slate-200 text-slate-700 rounded-lg px-3 py-2 outline-none focus:border-blue-500 w-full md:w-64 font-medium"
                    >
                        {subjects.map(s => (
                            <option key={s.id} value={s.subject_code}>{s.subject_code} - {s.subject_name}</option>
                        ))}
                    </select>
                </div>

                <div className="h-6 w-px bg-slate-200 hidden md:block"></div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    <select
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        className="bg-white border border-slate-200 text-slate-700 rounded-lg px-3 py-2 outline-none focus:border-blue-500"
                    >
                        <option value="2">2nd Year</option>
                        <option value="3">3rd Year</option>
                    </select>
                    <select
                        value={section}
                        onChange={(e) => setSection(e.target.value)}
                        className="bg-white border border-slate-200 text-slate-700 rounded-lg px-3 py-2 outline-none focus:border-blue-500"
                    >
                        <option value="A">Section A</option>
                        <option value="B">Section B</option>
                        <option value="C">Section C</option>
                    </select>
                </div>

                <div className="ml-auto text-sm text-slate-500 font-medium">
                    {students.length} Students Found
                </div>
            </div>

            {/* Excel Grid Table */}
            <div className="flex-1 glass-card rounded-2xl overflow-hidden bg-white/60 border border-slate-200 shadow-sm flex flex-col">
                <div className="flex-1 overflow-auto">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead className="bg-slate-50/90 sticky top-0 z-10 shadow-sm">
                            <tr>
                                <th className="p-4 border-b border-r border-slate-200 w-64 sticky left-0 bg-slate-50 z-20 text-slate-600 font-semibold text-sm">Student</th>
                                <th className="p-2 border-b border-r border-slate-200 w-24 text-center text-slate-600 font-semibold text-xs bg-blue-50/50">IA 1 (50)</th>
                                <th className="p-2 border-b border-r border-slate-200 w-24 text-center text-slate-600 font-semibold text-xs bg-blue-50/50">IA 2 (50)</th>
                                <th className="p-2 border-b border-r border-slate-200 w-24 text-center text-slate-600 font-semibold text-xs bg-blue-50/50">IA 3 (50)</th>
                                <th className="p-2 border-b border-r border-slate-200 w-24 text-center text-slate-600 font-semibold text-xs bg-amber-50/50">Assign 1</th>
                                <th className="p-2 border-b border-r border-slate-200 w-24 text-center text-slate-600 font-semibold text-xs bg-amber-50/50">Assign 2</th>
                                <th className="p-2 border-b border-r border-slate-200 w-24 text-center text-slate-600 font-semibold text-xs bg-amber-50/50">Assign 3</th>
                                <th className="p-2 border-b border-slate-200 w-24 text-center text-slate-600 font-semibold text-xs bg-amber-50/50">Assign 4</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {isLoading ? (
                                <tr><td colSpan="8" className="p-20 text-center text-slate-400">Loading marks data...</td></tr>
                            ) : students.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="p-20 text-center text-slate-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <p className="font-semibold text-lg">No students found</p>
                                            <p className="text-sm">Try changing the filters or add students in the Students tab.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                students.map((student) => (
                                    <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-3 border-r border-slate-100 sticky left-0 bg-white group-hover:bg-slate-50 border-b">
                                            <div>
                                                <p className="font-semibold text-slate-800 text-sm">{student.name}</p>
                                                <p className="text-xs text-slate-500 font-mono">{student.roll_no}</p>
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
                                                    className={`w-full h-10 text-center rounded-lg focus:bg-blue-50 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-medium ${!isStaff ? 'bg-transparent text-slate-600' : 'bg-slate-50/50 text-slate-800'}`}
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
                                                    className={`w-full h-10 text-center rounded-lg focus:bg-amber-50 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all font-medium ${!isStaff ? 'bg-transparent text-slate-600' : 'bg-slate-50/50 text-slate-800'}`}
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
