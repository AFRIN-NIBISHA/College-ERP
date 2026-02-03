import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { User, Mail, Phone, MapPin, Shield, Book, Calendar, Hash } from 'lucide-react';

const Profile = () => {
    const { user } = useAuth();
    const [profileData, setProfileData] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            if (user?.role === 'student' && user?.profileId) {
                try {
                    const res = await axios.get(`/api/students?id=${user.profileId}`);
                    if (res.data && res.data.length > 0) {
                        setProfileData(res.data[0]);
                    }
                } catch (err) {
                    console.error("Failed to fetch profile data", err);
                }
            }
        };
        fetchProfile();
    }, [user]);

    // Use profileData if available (for students), otherwise fallback to user context (for staff/admin)
    const displayData = profileData || user;

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h2 className="text-3xl font-bold text-slate-800">My Profile</h2>
                <p className="text-slate-500">View and manage your personal information</p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
                <div className="px-8 pb-8">
                    <div className="relative flex justify-between items-end -mt-12 mb-6">
                        <div className="p-1 bg-white rounded-full">
                            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center text-4xl border-4 border-white shadow-md">
                                🎓
                            </div>
                        </div>
                        <span className="px-4 py-1.5 bg-blue-50 text-blue-700 text-sm font-bold rounded-full border border-blue-100 uppercase tracking-wider">
                            {user?.role}
                        </span>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900">{displayData?.name || displayData?.username || 'User'}</h1>
                                <p className="text-slate-500 font-medium">
                                    {displayData?.roll_no ? `Roll No: ${displayData.roll_no}` : `ID: ${displayData?.id || 'N/A'}`}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
                            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                                <div className="p-2 bg-white rounded-xl shadow-sm text-slate-600">
                                    <Shield size={20} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase">Role</p>
                                    <p className="font-semibold text-slate-700 capitalize">{user?.role}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                                <div className="p-2 bg-white rounded-xl shadow-sm text-slate-600">
                                    <Mail size={20} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase">Email</p>
                                    <p className="font-semibold text-slate-700">{displayData?.email || 'N/A'}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                                <div className="p-2 bg-white rounded-xl shadow-sm text-slate-600">
                                    <Phone size={20} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase">Phone</p>
                                    <p className="font-semibold text-slate-700">{displayData?.phone || 'N/A'}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                                <div className="p-2 bg-white rounded-xl shadow-sm text-slate-600">
                                    <Book size={20} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase">Department</p>
                                    <p className="font-semibold text-slate-700">{displayData?.department || 'CSE'}</p>
                                </div>
                            </div>

                            {/* Additional Fields for Students */}
                            {user?.role === 'student' && (
                                <>
                                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                                        <div className="p-2 bg-white rounded-xl shadow-sm text-slate-600">
                                            <Calendar size={20} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase">Year</p>
                                            <p className="font-semibold text-slate-700">{displayData?.year ? `${displayData.year}th Year` : 'N/A'}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                                        <div className="p-2 bg-white rounded-xl shadow-sm text-slate-600">
                                            <Hash size={20} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase">Section</p>
                                            <p className="font-semibold text-slate-700">{displayData?.section || 'N/A'}</p>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
