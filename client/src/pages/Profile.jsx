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

    const getYearDisplay = (year) => {
        if (!year) return 'N/A';
        const suffixes = { 1: 'st', 2: 'nd', 3: 'rd' };
        return `${year}${suffixes[year] || 'th'} Year`;
    };

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

                    <div className="space-y-8">
                        <div>
                            <div>
                                <h1 className="text-3xl font-extrabold text-slate-900 leading-tight">{displayData?.name || displayData?.username || 'User'}</h1>
                                <p className="text-slate-500 font-medium flex items-center gap-2">
                                    <Hash size={16} />
                                    {displayData?.roll_no ? `Roll Number: ${displayData.roll_no}` : `ID: ${displayData?.id || 'N/A'}`}
                                </p>
                            </div>
                        </div>

                        {/* Basic Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="p-2 bg-white rounded-xl shadow-sm text-blue-600">
                                    <Mail size={20} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email Address</p>
                                    <p className="font-semibold text-slate-700">{displayData?.email || 'N/A'}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="p-2 bg-white rounded-xl shadow-sm text-emerald-600">
                                    <Phone size={20} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phone Number</p>
                                    <p className="font-semibold text-slate-700">{displayData?.phone || 'N/A'}</p>
                                </div>
                            </div>

                            {user?.role === 'student' && (
                                <>
                                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <div className="p-2 bg-white rounded-xl shadow-sm text-orange-600">
                                            <Calendar size={20} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date of Birth</p>
                                            <p className="font-semibold text-slate-700">{displayData?.dob ? new Date(displayData.dob).toLocaleDateString() : 'N/A'}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <div className="p-2 bg-white rounded-xl shadow-sm text-rose-600">
                                            <User size={20} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Blood Group</p>
                                            <p className="font-semibold text-slate-700">{displayData?.blood_group || 'N/A'}</p>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Student Specific Sections */}
                        {user?.role === 'student' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                {/* Academic Column */}
                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-1">Academic Status</h4>
                                    <div className="space-y-3 bg-slate-50/50 p-4 rounded-3xl border border-slate-100">
                                        <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                            <span className="text-sm text-slate-500">Year</span>
                                            <span className="font-bold text-slate-800 bg-white px-3 py-1 rounded-full shadow-sm border border-slate-100">{getYearDisplay(displayData?.year)}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                            <span className="text-sm text-slate-500">Section</span>
                                            <span className="font-bold text-slate-800 bg-white px-3 py-1 rounded-full shadow-sm border border-slate-100">{displayData?.section || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2">
                                            <span className="text-sm text-slate-500">Department</span>
                                            <span className="font-bold text-slate-800 bg-white px-3 py-1 rounded-full shadow-sm border border-slate-100">CSE</span>
                                        </div>
                                    </div>

                                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-1 mt-6">Family Details</h4>
                                    <div className="space-y-3 bg-slate-50/50 p-4 rounded-3xl border border-slate-100">
                                        <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                            <span className="text-sm text-slate-500">Father's Name</span>
                                            <span className="font-bold text-slate-800">{displayData?.father_name || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2">
                                            <span className="text-sm text-slate-500">Mother's Name</span>
                                            <span className="font-bold text-slate-800">{displayData?.mother_name || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Community Column */}
                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-1">Identity & Community</h4>
                                    <div className="space-y-3 bg-slate-50/50 p-4 rounded-3xl border border-slate-100">
                                        <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                            <span className="text-sm text-slate-500">Religion</span>
                                            <span className="font-bold text-slate-700">{displayData?.religion || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                            <span className="text-sm text-slate-500">Caste</span>
                                            <span className="font-bold text-slate-700">{displayData?.caste || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2">
                                            <span className="text-sm text-slate-500">Nationality</span>
                                            <span className="font-bold text-slate-700">{displayData?.nationality || 'N/A'}</span>
                                        </div>
                                    </div>

                                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-1 mt-6">National Identification</h4>
                                    <div className="space-y-3 bg-slate-50/50 p-4 rounded-3xl border border-slate-100">
                                        <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                            <span className="text-sm text-slate-500">Aadhaar No.</span>
                                            <span className="font-bold text-slate-700">{displayData?.aadhaar_no || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                            <span className="text-sm text-slate-500">EMIS No.</span>
                                            <span className="font-bold text-slate-700">{displayData?.emis_no || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2">
                                            <span className="text-sm text-slate-500">UMIS No.</span>
                                            <span className="font-bold text-slate-700">{displayData?.umis_no || 'N/A'}</span>
                                        </div>
                                    </div>

                                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-1 mt-6">Contact Address</h4>
                                    <div className="p-4 bg-slate-50/50 rounded-3xl border border-slate-100 min-h-[100px]">
                                        <p className="text-slate-600 text-sm leading-relaxed italic">
                                            {displayData?.address || 'No address provided.'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
