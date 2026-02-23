import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Book, Search, Clock, AlertCircle, BookOpen, User,
    Calendar, CreditCard, CheckCircle, Info, Landmark
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const StudentLibrary = () => {
    const { user } = useAuth();
    const [books, setBooks] = useState([]);
    const [myIssues, setMyIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [activeTab, setActiveTab] = useState('find'); // 'find' or 'mine'

    useEffect(() => {
        fetchBooks();
        if (user?.student_id) {
            fetchMyIssues();
        }
    }, [user]);

    const fetchBooks = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`/api/library/books?search=${searchTerm}&category=${categoryFilter}`);
            setBooks(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchMyIssues = async () => {
        try {
            const res = await axios.get(`/api/library/my-issues/${user.student_id}`);
            setMyIssues(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const categories = ['All', 'Computer Science', 'Electronics', 'Mathematics', 'Fiction', 'Novels', 'General', 'Management'];

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Stats / Welcome */}
            <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
                <div className="relative">
                    <h2 className="text-4xl font-black tracking-tighter mb-2">Welcome to the Library</h2>
                    <p className="text-indigo-100 font-bold opacity-80 italic">Explore thousands of books and resources at your fingertips.</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10">
                        <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20">
                            <p className="text-xs font-black uppercase tracking-widest text-indigo-200">Issued</p>
                            <p className="text-3xl font-black">{myIssues.filter(i => i.status === 'Issued').length}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20">
                            <p className="text-xs font-black uppercase tracking-widest text-indigo-200">Due Soon</p>
                            <p className="text-3xl font-black">
                                {myIssues.filter(i => i.status === 'Issued' && new Date(i.due_date) < new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)).length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Tabs */}
            <div className="flex bg-slate-100 p-1.5 rounded-[2rem] w-fit border border-slate-200 shadow-inner">
                <button
                    onClick={() => setActiveTab('find')}
                    className={`flex items-center gap-3 px-8 py-3.5 rounded-[1.5rem] text-sm font-black transition-all ${activeTab === 'find' ? 'bg-white text-blue-600 shadow-md translate-y-[-2px]' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <Search size={18} /> Find Books
                </button>
                <button
                    onClick={() => setActiveTab('mine')}
                    className={`flex items-center gap-3 px-8 py-3.5 rounded-[1.5rem] text-sm font-black transition-all ${activeTab === 'mine' ? 'bg-white text-blue-600 shadow-md translate-y-[-2px]' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <BookOpen size={18} /> My Library
                </button>
            </div>

            {/* View Content */}
            {activeTab === 'find' ? (
                <div className="space-y-6">
                    {/* Search Bar */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                type="text"
                                placeholder="What book are you looking for?"
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); fetchBooks(); }}
                                className="w-full pl-16 pr-8 py-5 bg-white border-2 border-slate-100 rounded-[2.2rem] outline-none focus:border-blue-500 transition-all font-bold text-slate-700 shadow-xl shadow-slate-200/50"
                            />
                        </div>
                        <select
                            className="px-8 py-5 bg-white border-2 border-slate-100 rounded-[2.2rem] outline-none focus:border-blue-500 font-bold text-slate-700 shadow-xl shadow-slate-200/50"
                            value={categoryFilter}
                            onChange={(e) => { setCategoryFilter(e.target.value); fetchBooks(); }}
                        >
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>

                    {/* Books Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {loading && books.length === 0 ? (
                            <div className="col-span-full py-20 text-center text-slate-400 font-bold uppercase tracking-widest animate-pulse">Searching catalog...</div>
                        ) : books.map((book) => (
                            <div key={book.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all group">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-16 h-16 rounded-[1.5rem] bg-slate-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                                        <Book size={32} />
                                    </div>
                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${book.available_copies > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                        {book.available_copies > 0 ? 'Available' : 'Out of Stock'}
                                    </span>
                                </div>
                                <h4 className="text-xl font-black text-slate-800 leading-tight mb-2">{book.title}</h4>
                                <p className="text-sm font-bold text-slate-400 uppercase tracking-tight mb-6">{book.author}</p>

                                <div className="space-y-3 pt-6 border-t border-slate-50">
                                    <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                                        <span>Category:</span>
                                        <span className="text-slate-800">{book.category}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                                        <span>Copies:</span>
                                        <span className="text-slate-800">{book.available_copies} of {book.total_copies}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                                        <span>Shelf:</span>
                                        <span className="text-blue-600">{book.shelf_location || 'Ask Librarian'}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Active Issues */}
                    <div className="space-y-6">
                        <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3 pl-4">
                            <Landmark className="text-blue-600" /> Currently Issued
                        </h3>
                        {myIssues.filter(i => i.status === 'Issued').length === 0 ? (
                            <div className="bg-slate-50 p-12 rounded-[2.5rem] border-2 border-dashed border-slate-200 text-center">
                                <Info className="mx-auto text-slate-300 mb-4" size={48} />
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">No books currently issued</p>
                            </div>
                        ) : myIssues.filter(i => i.status === 'Issued').map((issue) => (
                            <div key={issue.id} className="bg-white p-8 rounded-[2.5rem] border-l-8 border-l-blue-600 shadow-xl relative group">
                                <div className="absolute top-8 right-8 text-slate-100 group-hover:text-blue-50 transition-colors">
                                    <BookOpen size={48} />
                                </div>
                                <div className="relative">
                                    <h4 className="text-xl font-black text-slate-800 mb-1">{issue.title}</h4>
                                    <p className="text-xs font-bold text-slate-400 tracking-wider mb-6">Return by: <span className="text-slate-800">{new Date(issue.due_date).toLocaleDateString()}</span></p>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-slate-50 p-4 rounded-2xl">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                                            <p className="text-sm font-black text-amber-600">PENDING RETURN</p>
                                        </div>
                                        <div className="bg-slate-50 p-4 rounded-2xl">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Fine Accrued</p>
                                            <p className="text-sm font-black text-rose-600">
                                                {new Date() > new Date(issue.due_date) ? `₹${Math.ceil(Math.abs(new Date() - new Date(issue.due_date)) / (1000 * 60 * 60 * 24)) * 5}` : '₹0'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* History */}
                    <div className="space-y-6">
                        <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3 pl-4">
                            <Clock className="text-emerald-600" /> Recent History
                        </h3>
                        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50/50">
                                        <tr>
                                            <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Book History</th>
                                            <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Return Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {myIssues.filter(i => i.status === 'Returned').length === 0 ? (
                                            <tr><td colSpan="2" className="px-8 py-10 text-center text-slate-400 font-bold italic text-sm">No return history yet</td></tr>
                                        ) : myIssues.filter(i => i.status === 'Returned').map((issue) => (
                                            <tr key={issue.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-8 py-5">
                                                    <p className="font-black text-slate-800 text-sm">{issue.title}</p>
                                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Returned: {new Date(issue.return_date).toLocaleDateString()}</p>
                                                </td>
                                                <td className="px-8 py-5 text-right">
                                                    <div className="flex flex-col items-end">
                                                        <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase">COMPLETED</span>
                                                        {issue.fine_amount > 0 && <span className="text-[10px] font-bold text-rose-500 mt-1">Paid ₹{issue.fine_amount} fine</span>}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentLibrary;
