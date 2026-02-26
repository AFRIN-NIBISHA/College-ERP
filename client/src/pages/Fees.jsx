import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Search, Filter, Edit2, Check, X, CreditCard, IndianRupee, RefreshCw } from 'lucide-react';

const Fees = () => {
    const { user } = useAuth();
    const canEditFees = ['admin', 'office', 'staff', 'hod', 'principal'].includes(user?.role);
    const isStudent = user?.role === 'student';

    // Default to 1st Year, A Section (Common default) - or maintain user selection
    // Default to All if possible, or maintain user selection
    const [year, setYear] = useState('All');
    const [section, setSection] = useState('All');

    // Data States
    const [students, setStudents] = useState([]); // Stores ALL students
    const [loading, setLoading] = useState(false);

    // UI States
    const [editingStudent, setEditingStudent] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [feeForm, setFeeForm] = useState({
        total_fee: '',
        paid_amount: '',
        payment_date: '',
        payment_mode: 'Cash',
        receipt_no: '',
        status: 'Pending',
        scholarship_type: 'None',
        scholarship_details: '',
        bus_fee: ''
    });
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);

    useEffect(() => {
        fetchFeesData();
    }, []);

    const fetchFeesData = async () => {
        setLoading(true);
        try {
            let studentUrl = '/api/students';
            let feesUrl = '/api/fees';

            // Privacy: Fetch only own data if student
            if (user?.role === 'student' && user?.profileId) {
                studentUrl = `/api/students?id=${user.profileId}`;
                feesUrl = `/api/fees?student_id=${user.profileId}`;
            }

            // Fetch Data
            const [studentRes, feesRes] = await Promise.all([
                axios.get(studentUrl),
                axios.get(feesUrl)
            ]);

            // Combine Data efficiently using a map
            const feeMap = new Map();
            feesRes.data.forEach(f => feeMap.set(String(f.student_id), f));

            const combined = studentRes.data.map(student => {
                const feeRecord = feeMap.get(String(student.id)) || {};

                return {
                    ...feeRecord,
                    ...student,
                    id: student.id,
                    name: student.name,
                    total_fee: feeRecord.total_fee || '0',
                    paid_amount: feeRecord.paid_amount || '0',
                    bus_fee: feeRecord.bus_fee || '0',
                    status: feeRecord.status || ((parseFloat(feeRecord.paid_amount) >= (parseFloat(feeRecord.total_fee || 0) + parseFloat(feeRecord.bus_fee || 0))) && (parseFloat(feeRecord.total_fee) + parseFloat(feeRecord.bus_fee)) > 0 ? 'Paid' : 'Pending')
                };
            });

            setStudents(combined);
        } catch (err) {
            console.error("Error fetching fee data", err);
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (student) => {
        setEditingStudent(student);
        setFeeForm({
            total_fee: student.total_fee || '50000',
            paid_amount: student.paid_amount || '0',
            payment_date: student.payment_date ? student.payment_date.split('T')[0] : new Date().toISOString().split('T')[0],
            payment_mode: student.payment_mode || 'Cash',
            receipt_no: student.receipt_no || '',
            status: student.status || 'Pending',
            scholarship_type: student.scholarship_type || 'None',
            scholarship_details: student.scholarship_details || '',
            bus_fee: student.bus_fee || '0'
        });
    };

    const handleSaveFee = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                student_id: editingStudent.id,
                ...feeForm,
                status: parseFloat(feeForm.paid_amount) >= (parseFloat(feeForm.total_fee || 0) + parseFloat(feeForm.bus_fee || 0)) ? 'Paid' : 'Pending'
            };

            await axios.post('/api/fees', payload);
            setEditingStudent(null);
            fetchFeesData(); // Refresh local data
        } catch (err) {
            console.error("Failed to save fee", err);
            alert("Failed to save fee record");
        }
    };

    // Client-side Filtering
    const filteredStudents = students.filter(student => {
        // If student, show all (only fetched own data)
        if (isStudent) return true;

        const matchYear = year === 'All' || student.year.toString() === year.toString();
        const matchSection = section === 'All' || student.section === section;
        const matchSearch = searchTerm
            ? (student.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (student.roll_no || '').toLowerCase().includes(searchTerm.toLowerCase())
            : true;

        return matchYear && matchSection && matchSearch;
    });

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800">Fees Management</h2>
                    <p className="text-slate-500">Track and update student fee payments</p>
                </div>
            </div>
            {user?.role !== 'student' && (
                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={fetchFeesData}
                        className="p-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 hover:text-blue-600 transition-colors"
                        title="Refresh Data"
                    >
                        <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
                    </button>
                    <div className="relative">
                        <Search size={18} className="absolute left-3 top-3 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search Student..."
                            className="bg-white pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:border-blue-500 outline-none w-full md:w-64"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 w-full md:w-auto relative">
                        <button
                            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                            className={`flex items-center gap-2 px-4 py-2 border rounded-xl transition-colors duration-200 text-sm font-medium ${year !== 'All' || section !== 'All' ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                        >
                            <Filter size={18} />
                            {year !== 'All' || section !== 'All' ? `Year ${year} - Sec ${section}` : 'All Students'}
                        </button>

                        {showFilterDropdown && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setShowFilterDropdown(false)}></div>
                                <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 p-4 shadow-blue-900/10 scale-in-center origin-top-right">
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Filter by Year</p>
                                            <div className="grid grid-cols-2 gap-2">
                                                <button
                                                    onClick={() => setYear('All')}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${year === 'All' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                                                >
                                                    All Years
                                                </button>
                                                {['1', '2', '3', '4'].map((y) => (
                                                    <button
                                                        key={y}
                                                        onClick={() => setYear(y)}
                                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${year === y ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                                                    >
                                                        Year {y}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="border-t border-slate-100 pt-3">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Filter by Section</p>
                                            <div className="grid grid-cols-2 gap-2">
                                                <button
                                                    onClick={() => setSection('All')}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${section === 'All' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                                                >
                                                    All Sections
                                                </button>
                                                {['A', 'B', 'C'].map((s) => (
                                                    <button
                                                        key={s}
                                                        onClick={() => setSection(s)}
                                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${section === s ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                                                    >
                                                        Sec {s}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => setShowFilterDropdown(false)}
                                            className="w-full mt-2 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
                                        >
                                            Apply Filters
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}


            <div className="glass-card rounded-2xl overflow-hidden bg-white border border-slate-200">
                <div className="overflow-x-auto scroll-hint">
                    <table className="w-full text-left border-collapse min-w-[800px] md:min-w-full">
                        <thead className="bg-slate-50 border-b border-slate-200 hidden md:table-header-group">
                            <tr>
                                <th className="p-4 font-bold text-slate-600 uppercase text-[10px] tracking-wider">Roll No</th>
                                <th className="p-4 font-bold text-slate-600 uppercase text-[10px] tracking-wider border-l border-slate-100">Student Name</th>
                                <th className="p-4 font-bold text-slate-600 uppercase text-[10px] tracking-wider border-l border-slate-100">Total Fee</th>
                                <th className="p-4 font-bold text-slate-600 uppercase text-[10px] tracking-wider border-l border-slate-100">Paid</th>
                                <th className="p-4 font-bold text-slate-600 uppercase text-[10px] tracking-wider border-l border-slate-100">Bus Fee</th>
                                <th className="p-4 font-bold text-slate-600 uppercase text-[10px] tracking-wider border-l border-slate-100">Scholarship</th>
                                <th className="p-4 font-bold text-slate-600 uppercase text-[10px] tracking-wider border-l border-slate-100 hide-on-mobile">Balance</th>
                                <th className="p-4 font-bold text-slate-600 uppercase text-[10px] tracking-wider border-l border-slate-100 hide-on-mobile">Last Payment</th>
                                <th className="p-4 font-bold text-slate-600 uppercase text-[10px] tracking-wider border-l border-slate-100">Status</th>
                                <th className="p-4 font-bold text-slate-600 uppercase text-[10px] tracking-wider text-right border-l border-slate-100">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 mobile-stack">
                            {filteredStudents.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="p-8 text-center text-slate-500 font-medium">
                                        {loading ? "Loading..." : "No records found."}
                                    </td>
                                </tr>
                            ) : (
                                filteredStudents.map(student => {
                                    const total = parseFloat(student.total_fee || 0);
                                    const bus = parseFloat(student.bus_fee || 0);
                                    const paid = parseFloat(student.paid_amount || 0);
                                    const balance = (total + bus) - paid;
                                    const isPaid = paid >= (total + bus) && (total + bus) > 0;

                                    return (
                                        <tr key={student.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="p-4 text-slate-700 font-semibold md:font-medium" data-label="Roll No"><span>{student.roll_no}</span></td>
                                            <td
                                                className={`p-4 font-bold border-l-0 md:border-l border-slate-100 ${canEditFees ? 'text-blue-600 hover:text-blue-700 cursor-pointer' : 'text-slate-700'}`}
                                                onClick={() => canEditFees && handleEditClick(student)}
                                                data-label="Student"
                                            >
                                                <span>{student.name}</span>
                                            </td>
                                            <td className="p-4 text-slate-600 border-l-0 md:border-l border-slate-100" data-label="Total Fee"><span>₹{total.toLocaleString()}</span></td>
                                            <td className="p-4 text-blue-600 font-bold border-l-0 md:border-l border-slate-100" data-label="Bus Fee"><span>₹{bus.toLocaleString()}</span></td>
                                            <td className="p-4 text-emerald-600 font-bold border-l-0 md:border-l border-slate-100" data-label="Paid Amt"><span>₹{paid.toLocaleString()}</span></td>
                                            <td className="p-4 text-indigo-600 font-bold border-l-0 md:border-l border-slate-100 text-xs" data-label="Scholarship"><span>{student.scholarship_type && student.scholarship_type !== 'None' ? (student.scholarship_type === 'Other' ? student.scholarship_details : student.scholarship_type) : '-'}</span></td>
                                            <td className="p-4 text-red-500 font-bold border-l-0 md:border-l border-slate-100 hide-on-mobile" data-label="Balance"><span>₹{balance > 0 ? balance.toLocaleString() : 0}</span></td>
                                            <td className="p-4 text-slate-500 text-xs border-l-0 md:border-l border-slate-100 hide-on-mobile" data-label="Date"><span>{student.payment_date ? new Date(student.payment_date).toLocaleDateString() : '-'}</span></td>
                                            <td className="p-4 border-l-0 md:border-l border-slate-100" data-label="Status">
                                                <span className={`px-2 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider ${isPaid ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-amber-100 text-amber-700 border border-amber-200'
                                                    }`}>
                                                    {isPaid ? 'Completed' : 'Pending'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right border-l-0 md:border-l border-slate-100" data-label="Action">
                                                <span>
                                                    {canEditFees && (
                                                        <button
                                                            onClick={() => handleEditClick(student)}
                                                            className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                                        >
                                                            <Edit2 size={14} />
                                                        </button>
                                                    )}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Modal */}
            {
                editingStudent && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                        <div className="bg-white w-full max-w-md rounded-3xl p-8 relative shadow-2xl animate-in zoom-in duration-200">
                            <button onClick={() => setEditingStudent(null)} className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-50 rounded-full">
                                <X size={20} />
                            </button>

                            <h3 className="text-xl font-bold text-slate-800 mb-1">Update Fees</h3>
                            <p className="text-slate-500 mb-6">For {editingStudent.name} ({editingStudent.roll_no})</p>

                            <form onSubmit={handleSaveFee} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Total Fee Amount</label>
                                    <div className="relative">
                                        <IndianRupee size={16} className="absolute left-3 top-3.5 text-slate-400" />
                                        <input
                                            type="number"
                                            required
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 outline-none transition-all"
                                            value={feeForm.total_fee}
                                            onChange={e => setFeeForm({ ...feeForm, total_fee: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Bus Fee Amount</label>
                                    <div className="relative">
                                        <IndianRupee size={16} className="absolute left-3 top-3.5 text-slate-400" />
                                        <input
                                            type="number"
                                            required
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 outline-none transition-all"
                                            value={feeForm.bus_fee}
                                            onChange={e => setFeeForm({ ...feeForm, bus_fee: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Paid Amount</label>
                                    <div className="relative">
                                        <IndianRupee size={16} className="absolute left-3 top-3.5 text-slate-400" />
                                        <input
                                            type="number"
                                            required
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 outline-none transition-all"
                                            value={feeForm.paid_amount}
                                            onChange={e => setFeeForm({ ...feeForm, paid_amount: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Payment Status</p>
                                        <p className={`text-lg font-extrabold ${((parseFloat(feeForm.total_fee || 0) + parseFloat(feeForm.bus_fee || 0)) - parseFloat(feeForm.paid_amount || 0)) > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                                            {((parseFloat(feeForm.total_fee || 0) + parseFloat(feeForm.bus_fee || 0)) - parseFloat(feeForm.paid_amount || 0)) > 0
                                                ? `Next Payment: ₹${((parseFloat(feeForm.total_fee || 0) + parseFloat(feeForm.bus_fee || 0)) - parseFloat(feeForm.paid_amount || 0)).toLocaleString()}`
                                                : 'Status: Completed'}
                                        </p>
                                    </div>
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${((parseFloat(feeForm.total_fee || 0) + parseFloat(feeForm.bus_fee || 0)) - parseFloat(feeForm.paid_amount || 0)) > 0 ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                        {((parseFloat(feeForm.total_fee || 0) + parseFloat(feeForm.bus_fee || 0)) - parseFloat(feeForm.paid_amount || 0)) > 0 ? <RefreshCw size={20} /> : <Check size={20} />}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Payment Date</label>
                                        <input
                                            type="date"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 outline-none"
                                            value={feeForm.payment_date}
                                            onChange={e => setFeeForm({ ...feeForm, payment_date: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Mode</label>
                                        <select
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 outline-none"
                                            value={feeForm.payment_mode}
                                            onChange={e => setFeeForm({ ...feeForm, payment_mode: e.target.value })}
                                        >
                                            <option>Cash</option>
                                            <option>UPI</option>
                                            <option>Bank Transfer</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Receipt No</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 outline-none transition-all"
                                        placeholder="Optional"
                                        value={feeForm.receipt_no}
                                        onChange={e => setFeeForm({ ...feeForm, receipt_no: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Scholarship Type</label>
                                        <select
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 outline-none"
                                            value={feeForm.scholarship_type}
                                            onChange={e => setFeeForm({ ...feeForm, scholarship_type: e.target.value, scholarship_details: e.target.value === 'Other' ? '' : e.target.value })}
                                        >
                                            <option value="None">None</option>
                                            <option value="7.5">7.5</option>
                                            <option value="First Graduate">First Graduate</option>
                                            <option value="PMMS">PMMS</option>
                                            <option value="BC/MBC">BC/MBC</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        {feeForm.scholarship_type === 'Other' && (
                                            <>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Details manually</label>
                                                <input
                                                    type="text"
                                                    required
                                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 outline-none transition-all"
                                                    placeholder="Enter details..."
                                                    value={feeForm.scholarship_details}
                                                    onChange={e => setFeeForm({ ...feeForm, scholarship_details: e.target.value })}
                                                />
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all">
                                        Save & Update
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div >
                )
            }
        </div >
    );
};

export default Fees;
