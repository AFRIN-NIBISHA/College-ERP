import { useEffect, useState } from 'react';
import { Users, GraduationCap, BookOpen, TrendingUp, X, Bell } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <div className="glass-card p-6 rounded-3xl relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
        <div className={`absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500 ${color}`}>
            <Icon size={120} />
        </div>

        <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex justify-between items-start mb-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${color} bg-opacity-10 shadow-sm group-hover:shadow-md transition-shadow`}>
                    <Icon size={26} className={color.replace('bg-', 'text-')} />
                </div>
                {trend && (
                    <span className="flex items-center gap-1 text-xs font-semibold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full border border-emerald-200">
                        <TrendingUp size={12} /> {trend}
                    </span>
                )}
            </div>

            <div>
                <h3 className="text-slate-500 text-sm font-semibold tracking-wide uppercase mb-1">{title}</h3>
                <p className="text-4xl font-extrabold text-slate-800 tracking-tight">{value}</p>
            </div>
        </div>
    </div>
);

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({ students: 0, staff: 0, subjects: 0 });
    const [notices, setNotices] = useState([]);
    const [showNoticeModal, setShowNoticeModal] = useState(false);
    const [noticeForm, setNoticeForm] = useState({ title: '', content: '' });

    const [activities, setActivities] = useState([]);
    const [classInfo, setClassInfo] = useState({});

    useEffect(() => {
        fetchStats();
        fetchNotices();
        fetchActivities();
    }, []);

    useEffect(() => {
        if (user?.role === 'student' && user.year && user.section) {
            fetchClassInfo();
        }
    }, [user]);

    const fetchActivities = async () => {
        try {
            const res = await axios.get(`/api/notifications?userId=${user?.id || ''}&role=${user?.role || ''}`);
            setActivities(res.data.slice(0, 4)); // Show only 4 latest
        } catch (err) {
            console.error("Failed to fetch activities", err);
        }
    };

    const fetchClassInfo = async () => {
        try {
            const res = await axios.get(`/api/class-details?year=${user.year}&section=${user.section}`);
            setClassInfo(res.data);
        } catch (err) {
            console.error("Fetch Class Info Error", err);
        }
    };

    const fetchStats = () => {
        axios.get('/api/stats')
            .then(res => setStats(res.data))
            .catch(err => console.error("Failed to fetch stats", err));
    };

    const fetchNotices = () => {
        axios.get('/api/notices')
            .then(res => setNotices(res.data))
            .catch(err => console.error("Failed to fetch notices", err));
    };

    const handleDownloadReport = () => {
        navigate('/reports');
    };

    const handleCreateNotice = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/notices', noticeForm);
            setShowNoticeModal(false);
            setNoticeForm({ title: '', content: '' });
            fetchNotices(); // Refresh list
        } catch (err) {
            console.error("Failed to create notice", err);
            alert("Error creating notice");
        }
    };

    return (
        <div className="space-y-10">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-4xl font-bold text-slate-800 tracking-tight mb-2">Dashboard Overview</h2>
                    <p className="text-slate-500 font-medium">Welcome back, {user?.role}! Here's what's happening today.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleDownloadReport}
                        className="px-5 py-2.5 bg-white text-slate-600 font-semibold rounded-xl shadow-sm border border-slate-200 hover:bg-slate-50 transition-colors"
                    >
                        Download Report
                    </button>
                    {user?.role !== 'student' && (
                        <button
                            onClick={() => setShowNoticeModal(true)}
                            className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all"
                        >
                            Create Notice
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="md:col-span-2 lg:col-span-4 bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-6 text-white shadow-xl shadow-slate-200/50 flex items-center justify-between overflow-hidden relative">
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
                    <div className="relative z-10">
                        <p className="text-slate-400 font-medium text-sm mb-1 uppercase tracking-wider">Current Academic Session</p>
                        <h3 className="text-3xl font-bold tracking-tight">2025 - 2026</h3>
                        <div className="flex items-center gap-2 mt-4">
                            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                            <span className="text-emerald-400 text-xs font-bold uppercase tracking-wide">Active Semester</span>
                        </div>
                    </div>

                    {/* Only for Student: Show In-Charge Info */}
                    {user?.role === 'student' && classInfo?.in_charge_name && (
                        <div className="relative z-10 hidden sm:block text-right">
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-wide mb-1">Class In-Charge</p>
                            <p className="text-xl font-bold text-white mb-1">{classInfo.in_charge_name}</p>
                            <p className="text-sm text-emerald-300 font-mono tracking-wide">{classInfo.in_charge_phone}</p>
                        </div>
                    )}

                    {/* Default Icon for others */}
                    {user?.role !== 'student' && (
                        <div className="relative z-10 hidden sm:block">
                            <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-sm">
                                <GraduationCap size={40} className="text-blue-200" />
                            </div>
                        </div>
                    )}
                </div>

                <StatCard title="Total Students" value={stats.students || 0} icon={Users} color="bg-blue-500 text-blue-600" trend="+12%" />
                <StatCard title="Faculty" value={stats.staff || 0} icon={GraduationCap} color="bg-violet-500 text-violet-600" trend="+2" />
                <StatCard title="Subjects" value={stats.subjects || 0} icon={BookOpen} color="bg-amber-500 text-amber-600" />
                <StatCard title="Attendance" value="85%" icon={TrendingUp} color="bg-emerald-500 text-emerald-600" trend="+5%" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 glass-card p-8 rounded-3xl">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-bold text-slate-800">Recent Activities</h3>
                        <button
                            onClick={() => navigate('/notifications')}
                            className="text-sm text-blue-600 font-semibold hover:underline"
                        >
                            View All
                        </button>
                    </div>

                    <div className="space-y-6">
                        {activities.length === 0 ? (
                            <div className="text-center py-10 text-slate-400 italic">No recent activities found.</div>
                        ) : (
                            activities.map((activity) => (
                                <div key={activity.id} className="flex items-center gap-5 p-4 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group">
                                    <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                                        <div className={`w-3 h-3 rounded-full ${activity.type === 'marks' ? 'bg-violet-500' : 'bg-blue-500'} shadow-[0_0_10px_rgba(59,130,246,0.5)]`}></div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-base text-slate-800 font-semibold mb-0.5 truncate">{activity.title}</p>
                                        <p className="text-xs text-slate-500 font-medium line-clamp-1">{activity.message}</p>
                                    </div>
                                    <p className="text-xs font-medium text-slate-400 whitespace-nowrap">
                                        {new Date(activity.created_at).toLocaleDateString() === new Date().toLocaleDateString()
                                            ? new Date(activity.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                            : new Date(activity.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="glass-card p-8 rounded-3xl flex flex-col relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>

                    <h3 className="text-xl font-bold text-slate-800 mb-6 relative z-10 flex items-center gap-2">
                        <Bell size={20} className="text-blue-600" />
                        Department Notices
                    </h3>

                    <div className="flex-1 overflow-y-auto pr-2 space-y-4 max-h-[400px] scrollbar-thin scrollbar-thumb-slate-200">
                        {notices.length === 0 ? (
                            <div className="text-center py-10 text-slate-500 italic">No notices posted yet.</div>
                        ) : (
                            notices.map((notice) => (
                                <div key={notice.id} className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-6 relative group hover:shadow-md transition-all">
                                    <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                                    <h4 className="font-bold text-blue-900 mb-2 text-lg line-clamp-1">{notice.title}</h4>
                                    <p className="text-sm text-slate-600 leading-relaxed mb-4 line-clamp-3">
                                        {notice.content}
                                    </p>
                                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                                        {new Date(notice.date_posted).toLocaleDateString()}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Create Notice Modal */}
            {showNoticeModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-lg rounded-3xl p-8 relative animate-in fade-in zoom-in duration-200 shadow-2xl border border-slate-100">
                        <button
                            onClick={() => setShowNoticeModal(false)}
                            className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <h3 className="text-2xl font-bold text-slate-800 mb-2">Create New Notice</h3>
                        <p className="text-slate-500 mb-6">Post an announcement for the CSE Department.</p>

                        <form onSubmit={handleCreateNotice} className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700">Notice Title</label>
                                <input
                                    required
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                                    placeholder="e.g., Internal Exam Schedule"
                                    value={noticeForm.title}
                                    onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700">Content</label>
                                <textarea
                                    required
                                    rows="4"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all resize-none"
                                    placeholder="Type the full notice details here..."
                                    value={noticeForm.content}
                                    onChange={(e) => setNoticeForm({ ...noticeForm, content: e.target.value })}
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowNoticeModal(false)}
                                    className="flex-1 py-3 rounded-xl text-slate-600 font-semibold hover:bg-slate-100 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/30 transition-all"
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

export default Dashboard;
