import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Search, Filter, Edit2, Check, X, CreditCard, IndianRupee, RefreshCw } from 'lucide-react';

const Fees = () => {
    const { user } = useAuth();
    const canEditFees = ['admin', 'office'].includes(user?.role);
    const isStudent = user?.role === 'student';

    // Default to 1st Year, A Section (Common default) - or maintain user selection
    const [year, setYear] = useState('3');
    const [section, setSection] = useState('A');

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
        status: 'Pending'
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

            // Combine Data
            const combined = studentRes.data.map(student => {
                // Find matching fee record (loose comparison for string/number safety)
                const feeRecord = feesRes.data.find(f => f.student_id == student.id) || {};

                // Merge: Fee details + Student details
                return {
                    ...feeRecord, // Default fee fields
                    ...student,   // Student fields (name, roll_no, etc)
                    id: student.id,
                    name: student.name, // Guarantee Name
                    total_fee: feeRecord.total_fee || '50000', // Ensure default if missing
                    paid_amount: feeRecord.paid_amount || '0',
                    status: feeRecord.status || 'Pending'
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
            status: student.status || 'Pending'
        });
    };

    const handleSaveFee = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                student_id: editingStudent.id,
                ...feeForm,
                status: parseFloat(feeForm.paid_amount) >= parseFloat(feeForm.total_fee) ? 'Paid' : 'Pending'
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
        if (user?.role === 'student') return true;

        const matchYear = student.year.toString() === year.toString();
        const matchSection = student.section === section;
        const matchSearch = searchTerm
            ? (student.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (student.roll_no || '').toLowerCase().includes(searchTerm.toLowerCase())
            : true;

        return matchYear && matchSection && matchSearch;
    });

    return (
        <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-12">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                        Fees <span className="text-blue-600">Management</span>
                    </h2>
                    <p className="text-slate-500 font-medium">Track and settle academic financial records</p>
                </div>

                {user?.role !== 'student' && (
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative flex-1 min-w-[240px]">
                            <Search size={18} className="absolute left-4 top-3.5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by name or roll no..."
                                className="bg-white/80 backdrop-blur-md pl-12 pr-4 py-3 rounded-2xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none w-full transition-all text-sm font-medium shadow-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={fetchFeesData}
                            className="p-3 bg-white border border-slate-200 text-slate-400 rounded-2xl hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm active:scale-95"
                            title="Refresh Records"
                        >
                            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
                        </button>
                    </div>
                )}
            </div>

            {/* Filter Controls (Desktop/Tablet) */}
            {user?.role !== 'student' && (
                <div className="flex flex-wrap items-center justify-between gap-4 p-2 bg-slate-100/50 rounded-[2rem] border border-slate-200/50">
                    <div className="flex items-center gap-2 p-1">
                        {['1', '2', '3', '4'].map(y => (
                            <button
                                key={y}
                                onClick={() => setYear(y)}
                                className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${year === y ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                Year {y}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-2 p-1 mr-1">
                        {['A', 'B', 'C'].map(s => (
                            <button
                                key={s}
                                onClick={() => setSection(s)}
                                className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${section === s ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                Sec {s}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Main Data Table */}
            <div className="glass-card rounded-[2.5rem] overflow-hidden bg-white border border-slate-200/60 shadow-2xl shadow-slate-200/40 table-container">
                <div className="scroll-hint overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[900px]">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="p-6 font-black text-[10px] text-slate-400 uppercase tracking-widest">Student / ID</th>
                                <th className="p-6 font-black text-[10px] text-slate-400 uppercase tracking-widest text-center">Plan</th>
                                <th className="p-6 font-black text-[10px] text-slate-400 uppercase tracking-widest text-center">Paid</th>
                                <th className="p-6 font-black text-[10px] text-slate-400 uppercase tracking-widest text-center hide-on-mobile">Balance</th>
                                <th className="p-6 font-black text-[10px] text-slate-400 uppercase tracking-widest text-center">Status</th>
                                <th className="p-6 font-black text-[10px] text-slate-400 uppercase tracking-widest text-right">Operations</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 mobile-stack">
                            {filteredStudents.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="p-4 bg-slate-50 rounded-full text-slate-200">
                                                <IndianRupee size={40} />
                                            </div>
                                            <p className="text-slate-400 font-bold italic">{loading ? "Synchronizing database..." : "No matching financial records found."}</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredStudents.map(student => {
                                    const total = parseFloat(student.total_fee || 0);
                                    const paid = parseFloat(student.paid_amount || 0);
                                    const balance = total - paid;
                                    const isPaid = paid >= total && total > 0;

                                    return (
                                        <tr key={student.id} className="group hover:bg-slate-50/80 transition-all cursor-default">
                                            <td className="p-6" data-label="Student">
                                                <div className="flex flex-col">
                                                    <span className="font-extrabold text-slate-800 text-sm tracking-tight group-hover:text-blue-600 transition-colors uppercase">{student.name}</span>
                                                    <span className="text-[10px] text-slate-400 font-mono font-bold mt-1 uppercase tracking-tighter">{student.roll_no}</span>
                                                </div>
                                            </td>
                                            <td className="p-6 text-center font-bold text-slate-600 text-sm" data-label="Total Plan">₹{total.toLocaleString()}</td>
                                            <td className="p-6 text-center font-black text-emerald-600 text-sm" data-label="Amount Paid">₹{paid.toLocaleString()}</td>
                                            <td className="p-6 text-center font-bold text-red-500 text-sm hide-on-mobile" data-label="Balance Due">₹{balance > 0 ? balance.toLocaleString() : 0}</td>
                                            <td className="p-6 text-center" data-label="Fee Status">
                                                <div className="flex justify-center">
                                                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${isPaid ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-orange-50 text-orange-600 border-orange-100'
                                                        }`}>
                                                        {isPaid ? 'Cleared' : 'Due'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-6 text-right" data-label="Action">
                                                {canEditFees && (
                                                    <button
                                                        onClick={() => handleEditClick(student)}
                                                        className="p-3 bg-white text-slate-400 border border-slate-100 rounded-2xl hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all shadow-sm active:scale-95"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Update Modal */}
            {editingStudent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-xl rounded-[3rem] p-10 relative shadow-2xl border border-white/20 animate-in zoom-in-95 duration-200">
                        <button onClick={() => setEditingStudent(null)} className="absolute top-6 right-6 p-3 text-slate-300 hover:bg-slate-50 hover:text-slate-600 rounded-2xl transition-all">
                            <X size={24} />
                        </button>

                        <div className="mb-8">
                            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-500/30 mb-4">
                                <CreditCard size={28} />
                            </div>
                            <h3 className="text-2xl font-black text-slate-800 tracking-tight">Record Payment</h3>
                            <p className="text-slate-400 font-medium">Updating billing for <span className="text-blue-600 font-bold">{editingStudent.name}</span></p>
                        </div>

                        <form onSubmit={handleSaveFee} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Annual Fee Goal</label>
                                    <div className="relative">
                                        <IndianRupee size={16} className="absolute left-4 top-4 text-slate-300" />
                                        <input
                                            type="number"
                                            required
                                            className="w-full pl-10 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold text-slate-700"
                                            value={feeForm.total_fee}
                                            onChange={e => setFeeForm({ ...feeForm, total_fee: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Total Paid To Date</label>
                                    <div className="relative">
                                        <IndianRupee size={16} className="absolute left-4 top-4 text-emerald-300" />
                                        <input
                                            type="number"
                                            required
                                            className="w-full pl-10 pr-4 py-4 bg-emerald-50/30 border-none rounded-2xl focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all font-black text-emerald-700"
                                            value={feeForm.paid_amount}
                                            onChange={e => setFeeForm({ ...feeForm, paid_amount: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Payment Date</label>
                                    <input
                                        type="date"
                                        className="w-full px-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none font-bold text-slate-600"
                                        value={feeForm.payment_date}
                                        onChange={e => setFeeForm({ ...feeForm, payment_date: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Transfer Mode</label>
                                    <select
                                        className="w-full px-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none font-bold text-slate-600 appearance-none cursor-pointer"
                                        value={feeForm.payment_mode}
                                        onChange={e => setFeeForm({ ...feeForm, payment_mode: e.target.value })}
                                    >
                                        <option>Cash</option>
                                        <option>UPI / Online</option>
                                        <option>Cheque / DD</option>
                                        <option>Bank Transfer</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Transaction / Receipt Reference</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold text-slate-600 placeholder:text-slate-300"
                                    placeholder="Enter reference number or ID"
                                    value={feeForm.receipt_no}
                                    onChange={e => setFeeForm({ ...feeForm, receipt_no: e.target.value })}
                                />
                            </div>

                            <div className="pt-4">
                                <button type="submit" className="w-full py-5 bg-slate-900 border-none text-white font-black uppercase tracking-[0.2em] rounded-[2rem] shadow-2xl shadow-slate-900/40 hover:bg-blue-600 transition-all active:scale-95">
                                    Commit Record
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Fees;
