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
                    <select value={year} onChange={(e) => setYear(e.target.value)} className="glass-card px-4 py-2 rounded-xl outline-none border border-slate-200">
                        <option value="1">1st Year</option>
                        <option value="2">2nd Year</option>
                        <option value="3">3rd Year</option>
                        <option value="4">4th Year</option>
                    </select>
                    <select value={section} onChange={(e) => setSection(e.target.value)} className="glass-card px-4 py-2 rounded-xl outline-none border border-slate-200">
                        <option value="A">Section A</option>
                        <option value="B">Section B</option>
                    </select>
                </div>
            )}


            <div className="glass-card rounded-2xl overflow-hidden bg-white border border-slate-200">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="p-4 font-semibold text-slate-600">Roll No</th>
                                <th className="p-4 font-semibold text-slate-600">Student Name</th>
                                <th className="p-4 font-semibold text-slate-600">Total Fee</th>
                                <th className="p-4 font-semibold text-slate-600">Paid</th>
                                <th className="p-4 font-semibold text-slate-600">Balance</th>
                                <th className="p-4 font-semibold text-slate-600">Last Payment</th>
                                <th className="p-4 font-semibold text-slate-600">Status</th>
                                <th className="p-4 font-semibold text-slate-600 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredStudents.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="p-8 text-center text-slate-500">
                                        {loading ? "Loading..." : "No students found for this selection."}
                                    </td>
                                </tr>
                            ) : (
                                filteredStudents.map(student => {
                                    const total = parseFloat(student.total_fee || 0);
                                    const paid = parseFloat(student.paid_amount || 0);
                                    const balance = total - paid;

                                    return (
                                        <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="p-4 text-slate-700 font-medium">{student.roll_no}</td>
                                            <td
                                                className={`p-4 font-bold flex items-center gap-2 ${canEditFees ? 'text-blue-600 hover:underline cursor-pointer' : 'text-slate-700'}`}
                                                onClick={() => canEditFees && handleEditClick(student)}
                                            >
                                                {student.name}
                                            </td>
                                            <td className="p-4 text-slate-600">₹{total.toLocaleString()}</td>
                                            <td className="p-4 text-emerald-600 font-medium">₹{paid.toLocaleString()}</td>
                                            <td className="p-4 text-red-500 font-medium">₹{balance > 0 ? balance.toLocaleString() : 0}</td>
                                            <td className="p-4 text-slate-500 text-sm">{student.payment_date ? new Date(student.payment_date).toLocaleDateString() : '-'}</td>
                                            <td className="p-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${paid >= total && total > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                                    }`}>
                                                    {paid >= total && total > 0 ? 'Paid' : 'Pending'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                {canEditFees && (
                                                    <button
                                                        onClick={() => handleEditClick(student)}
                                                        className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
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

                                <div className="pt-2">
                                    <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all">
                                        Save & Update
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default Fees;
