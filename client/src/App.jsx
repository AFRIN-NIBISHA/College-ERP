import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import logo from './assets/dmi_logo.png';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Attendance from './pages/Attendance';
import Faculty from './pages/Faculty';
import FacultyAttendance from './pages/FacultyAttendance';
import Timetable from './pages/Timetable';
import Marks from './pages/Marks';
import Reports from './pages/Reports';
import Fees from './pages/Fees';
import Login from './pages/Login';
import Register from './pages/Register';
import Notices from './pages/Notices';
import Notifications from './pages/Notifications';
import NoDue from './pages/NoDue';
import Subjects from './pages/Subjects';
import Profile from './pages/Profile';
import StudentOD from './pages/StudentOD';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

const PrivateRoute = ({ children }) => {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" />;
    return children;
};

const Layout = ({ children }) => {
    const { user } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen text-slate-800 overflow-hidden font-sans selection:bg-blue-600 selection:text-white bg-[#f8fafc]">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/80 z-30 lg:hidden backdrop-blur-md transition-all duration-500"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden relative w-full bg-[#f8fafc]">
                {/* Top Header - Cinematic Version */}
                <header className="h-24 bg-white/40 backdrop-blur-[50px] border-b border-white/60 flex items-center justify-between px-6 md:px-12 z-20 sticky top-0 transition-all duration-500">
                    <div className="flex items-center gap-6">
                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="lg:hidden w-12 h-12 flex items-center justify-center text-slate-600 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-blue-300 transition-all active:scale-90"
                        >
                            <Menu size={24} />
                        </button>

                        <div className="hidden sm:flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center shadow-xl">
                                <img src={logo} alt="DMI Logo" className="w-10 h-10 object-contain" />
                            </div>
                            <div className="h-10 w-px bg-slate-200 mx-2"></div>
                            <div>
                                <h1 className="text-xl font-black text-slate-900 tracking-tighter leading-none">
                                    DMI Engineering <span className="text-blue-600">College</span>
                                </h1>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1.5">
                                    {user?.role === 'student' ? 'Operational Portal : Student' : `Operational Portal : ${user?.role}`}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-8">
                        {/* Academic Statistics Widget - Desktop */}
                        <div className="hidden xl:flex items-center gap-8 px-8 border-r border-slate-200">
                            <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">System Load</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="w-1/3 h-full bg-blue-500"></div>
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-600">32%</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-5">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-black text-slate-900 tracking-tight capitalize">{user?.username}</p>
                                <div className="flex items-center justify-end gap-1.5 mt-0.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Status: Online</p>
                                </div>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-[2px] shadow-2xl shadow-blue-500/20 active:scale-95 transition-transform cursor-pointer">
                                <div className="w-full h-full rounded-[14px] bg-slate-900 flex items-center justify-center text-white font-black text-sm uppercase border border-white/10">
                                    {user?.username?.substring(0, 2)}
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content with custom scrollbar */}
                <main className="flex-1 overflow-y-auto p-6 md:p-12 scroll-hint flex flex-col">
                    <div className="flex-1 w-full max-w-[1700px] mx-auto">
                        {children}
                    </div>

                    {/* Minimal Footer */}
                    <footer className="mt-20 pt-10 border-t border-slate-200/60 pb-10 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                                <img src={logo} alt="DMI Logo" className="w-5 h-5 object-contain grayscale opacity-50" />
                            </div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">© 2025 DMI Engineering College. All Signals Encrypted.</p>
                        </div>
                        <div className="flex items-center gap-8">
                            <a href="#" className="text-[10px] font-black text-slate-400 hover:text-blue-600 uppercase tracking-widest transition-colors">Security Protocol</a>
                            <a href="#" className="text-[10px] font-black text-slate-400 hover:text-blue-600 uppercase tracking-widest transition-colors">API Status</a>
                            <a href="#" className="text-[10px] font-black text-slate-400 hover:text-blue-600 uppercase tracking-widest transition-colors">Technical Support</a>
                        </div>
                    </footer>
                </main>
            </div>
        </div>
    );
};

function App() {
    return (
        <AuthProvider>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                <Route path="/*" element={
                    <PrivateRoute>
                        <Layout>
                            <Routes>
                                <Route path="/" element={<Dashboard />} />
                                <Route path="/students" element={<Students />} />
                                <Route path="/marks" element={<Marks />} />
                                <Route path="/reports" element={<Reports />} />
                                <Route path="/fees" element={<Fees />} />
                                <Route path="/faculty" element={<Faculty />} />
                                <Route path="/attendance" element={<Attendance />} />
                                <Route path="/attendance/faculty" element={<FacultyAttendance />} />
                                <Route path="/attendance/report" element={<Attendance />} />
                                <Route path="/timetable" element={<Timetable />} />
                                <Route path="/no-due" element={<NoDue />} />
                                <Route path="/notices" element={<Notices />} />
                                <Route path="/notifications" element={<Notifications />} />
                                <Route path="/subjects" element={<Subjects />} />
                                <Route path="/profile" element={<Profile />} />
                                <Route path="/od-requests" element={<StudentOD />} />
                                <Route path="*" element={<div className="text-center mt-20 text-slate-400 font-light text-xl">Page not found</div>} />
                            </Routes>
                        </Layout>
                    </PrivateRoute>
                } />
            </Routes>
        </AuthProvider>
    );
}

export default App;
