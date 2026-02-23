import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bus, User, Phone, Plus, Edit2, Trash2, X, Check, Search, AlertCircle, RefreshCw } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const BusManagement = () => {
    const [buses, setBuses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingBus, setEditingBus] = useState(null);
    const [formData, setFormData] = useState({
        bus_number: '',
        driver_name: '',
        driver_phone: '',
        starting_point: '',
        ending_point: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchBuses();
    }, []);

    const fetchBuses = async () => {
        setLoading(true);
        try {
            // Add timestamp to prevent caching
            const res = await axios.get(`${API_URL}/bus?t=${Date.now()}`);
            console.log('Fetched buses:', res.data);
            setBuses(Array.isArray(res.data) ? res.data : []);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching buses', err);
            setError('Failed to load bus list');
            setLoading(false);
        }
    };

    const handleOpenModal = (bus = null) => {
        if (bus) {
            setEditingBus(bus);
            setFormData({
                bus_number: bus.bus_number,
                driver_name: bus.driver_name,
                driver_phone: bus.driver_phone || '',
                starting_point: bus.starting_point || '',
                ending_point: bus.ending_point || ''
            });
        } else {
            setEditingBus(null);
            setFormData({
                bus_number: '',
                driver_name: '',
                driver_phone: '',
                starting_point: '',
                ending_point: ''
            });
        }
        setIsModalOpen(true);
        setError('');
        setSuccess('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            if (editingBus) {
                await axios.put(`${API_URL}/bus/${editingBus.id}`, formData);
                setSuccess('Bus updated successfully!');
            } else {
                await axios.post(`${API_URL}/bus`, formData);
                setSuccess('New bus added successfully!');
            }

            // Wait a bit and then fetch
            setTimeout(async () => {
                await fetchBuses();
                setIsModalOpen(false);
                setSuccess('');
            }, 1000);
        } catch (err) {
            setError(err.response?.data?.message || 'Network error or server unavailable');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this bus?')) {
            try {
                await axios.delete(`${API_URL}/bus/${id}`);
                fetchBuses();
            } catch (err) {
                console.error('Error deleting bus', err);
                setError('Failed to delete bus');
            }
        }
    };

    const filteredBuses = buses.filter(bus =>
        (bus.bus_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (bus.driver_name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                        <Bus className="text-blue-600 w-8 h-8" />
                        Bus Management
                    </h2>
                    <p className="text-slate-500 font-medium tracking-tight">Add and manage college bus fleet</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={fetchBuses}
                        className="p-3 bg-white border-2 border-slate-100 rounded-2xl text-slate-500 hover:text-blue-600 hover:border-blue-100 transition-all shadow-sm"
                        title="Refresh List"
                    >
                        <RefreshCw size={24} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-blue-500/20 hover:scale-[1.02] transition-all"
                    >
                        <Plus size={20} />
                        Add New Bus
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                    type="text"
                    placeholder="Search by bus number or driver..."
                    className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 transition-all font-medium text-slate-700 shadow-sm shadow-slate-200/20"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Bus Grid */}
            {loading && buses.length === 0 ? (
                <div className="flex justify-center p-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
                    {filteredBuses.map(bus => (
                        <div key={bus.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 group hover:shadow-blue-900/10 transition-all hover:-translate-y-1">
                            <div className="flex justify-between items-start mb-6">
                                <div className="bg-blue-50 p-4 rounded-2xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner">
                                    <Bus size={28} />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleOpenModal(bus)}
                                        className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                    >
                                        <Edit2 size={20} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(bus.id)}
                                        className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>

                            <h3 className="text-2xl font-black text-slate-800 mb-6 tracking-tight">{bus.bus_number}</h3>

                            <div className="space-y-4">
                                <div className="flex items-center gap-4 text-slate-600 bg-slate-50/50 p-3 rounded-2xl border border-slate-100/50">
                                    <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-blue-500">
                                        <User size={18} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Driver</span>
                                        <span className="font-bold text-slate-700 tracking-tight">{bus.driver_name}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 text-slate-600 bg-slate-50/50 p-3 rounded-2xl border border-slate-100/50">
                                    <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-indigo-500">
                                        <Phone size={18} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact</span>
                                        <span className="font-mono text-slate-700 font-bold">{bus.driver_phone || 'Not provided'}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 text-slate-600 bg-slate-50/50 p-3 rounded-2xl border border-slate-100/50">
                                    <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-emerald-500">
                                        <RefreshCw size={18} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Route</span>
                                        <span className="font-bold text-slate-700 tracking-tight text-xs">
                                            {bus.starting_point || 'Start'} → {bus.ending_point || 'End'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {filteredBuses.length === 0 && !loading && (
                        <div className="col-span-full py-12 text-center bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
                            <Bus size={48} className="mx-auto text-slate-200 mb-4" />
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">No matching buses found</p>
                        </div>
                    )}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 relative z-10 shadow-3xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute right-8 top-8 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <X size={28} />
                        </button>

                        <h3 className="text-3xl font-black text-slate-800 mb-2 tracking-tighter">
                            {editingBus ? 'Edit Bus' : 'Add New Bus'}
                        </h3>
                        <p className="text-slate-500 mb-10 font-bold italic text-sm">Update driver and route details</p>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Route / Bus Number</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 transition-all font-black text-slate-800 placeholder:text-slate-300 shadow-inner"
                                    placeholder="e.g. BUS-01 (Kanyakumari)"
                                    value={formData.bus_number}
                                    onChange={(e) => setFormData({ ...formData, bus_number: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Driver Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 transition-all font-black text-slate-800 placeholder:text-slate-300 shadow-inner"
                                    placeholder="Enter full name"
                                    value={formData.driver_name}
                                    onChange={(e) => setFormData({ ...formData, driver_name: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Driver Phone (Optional)</label>
                                <input
                                    type="tel"
                                    className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 transition-all font-black text-slate-800 placeholder:text-slate-300 shadow-inner"
                                    placeholder="e.g. 9876543210"
                                    value={formData.driver_phone}
                                    onChange={(e) => setFormData({ ...formData, driver_phone: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Starting Point</label>
                                    <input
                                        type="text"
                                        className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 transition-all font-black text-slate-800 placeholder:text-slate-300 shadow-inner"
                                        placeholder="Starting point"
                                        value={formData.starting_point}
                                        onChange={(e) => setFormData({ ...formData, starting_point: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Ending Point</label>
                                    <input
                                        type="text"
                                        className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 transition-all font-black text-slate-800 placeholder:text-slate-300 shadow-inner"
                                        placeholder="Ending point"
                                        value={formData.ending_point}
                                        onChange={(e) => setFormData({ ...formData, ending_point: e.target.value })}
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="p-5 bg-red-50 text-red-600 text-sm font-bold rounded-2xl border border-red-100 flex items-center gap-3 animate-in shake duration-300">
                                    <AlertCircle size={20} className="shrink-0" />
                                    {error}
                                </div>
                            )}

                            {success && (
                                <div className="p-5 bg-green-50 text-green-600 text-sm font-bold rounded-2xl border border-green-100 flex items-center gap-3 animate-pulse">
                                    <Check size={20} className="shrink-0" />
                                    {success}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-br from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-black py-5 rounded-2xl shadow-2xl shadow-blue-500/30 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                            >
                                {editingBus ? <Check size={24} /> : <Plus size={24} />}
                                {editingBus ? 'UPDATE BUS' : 'SAVE BUS RECORD'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BusManagement;
