import { useState, useEffect } from 'react';
import { Search, Plus, Filter, MoreHorizontal, User, Edit, Trash2, ArrowLeft, GraduationCap, FileText } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Students = () => {
    const { user } = useAuth();
    const [students, setStudents] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [currentView, setCurrentView] = useState('CLASSES'); // CLASSES, LIST
    const [selectedClass, setSelectedClass] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeSection, setActiveSection] = useState('All');
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    const [buses, setBuses] = useState([]);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        roll_no: '',
        year: '1',
        section: 'A',
        email: '',
        phone: '',
        dob: '',
        bus_no: '',
        bus_driver_name: '',
        bus_driver_phone: '',
        bus_starting_point: '',
        bus_ending_point: '',
        emis_no: '',
        umis_no: '',
        father_name: '',
        mother_name: '',
        address: '',
        blood_group: '',
        religion: '',
        caste: '',
        nationality: ''
    });

    const classOptions = [
        { id: 1, title: '1st Year', year: 1, description: 'First Year B.E CSE' },
        { id: 2, title: '2nd Year', year: 2, description: 'Second Year B.E CSE' },
        { id: 3, title: '3rd Year', year: 3, description: 'Third Year B.E CSE' },
        { id: 4, title: '4th Year', year: 4, description: 'Final Year B.E CSE' },
    ];

    useEffect(() => {
        // If Student, auto-select view and fetch own data
        if (user?.role === 'student') {
            setSelectedClass({ title: 'My Profile', description: 'Student Details', year: 0 });
            setCurrentView('LIST');
        } else {
            // For staff/office, show class selection
            setCurrentView('CLASSES');
        }
        fetchBuses();
    }, [user]);

    const fetchBuses = async () => {
        try {
            const res = await axios.get('/api/bus');
            setBuses(res.data);
        } catch (err) {
            console.error('Error fetching buses', err);
        }
    };

    useEffect(() => {
        if (selectedClass) {
            fetchStudents(selectedClass.year);
        }
    }, [selectedClass]);

    const fetchStudents = async (year) => {
        setIsLoading(true);
        try {
            let url = `/api/students?year=${year}`;

            // Privacy Check: If Student, FORCE fetch only own profile
            if (user?.role === 'student' && user?.profileId) {
                url = `/api/students?id=${user.profileId}`;
            }

            const res = await axios.get(url);
            // Ensure sorted client-side as well
            const sorted = res.data.sort((a, b) =>
                a.roll_no.localeCompare(b.roll_no, undefined, { numeric: true, sensitivity: 'base' })
            );
            setStudents(sorted);
        } catch (err) {
            console.error("Error fetching students", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClassClick = (cls) => {
        setSelectedClass(cls);
        setCurrentView('LIST');
        setFormData({ ...formData, year: cls.year.toString() }); // Pre-select year for adding students
    };

    const handleBack = () => {
        setCurrentView('CLASSES');
        setSelectedClass(null);
        setStudents([]);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newData = { ...prev, [name]: value };

            // Auto-fill logic for Bus
            if (name === 'bus_no') {
                const matchedBus = buses.find(b =>
                    b.bus_number.toLowerCase() === value.toLowerCase() ||
                    b.bus_number.split(' ')[0].toLowerCase() === value.toLowerCase()
                );

                if (matchedBus) {
                    newData.bus_driver_name = matchedBus.driver_name;
                    newData.bus_driver_phone = matchedBus.driver_phone || '';
                    newData.bus_starting_point = matchedBus.starting_point || '';
                    newData.bus_ending_point = matchedBus.ending_point || '';
                }
            }

            return newData;
        });
    };

    const resetForm = () => {
        setFormData({
            name: '',
            roll_no: '',
            year: selectedClass ? selectedClass.year.toString() : '1',
            section: 'A',
            email: '',
            phone: '',
            dob: '',
            bus_no: '',
            bus_driver_name: '',
            bus_driver_phone: '',
            bus_starting_point: '',
            bus_ending_point: '',
            emis_no: '',
            umis_no: '',
            father_name: '',
            mother_name: '',
            address: '',
            blood_group: '',
            religion: '',
            caste: '',
            nationality: ''
        });
        setEditingId(null);
        setShowAddModal(false);
    };

    const handleEdit = (student) => {
        setFormData({
            name: student.name,
            roll_no: student.roll_no,
            year: student.year,
            section: student.section,
            email: student.email || '',
            phone: student.phone || '',
            dob: student.dob ? student.dob.split('T')[0] : '',
            bus_no: student.bus_no || '',
            bus_driver_name: student.bus_driver_name || '',
            bus_driver_phone: student.bus_driver_phone || '',
            bus_starting_point: student.bus_starting_point || '',
            bus_ending_point: student.bus_ending_point || '',
            emis_no: student.emis_no || '',
            umis_no: student.umis_no || '',
            father_name: student.father_name || '',
            mother_name: student.mother_name || '',
            address: student.address || '',
            blood_group: student.blood_group || '',
            religion: student.religion || '',
            caste: student.caste || '',
            nationality: student.nationality || ''
        });
        setEditingId(student.id);
        setShowAddModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this student?")) return;
        try {
            await axios.delete(`/api/students/${id}`);
            setStudents(students.filter(s => s.id !== id));
        } catch (err) {
            console.error("Error deleting student", err);
            const errorMessage = err.response?.data?.message || "Failed to delete student";
            alert(errorMessage);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let updatedList;
            if (editingId) {
                // Update
                const res = await axios.put(`/api/students/${editingId}`, formData);
                const updatedStudent = res.data;
                updatedList = students.map(s => s.id === editingId ? updatedStudent : s);
            } else {
                // Create
                const res = await axios.post('/api/students', formData);
                const newStudent = res.data;
                updatedList = [...students, newStudent];
            }

            // Sort the list by Roll Number
            updatedList.sort((a, b) =>
                a.roll_no.localeCompare(b.roll_no, undefined, { numeric: true, sensitivity: 'base' })
            );

            setStudents(updatedList);
            resetForm();
        } catch (err) {
            console.error("Error saving student", err);
            const errorMessage = err.response?.data?.message || "Failed to save student. Ensure backend is running.";
            alert(errorMessage);
        }
    };

    const canEditStudents = ['admin', 'office', 'staff', 'hod', 'principal'].includes(user?.role);
    const isStudent = user?.role === 'student';

    return (
        <div className="space-y-6">
            {/* Class Selection View */}
            {currentView === 'CLASSES' && (
                <div>
                    <h2 className="text-3xl font-bold text-slate-800 mb-6">Select Class</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {classOptions.map((option) => (
                            <button
                                key={option.id}
                                onClick={() => handleClassClick(option)}
                                className="glass-card p-6 rounded-2xl bg-white/60 hover:bg-blue-50/50 border border-slate-200 transition-all hover:scale-[1.02] hover:shadow-xl text-left group"
                            >
                                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    <GraduationCap size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 mb-2">{option.title}</h3>
                                <p className="text-slate-500 text-sm">{option.description}</p>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Student List View */}
            {currentView === 'LIST' && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleBack}
                                className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                            >
                                <ArrowLeft size={24} />
                            </button>
                            <div>
                                <h2 className="text-3xl font-bold text-slate-800">{selectedClass?.title} Students</h2>
                                <p className="text-slate-500">Manage students for {selectedClass?.description}</p>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            {/* Staff/Office Only: Add Student */}
                            {canEditStudents && (
                                <button
                                    onClick={() => { resetForm(); setShowAddModal(true); }}
                                    className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-blue-500/25"
                                >
                                    <Plus size={20} />
                                    Add Student
                                </button>
                            )}

                            {/* Student Only: Apply OD */}
                            {isStudent && (
                                <button
                                    onClick={() => alert("OD Application Form - Coming Soon!")}
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/25"
                                >
                                    <FileText size={20} />
                                    Apply OD
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Filters & Search */}
                    <div className="glass-card p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center justify-between bg-white/60 shadow-sm border border-slate-200">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search students..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-white border border-slate-200 text-slate-900 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-blue-500 transition-all text-sm outline-none"
                            />
                        </div>
                        <div className="flex gap-2 w-full md:w-auto relative">
                            <button
                                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                                className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-all text-sm font-medium ${activeSection !== 'All' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                            >
                                <Filter size={16} />
                                {activeSection === 'All' ? 'All Sections' : `Section ${activeSection}`}
                            </button>

                            {showFilterDropdown && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setShowFilterDropdown(false)}></div>
                                    <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 p-2 overflow-hidden shadow-blue-900/10">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 py-2 border-b border-slate-50 mb-1">Filter by Section</p>
                                        {['All', 'A', 'B', 'C'].map((sec) => (
                                            <button
                                                key={sec}
                                                onClick={() => { setActiveSection(sec); setShowFilterDropdown(false); }}
                                                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${activeSection === sec ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
                                            >
                                                {sec === 'All' ? 'All Sections' : `Section ${sec}`}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Table */}
                    <div className="glass-card rounded-2xl overflow-hidden bg-white/60 border border-slate-200 shadow-sm table-container">
                        <div className="scroll-hint">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-50/80 border-b border-slate-200 text-left">
                                        <th className="p-4 text-slate-500 font-semibold text-sm">Student</th>
                                        <th className="p-4 text-slate-500 font-semibold text-sm">Roll No</th>
                                        <th className="p-4 text-slate-500 font-semibold text-sm hide-on-mobile">Year/Sec</th>
                                        <th className="p-4 text-slate-500 font-semibold text-sm hide-on-mobile">DOB</th>
                                        <th className="p-4 text-slate-500 font-semibold text-sm hide-on-mobile">Email</th>
                                        <th className="p-4 text-slate-500 font-semibold text-sm hide-on-mobile">Bus No</th>
                                        <th className="p-4 text-slate-500 font-semibold text-sm">Status</th>
                                        {canEditStudents && <th className="p-4 text-slate-500 font-semibold text-sm">Actions</th>}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 mobile-stack">
                                    {isLoading ? (
                                        <tr><td colSpan={canEditStudents ? 7 : 6} className="p-8 text-center text-slate-500">Loading...</td></tr>
                                    ) : (() => {
                                        const filteredStudents = students.filter(s => {
                                            const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                s.roll_no.toLowerCase().includes(searchTerm.toLowerCase());
                                            const matchesSection = activeSection === 'All' || s.section === activeSection;
                                            return matchesSearch && matchesSection;
                                        });

                                        if (filteredStudents.length === 0) {
                                            return <tr><td colSpan={canEditStudents ? 7 : 6} className="p-8 text-center text-slate-500">No students matching your filters.</td></tr>;
                                        }

                                        return filteredStudents.map((student) => (
                                            <tr key={student.id} className="hover:bg-slate-50 transition-colors group">
                                                <td className="p-4" data-label="Student">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-200">
                                                            <User size={20} />
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-slate-800">{student.name}</p>
                                                            <p className="text-xs text-slate-500">CSE Dept</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-slate-600 font-mono text-sm" data-label="Roll No">{student.roll_no}</td>
                                                <td className="p-4 text-slate-600 font-medium hide-on-mobile" data-label="Year/Sec">{student.year} - {student.section}</td>
                                                <td className="p-4 text-slate-500 text-sm hide-on-mobile" data-label="DOB">{student.dob ? new Date(student.dob).toLocaleDateString() : '-'}</td>
                                                <td className="p-4 text-slate-500 text-sm hide-on-mobile" data-label="Email">{student.email}</td>
                                                <td className="p-4 text-slate-500 text-sm hide-on-mobile" data-label="Bus No">{student.bus_no || '-'}</td>
                                                <td className="p-4" data-label="Status">
                                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 border border-emerald-200">
                                                        Active
                                                    </span>
                                                </td>
                                                {canEditStudents && (
                                                    <td className="p-4" data-label="Actions">
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => handleEdit(student)}
                                                                className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                                                                title="Edit"
                                                            >
                                                                <Edit size={18} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(student.id)}
                                                                className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                                                                title="Delete"
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </div>
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
            )}

            {/* Add/Edit Student Modal (Restricted) */}
            {canEditStudents && showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-lg rounded-2xl p-6 relative animate-in fade-in zoom-in duration-200 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
                        <h3 className="text-xl font-bold text-slate-800 mb-6">{editingId ? 'Edit Student' : 'Add New Student'}</h3>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Section 1: Basic Information */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-bold text-blue-600 uppercase tracking-widest border-b border-blue-100 pb-1">Basic Information</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-slate-500">Full Name</label>
                                        <input required name="name" value={formData.name} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-slate-500">Roll Number</label>
                                        <input required name="roll_no" value={formData.roll_no} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-slate-500">Year</label>
                                        <select name="year" value={formData.year} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20">
                                            <option value="1">1st Year</option>
                                            <option value="2">2nd Year</option>
                                            <option value="3">3rd Year</option>
                                            <option value="4">4th Year</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-slate-500">Section</label>
                                        <select name="section" value={formData.section} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20">
                                            <option value="A">A</option>
                                            <option value="B">B</option>
                                            <option value="C">C</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-slate-500">Email Address</label>
                                        <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-slate-500">Phone</label>
                                        <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-slate-500">Date of Birth</label>
                                        <input type="date" required name="dob" value={formData.dob} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-slate-500">Blood Group</label>
                                        <input name="blood_group" value={formData.blood_group} onChange={handleInputChange} placeholder="e.g. O+ve" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20" />
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Family Details */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-bold text-blue-600 uppercase tracking-widest border-b border-blue-100 pb-1">Family Details</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-slate-500">Father's Name</label>
                                        <input name="father_name" value={formData.father_name} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-slate-500">Mother's Name</label>
                                        <input name="mother_name" value={formData.mother_name} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-500">Address</label>
                                    <textarea name="address" value={formData.address} onChange={handleInputChange} rows="2" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20 text-sm"></textarea>
                                </div>
                            </div>

                            {/* Section 3: Community & Identity */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-bold text-blue-600 uppercase tracking-widest border-b border-blue-100 pb-1">Community & Identity</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-slate-500">Religion</label>
                                        <input name="religion" value={formData.religion} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-slate-500">Caste</label>
                                        <input name="caste" value={formData.caste} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-slate-500">Nationality</label>
                                        <input name="nationality" value={formData.nationality} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-slate-500">EMIS No</label>
                                        <input name="emis_no" value={formData.emis_no} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-500">UMIS No</label>
                                    <input name="umis_no" value={formData.umis_no} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20" />
                                </div>
                            </div>

                            {/* Section 4: Transport Details */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-bold text-blue-600 uppercase tracking-widest border-b border-blue-100 pb-1">Transport Details</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-slate-500">Bus Number</label>
                                        <input name="bus_no" value={formData.bus_no} onChange={handleInputChange} placeholder="e.g. TN 74 AD 1234" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-slate-500">Driver Name</label>
                                        <input name="bus_driver_name" value={formData.bus_driver_name} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-slate-500">Driver Mobile</label>
                                        <input type="tel" name="bus_driver_phone" value={formData.bus_driver_phone} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-medium text-slate-500">Starting Point</label>
                                            <input name="bus_starting_point" value={formData.bus_starting_point} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-medium text-slate-500">Ending Point</label>
                                            <input name="bus_ending_point" value={formData.bus_ending_point} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-6 border-t border-slate-100 justify-end">
                                <button type="button" onClick={resetForm} className="px-6 py-2.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors font-semibold">Cancel</button>
                                <button type="submit" className="px-8 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-500/20 transition-all font-bold">{editingId ? 'Update Record' : 'Save Record'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Students;
