import { useState, useEffect } from 'react';
import { Users, ChevronRight, CheckCircle, XCircle, ArrowLeft, BarChart2, ClipboardList, Calendar, User, Search } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Attendance = () => {
    const { user } = useAuth();
    const isStudent = user?.role === 'student';
    const isHOD = user?.role === 'hod';

    // 0 = Class Selection, 1 = Student List / Report View
    const [view, setView] = useState(isStudent ? 1 : 0); // HOD should start with class selection
    const [mode, setMode] = useState(isHOD ? 'report' : 'mark'); // HOD defaults to report mode
    const [selectedClass, setSelectedClass] = useState(null);
    const [students, setStudents] = useState([]);
    const [attendanceReport, setAttendanceReport] = useState([]);
    const [attendance, setAttendance] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [month, setMonth] = useState(new Date().getMonth() + 1); // Default to current month
    const [personalAttendance, setPersonalAttendance] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const classes = [
        { year: 2, section: 'A' },
        { year: 2, section: 'B' },
        { year: 3, section: 'A' },
        { year: 3, section: 'B' },
        { year: 4, section: 'A' },
        { year: 4, section: 'B' },
    ];

    useEffect(() => {
        if (view === 1 && mode === 'report' && selectedClass && !isStudent) {
            handleClassSelect(selectedClass);
        }
    }, [month]);

    useEffect(() => {
        if (isStudent && user) {
            fetchPersonalAttendance();
        }
    }, [user, isStudent]);

    const fetchPersonalAttendance = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(`/api/attendance/personal?student_id=${user.profileId}`);
            setPersonalAttendance(res.data);
        } catch (err) {
            console.error("Error fetching personal attendance", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClassSelect = async (cls) => {
        setIsLoading(true);
        setSelectedClass(cls);
        setView(1);
        try {
            if (mode === 'mark') {
                const res = await axios.get(`/api/students?year=${cls.year}&section=${cls.section}`);
                setStudents(res.data);

                // Initialize all as Present by default
                const initialAttendance = {};
                res.data.forEach(s => initialAttendance[s.id] = 'Present');
                setAttendance(initialAttendance);
            } else {
                // Fetch Report
                const res = await axios.get(`/api/attendance/report?year=${cls.year}&section=${cls.section}&month=${month}`);
                setAttendanceReport(res.data);
            }
        } catch (err) {
            console.error("Error fetching data", err);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleAttendance = (id) => {
        setAttendance(prev => ({
            ...prev,
            [id]: prev[id] === 'Present' ? 'Absent' : 'Present'
        }));
    };

    const [period, setPeriod] = useState(1); // 1-8

    const submitAttendance = async () => {
        try {
            const date = new Date().toISOString().split('T')[0];
            await axios.post('/api/attendance', {
                date,
                period: period, // Send the period number (1-8)
                records: attendance
            });
            alert(`Attendance for Period ${period} Submitted Successfully!`);
        } catch (err) {
            console.error("Error submitting attendance", err);
            alert("Failed to save attendance");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {view === 1 && !isStudent && (
                        <button
                            onClick={() => { setView(0); setSelectedClass(null); setSearchTerm(''); }}
                            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
                        >
                            <ArrowLeft size={24} />
                        </button>
                    )}
                    <div>
                        <h2 className="text-3xl font-bold text-slate-800">
                            {isHOD ? "Monitor Attendance" : "Attendance"}
                        </h2>
                        <p className="text-slate-500">
                            {isStudent
                                ? "Your Personal Attendance Record"
                                : isHOD
                                    ? view === 0
                                        ? "Monitor department attendance reports"
                                        : `${selectedClass.year}nd Year - ${selectedClass.section} Section (Attendance Report)`
                                    : view === 0
                                        ? "Manage student attendance"
                                        : `${selectedClass.year}nd Year - ${selectedClass.section} Section (${mode === 'mark' ? 'Marking' : 'Report'})`
                            }
                        </p>
                    </div>
                </div>

                {view === 0 && !isStudent && !isHOD && (
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                        <button
                            onClick={() => setMode('mark')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${mode === 'mark' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <ClipboardList size={18} /> Mark Attendance
                        </button>
                        <button
                            onClick={() => setMode('report')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${mode === 'report' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <BarChart2 size={18} /> View Report
                        </button>
                    </div>
                )}
            </div>

            {isStudent ? (
                <div className="glass-card rounded-2xl overflow-hidden bg-white/60 border border-slate-200 table-container">
                    <div className="p-4 bg-slate-50/50 border-b border-slate-200 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <User className="text-blue-600" size={20} />
                            <span className="font-semibold text-slate-700">Your Attendance Record</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="text-slate-400" size={16} />
                            <span className="text-sm text-slate-500 hide-on-mobile">{new Date().toLocaleDateString()}</span>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="p-10 text-center text-slate-500">Loading your attendance...</div>
                    ) : personalAttendance.length === 0 ? (
                        <div className="p-10 text-center text-slate-500">No attendance records found.</div>
                    ) : (
                        <div className="scroll-hint">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-50/50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        <th className="p-4">Date</th>
                                        <th className="p-4 text-center">Status</th>
                                        <th className="p-4 text-center hide-on-mobile">Month</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 mobile-stack">
                                    {personalAttendance.map((record, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                            <td className="p-4" data-label="Date">
                                                <div className="flex items-center gap-2 md:justify-start justify-end">
                                                    <Calendar className="text-slate-400 hide-on-mobile" size={14} />
                                                    <span className="font-medium text-slate-700">
                                                        {new Date(record.date).toLocaleDateString('en-IN', {
                                                            weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
                                                        })}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-center" data-label="Status">
                                                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${record.status === 'Present' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : record.status === 'Absent' ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-blue-100 text-blue-700 border border-blue-200'}`}>
                                                    {record.status === 'Present' ? <><CheckCircle size={12} /> Present</> : record.status === 'Absent' ? <><XCircle size={12} /> Absent</> : <><Calendar size={12} /> On Duty</>}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center hide-on-mobile" data-label="Month">
                                                <span className="text-sm text-slate-600">{new Date(record.date).toLocaleDateString('en-IN', { month: 'long' })}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            ) : view === 0 ? (
                <div>
                    <div className="mb-6">
                        <p className="text-slate-600">{isHOD ? "Select a class to monitor attendance reports" : "Select a class to manage attendance"}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {classes.map((cls, idx) => (
                            <div key={idx} onClick={() => handleClassSelect(cls)} className="glass-card p-6 rounded-2xl cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all group bg-white/60 border border-slate-200">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-colors ${mode === 'mark' ? 'bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white' : 'bg-purple-100 text-purple-600 group-hover:bg-purple-600 group-hover:text-white'}`}>
                                            {cls.year}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-800 text-lg">{cls.year === 2 ? '2nd' : cls.year === 3 ? '3rd' : '4th'} Year</h3>
                                            <p className="text-slate-500">Section {cls.section}</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="text-slate-300 group-hover:text-slate-600 transition-colors" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                    <div className="glass-card rounded-2xl overflow-hidden bg-white/60 border border-slate-200 table-container">
                        {mode === 'mark' ? (
                            <>
                                <div className="p-4 bg-slate-50/50 border-b border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
                                    <div className="flex items-center gap-4">
                                        <span className="font-semibold text-slate-700">Mark Attendance</span>
                                        <select
                                            value={period}
                                            onChange={(e) => setPeriod(Number(e.target.value))}
                                            className="bg-white border border-blue-200 text-blue-700 font-bold rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            {[1, 2, 3, 4, 5, 6, 7, 8].map(p => <option key={p} value={p}>Period {p}</option>)}
                                        </select>
                                    </div>
                                    <span className="text-sm text-slate-500">{new Date().toLocaleDateString()}</span>
                                </div>
                                {isLoading ? (
                                    <div className="p-10 text-center text-slate-500">Loading students...</div>
                                ) : students.length === 0 ? (
                                    <div className="p-10 text-center text-slate-500">No students found in this class.</div>
                                ) : (
                                    <>
                                        <div className="p-4 bg-white border-b border-slate-100">
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                                <input
                                                    type="text"
                                                    placeholder="Search student by name or roll no..."
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm outline-none focus:border-blue-500 transition-all"
                                                />
                                            </div>
                                        </div>
                                        <div className="divide-y divide-slate-100">
                                            {students.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.roll_no.toLowerCase().includes(searchTerm.toLowerCase())).map((student) => (
                                                <div key={student.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between hover:bg-slate-50 transition-colors gap-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-semibold text-sm">{student.roll_no.slice(-3)}</div>
                                                        <div>
                                                            <p className="font-semibold text-slate-800">{student.name}</p>
                                                            <p className="text-xs text-slate-500 font-mono">{student.roll_no}</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => toggleAttendance(student.id)}
                                                        className={`w-full sm:w-auto px-4 py-2 rounded-xl flex items-center justify-center gap-2 font-medium transition-all ${attendance[student.id] === 'Present' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200 hover:bg-emerald-200' : 'bg-rose-100 text-rose-700 border border-rose-200 hover:bg-rose-200'}`}
                                                    >
                                                        {attendance[student.id] === 'Present' ? <><CheckCircle size={18} /> Present</> : <><XCircle size={18} /> Absent</>}
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </>
                        ) : (
                            <>
                                <div className="p-4 bg-slate-50/50 border-b border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
                                    <span className="font-semibold text-slate-700">Attendance Report</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-slate-500">Month:</span>
                                        <select value={month} onChange={(e) => setMonth(e.target.value)} className="bg-white border border-slate-200 text-slate-700 rounded-lg px-3 py-1.5 outline-none focus:border-blue-500 text-sm font-medium">
                                            <option value="">All Time</option>
                                            {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                                        </select>
                                    </div>
                                </div>
                                {isLoading ? (
                                    <div className="p-10 text-center text-slate-500">Loading report...</div>
                                ) : attendanceReport.length === 0 ? (
                                    <div className="p-10 text-center text-slate-500">No attendance records found.</div>
                                ) : (
                                    <>
                                        <div className="p-4 bg-white border-b border-slate-100">
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                                <input
                                                    type="text"
                                                    placeholder="Search report by name or roll no..."
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm outline-none focus:border-blue-500 transition-all"
                                                />
                                            </div>
                                        </div>
                                        <div className="scroll-hint">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="bg-slate-50/50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                                        <th className="p-4">Student</th>
                                                        <th className="p-4 text-center hide-on-mobile">Total</th>
                                                        <th className="p-4 text-center text-emerald-600">Pres.</th>
                                                        <th className="p-4 text-center text-rose-600 hide-on-mobile">Abs.</th>
                                                        <th className="p-4 text-center">Perc.</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100 mobile-stack">
                                                    {attendanceReport.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.roll_no.toLowerCase().includes(searchTerm.toLowerCase())).map((student) => (
                                                        <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                                                            <td className="p-4" data-label="Student">
                                                                <div className="text-left md:text-left text-right">
                                                                    <p className="font-semibold text-slate-800">{student.name}</p>
                                                                    <p className="text-xs text-slate-500 font-mono">{student.roll_no}</p>
                                                                </div>
                                                            </td>
                                                            <td className="p-4 text-center font-medium hide-on-mobile" data-label="Total">{student.total_days}</td>
                                                            <td className="p-4 text-center font-medium text-emerald-600" data-label="Present">{student.present_days}</td>
                                                            <td className="p-4 text-center font-medium text-rose-600 hide-on-mobile" data-label="Absent">{student.absent_days}</td>
                                                            <td className="p-4 text-center" data-label="Perc">
                                                                <div className="flex items-center justify-center gap-2">
                                                                    <div className="w-12 h-1.5 bg-slate-200 rounded-full overflow-hidden hide-on-mobile">
                                                                        <div className={`h-full rounded-full ${parseFloat(student.percentage) >= 75 ? 'bg-emerald-500' : 'bg-rose-500'}`} style={{ width: `${student.percentage}%` }}></div>
                                                                    </div>
                                                                    <span className={`text-sm font-bold ${parseFloat(student.percentage) >= 75 ? 'text-emerald-600' : 'text-rose-600'}`}>{student.percentage}%</span>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </>
                                )}
                            </>
                        )}
                    </div>
                    {mode === 'mark' && (
                        <div className="flex justify-end">
                            <button onClick={submitAttendance} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all hover:scale-105">Save Attendance</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Attendance;
