import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Bell, Calendar, Info, CheckCircle, AlertCircle, Bookmark } from 'lucide-react';

const Notifications = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (user) {
            fetchNotifications();
        }
    }, [user]);

    const fetchNotifications = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(`/api/notifications?userId=${user.id}&role=${user.role}`);
            setNotifications(res.data);
        } catch (err) {
            console.error("Failed to fetch notifications", err);
        } finally {
            setIsLoading(false);
        }
    };

    const getTypeDetails = (type) => {
        switch (type) {
            case 'success':
                return { icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50' };
            case 'warning':
                return { icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-50' };
            case 'error':
                return { icon: Info, color: 'text-red-500', bg: 'bg-red-50' };
            case 'marks':
                return { icon: Bookmark, color: 'text-violet-500', bg: 'bg-violet-50' };
            default:
                return { icon: Info, color: 'text-blue-500', bg: 'bg-blue-50' };
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800">Your Notifications</h2>
                    <p className="text-slate-500">Recent activities and updates related to you</p>
                </div>
                <button
                    onClick={fetchNotifications}
                    className="text-sm text-blue-600 font-semibold hover:underline bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm"
                >
                    Refresh
                </button>
            </div>

            <div className="grid gap-4">
                {isLoading ? (
                    <div className="text-center py-10 text-slate-400">Loading notifications...</div>
                ) : notifications.length === 0 ? (
                    <div className="text-center py-20 bg-slate-50 rounded-3xl border border-slate-100">
                        <Bell size={48} className="mx-auto text-slate-300 mb-4" />
                        <h3 className="text-lg font-semibold text-slate-600">No notifications found</h3>
                        <p className="text-slate-400">You're all caught up!</p>
                    </div>
                ) : (
                    notifications.map((notification) => {
                        const { icon: Icon, color, bg } = getTypeDetails(notification.type);
                        return (
                            <div key={notification.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group flex items-start gap-4">
                                <div className={`p-3 rounded-xl ${bg} ${color} flex-shrink-0 group-hover:scale-110 transition-transform`}>
                                    <Icon size={24} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                                        <h3 className="text-lg font-bold text-slate-800 truncate">{notification.title}</h3>
                                        <span className="text-xs text-slate-400 font-medium flex items-center gap-1 whitespace-nowrap">
                                            <Calendar size={12} />
                                            {new Date(notification.created_at).toLocaleString()}
                                        </span>
                                    </div>
                                    <p className="text-slate-600 leading-relaxed">{notification.message}</p>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default Notifications;
