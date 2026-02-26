import { useState, useEffect } from 'react';
import { Search, User, Bus, Phone, Info, Milestone, GraduationCap, MapPin, Hash, CheckCircle, Share2, FileDown } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import logoImg from '../assets/dmi_logo.png';

const DriverStudentList = () => {
    const { user } = useAuth();
    const [students, setStudents] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedBus, setSelectedBus] = useState('All');
    const [buses, setBuses] = useState([]);

    useEffect(() => {
        fetchData();
        fetchBuses();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get('/api/students/bus-list');
            setStudents(res.data);
        } catch (err) {
            console.error("Error fetching students", err);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchBuses = async () => {
        try {
            const res = await axios.get('/api/bus');
            setBuses(res.data);
        } catch (err) {
            console.error('Error fetching buses', err);
        }
    };

    const handleDownloadPDF = (share = false) => {
        const doc = new jsPDF();
        const busTitle = selectedBus === 'All' ? 'All Bus Routes' : `Bus Route: ${selectedBus}`;

        // Header
        doc.setFontSize(18);
        doc.setTextColor(40);
        doc.text('DMI Engineering College', 105, 15, { align: 'center' });
        doc.setFontSize(12);
        doc.text('Computer Science and Engineering - Transport List', 105, 22, { align: 'center' });
        doc.line(20, 25, 190, 25);

        doc.setFontSize(14);
        doc.text(busTitle, 14, 35);
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 40);

        const tableColumn = ["Roll No", "Student Name", "Bus Number", "Starting Point"];
        const tableRows = filteredStudents.map(s => [
            s.roll_no,
            s.name,
            s.bus_no,
            s.bus_starting_point || 'N/A'
        ]);

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 45,
            theme: 'grid',
            headStyles: { fillColor: [59, 130, 246] }, // Blue-600 logic
            margin: { top: 45 }
        });

        const fileName = `${busTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;

        if (share && navigator.share) {
            const blob = doc.output('blob');
            const file = new File([blob], fileName, { type: 'application/pdf' });
            navigator.share({
                title: busTitle,
                text: `Student list for ${busTitle}`,
                files: [file]
            }).catch(err => {
                console.error("Sharing failed", err);
                doc.save(fileName);
            });
        } else {
            doc.save(fileName);
        }
    };

    const filteredStudents = students.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.roll_no.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesBus = selectedBus === 'All' || s.bus_no === selectedBus;
        return matchesSearch && matchesBus && s.bus_no; // Only show students with a bus assigned
    });

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="relative overflow-hidden bg-white/40 backdrop-blur-xl border border-white/50 rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-blue-900/5">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-xs font-black uppercase tracking-widest border border-blue-100/50">
                            <Bus size={14} className="animate-bounce" />
                            Transport Portal
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-none">
                            Assigned <span className="text-blue-600">Students</span>
                        </h2>
                        <p className="text-slate-500 text-lg font-medium max-w-xl leading-relaxed">
                            A restricted view of students assigned to various transport routes. Manage boardings and route compliance.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleDownloadPDF(false)}
                                className="p-4 bg-white hover:bg-slate-50 text-blue-600 rounded-3xl border border-slate-100 shadow-xl shadow-blue-900/5 group transition-all"
                                title="Download PDF"
                            >
                                <FileDown size={24} className="group-hover:scale-110 transition-transform" />
                            </button>
                            <button
                                onClick={() => handleDownloadPDF(true)}
                                className="p-4 bg-blue-600 hover:bg-blue-500 text-white rounded-3xl shadow-xl shadow-blue-500/20 group transition-all flex items-center gap-2 pr-6"
                                title="Share Route"
                            >
                                <Share2 size={24} className="group-hover:rotate-12 transition-transform" />
                                <span className="font-bold underline">Share Route</span>
                            </button>
                        </div>

                        <div className="bg-white/80 p-4 rounded-3xl border border-slate-100 shadow-xl shadow-blue-900/5 flex items-center gap-4 min-w-[200px]">
                            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                                <GraduationCap size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Students</p>
                                <p className="text-2xl font-black text-slate-900 leading-tight">{filteredStudents.length}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 relative group">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                        <Search className="text-slate-400 group-focus-within:text-blue-600 transition-colors" size={22} />
                    </div>
                    <input
                        type="text"
                        placeholder="Search by student name or roll number..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/70 backdrop-blur-md border border-slate-200 text-slate-900 rounded-[2rem] pl-14 pr-6 py-5 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-lg shadow-xl shadow-slate-200/40 outline-none"
                    />
                </div>
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                        <MapPin className="text-slate-400 group-focus-within:text-blue-600 transition-colors" size={22} />
                    </div>
                    <select
                        value={selectedBus}
                        onChange={(e) => setSelectedBus(e.target.value)}
                        className="w-full bg-white/70 backdrop-blur-md border border-slate-200 text-slate-900 rounded-[2rem] pl-14 pr-10 py-5 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-lg appearance-none shadow-xl shadow-slate-200/40 outline-none cursor-pointer"
                    >
                        <option value="All">All Buses</option>
                        {buses.map(b => (
                            <option key={b.id} value={b.bus_number}>{b.bus_number}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Grid View */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-32 space-y-4">
                    <div className="w-16 h-16 border-4 border-blue-600/10 border-t-blue-600 rounded-full animate-spin" />
                    <p className="text-slate-500 font-black uppercase tracking-widest text-xs animate-pulse font-mono">Loading Data Access...</p>
                </div>
            ) : filteredStudents.length === 0 ? (
                <div className="bg-white/40 backdrop-blur-md rounded-[2.5rem] border-2 border-dashed border-slate-200 p-20 text-center space-y-4">
                    <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-300 mx-auto border border-slate-100">
                        <User size={40} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">No Students Found</h3>
                        <p className="text-slate-500 font-medium tracking-tight">No students match your current search or bus filter.</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredStudents.map((student) => (
                        <div key={student.id} className="group bg-white/60 backdrop-blur-md p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 hover:shadow-blue-900/10 transition-all hover:-translate-y-1 hover:bg-white">
                            <div className="flex items-center gap-6 mb-8">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-all duration-500">
                                    {student.name.substring(0, 1)}
                                </div>
                                <div className="space-y-1 overflow-hidden">
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight truncate pr-2" title={student.name}>
                                        {student.name}
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <Hash size={14} className="text-blue-500" />
                                        <p className="text-xs font-mono font-black text-slate-400 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                                            {student.roll_no}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-4 p-5 bg-blue-50/50 rounded-3xl border border-blue-100/30">
                                    <div className="flex items-center gap-2 text-blue-600">
                                        <Bus size={18} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Bus Route</span>
                                    </div>
                                    <p className="text-lg font-black text-blue-950 truncate" title={student.bus_no}>
                                        {student.bus_no}
                                    </p>
                                </div>
                                <div className="space-y-4 p-5 bg-emerald-50/50 rounded-3xl border border-emerald-100/30">
                                    <div className="flex items-center gap-2 text-emerald-600">
                                        <CheckCircle size={18} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Status</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <p className="text-lg font-black text-emerald-950 leading-tight">Assigned</p>
                                        <span className="text-[10px] font-black text-emerald-600 uppercase">Authorized</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verified Log</span>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full text-slate-500">
                                    <MapPin size={12} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Zone {student.bus_starting_point?.substring(0, 3) || 'NA'}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="bg-amber-50 rounded-[2rem] p-8 border border-amber-100/50 flex items-start gap-4">
                <div className="p-3 bg-white rounded-2xl text-amber-600 shadow-sm border border-amber-100">
                    <Info size={24} />
                </div>
                <div className="space-y-1">
                    <h4 className="text-lg font-black text-amber-900 tracking-tight">Privacy Notice</h4>
                    <p className="text-amber-800/70 font-medium leading-relaxed">
                        In compliance with student data policy, personal details (phone, email, parent information) are hidden. You are only authorized to view route-essential identifiers.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default DriverStudentList;
