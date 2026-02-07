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
        <div className="space-y-12 animate-fade-in max-w-[1600px] mx-auto pb-16">
            {/* Contextual Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pt-4">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Live Intelligence Feed</span>
                    </div>
                    <h2 className="text-5xl font-black text-slate-800 tracking-tighter">
                        Nexus <span className="text-blue-600">Dashboard</span>
                    </h2>
                    <p className="text-slate-500 font-medium italic">Welcome back, <span className="text-slate-900 font-bold uppercase">{user?.role}</span>. System status is nominal.</p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    {['admin', 'staff', 'hod', 'principal', 'office'].includes(user?.role) && (
                        <button
                            onClick={handleDownloadReport}
                            className="group flex items-center gap-3 px-8 py-4 bg-white border border-slate-200 text-slate-600 font-black text-xs uppercase tracking-widest rounded-[2rem] shadow-xl shadow-slate-200/50 hover:border-blue-300 transition-all active:scale-95"
                        >
                            <TrendingUp size={18} className="text-blue-500 group-hover:scale-125 transition-transform" />
                            Intelligence Reports
                        </button>
                    )}
                    {user?.role !== 'student' && (
                        <button
                            onClick={() => setShowNoticeModal(true)}
                            className="group flex items-center gap-3 px-8 py-4 bg-slate-900 text-white font-black text-xs uppercase tracking-widest rounded-[2rem] shadow-2xl shadow-slate-900/30 hover:bg-blue-600 transition-all active:scale-95"
                        >
                            <Bell size={18} className="text-blue-400 group-hover:animate-bounce" />
                            Broadcast Notice
                        </button>
                    )}
                </div>
            </div>

            {/* Strategic Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {/* Hero Session Card */}
                <div className="md:col-span-2 lg:col-span-4 relative group overflow-hidden rounded-[3rem] bg-slate-900 p-10 text-white shadow-2xl">
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-600/20 to-transparent pointer-events-none"></div>
                    <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>

                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
                        <div className="space-y-6">
                            <div>
                                <span className="inline-block px-4 py-1.5 bg-blue-500/20 border border-blue-500/30 rounded-full text-[10px] font-black uppercase tracking-widest text-blue-400 mb-4">Master Calendar</span>
                                <h3 className="text-5xl font-black tracking-tighter">Academic Year <span className="text-blue-500">2025-26</span></h3>
                            </div>

                            <div className="flex items-center gap-8">
                                <div className="flex items-center gap-4 bg-white/5 border border-white/10 px-6 py-3 rounded-2xl backdrop-blur-md">
                                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                                    <span className="text-emerald-400 text-xs font-black uppercase tracking-widest">Active Semester</span>
                                </div>
                                <div className="hidden sm:block h-10 w-px bg-white/10"></div>
                                <div className="hidden sm:flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400">
                                        <TrendingUp size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Performance</p>
                                        <p className="text-sm font-bold">+14.2% Growth</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {user?.role === 'student' && classInfo?.in_charge_name && (
                            <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-xl md:min-w-[300px] hover:bg-white/10 transition-colors">
                                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-6 border-b border-white/10 pb-4">Commander in Charge</p>
                                <div className="space-y-2">
                                    <p className="text-2xl font-black text-white tracking-tight">{classInfo.in_charge_name}</p>
                                    <div className="flex items-center gap-3 text-slate-400">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                                            <TrendingUp size={14} />
                                        </div>
                                        <p className="text-xs font-mono font-bold">{classInfo.in_charge_phone}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {user?.role !== 'student' && (
                            <div className="hidden lg:flex items-center gap-8">
                                <div className="w-32 h-32 rounded-[2rem] bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-2xl shadow-blue-500/40 transform rotate-6 border-4 border-white/20">
                                    <GraduationCap size={60} className="text-white" />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <StatCard title="Total Cadets" value={stats.students || 0} icon={Users} color="bg-blue-600 text-white" trend="+12.4%" />
                <StatCard title="Elite Faculty" value={stats.staff || 0} icon={GraduationCap} color="bg-violet-600 text-white" trend="+2.1%" />
                <StatCard title="Knowledge Hub" value={stats.subjects || 0} icon={BookOpen} color="bg-amber-600 text-white" />
                <StatCard title="Retention" value="85.4%" icon={TrendingUp} color="bg-emerald-600 text-white" trend="+5.2%" />
            </div>

            {/* Insight Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 glass-card p-10 rounded-[3rem] bg-white border border-slate-200/60 shadow-2xl shadow-slate-200/30">
                    <div className="flex items-center justify-between mb-10 pb-6 border-b border-slate-50">
                        <div>
                            <h3 className="text-2xl font-black text-slate-800 tracking-tight">Signal Flow</h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Real-time Activity Stream</p>
                        </div>
                        <button
                            onClick={() => navigate('/notifications')}
                            className="px-6 py-2 rounded-full bg-slate-50 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all active:scale-95"
                        >
                            Tunnel View
                        </button>
                    </div>

                    <div className="space-y-4">
                        {activities.length === 0 ? (
                            <div className="text-center py-20 text-slate-300 font-bold italic tracking-tight uppercase">Monitoring for activity signals...</div>
                        ) : (
                            activities.map((activity) => (
                                <div key={activity.id} className="group flex items-center gap-6 p-5 rounded-[2rem] border border-transparent hover:border-slate-100 hover:bg-slate-50/50 transition-all duration-300">
                                    <div className="relative w-14 h-14 flex-shrink-0">
                                        <div className="absolute inset-0 bg-blue-600/10 rounded-2xl group-hover:scale-110 transition-transform"></div>
                                        <div className="relative w-full h-full flex items-center justify-center">
                                            <div className={`w-3 h-3 rounded-full ${activity.type === 'marks' ? 'bg-violet-500' : 'bg-blue-500'} shadow-lg`}></div>
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-base text-slate-800 font-black mb-1 truncate tracking-tight">{activity.title}</p>
                                        <p className="text-xs text-slate-400 font-medium line-clamp-1">{activity.message}</p>
                                    </div>
                                    <div className="text-right flex flex-col items-end gap-1">
                                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Timestamp</span>
                                        <p className="text-xs font-bold text-slate-500 whitespace-nowrap bg-white px-3 py-1 rounded-lg border border-slate-100">
                                            {new Date(activity.created_at).toLocaleDateString() === new Date().toLocaleDateString()
                                                ? new Date(activity.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                : new Date(activity.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="glass-card p-10 rounded-[3rem] bg-slate-900 border border-white/10 shadow-2xl relative overflow-hidden text-white flex flex-col">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>

                    <div className="mb-10 relative z-10 flex items-center justify-between">
                        <div>
                            <h3 className="text-2xl font-black text-white tracking-tight">Broadcasting</h3>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Department Circulars</p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-blue-400 border border-white/10">
                            <Bell size={24} />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 space-y-6 max-h-[500px] scroll-hint relative z-10">
                        {notices.length === 0 ? (
                            <div className="text-center py-20 text-slate-600 font-bold italic uppercase tracking-widest">Static detected. No signals found.</div>
                        ) : (
                            notices.map((notice) => (
                                <div key={notice.id} className="relative group p-6 bg-white/5 border border-white/10 rounded-[2rem] hover:bg-white/10 transition-all duration-300">
                                    <div className="absolute top-6 right-6 w-2 h-2 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50"></div>
                                    <h4 className="font-black text-white mb-3 text-lg leading-tight uppercase tracking-tighter group-hover:text-blue-400 transition-colors">{notice.title}</h4>
                                    <p className="text-sm text-slate-400 leading-relaxed mb-6 font-medium line-clamp-4">
                                        {notice.content}
                                    </p>
                                    <div className="flex items-center justify-between border-t border-white/5 pt-4">
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Deployment Date</span>
                                        <span className="text-[10px] font-black text-blue-400 bg-blue-400/10 px-3 py-1 rounded-lg">
                                            {new Date(notice.date_posted).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Global Notice Creation Overlay */}
            {showNoticeModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-xl animate-fade-in">
                    <div className="bg-white w-full max-w-2xl rounded-[3rem] p-12 relative shadow-2xl border border-white/20 animate-in zoom-in-95 duration-300">
                        <button
                            onClick={() => setShowNoticeModal(false)}
                            className="absolute top-8 right-8 p-3 rounded-2xl hover:bg-slate-100 text-slate-300 hover:text-slate-900 transition-all active:scale-95"
                        >
                            <X size={28} />
                        </button>

                        <div className="mb-10">
                            <div className="w-16 h-16 bg-blue-600 rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl shadow-blue-600/20 mb-6 font-black italic">
                                BM
                            </div>
                            <h3 className="text-4xl font-black text-slate-800 tracking-tighter mb-2">New Broadcast Signal</h3>
                            <p className="text-slate-400 font-medium">Coordinate department-wide communication with precision.</p>
                        </div>

                        <form onSubmit={handleCreateNotice} className="space-y-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Signal Protocol (Title)</label>
                                <input
                                    required
                                    className="w-full bg-slate-50 border-none rounded-2xl px-6 py-5 text-slate-800 font-bold focus:ring-4 focus:ring-blue-600/10 transition-all outline-none placeholder:text-slate-300"
                                    placeholder="ENTER SYSTEM SUBJECT..."
                                    value={noticeForm.title}
                                    onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Encrypted Payload (Content)</label>
                                <textarea
                                    required
                                    rows="5"
                                    className="w-full bg-slate-50 border-none rounded-[2rem] px-8 py-6 text-slate-600 font-medium focus:ring-4 focus:ring-blue-600/10 transition-all outline-none resize-none placeholder:text-slate-300"
                                    placeholder="TRANSMIT FULL SIGNAL PARAMETERS HERE..."
                                    value={noticeForm.content}
                                    onChange={(e) => setNoticeForm({ ...noticeForm, content: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowNoticeModal(false)}
                                    className="py-5 bg-slate-100 text-slate-500 font-black text-xs uppercase tracking-[0.3em] rounded-[2rem] hover:bg-slate-200 transition-all active:scale-95"
                                >
                                    Abort
                                </button>
                                <button
                                    type="submit"
                                    className="py-5 bg-slate-900 text-white font-black text-xs uppercase tracking-[0.3em] rounded-[2rem] shadow-2xl shadow-slate-900/40 hover:bg-blue-600 transition-all active:scale-95"
                                >
                                    Transmit
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
