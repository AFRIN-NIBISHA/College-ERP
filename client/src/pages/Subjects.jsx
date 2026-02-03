import React, { useState, useEffect } from 'react';
import { BookOpen, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Subjects = () => {
    const { user } = useAuth();
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSubjects = async () => {
            console.log("Subjects component - user data:", user);
            
            // Always try to fetch subjects with default values if user data is missing
            const studentYear = user?.year || 2;
            const studentSection = user?.section || 'A';
            
            console.log(`Fetching subjects for Year ${studentYear}, Section ${studentSection}`);
            
            try {
                setLoading(true);
                setError(null);
                
                const res = await axios.get(`/api/student/subjects?year=${studentYear}&section=${studentSection}`);
                console.log("Subjects response:", res.data);
                
                if (Array.isArray(res.data)) {
                    setSubjects(res.data);
                } else {
                    console.error("Unexpected response format:", res.data);
                    setError("Invalid response format");
                }
            } catch (err) {
                console.error("Error fetching subjects:", err);
                setError(err.response?.data?.message || err.message || "Failed to fetch subjects");
            } finally {
                setLoading(false);
            }
        };
        
        fetchSubjects();
    }, [user]);

    if (loading) return <div className="p-8 text-center text-slate-500">Loading curriculum...</div>;

    if (error) return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div>
                <h2 className="text-3xl font-bold text-slate-800">My Subjects</h2>
            </div>
            <div className="p-12 text-center bg-white rounded-3xl border border-red-200">
                <AlertCircle className="mx-auto h-12 w-12 text-red-400 mb-4" />
                <h3 className="text-lg font-medium text-slate-900">Error Loading Subjects</h3>
                <p className="text-slate-500">{error}</p>
                <button 
                    onClick={() => window.location.reload()} 
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    Retry
                </button>
            </div>
        </div>
    );

    if (subjects.length === 0) return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div>
                <h2 className="text-3xl font-bold text-slate-800">My Subjects</h2>
            </div>
            <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-300">
                <AlertCircle className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                <h3 className="text-lg font-medium text-slate-900">No Subjects Linked</h3>
                <p className="text-slate-500">Your timetable schedules have not been finalized yet.</p>
            </div>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div>
                <h2 className="text-3xl font-bold text-slate-800">My Subjects</h2>
                <p className="text-slate-500">
                    Year {user?.year || 2} • Section {user?.section || 'A'}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subjects.map((sub, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                                <BookOpen size={24} />
                            </div>
                            <span className="text-xs font-bold px-2 py-1 bg-slate-100 text-slate-600 rounded-lg">{sub.subject_code}</span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-2 leading-tight min-h-[56px]">{sub.subject_name}</h3>
                        <p className="text-sm text-slate-500 mb-4">Credits: {sub.credits || 3}</p>

                        <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs ring-2 ring-white">
                                {sub.staff_name ? sub.staff_name.charAt(0) : '?'}
                            </div>
                            <div>
                                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Faculty</p>
                                <p className="text-sm font-semibold text-slate-700">{sub.staff_name || 'TBA'}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Subjects;
