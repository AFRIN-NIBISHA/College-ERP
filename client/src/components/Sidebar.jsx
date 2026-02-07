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
            fixed inset-y-0 left-0 z-30 w-72 bg-white/90 backdrop-blur-xl border-r border-slate-200/60 flex flex-col transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none
            lg:relative lg:translate-x-0 
            ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
            <div className="h-20 flex items-center justify-between px-8 border-b border-slate-100/50">
                <div className="flex items-center gap-3">
                    <img src={logo} alt="DMI Logo" className="w-10 h-10 object-contain" />
                    <span className="text-xl font-bold tracking-tight text-slate-800">College<span className="text-blue-600">ERP</span></span>
                </div>
                {/* Close Button Mobile */}
                <button
                    onClick={onClose}
                    className="lg:hidden p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                    <X size={20} />
                </button>
            </div>

            <nav className="flex-1 py-6 px-5 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
                <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Main Menu</p>
                {filteredItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => onClose && onClose()} // Close sidebar on mobile when link clicked
                            className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group font-medium text-sm ${isActive
                                ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-sm border border-blue-100'
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 hover:translate-x-1'
                                }`}
                        >
                            <Icon size={20} className={`transition-colors duration-300 ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                            <span>{item.label}</span>
                            {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500"></div>}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-5 border-t border-slate-100 bg-white/50">
                {/* Notifications Panel */}
                <div className="relative mb-4">
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="w-full flex items-center justify-between px-4 py-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm text-slate-600 text-sm font-medium group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Bell size={18} className={`transition-colors ${unreadCount > 0 ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"}`} />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                                )}
                            </div>
                            <span>Notifications</span>
                        </div>
                        {unreadCount > 0 && (
                            <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md text-xs font-bold">{unreadCount}</span>
                        )}
                    </button>

                    {showNotifications && (
                        <div className="absolute bottom-full left-0 w-full mb-2 bg-white rounded-xl shadow-xl border border-slate-100 max-h-80 overflow-y-auto z-50 animate-in slide-in-from-bottom-2 fade-in duration-200">
                            {/* ... existing notification list ... */}
                            <div className="p-3 border-b border-slate-100 bg-slate-50 rounded-t-xl">
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Recent Updates</h4>
                            </div>
                            {notifications.length === 0 ? (
                                <div className="p-4 text-center text-slate-400 text-xs">No notifications</div>
                            ) : (
                                <div className="divide-y divide-slate-50">
                                    {notifications.map(n => (
                                        <div
                                            key={n.id}
                                            className={`p-3 text-xs hover:bg-slate-50 cursor-pointer transition-colors ${!n.is_read ? 'bg-blue-50/50' : ''}`}
                                            onClick={() => markAsRead(n.id)}
                                        >
                                            <div className="flex justify-between items-start mb-1">
                                                <span className={`font-bold ${!n.is_read ? 'text-blue-700' : 'text-slate-700'}`}>{n.title}</span>
                                                <span className="text-[10px] text-slate-400">{new Date(n.created_at).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-slate-500 leading-relaxed">{n.message}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors hover:shadow-sm"
                    >
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
