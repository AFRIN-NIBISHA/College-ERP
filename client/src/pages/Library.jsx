import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Book, Search, Plus, Edit, Trash2, CheckCircle, Clock,
    AlertCircle, Filter, BookOpen, User, Calendar, CreditCard, X, ArrowLeftRight, Upload
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { useAuth } from '../context/AuthContext';

const Library = () => {
    const { user } = useAuth();
    const [books, setBooks] = useState([]);
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('books'); // 'books' or 'issues'
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [showBookModal, setShowBookModal] = useState(false);
    const [showIssueModal, setShowIssueModal] = useState(false);
    const [editingBook, setEditingBook] = useState(null);
    const [selectedBookForIssue, setSelectedBookForIssue] = useState(null);
    const [uploading, setUploading] = useState(false);

    const [bookFormData, setBookFormData] = useState({
        title: '', author: '', isbn: '', category: 'General', total_copies: 1, shelf_location: ''
    });

    const [issueFormData, setIssueFormData] = useState({
        roll_no: '', due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // Default 14 days
    });

    useEffect(() => {
        fetchBooks();
        fetchIssues();
    }, []);

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

    const fetchIssues = async () => {
        try {
            const res = await axios.get('/api/library/issues');
            setIssues(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleBookSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingBook) {
                await axios.put(`/api/library/books/${editingBook.id}`, bookFormData);
            } else {
                await axios.post('/api/library/books', bookFormData);
            }
            setShowBookModal(false);
            setEditingBook(null);
            resetBookForm();
            fetchBooks();
        } catch (err) {
            alert(err.response?.data?.message || 'Error saving book');
        }
    };

    const handleIssueSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/library/issue', {
                book_id: selectedBookForIssue.id,
                roll_no: issueFormData.roll_no,
                due_date: issueFormData.due_date
            });
            setShowIssueModal(false);
            setSelectedBookForIssue(null);
            fetchBooks();
            fetchIssues();
            alert('Book issued successfully!');
        } catch (err) {
            alert(err.response?.data?.message || 'Error issuing book');
        }
    };

    const handleReturn = async (issueId) => {
        if (!window.confirm('Mark this book as returned?')) return;
        try {
            const res = await axios.post(`/api/library/return/${issueId}`);
            alert(`Book returned! Fine: ₹${res.data.fine}`);
            fetchBooks();
            fetchIssues();
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteBook = async (id) => {
        if (!window.confirm('Delete this book?')) return;
        try {
            await axios.delete(`/api/library/books/${id}`);
            fetchBooks();
        } catch (err) {
            console.error(err);
        }
    };

    const resetBookForm = () => {
        setBookFormData({ title: '', author: '', isbn: '', category: 'General', total_copies: 1, shelf_location: '' });
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setUploading(true);
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data);
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const parsedData = XLSX.utils.sheet_to_json(sheet);

            if (parsedData.length === 0) {
                alert("The Excel sheet is empty.");
                setUploading(false);
                return;
            }

            // Map Excel columns to our DB columns
            const formattedBooks = parsedData.map(row => ({
                title: row['Title'] || row['title'] || row['Book Name'] || 'Unknown Title',
                author: row['Author'] || row['author'] || 'Unknown Author',
                isbn: row['ISBN'] || row['isbn'] || null,
                category: row['Category'] || row['category'] || 'General',
                total_copies: parseInt(row['Total Copies'] || row['total_copies'] || row['Copies'] || 1),
                shelf_location: row['Shelf'] || row['shelf_location'] || row['Location'] || ''
            }));

            const res = await axios.post('/api/library/books/bulk', { books: formattedBooks });
            alert(`Upload Complete! Successfully added ${res.data.successCount} books. ${res.data.failCount > 0 ? `(${res.data.failCount} skipped due to duplicates/errors)` : ''}`);
            fetchBooks();
        } catch (err) {
            console.error("Upload error:", err);
            alert("Failed to process Excel file. Please check the format.");
        } finally {
            setUploading(false);
            e.target.value = null; // reset input
        }
    };

    const openEditBook = (book) => {
        setEditingBook(book);
        setBookFormData({
            title: book.title,
            author: book.author,
            isbn: book.isbn,
            category: book.category,
            total_copies: book.total_copies,
            shelf_location: book.shelf_location || ''
        });
        setShowBookModal(true);
    };

    const categories = ['All', 'Computer Science', 'Electronics', 'Mathematics', 'Fiction', 'Novels', 'General', 'Management'];

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header section with Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
                    <div className="relative">
                        <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 mb-4">
                            <Book size={24} />
                        </div>
                        <h4 className="text-4xl font-black text-slate-800 tracking-tighter">{books.length}</h4>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">Total Books</p>
                    </div>
                </div>
                <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50/50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
                    <div className="relative">
                        <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 mb-4">
                            <Clock size={24} />
                        </div>
                        <h4 className="text-4xl font-black text-slate-800 tracking-tighter">
                            {issues.filter(i => i.status === 'Issued').length}
                        </h4>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">Active Issues</p>
                    </div>
                </div>
                <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50/50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
                    <div className="relative">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 mb-4">
                            <CheckCircle size={24} />
                        </div>
                        <h4 className="text-4xl font-black text-slate-800 tracking-tighter">
                            {issues.filter(i => i.status === 'Returned').length}
                        </h4>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">Total Returns</p>
                    </div>
                </div>
            </div>

            {/* Tabs & Controls */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-50/30">
                    <div className="flex bg-slate-100 p-1 rounded-2xl w-fit">
                        <button
                            onClick={() => setActiveTab('books')}
                            className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all ${activeTab === 'books' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Books Inventory
                        </button>
                        <button
                            onClick={() => setActiveTab('issues')}
                            className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all ${activeTab === 'issues' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Issue Records
                        </button>
                    </div>

                    <div className="flex items-center gap-4 flex-wrap">
                        {activeTab === 'books' && (
                            <>
                                <div className="relative min-w-[240px]">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Search by title, author, ISBN..."
                                        value={searchTerm}
                                        onChange={(e) => { setSearchTerm(e.target.value); fetchBooks(); }}
                                        className="w-full pl-12 pr-6 py-3.5 bg-white border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 transition-all font-bold text-sm shadow-inner"
                                    />
                                </div>
                                <select
                                    className="px-6 py-3.5 bg-white border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 font-bold text-sm shadow-inner"
                                    value={categoryFilter}
                                    onChange={(e) => { setCategoryFilter(e.target.value); fetchBooks(); }}
                                >
                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                <button
                                    onClick={() => { resetBookForm(); setEditingBook(null); setShowBookModal(true); }}
                                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3.5 rounded-2xl font-black text-sm shadow-lg shadow-blue-200 transition-all hover:-translate-y-0.5"
                                >
                                    <Plus size={20} />
                                    <span>Add Book</span>
                                </button>

                                <div className="relative">
                                    <input
                                        type="file"
                                        accept=".xlsx, .xls, .csv"
                                        onChange={handleFileUpload}
                                        disabled={uploading}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                        title="Upload Excel File"
                                    />
                                    <button
                                        disabled={uploading}
                                        className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl font-black text-sm shadow-lg transition-all ${uploading ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200 hover:-translate-y-0.5'}`}
                                    >
                                        <Upload size={20} />
                                        <span>{uploading ? 'Uploading...' : 'Excel Upload'}</span>
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="p-0 overflow-x-auto">
                    {activeTab === 'books' ? (
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50">
                                <tr>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Book Details</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">ISBN / Category</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Availability</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {books.map((book) => (
                                    <tr key={book.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">
                                                    <BookOpen size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-800">{book.title}</p>
                                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-tight">{book.author}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="text-sm font-bold text-slate-700">{book.isbn || 'N/A'}</p>
                                            <span className="text-[10px] font-black text-blue-500 bg-blue-50 px-2 py-0.5 rounded-md uppercase tracking-wider">{book.category}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className={`text-sm font-black ${book.available_copies > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                    {book.available_copies} / {book.total_copies}
                                                </span>
                                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Available</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => { setSelectedBookForIssue(book); setShowIssueModal(true); }}
                                                    disabled={book.available_copies <= 0}
                                                    className="px-4 py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-xl text-xs font-black transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <ArrowLeftRight size={14} /> Issue
                                                </button>
                                                <button onClick={() => openEditBook(book)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"><Edit size={18} /></button>
                                                <button onClick={() => handleDeleteBook(book.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 size={18} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50">
                                <tr>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student / Book</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Issue / Due Date</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status / Fine</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {issues.map((issue) => (
                                    <tr key={issue.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <p className="font-black text-slate-800">{issue.student_name}</p>
                                                <p className="text-xs text-slate-500 font-bold uppercase">{issue.roll_no} • {issue.title}</p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4 text-xs font-bold text-slate-600">
                                                <div>
                                                    <p className="text-[10px] text-slate-400 uppercase">Issued</p>
                                                    <p>{new Date(issue.issue_date).toLocaleDateString()}</p>
                                                </div>
                                                <div className="h-8 w-px bg-slate-100"></div>
                                                <div>
                                                    <p className="text-[10px] text-slate-400 uppercase">Due</p>
                                                    <p className={issue.status === 'Issued' && new Date() > new Date(issue.due_date) ? 'text-rose-500' : ''}>
                                                        {new Date(issue.due_date).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className={`w-fit px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${issue.status === 'Returned' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                                    {issue.status}
                                                </span>
                                                {issue.fine_amount > 0 && (
                                                    <span className="text-xs font-bold text-rose-500 mt-1">Fine: ₹{issue.fine_amount}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            {issue.status === 'Issued' && (
                                                <button
                                                    onClick={() => handleReturn(issue.id)}
                                                    className="px-6 py-2 bg-blue-600 text-white rounded-xl text-xs font-black hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                                                >
                                                    Return Book
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Book Modal */}
            {showBookModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowBookModal(false)}></div>
                    <div className="bg-white w-full max-w-lg rounded-[2rem] p-6 md:p-8 relative z-10 shadow-3xl animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[95vh] scrollbar-thin scrollbar-thumb-slate-200">
                        <button onClick={() => setShowBookModal(false)} className="absolute right-6 top-6 text-slate-400 hover:text-slate-600 transition-colors"><X size={24} /></button>
                        <h3 className="text-2xl font-black text-slate-800 mb-1 tracking-tighter">{editingBook ? 'Edit Book' : 'Add New Book'}</h3>
                        <p className="text-slate-500 mb-6 font-bold italic text-xs">Fill in the book details for library catalog.</p>

                        <form onSubmit={handleBookSubmit} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Book Title</label>
                                <input required value={bookFormData.title} onChange={(e) => setBookFormData({ ...bookFormData, title: e.target.value })} className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:border-blue-500 transition-all font-bold text-slate-800 shadow-inner text-sm" placeholder="Enter book title" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Author</label>
                                    <input required value={bookFormData.author} onChange={(e) => setBookFormData({ ...bookFormData, author: e.target.value })} className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:border-blue-500 transition-all font-bold text-slate-800 shadow-inner text-sm" placeholder="Author name" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ISBN</label>
                                    <input value={bookFormData.isbn} onChange={(e) => setBookFormData({ ...bookFormData, isbn: e.target.value })} className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:border-blue-500 transition-all font-bold text-slate-800 shadow-inner text-sm" placeholder="Book ISBN" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                                    <select value={bookFormData.category} onChange={(e) => setBookFormData({ ...bookFormData, category: e.target.value })} className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:border-blue-500 transition-all font-bold text-slate-800 shadow-inner text-sm">
                                        {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Total Copies</label>
                                    <input type="number" min="1" required value={bookFormData.total_copies} onChange={(e) => setBookFormData({ ...bookFormData, total_copies: parseInt(e.target.value) })} className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:border-blue-500 transition-all font-bold text-slate-800 shadow-inner text-sm" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Shelf Location</label>
                                <input value={bookFormData.shelf_location} onChange={(e) => setBookFormData({ ...bookFormData, shelf_location: e.target.value })} className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:border-blue-500 transition-all font-bold text-slate-800 shadow-inner text-sm" placeholder="e.g. S-102, Rack-A" />
                            </div>
                            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-black text-md shadow-xl shadow-blue-200 transition-all active:scale-95 mt-2">
                                {editingBook ? 'Update Catalog' : 'Add to Catalog'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Issue Modal */}
            {showIssueModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowIssueModal(false)}></div>
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 relative z-10 shadow-3xl animate-in zoom-in-95 duration-200">
                        <button onClick={() => setShowIssueModal(false)} className="absolute right-8 top-8 text-slate-400 hover:text-slate-600 transition-colors"><X size={28} /></button>
                        <h3 className="text-3xl font-black text-slate-800 mb-2 tracking-tighter">Issue Book</h3>
                        <p className="text-slate-500 mb-8 font-bold italic text-sm">Assigning: <span className="text-blue-600">"{selectedBookForIssue?.title}"</span></p>

                        <form onSubmit={handleIssueSubmit} className="space-y-6">
                            <div className="space-y-1">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Student Roll Number</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input required value={issueFormData.roll_no} onChange={(e) => setIssueFormData({ ...issueFormData, roll_no: e.target.value })} className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 transition-all font-bold text-slate-800 shadow-inner" placeholder="Enter Roll Number" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Due Date</label>
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input type="date" required value={issueFormData.due_date} onChange={(e) => setIssueFormData({ ...issueFormData, due_date: e.target.value })} className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 transition-all font-bold text-slate-800 shadow-inner" />
                                </div>
                            </div>
                            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-emerald-200 transition-all active:scale-95 mt-4 flex items-center justify-center gap-3">
                                <CheckCircle size={24} /> Confirm Issue
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Library;
