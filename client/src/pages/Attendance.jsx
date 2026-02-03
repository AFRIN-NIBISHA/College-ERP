import { useState, useEffect } from 'react';
import { Users, ChevronRight, CheckCircle, XCircle, ArrowLeft, BarChart2, ClipboardList, Calendar, User } from 'lucide-react';
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

    const submitAttendance = async () => {
        try {
            const date = new Date().toISOString().split('T')[0];
            await axios.post('/api/attendance', {
                date,
                records: attendance
            });
            alert("Attendance Submitted Successfully!");
            setView(0);
            setSelectedClass(null);
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
                            onClick={() => { setView(0); setSelectedClass(null); }}
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
                                        : `${selectedClass.year}rd Year - ${selectedClass.section} Section (Attendance Report)`
                                    : view === 0
                                        ? "Manage student attendance"
                                        : `${selectedClass.year}rd Year - ${selectedClass.section} Section (${mode === 'mark' ? 'Marking' : 'Report'})`
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
                // Student Personal Attendance View
                <div className="glass-card rounded-2xl overflow-hidden bg-white/60 border border-slate-200">
                    <div className="p-4 bg-slate-50/50 border-b border-slate-200 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <User className="text-blue-600" size={20} />
                            <span className="font-semibold text-slate-700">Your Attendance Record</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="text-slate-400" size={16} />
                            <span className="text-sm text-slate-500">{new Date().toLocaleDateString()}</span>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="p-10 text-center text-slate-500">Loading your attendance...</div>
                    ) : personalAttendance.length === 0 ? (
                        <div className="p-10 text-center text-slate-500">No attendance records found.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-50/50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        <th className="p-4">Date</th>
                                        <th className="p-4 text-center">Status</th>
                                        <th className="p-4 text-center">Month</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {personalAttendance.map((record, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="text-slate-400" size={14} />
                                                    <span className="font-medium text-slate-700">
                                                        {new Date(record.date).toLocaleDateString('en-IN', {
                                                            weekday: 'short',
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric'
                                                        })}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                                                    record.status === 'Present' 
                                                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                                        : record.status === 'Absent'
                                                            ? 'bg-rose-100 text-rose-700 border border-rose-200'
                                                            : 'bg-blue-100 text-blue-700 border border-blue-200'
                                                }`}>
                                                    {record.status === 'Present' ? (
                                                        <><CheckCircle size={12} /> Present</>
                                                    ) : record.status === 'Absent' ? (
                                                        <><XCircle size={12} /> Absent</>
                                                    ) : (
                                                        <><Calendar size={12} /> On Duty</>
                                                    )}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className="text-sm text-slate-600">
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
                // Class Selection View
                <div>
                    <div className="mb-6">
                        <p className="text-slate-600">
                            {isHOD 
                                ? "Select a class to monitor attendance reports"
                                : "Select a class to manage attendance"
                            }
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {classes.map((cls, idx) => (
                            <div
                                key={idx}
                                onClick={() => handleClassSelect(cls)}
                                className="glass-card p-6 rounded-2xl cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all group bg-white/60 border border-slate-200"
                            >
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
                // Detail View (Mark or Report)
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                    <div className="glass-card rounded-2xl overflow-hidden bg-white/60 border border-slate-200">
                        {mode === 'mark' ? (
                            // Mark Attendance Interface
                            <>
                                <div className="p-4 bg-slate-50/50 border-b border-slate-200 flex justify-between items-center">
                                    <span className="font-semibold text-slate-700">Student List ({students.length})</span>
                                    <span className="text-sm text-slate-500">{new Date().toLocaleDateString()}</span>
                                </div>

                                {isLoading ? (
                                    <div className="p-10 text-center text-slate-500">Loading students...</div>
                                ) : students.length === 0 ? (
                                    <div className="p-10 text-center text-slate-500">No students found in this class.</div>
                                ) : (
                                    <div className="divide-y divide-slate-100">
                                        {students.map((student) => (
                                            <div key={student.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-semibold text-sm">
                                                        {student.roll_no.slice(-3)}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-slate-800">{student.name}</p>
                                                        <p className="text-xs text-slate-500 font-mono">{student.roll_no}</p>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => toggleAttendance(student.id)}
                                                    className={`px-4 py-2 rounded-xl flex items-center gap-2 font-medium transition-all ${attendance[student.id] === 'Present'
                                                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-200 hover:bg-emerald-200'
                                                        : 'bg-rose-100 text-rose-700 border border-rose-200 hover:bg-rose-200'
                                                        }`}
                                                >
                                                    {attendance[student.id] === 'Present' ? (
                                                        <><CheckCircle size={18} /> Present</>
                                                    ) : (
                                                        <><XCircle size={18} /> Absent</>
                                                    )}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        ) : (
                            // View Report Interface
                            <>
                                <div className="p-4 bg-slate-50/50 border-b border-slate-200 flex justify-between items-center">
                                    <span className="font-semibold text-slate-700">Attendance Report</span>

                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-slate-500">Month:</span>
                                        <select
                                            value={month}
                                            onChange={(e) => setMonth(e.target.value)}
                                            className="bg-white border border-slate-200 text-slate-700 rounded-lg px-3 py-1.5 outline-none focus:border-blue-500 text-sm font-medium"
                                        >
                                            <option value="">All Time</option>
                                            <option value="1">January</option>
                                            <option value="2">February</option>
                                            <option value="3">March</option>
                                            <option value="4">April</option>
                                            <option value="5">May</option>
                                            <option value="6">June</option>
                                            <option value="7">July</option>
                                            <option value="8">August</option>
                                            <option value="9">September</option>
                                            <option value="10">October</option>
                                            <option value="11">November</option>
                                            <option value="12">December</option>
                                        </select>
                                    </div>
                                </div>

                                {isLoading ? (
                                    <div className="p-10 text-center text-slate-500">Loading report...</div>
                                ) : attendanceReport.length === 0 ? (
                                    <div className="p-10 text-center text-slate-500">No attendance records found.</div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="bg-slate-50/50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                                    <th className="p-4">Student</th>
                                                    <th className="p-4 text-center">Total Days</th>
                                                    <th className="p-4 text-center text-emerald-600">Present</th>
                                                    <th className="p-4 text-center text-rose-600">Absent</th>
                                                    <th className="p-4 text-center">Percentage</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {attendanceReport.map((student) => (
                                                    <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                                                        <td className="p-4">
                                                            <div>
                                                                <p className="font-semibold text-slate-800">{student.name}</p>
                                                                <p className="text-xs text-slate-500 font-mono">{student.roll_no}</p>
                                                            </div>
                                                        </td>
                                                        <td className="p-4 text-center font-medium">{student.total_days}</td>
                                                        <td className="p-4 text-center font-medium text-emerald-600">{student.present_days}</td>
                                                        <td className="p-4 text-center font-medium text-rose-600">{student.absent_days}</td>
                                                        <td className="p-4 text-center">
                                                            <div className="flex items-center justify-center gap-2">
                                                                <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                                                                    <div
                                                                        className={`h-full rounded-full ${parseFloat(student.percentage) >= 75 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                                                                        style={{ width: `${student.percentage}%` }}
                                                                    ></div>
                                                                </div>
                                                                <span className={`text-sm font-bold ${parseFloat(student.percentage) >= 75 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                                    {student.percentage}%
                                                                </span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {mode === 'mark' && (
                        <div className="flex justify-end">
                            <button
                                onClick={submitAttendance}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all hover:scale-105"
                            >
                                Save Attendance
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Attendance;
