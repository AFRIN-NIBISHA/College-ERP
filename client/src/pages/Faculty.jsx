import { useState, useEffect } from 'react';
import { Search, Plus, Filter, User, Edit, Trash2, ShieldCheck, Mail, Phone } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Faculty = () => {
    const { user } = useAuth();
    const [staffList, setStaffList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingId, setEditingId] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        staff_id: '',
        name: '',
        designation: 'Assistant Professor',
        department: 'CSE',
        email: '',
        phone: ''
    });

    useEffect(() => {
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get('/api/staff');
            setStaffList(res.data);
        } catch (err) {
            console.error("Error fetching staff", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const resetForm = () => {
        setFormData({
            staff_id: '',
            name: '',
            designation: 'Assistant Professor',
            department: 'CSE',
            email: '',
            phone: ''
        });
        setEditingId(null);
        setShowAddModal(false);
    };

    const handleEdit = (staff) => {
        setFormData({
            staff_id: staff.staff_id,
            name: staff.name,
            designation: staff.designation,
            department: staff.department || 'CSE',
            email: staff.email || '',
            phone: staff.phone || ''
        });
        setEditingId(staff.id);
        setShowAddModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this staff member?")) return;
        try {
            await axios.delete(`/api/staff/${id}`);
            setStaffList(staffList.filter(s => s.id !== id));
        } catch (err) {
            console.error("Error deleting staff", err);
            alert("Failed to delete staff");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                // Update
                const res = await axios.put(`/api/staff/${editingId}`, formData);
                setStaffList(staffList.map(s => s.id === editingId ? res.data : s));
            } else {
                // Create
                const res = await axios.post('/api/staff', formData);
                setStaffList([...staffList, res.data]);
            }
            resetForm();
        } catch (err) {
            console.error("Error saving staff", err);
            alert(err.response?.data?.message || "Failed to save staff");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800">Faculty Management</h2>
                    <p className="text-slate-500">Manage teaching and non-teaching staff</p>
                </div>
                <button
                    onClick={() => { resetForm(); setShowAddModal(true); }}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-blue-500/25"
                >
                    <Plus size={20} />
                    Add Faculty
                </button>
            </div>

            {/* List */}
            <div className="glass-card rounded-2xl overflow-hidden bg-white/60 border border-slate-200 shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50/80 border-b border-slate-200">
                            <tr>
                                <th className="p-4 text-left text-slate-500 font-semibold text-sm">Staff Details</th>
                                <th className="p-4 text-left text-slate-500 font-semibold text-sm">Designation</th>
                                <th className="p-4 text-left text-slate-500 font-semibold text-sm">Contact</th>
                                <th className="p-4 text-left text-slate-500 font-semibold text-sm">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                <tr><td colSpan="4" className="p-8 text-center text-slate-500">Loading...</td></tr>
                            ) : staffList.length === 0 ? (
                                <tr><td colSpan="4" className="p-8 text-center text-slate-500">No faculty members found.</td></tr>
                            ) : (
                                staffList.map((staff) => (
                                    <tr key={staff.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                                    {staff.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-800">{staff.name}</p>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded uppercase border border-slate-200">
                                                            {staff.staff_id}
                                                        </span>
                                                        <span className="text-xs text-slate-500">{staff.email}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-100">
                                                {staff.designation}
                                            </span>
                                            <p className="text-xs text-slate-400 mt-1">{staff.department}</p>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2 text-xs text-slate-600">
                                                    <Mail size={12} /> {staff.email || '-'}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-slate-600">
                                                    <Phone size={12} /> {staff.phone || '-'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex gap-2">
                                                <button onClick={() => handleEdit(staff)} className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg">
                                                    <Edit size={16} />
                                                </button>
                                                <button onClick={() => handleDelete(staff.id)} className="p-2 hover:bg-red-50 text-red-600 rounded-lg">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-lg rounded-2xl p-6 relative animate-in fade-in zoom-in duration-200">
                        <h3 className="text-xl font-bold text-slate-800 mb-6">{editingId ? 'Edit Faculty' : 'Add New Faculty'}</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-500">Name</label>
                                    <input required name="name" value={formData.name} onChange={handleInputChange} className="w-full bg-slate-50 border rounded-lg px-4 py-2 text-slate-800" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-500">Staff ID</label>
                                    <input required name="staff_id" value={formData.staff_id} onChange={handleInputChange} className="w-full bg-slate-50 border rounded-lg px-4 py-2 text-slate-800" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-500">Designation</label>
                                    <select name="designation" value={formData.designation} onChange={handleInputChange} className="w-full bg-slate-50 border rounded-lg px-4 py-2 text-slate-800">
                                        <option>Assistant Professor</option>
                                        <option>Associate Professor</option>
                                        <option>Professor</option>
                                        <option>Lab Assistant</option>
                                        <option>HOD</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-500">Department</label>
                                    <input name="department" value={formData.department} onChange={handleInputChange} className="w-full bg-slate-50 border rounded-lg px-4 py-2 text-slate-800" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-500">Email</label>
                                <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full bg-slate-50 border rounded-lg px-4 py-2 text-slate-800" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-500">Phone</label>
                                <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full bg-slate-50 border rounded-lg px-4 py-2 text-slate-800" />
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-slate-100 mt-6 md:justify-end">
                                <button type="button" onClick={resetForm} className="px-4 py-2 rounded-lg text-slate-500 hover:bg-slate-100">Cancel</button>
                                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-500">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Faculty;
