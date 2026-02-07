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
        <div className="space-y-8 animate-fade-in pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="flex items-center gap-5">
                    {view === 1 && !isStudent && (
                        <button
                            onClick={() => { setView(0); setSelectedClass(null); setSearchTerm(''); }}
                            className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm active:scale-90"
                        >
                            <ArrowLeft size={24} />
                        </button>
                    )}
                    <div>
                        <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                            {isHOD ? "Department <span class='text-blue-600'>Attendance</span>" : "Academic <span class='text-blue-600'>Attendance</span>"}<span className="text-blue-600">.</span>
                        </h2>
                        <p className="text-slate-500 font-medium">
                            {isStudent
                                ? "Monitoring your physical presence across sessions"
                                : isHOD
                                    ? view === 0
                                        ? "Analytical overview of department engagement"
                                        : `Class Audit: Year ${selectedClass.year} - Section ${selectedClass.section}`
                                    : view === 0
                                        ? "Manage and track daily student presence"
                                        : `${mode === 'mark' ? 'Marking Presence' : 'Attendance Analytics'}: Year ${selectedClass.year} - ${selectedClass.section}`
                            }
                        </p>
                    </div>
                </div>

                {view === 0 && !isStudent && !isHOD && (
                    <div className="flex bg-slate-100/80 backdrop-blur-md p-1.5 rounded-[1.5rem] border border-slate-200 shadow-inner">
                        <button
                            onClick={() => setMode('mark')}
                            className={`flex items-center gap-2.5 px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${mode === 'mark' ? 'bg-white shadow-lg text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <ClipboardList size={16} /> Mark
                        </button>
                        <button
                            onClick={() => setMode('report')}
                            className={`flex items-center gap-2.5 px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${mode === 'report' ? 'bg-white shadow-lg text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <BarChart2 size={16} /> Reports
                        </button>
                    </div>
                )}
            </div>

            {isStudent ? (
                <div className="glass-card rounded-[2.5rem] overflow-hidden bg-white/40 border border-white/60 shadow-2xl shadow-slate-200/40 table-container">
                    <div className="p-8 border-b border-white/40 flex justify-between items-center bg-white/30 backdrop-blur-md">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
                                <User size={24} />
                            </div>
                            <span className="font-extrabold text-slate-800 tracking-tight">Personal Attendance Ledger</span>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Last Updated</span>
                            <span className="text-sm font-bold text-slate-700">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="p-32 text-center text-slate-400 font-bold italic animate-pulse">Synchronizing records...</div>
                    ) : personalAttendance.length === 0 ? (
                        <div className="p-32 text-center">
                            <p className="text-slate-300 font-extrabold text-2xl uppercase tracking-tighter">No Active Records Found</p>
                        </div>
                    ) : (
                        <div className="scroll-hint overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50 text-left">
                                        <th className="p-6 font-black text-[10px] text-slate-400 uppercase tracking-widest">Entry Date</th>
                                        <th className="p-6 font-black text-[10px] text-slate-400 uppercase tracking-widest text-center">Session Status</th>
                                        <th className="p-6 font-black text-[10px] text-slate-400 uppercase tracking-widest text-center hide-on-mobile">Academic Month</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 mobile-stack">
                                    {personalAttendance.map((record, idx) => (
                                        <tr key={idx} className="group hover:bg-white/60 transition-all duration-300">
                                            <td className="p-6" data-label="Date">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                                                        <Calendar size={18} />
                                                    </div>
                                                    <span className="font-bold text-slate-700">
                                                        {new Date(record.date).toLocaleDateString('en-IN', {
                                                            weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
                                                        })}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-6 text-center" data-label="Status">
                                                <div className="flex justify-center">
                                                    <span className={`flex items-center gap-1.5 px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${record.status === 'Present' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                            record.status === 'Absent' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                                                'bg-blue-50 text-blue-600 border-blue-100'
                                                        }`}>
                                                        {record.status === 'Present' ? <CheckCircle size={14} /> : record.status === 'Absent' ? <XCircle size={14} /> : <ClipboardList size={14} />}
                                                        {record.status}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-6 text-center hide-on-mobile" data-label="Month">
                                                <span className="text-xs font-bold text-slate-500 italic uppercase">
                                                    {new Date(record.date).toLocaleDateString('en-IN', { month: 'long' })}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            ) : view === 0 ? (
                <div className="space-y-8">
                    <div className="flex items-center gap-3 pl-1">
                        <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Select Deployment Class</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {classes.map((cls, idx) => (
                            <div key={idx} onClick={() => handleClassSelect(cls)} className="group cursor-pointer relative">
                                <div className="absolute inset-0 bg-blue-600/10 rounded-[2.5rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                <div className="relative glass-card p-10 rounded-[2.5rem] bg-white border border-slate-200 transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-2xl group-hover:shadow-blue-500/10 group-hover:border-blue-200">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-8">
                                            <div className={`w-20 h-20 rounded-[1.75rem] flex items-center justify-center font-black text-3xl transition-all duration-500 shadow-inner ${mode === 'mark' ? 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white' : 'bg-violet-50 text-violet-600 group-hover:bg-violet-600 group-hover:text-white'}`}>
                                                {cls.year}
                                            </div>
                                            <div>
                                                <h3 className="font-extrabold text-slate-800 text-2xl tracking-tighter">Year {cls.year}</h3>
                                                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">Section <span className="text-blue-500">{cls.section}</span></p>
                                            </div>
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:rotate-45 transition-all">
                                            <ChevronRight size={20} />
                                        </div>
                                    </div>

                                    <div className="mt-8 pt-8 border-t border-slate-50 flex items-center justify-between">
                                        <div className="flex -space-x-3">
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center overflow-hidden">
                                                    <div className="w-full h-full bg-blue-100 animate-pulse"></div>
                                                </div>
                                            ))}
                                            <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">+60</div>
                                        </div>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{mode === 'mark' ? 'Mark Attendance' : 'View Audit'}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="space-y-8 animate-in slide-in-from-bottom-5 duration-500">
                    <div className="glass-card rounded-[2.5rem] overflow-hidden bg-white border border-slate-200 shadow-2xl shadow-slate-200/30">
                        {mode === 'mark' ? (
                            <>
                                <div className="p-8 bg-slate-50/50 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
                                    <div className="flex items-center gap-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                                                <ClipboardList size={20} />
                                            </div>
                                            <span className="font-extrabold text-slate-800 tracking-tight">Deployment Registry</span>
                                        </div>
                                        <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                                            {[1, 2, 3, 4, 5, 6, 7, 8].map(p => (
                                                <button
                                                    key={p} onClick={() => setPeriod(p)}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${period === p ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                                                >
                                                    P{p}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm">{new Date().toLocaleDateString('en-GB')}</span>
                                        <button onClick={submitAttendance} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-blue-500/30 transition-all active:scale-95">Commit</button>
                                    </div>
                                </div>
                                {isLoading ? (
                                    <div className="p-32 text-center text-slate-300 font-bold italic">Assembling student list...</div>
                                ) : students.length === 0 ? (
                                    <div className="p-32 text-center text-slate-400">No active students in this cluster.</div>
                                ) : (
                                    <div className="flex flex-col">
                                        <div className="p-6 bg-white border-b border-slate-50">
                                            <div className="relative max-w-2xl mx-auto">
                                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                                                <input
                                                    type="text"
                                                    placeholder="Search record by name or identifier..."
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                    className="w-full bg-slate-50/50 border border-slate-100 rounded-[2rem] pl-16 pr-8 py-5 text-sm font-bold text-slate-700 outline-none focus:bg-white focus:border-blue-300 focus:ring-8 focus:ring-blue-500/5 transition-all shadow-inner"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 p-8 gap-6">
                                            {students.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.roll_no.toLowerCase().includes(searchTerm.toLowerCase())).map((student) => (
                                                <div
                                                    key={student.id}
                                                    onClick={() => toggleAttendance(student.id)}
                                                    className={`p-6 rounded-[2rem] border transition-all duration-300 cursor-pointer flex items-center justify-between group ${attendance[student.id] === 'Present' ? 'bg-emerald-50/30 border-emerald-100 hover:bg-emerald-50' : 'bg-rose-50/30 border-rose-100 hover:bg-rose-50'}`}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-sm transition-all duration-500 ${attendance[student.id] === 'Present' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>{student.roll_no.slice(-3)}</div>
                                                        <div>
                                                            <p className="font-extrabold text-slate-800 tracking-tight group-hover:text-blue-600 transition-colors uppercase text-sm">{student.name}</p>
                                                            <p className="text-[10px] text-slate-400 font-mono font-bold mt-1 uppercase tracking-widest">{student.roll_no}</p>
                                                        </div>
                                                    </div>
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${attendance[student.id] === 'Present' ? 'bg-emerald-500 text-white scale-110 shadow-lg shadow-emerald-500/20' : 'bg-slate-200 text-slate-400'}`}>
                                                        {attendance[student.id] === 'Present' ? <CheckCircle size={20} /> : <XCircle size={20} />}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <>
                                <div className="p-8 bg-slate-50/50 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-violet-600 flex items-center justify-center text-white shadow-xl shadow-violet-500/20">
                                            <BarChart2 size={24} />
                                        </div>
                                        <span className="font-extrabold text-slate-800 tracking-tight text-xl uppercase tracking-tighter">Attendance Analytics Audit</span>
                                    </div>
                                    <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-3">Audit Window</span>
                                        <select value={month} onChange={(e) => setMonth(e.target.value)} className="bg-slate-50 border-none text-slate-800 rounded-xl px-5 py-2 outline-none font-black text-xs appearance-none cursor-pointer">
                                            <option value="">All Academic Time</option>
                                            {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                                        </select>
                                    </div>
                                </div>
                                {isLoading ? (
                                    <div className="p-32 text-center text-slate-300 font-bold italic">Compiling data streams...</div>
                                ) : attendanceReport.length === 0 ? (
                                    <div className="p-32 text-center text-slate-400 font-bold italic">No data records currently available.</div>
                                ) : (
                                    <>
                                        <div className="p-6 bg-white border-b border-slate-50">
                                            <div className="relative max-w-2xl mx-auto">
                                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                                                <input
                                                    type="text"
                                                    placeholder="Search audit by name or roll no..."
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                    className="w-full bg-slate-50/50 border border-slate-100 rounded-[2rem] pl-16 pr-8 py-5 text-sm font-bold text-slate-700 outline-none focus:bg-white focus:border-blue-300 transition-all shadow-inner"
                                                />
                                            </div>
                                        </div>
                                        <div className="scroll-hint overflow-x-auto">
                                            <table className="w-full border-collapse">
                                                <thead>
                                                    <tr className="bg-slate-50/50 text-left">
                                                        <th className="p-8 font-black text-[10px] text-slate-400 uppercase tracking-widest">Academic Personnel / ID</th>
                                                        <th className="p-8 font-black text-[10px] text-slate-400 uppercase tracking-widest text-center hide-on-mobile">Cycles</th>
                                                        <th className="p-8 font-black text-[10px] text-emerald-500 uppercase tracking-widest text-center pr-4">Present</th>
                                                        <th className="p-8 font-black text-[10px] text-rose-500 uppercase tracking-widest text-center hide-on-mobile">Absent</th>
                                                        <th className="p-8 font-black text-[10px] text-slate-400 uppercase tracking-widest text-center">Score %</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100 mobile-stack">
                                                    {attendanceReport.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.roll_no.toLowerCase().includes(searchTerm.toLowerCase())).map((student) => (
                                                        <tr key={student.id} className="group hover:bg-slate-50/50 transition-colors">
                                                            <td className="p-8" data-label="Personnel">
                                                                <div className="flex items-center gap-4">
                                                                    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center font-black text-blue-600 text-xs shadow-sm uppercase">{student.name.charAt(0)}</div>
                                                                    <div className="flex flex-col">
                                                                        <p className="font-extrabold text-slate-800 tracking-tight group-hover:text-blue-600 transition-colors uppercase text-sm">{student.name}</p>
                                                                        <p className="text-[10px] text-slate-400 font-mono font-bold mt-1 uppercase tracking-widest">{student.roll_no}</p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="p-8 text-center font-bold text-slate-500 text-sm hide-on-mobile" data-label="Total Cycles">{student.total_days}</td>
                                                            <td className="p-8 text-center font-black text-emerald-600 text-sm pr-4" data-label="Present">{student.present_days}</td>
                                                            <td className="p-8 text-center font-black text-rose-500 text-sm hide-on-mobile" data-label="Absent">{student.absent_days}</td>
                                                            <td className="p-8 text-center" data-label="Score">
                                                                <div className="flex flex-col items-center gap-3">
                                                                    <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden hide-on-mobile shadow-inner">
                                                                        <div className={`h-full rounded-full transition-all duration-1000 ${parseFloat(student.percentage) >= 75 ? 'bg-gradient-to-r from-emerald-500 to-green-400' : 'bg-gradient-to-r from-rose-500 to-orange-400'}`} style={{ width: `${student.percentage}%` }}></div>
                                                                    </div>
                                                                    <span className={`text-base font-black tracking-tighter ${parseFloat(student.percentage) >= 75 ? 'text-emerald-600' : 'text-rose-600'}`}>{student.percentage}%</span>
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
                </div>
            )}
        </div>
    );
};

export default Attendance;
