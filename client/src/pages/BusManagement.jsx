import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bus, User, Phone, Plus, Edit2, Trash2, X, Check, Search, AlertCircle } from 'lucide-react';

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
        driver_phone: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchBuses();
    }, []);

    const fetchBuses = async () => {
        try {
            const res = await axios.get(`${API_URL}/bus`);
            setBuses(Array.isArray(res.data) ? res.data : []);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching buses', err);
            setLoading(false);
        }
    };

    const handleOpenModal = (bus = null) => {
        if (bus) {
            setEditingBus(bus);
            setFormData({
                bus_number: bus.bus_number,
                driver_name: bus.driver_name,
                driver_phone: bus.driver_phone || ''
            });
        } else {
            setEditingBus(null);
            setFormData({
                bus_number: '',
                driver_name: '',
                driver_phone: ''
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
            fetchBuses();
            setTimeout(() => {
                setIsModalOpen(false);
                setSuccess('');
            }, 1500);
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
                    <p className="text-slate-500 font-medium">Add, update and manage college bus records</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-blue-500/20 hover:scale-[1.02] transition-all"
                >
                    <Plus size={20} />
                    Add New Bus
                </button>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                    type="text"
                    placeholder="Search by bus number or driver name..."
                    className="w-full pl-12 pr-4 py-3 bg-white border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 transition-all font-medium text-slate-700"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Bus Grid */}
            {loading ? (
                <div className="flex justify-center p-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredBuses.map(bus => (
                        <div key={bus.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 group hover:shadow-blue-950/5 transition-all">
                            <div className="flex justify-between items-start mb-6">
                                <div className="bg-blue-50 p-3 rounded-2xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    <Bus size={24} />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleOpenModal(bus)}
                                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(bus.id)}
                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            <h3 className="text-xl font-black text-slate-800 mb-4">{bus.bus_number}</h3>

                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-slate-600">
                                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                                        <User size={16} />
                                    </div>
                                    <span className="font-bold text-sm tracking-tight">{bus.driver_name}</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-600">
                                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                                        <Phone size={16} />
                                    </div>
                                    <span className="font-mono text-sm">{bus.driver_phone || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 md:p-10 relative z-10 shadow-3xl animate-in zoom-in-95 duration-200">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute right-8 top-8 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <X size={24} />
                        </button>

                        <h3 className="text-2xl font-black text-slate-800 mb-2">
                            {editingBus ? 'Edit Bus' : 'Add New Bus'}
                        </h3>
                        <p className="text-slate-500 mb-8 font-medium italic">Ensure all driver details are accurate</p>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Bus Number / Route</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 transition-all font-bold text-slate-700"
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
                                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 transition-all font-bold text-slate-700"
                                    placeholder="Enter full name"
                                    value={formData.driver_name}
                                    onChange={(e) => setFormData({ ...formData, driver_name: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Driver Phone (Optional)</label>
                                <input
                                    type="tel"
                                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 transition-all font-bold text-slate-700"
                                    placeholder="9876543210"
                                    value={formData.driver_phone}
                                    onChange={(e) => setFormData({ ...formData, driver_phone: e.target.value })}
                                />
                            </div>

                            {error && (
                                <div className="p-4 bg-red-50 text-red-600 text-sm font-bold rounded-2xl border border-red-100 flex items-center gap-2">
                                    <AlertCircle size={16} />
                                    {error}
                                </div>
                            )}

                            {success && (
                                <div className="p-4 bg-green-50 text-green-600 text-sm font-bold rounded-2xl border border-green-100 flex items-center gap-2">
                                    <Check size={16} />
                                    {success}
                                </div>
                            )}

                            <button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                            >
                                {editingBus ? <Check size={20} /> : <Plus size={20} />}
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
