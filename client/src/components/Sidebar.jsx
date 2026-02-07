import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, GraduationCap, FileText, ClipboardCheck, Bell, LogOut, BookOpen, BarChart, IndianRupee, CheckCircle, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import logo from '../assets/dmi_logo.png';

const Sidebar = ({ isOpen, onClose }) => {
    const location = useLocation();
    const { user, logout } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (user?.id) {
            fetchNotifications();
            // Poll for notifications every 30 seconds
            const interval = setInterval(fetchNotifications, 30000);
            return () => clearInterval(interval);
        }
    }, [user]);

    const fetchNotifications = async () => {
        try {
            const res = await axios.get(`/api/notifications?user_id=${user.id}`);
            setNotifications(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const markAsRead = async (id) => {
        try {
            await axios.put(`/api/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        } catch (err) {
            console.error(err);
        }
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Define menus for each role
    const menus = {
        student: [
            { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
            { icon: Users, label: 'My Profile', path: '/profile' },
            { icon: BookOpen, label: 'Subjects', path: '/subjects' }, // Placeholder
            { icon: FileText, label: 'Timetable', path: '/timetable' },
            { icon: ClipboardCheck, label: 'Attendance', path: '/attendance' },
            { icon: BookOpen, label: 'Internal Marks', path: '/marks' },
            { icon: IndianRupee, label: 'Fees', path: '/fees' },
            { icon: CheckCircle, label: 'No Due', path: '/no-due' },
            { icon: FileText, label: 'OD / Leave', path: '/od-requests' },
            { icon: Bell, label: 'Notices', path: '/notices' },
        ],
        staff: [
            { icon: LayoutDashboard, label: 'Dashboard', path: '/' }, // Staff need dashboard too
            { icon: ClipboardCheck, label: 'Attendance', path: '/attendance' },
            { icon: FileText, label: 'Timetable', path: '/timetable' },
            { icon: BookOpen, label: 'Update Marks', path: '/marks' },
            { icon: Users, label: 'Students', path: '/students' },
            { icon: IndianRupee, label: 'Fees', path: '/fees' },
            { icon: CheckCircle, label: 'No Due Inbox', path: '/no-due' },
            { icon: FileText, label: 'OD / Leave', path: '/od-requests' },
            { icon: BarChart, label: 'Reports', path: '/reports' },
            { icon: Bell, label: 'Notices', path: '/notices' },
        ],
        hod: [
            { icon: LayoutDashboard, label: 'HOD Dashboard', path: '/' },
            { icon: GraduationCap, label: 'Staff Mgmt', path: '/faculty' }, // Using /faculty path
            { icon: Users, label: 'Dept Students', path: '/students' },
            { icon: ClipboardCheck, label: 'Monitor Attendance', path: '/attendance/report' }, // Report view
            { icon: CheckCircle, label: 'No Due Requests', path: '/no-due' },
            { icon: FileText, label: 'OD / Leave', path: '/od-requests' },
            { icon: BarChart, label: 'Dept Reports', path: '/reports' },
            { icon: Bell, label: 'Notices', path: '/notices' },
        ],
        principal: [
            { icon: LayoutDashboard, label: 'Principal Dashboard', path: '/' },
            { icon: GraduationCap, label: 'All Staff', path: '/faculty' },
            { icon: Users, label: 'All Students', path: '/students' },
            { icon: CheckCircle, label: 'No Due Approval', path: '/no-due' },
            { icon: FileText, label: 'OD Approvals', path: '/od-requests' },
            { icon: BarChart, label: 'Global Reports', path: '/reports' },
            { icon: Bell, label: 'Notices', path: '/notices' },
        ],
        office: [
            { icon: LayoutDashboard, label: 'Office Dashboard', path: '/' },
            { icon: IndianRupee, label: 'Fees Management', path: '/fees' },
            { icon: CheckCircle, label: 'No Due (Office)', path: '/no-due' },
            { icon: Users, label: 'Student Records', path: '/students' },
            { icon: BarChart, label: 'Reports', path: '/reports' },
        ],
        admin: [
            { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
            { icon: Users, label: 'Students', path: '/students' },
            { icon: CheckCircle, label: 'No Due', path: '/no-due' },
            { icon: FileText, label: 'OD Requests', path: '/od-requests' }
        ]
    };

    const currentRole = user?.role || 'student';
    let filteredItems = menus[currentRole] || menus['staff'];

    // Map admin to principal view for full access
    if (currentRole === 'admin') filteredItems = menus['principal'];

    return (
        <aside className={`
            fixed inset-y-0 left-0 z-40 w-80 bg-slate-900 border-r border-white/10 flex flex-col transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] shadow-[20px_0_40px_rgba(0,0,0,0.1)] lg:shadow-none
            lg:relative lg:translate-x-0 
            ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
            {/* Header / Brand Area */}
            <div className="h-24 flex items-center justify-between px-8 bg-black/10">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center p-1.5 shadow-2xl rotate-3 group-hover:rotate-0 transition-transform">
                        <img src={logo} alt="DMI Logo" className="w-full h-full object-contain" />
                    </div>
                    <div>
                        <span className="text-xl font-black tracking-tighter text-white block leading-none">Nexus<span className="text-blue-500">ERP</span></span>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1 block">DMI Academic OS</span>
                    </div>
                </div>
                {/* Close Button Mobile */}
                <button
                    onClick={onClose}
                    className="lg:hidden p-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-2xl transition-all active:scale-90"
                >
                    <X size={22} />
                </button>
            </div>

            {/* User Profile Hook (Optional, but looks premium) */}
            <div className="mt-8 px-6">
                <div className="p-6 rounded-[2rem] bg-white/5 border border-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/10 rounded-full blur-2xl -mr-12 -mt-12"></div>
                    <div className="relative z-10 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-xl shadow-blue-500/20 ring-2 ring-white/10">
                            {user?.username?.substring(0, 1).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-black text-white truncate tracking-tight">{user?.username}</p>
                            <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">{user?.role}</p>
                        </div>
                    </div>
                </div>
            </div>

            <nav className="flex-1 py-10 px-6 space-y-1.5 overflow-y-auto scroll-hint">
                <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6">Strategic Matrix</p>
                {filteredItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => onClose && onClose()}
                            className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group ${isActive
                                ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20'
                                : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <Icon size={20} className={`transition-all duration-300 ${isActive ? 'scale-110' : 'group-hover:text-blue-400 group-hover:rotate-12'}`} />
                            <span className={`text-[13px] font-black tracking-tight ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}>{item.label}</span>
                            {isActive && (
                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_10px_white]"></div>
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-8 border-t border-white/10 bg-black/5 flex flex-col gap-4">
                {/* Terminal Notifications */}
                <div className="relative">
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300 border ${showNotifications ? 'bg-white/10 border-white/20' : 'bg-transparent border-transparent hover:bg-white/5'}`}
                    >
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <Bell size={18} className={unreadCount > 0 ? "text-blue-400" : "text-slate-500"} />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-slate-900 shadow-[0_0_10px_rgba(59,130,246,0.8)]"></span>
                                )}
                            </div>
                            <span className="text-xs font-black text-slate-300 uppercase tracking-widest">Updates</span>
                        </div>
                        {unreadCount > 0 && (
                            <span className="bg-blue-600 text-white px-2.5 py-1 rounded-lg text-[10px] font-black">{unreadCount}</span>
                        )}
                    </button>

                    {showNotifications && (
                        <div className="absolute bottom-full left-0 w-80 mb-4 bg-slate-800 border border-white/10 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden z-[60] animate-in zoom-in-95 fade-in duration-300">
                            <div className="p-5 bg-slate-900/50 border-b border-white/5 flex items-center justify-between">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Signal Inbox</h4>
                                <span className="text-[9px] font-bold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded uppercase">{unreadCount} New</span>
                            </div>
                            <div className="max-h-64 overflow-y-auto scroll-hint divide-y divide-white/5">
                                {notifications.length === 0 ? (
                                    <div className="p-10 text-center text-slate-500 text-[10px] font-black italic tracking-widest uppercase">No data signals detected</div>
                                ) : (
                                    notifications.map(n => (
                                        <div
                                            key={n.id}
                                            className={`p-5 hover:bg-white/5 cursor-pointer transition-all ${!n.is_read ? 'bg-blue-500/5' : ''}`}
                                            onClick={() => markAsRead(n.id)}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <span className={`text-[11px] font-black tracking-tight ${!n.is_read ? 'text-blue-400' : 'text-slate-300 font-bold'}`}>{n.title}</span>
                                                <span className="text-[9px] font-bold text-slate-600">{new Date(n.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                            </div>
                                            <p className="text-[10px] text-slate-500 leading-relaxed font-medium line-clamp-2 uppercase tracking-tighter">{n.message}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                            <button onClick={() => navigate('/notifications')} className="w-full py-4 text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] bg-black/20 hover:bg-blue-600 hover:text-white transition-all">Expand Viewport</button>
                        </div>
                    )}
                </div>

                <button
                    onClick={handleLogout}
                    className="group w-full flex items-center gap-4 px-6 py-4 text-xs font-black text-rose-400 bg-rose-500/5 hover:bg-rose-500 hover:text-white rounded-2xl transition-all duration-300 uppercase tracking-widest"
                >
                    <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
                    Terminate Session
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
