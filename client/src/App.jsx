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
import BusManagement from './pages/BusManagement';
import Library from './pages/Library';
import StudentLibrary from './pages/StudentLibrary';
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
        <div className="flex h-screen text-slate-800 overflow-hidden font-sans selection:bg-blue-100 selection:text-blue-900 bg-slate-50">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 z-20 lg:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden relative w-full">
                {/* Top Header */}
                <header className="h-16 md:h-20 bg-white/80 backdrop-blur-xl border-b border-white/50 flex items-center justify-between px-4 md:px-8 z-10 sticky top-0 transition-all duration-300">
                    <div className="flex items-center gap-3 md:gap-4">
                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="lg:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <Menu size={24} />
                        </button>

                        <img src={logo} alt="DMI Logo" className="w-10 h-10 md:w-12 md:h-12 object-contain" />
                        <div>
                            <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent tracking-tight leading-tight">
                                <span className="hidden md:inline">DMI Engineering College</span>
                                <span className="md:hidden">DMI College</span>
                            </h1>
                            <p className="text-[10px] md:text-xs text-slate-500 font-medium tracking-wide uppercase">
                                {user?.role === 'student' ? 'STUDENT PORTAL' : `${user?.role} PORTAL`}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 md:gap-6">
                        <div className="flex items-center gap-3 pl-3 md:pl-6 border-l border-slate-200/60">
                            <div className="text-right hidden md:block">
                                <p className="text-sm font-semibold text-slate-700 capitalize">{user?.username}</p>
                                <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
                            </div>
                            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs md:text-sm font-bold shadow-lg shadow-blue-500/20 ring-2 ring-white uppercase">
                                {user?.username?.substring(0, 2)}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-scroll p-4 md:p-8 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
                    {children}
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
                                <Route path="/bus-management" element={<BusManagement />} />
                                <Route path="/library" element={user?.role === 'student' ? <StudentLibrary /> : <Library />} />
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
