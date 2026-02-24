import React, { useState, useEffect } from 'react';
import { BookOpen, AlertCircle, Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Subjects = () => {
    const { user } = useAuth();
    const isAdmin = ['admin', 'staff', 'hod', 'principal', 'office'].includes(user?.role);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [formData, setFormData] = useState({
        subject_code: '',
        subject_name: '',
        semester: '4',
        credits: '3'
    });

    const fetchSubjects = async () => {
        try {
            setLoading(true);
            let url = '/api/subjects';

            // For students, prioritize showing subjects that are in their assigned timetable
            if (user?.role === 'student' && user?.year && user?.section) {
                url += `?year=${user.year}&section=${user.section}`;
            } else if (user?.role === 'student' && user?.year) {
                // Fallback to semester if section is missing
                const currentMonth = new Date().getMonth() + 1;
                const isEvenSemester = currentMonth >= 1 && currentMonth <= 6;
                const studentYear = parseInt(user.year);
                const currentSemester = isEvenSemester ? studentYear * 2 : (studentYear * 2) - 1;
                url += `?semester=${currentSemester}`;
            }

            const res = await axios.get(url);
            setSubjects(res.data);
            setError(null);
        } catch (err) {
            console.error("Error fetching subjects:", err);
            setError("Failed to fetch subjects");
        } finally {
            setLoading(false);
        }
    };



    useEffect(() => {
        fetchSubjects();
    }, []);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await axios.put(`/api/subjects/${editingId}`, formData);
            } else {
                await axios.post('/api/subjects', formData);
            }
            setFormData({ subject_code: '', subject_name: '', semester: '4', credits: '3' });
            setShowAddForm(false);
            setEditingId(null);
            fetchSubjects();
            alert("Subject saved successfully!");
        } catch (err) {
            alert(err.response?.data?.message || "Failed to save subject");
        }
    };

    const handleEdit = (sub) => {
        setEditingId(sub.id);
        setFormData({
            subject_code: sub.subject_code,
            subject_name: sub.subject_name,
            semester: sub.semester.toString(),
            credits: sub.credits.toString()
        });
        setShowAddForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this subject?")) return;
        try {
            await axios.delete(`/api/subjects/${id}`);
            fetchSubjects();
        } catch (err) {
            alert("Failed to delete subject");
        }
    };

    if (loading && subjects.length === 0) return <div className="p-8 text-center text-slate-500">Loading subjects...</div>;

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800">Subject Management</h2>
                    <p className="text-slate-500">
                        {user?.role === 'student'
                            ? `Showing subjects assigned in your Timetable for ${user.year}${user.section}`
                            : 'Add and manage curriculum subjects and codes.'
                        }
                    </p>
                </div>


                {isAdmin && !showAddForm && (
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2"
                    >
                        <Plus size={18} /> Add Subject
                    </button>
                )}
            </div>

            {isAdmin && showAddForm && (
                <div className="bg-white p-8 rounded-3xl border border-blue-100 shadow-xl shadow-blue-500/5 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-slate-800">{editingId ? 'Edit Subject' : 'Add New Subject'}</h3>
                        <button onClick={() => { setShowAddForm(false); setEditingId(null); }} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                            <X size={20} className="text-slate-400" />
                        </button>
                    </div>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-600 ml-1">Subject Code</label>
                            <input
                                name="subject_code"
                                value={formData.subject_code}
                                onChange={handleInputChange}
                                placeholder="e.g. CS3401"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                required
                            />
                        </div>
                        <div className="space-y-2 lg:col-span-2">
                            <label className="text-sm font-semibold text-slate-600 ml-1">Subject Name</label>
                            <input
                                name="subject_name"
                                value={formData.subject_name}
                                onChange={handleInputChange}
                                placeholder="e.g. Algorithms"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-600 ml-1">Semester</label>
                            <select
                                name="semester"
                                value={formData.semester}
                                onChange={handleInputChange}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            >
                                {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                            </select>
                        </div>
                        <div className="lg:col-span-4 flex flex-wrap gap-2 mt-2">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider w-full mb-1">Quick Templates:</span>
                            {[
                                { code: 'SOFT SKILL', name: 'Soft Skill Training', sem: '4', cr: '1' },
                                { code: 'NPTEL', name: 'NPTEL Course', sem: '4', cr: '2' },
                                { code: 'CS3491_LAB', name: 'AIML Laboratory', sem: '4', cr: '2' },
                                { code: 'CS3461', name: 'Operating Systems Laboratory', sem: '4', cr: '2' },
                                { code: 'CS3481', name: 'DBMS Laboratory', sem: '4', cr: '2' }
                            ].map(tpl => (
                                <button
                                    key={tpl.code}
                                    type="button"
                                    onClick={() => setFormData({ subject_code: tpl.code, subject_name: tpl.name, semester: tpl.sem, credits: tpl.cr })}
                                    className="text-[10px] font-bold px-3 py-1 bg-slate-100 hover:bg-blue-100 hover:text-blue-700 text-slate-600 rounded-full transition-all border border-slate-200"
                                >
                                    + {tpl.code}
                                </button>
                            ))}
                        </div>
                        <div className="lg:col-span-4 flex justify-end gap-3 mt-4">
                            <button
                                type="button"
                                onClick={() => { setShowAddForm(false); setEditingId(null); }}
                                className="px-6 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2"
                            >
                                <Save size={18} /> {editingId ? 'Update Subject' : 'Save Subject'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 flex items-center gap-3">
                    <AlertCircle size={20} /> {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subjects.length === 0 ? (
                    <div className="col-span-full p-12 text-center bg-white rounded-3xl border border-dashed border-slate-300">
                        <p className="text-slate-500 font-medium italic">No subjects added yet.</p>
                    </div>
                ) : (
                    subjects.map((sub) => (
                        <div key={sub.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                                    <BookOpen size={24} />
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {isAdmin && (
                                        <>
                                            <button onClick={() => handleEdit(sub)} className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors">
                                                <Edit2 size={16} />
                                            </button>
                                            <button onClick={() => handleDelete(sub.id)} className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="mb-4">
                                {sub.subject_code && sub.subject_code.trim().toLowerCase() !== sub.subject_name.trim().toLowerCase() && (
                                    <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-500 rounded uppercase tracking-wider">{sub.subject_code}</span>
                                )}
                                <h3 className="text-lg font-bold text-slate-800 mt-1 leading-tight min-h-[56px]">{sub.subject_name}</h3>
                            </div>
                            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                <span className="text-xs font-semibold text-slate-400">
                                    Semester {(user?.role === 'student' && (sub.semester === 0 || !sub.semester))
                                        ? ((new Date().getMonth() + 1 >= 1 && new Date().getMonth() + 1 <= 6) ? user.year * 2 : (user.year * 2) - 1)
                                        : sub.semester
                                    }
                                </span>
                                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">{sub.credits || 3} Credits</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Subjects;
