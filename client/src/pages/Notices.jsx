import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Bell, Trash2, Plus, Calendar, Megaphone } from 'lucide-react';

const Notices = () => {
    const { user } = useAuth();
    const [notices, setNotices] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [formData, setFormData] = useState({ title: '', content: '' });

    // Check if user is staff or admin OR driver
    const canManage = user?.role === 'staff' || user?.role === 'admin' || user?.role === 'driver';

    useEffect(() => {
        fetchNotices();
    }, []);

    const fetchNotices = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get('/api/notices');
            setNotices(res.data);
        } catch (err) {
            console.error("Failed to fetch notices", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this notice?")) return;
        try {
            await axios.delete(`/api/notices/${id}`);
            setNotices(notices.filter(n => n.id !== id));
        } catch (err) {
            console.error("Failed to delete notice", err);
            alert("Failed to delete notice");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('/api/notices', formData);
            setNotices([res.data, ...notices]);
            setShowAddModal(false);
            setFormData({ title: '', content: '' });
        } catch (err) {
            console.error("Failed to add notice", err);
            alert("Failed to add notice");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800">Notices & Announcements</h2>
                    <p className="text-slate-500">Stay updated with the latest college news</p>
                </div>
                {canManage && (
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-blue-500/25"
                    >
                        <Plus size={20} />
                        Post Notice
                    </button>
                )}
            </div>

            <div className="grid gap-6">
                {isLoading ? (
                    <div className="text-center py-10 text-slate-400">Loading notices...</div>
                ) : notices.length === 0 ? (
                    <div className="text-center py-20 bg-slate-50 rounded-3xl border border-slate-100">
                        <Megaphone size={48} className="mx-auto text-slate-300 mb-4" />
                        <h3 className="text-lg font-semibold text-slate-600">No notices posted yet</h3>
                        <p className="text-slate-400">Check back later for updates</p>
                    </div>
                ) : (
                    notices.map((notice) => (
                        <div key={notice.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full border border-blue-100 flex items-center gap-1">
                                            <Calendar size={12} />
                                            {new Date(notice.date_posted).toLocaleDateString()}
                                        </span>
                                        <h3 className="text-xl font-bold text-slate-800">{notice.title}</h3>
                                    </div>
                                    <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{notice.content}</p>
                                </div>
                                {canManage && (
                                    <button
                                        onClick={() => handleDelete(notice.id)}
                                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Delete Notice"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-lg rounded-2xl p-6 relative animate-in fade-in zoom-in duration-200 shadow-2xl">
                        <h3 className="text-xl font-bold text-slate-800 mb-6">Post New Notice</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-500">Title</label>
                                <input
                                    required
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-800 focus:border-blue-500 outline-none"
                                    placeholder="Enter notice title"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-500">Content</label>
                                <textarea
                                    required
                                    rows="5"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-800 focus:border-blue-500 outline-none resize-none"
                                    placeholder="Enter full details..."
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                />
                            </div>
                            <div className="flex gap-3 pt-4 justify-end">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-lg shadow-blue-500/30"
                                >
                                    Post Notice
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Notices;
