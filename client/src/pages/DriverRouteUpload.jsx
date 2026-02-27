import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { MapPin, Upload, Trash2, FileText, CheckCircle, AlertCircle } from 'lucide-react';

const DriverRouteUpload = () => {
    const { user } = useAuth();
    const [buses, setBuses] = useState([]);
    const [selectedBus, setSelectedBus] = useState('');
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBuses();
    }, []);

    const fetchBuses = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/bus');
            // Filter buses for this driver
            const driverBuses = res.data.filter(b => b.driver_name === user?.username);
            setBuses(driverBuses);
            if (driverBuses.length > 0) {
                setSelectedBus(driverBuses[0].bus_number);
            }
        } catch (err) {
            console.error('Error fetching buses', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) {
            alert("File is too large! Max size is 2MB.");
            return;
        }

        const busToUpdate = buses.find(b => b.bus_number === selectedBus);
        if (!busToUpdate) {
            alert("Please select your bus first.");
            return;
        }

        setUploading(true);
        const reader = new FileReader();
        reader.onloadend = async () => {
            try {
                await axios.put(`/api/bus/${busToUpdate.id}`, {
                    ...busToUpdate,
                    route_pdf: reader.result
                });
                alert("Route Map Uploaded Successfully!");
                fetchBuses(); // Refresh
            } catch (err) {
                console.error("Upload failed", err);
                const errMsg = err.response?.data?.message || err.response?.data?.error || err.message || "Unknown error";
                alert(`Upload failed: ${errMsg}`);
            } finally {
                setUploading(false);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleDelete = async () => {
        const busToUpdate = buses.find(b => b.bus_number === selectedBus);
        if (!busToUpdate) return;

        if (!window.confirm(`Are you sure you want to delete the route map for ${selectedBus}?`)) return;

        try {
            await axios.put(`/api/bus/${busToUpdate.id}`, {
                ...busToUpdate,
                route_pdf: null
            });
            alert("Route Map Deleted Successfully!");
            fetchBuses();
        } catch (err) {
            console.error("Delete failed", err);
            const errMsg = err.response?.data?.message || err.response?.data?.error || err.message || "Unknown error";
            alert(`Delete failed: ${errMsg}`);
        }
    };

    const handleViewRouteMap = () => {
        const bus = buses.find(b => b.bus_number === selectedBus);
        if (bus && bus.route_pdf) {
            const win = window.open();
            win.document.write('<iframe src="' + bus.route_pdf + '" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>');
        } else {
            alert("No route map uploaded yet.");
        }
    };

    const activeBus = buses.find(b => b.bus_number === selectedBus);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="relative overflow-hidden bg-white/40 backdrop-blur-xl border border-white/50 rounded-[2.5rem] p-8 shadow-2xl shadow-blue-900/5">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-xs font-black uppercase tracking-widest border border-blue-100/50 mb-4">
                        <MapPin size={14} className="animate-pulse" />
                        Route Management
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                        Upload <span className="text-blue-600">Route Map</span>
                    </h2>
                    <p className="text-slate-500 mt-2 font-medium">Manage and upload PDF route documents for your assigned buses.</p>
                </div>
            </div>

            {buses.length === 0 ? (
                <div className="bg-amber-50 rounded-3xl p-8 border border-amber-100 flex items-center gap-4">
                    <AlertCircle className="text-amber-500 w-12 h-12" />
                    <div>
                        <h3 className="text-xl font-bold text-amber-900">No Buses Assigned</h3>
                        <p className="text-amber-700">You are not currently assigned to any buses as a driver. Please contact administration.</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Controls Side */}
                    <div className="bg-white/60 backdrop-blur-md border border-slate-200 rounded-[2rem] p-8 shadow-xl shadow-slate-200/40">
                        <h3 className="text-xl font-bold text-slate-800 mb-6">Route Actions</h3>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Select Your Bus</label>
                                <select
                                    value={selectedBus}
                                    onChange={(e) => setSelectedBus(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-semibold outline-none"
                                >
                                    {buses.map(b => (
                                        <option key={b.id} value={b.bus_number}>{b.bus_number} - {b.starting_point || 'Unknown'}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="pt-4 border-t border-slate-100 grid grid-cols-1 gap-4">
                                <div>
                                    <input
                                        type="file"
                                        accept="application/pdf"
                                        id="route-upload-input"
                                        className="hidden"
                                        onChange={handleUpload}
                                    />
                                    <label
                                        htmlFor="route-upload-input"
                                        className={`w-full py-4 px-6 flex items-center justify-center gap-2 rounded-2xl font-bold text-white transition-all shadow-xl shadow-blue-500/20 cursor-pointer ${uploading ? 'bg-slate-400' : 'bg-blue-600 hover:bg-blue-500 hover:-translate-y-1'}`}
                                    >
                                        <Upload size={20} />
                                        {uploading ? 'Uploading PDF...' : 'Upload New Route PDF'}
                                    </label>
                                </div>

                                {activeBus?.route_pdf && (
                                    <>
                                        <button
                                            onClick={handleViewRouteMap}
                                            className="w-full py-4 px-6 flex items-center justify-center gap-2 rounded-2xl font-bold text-white bg-slate-800 hover:bg-slate-700 transition-all shadow-xl hover:-translate-y-1"
                                        >
                                            <FileText size={20} />
                                            View Current PDF
                                        </button>

                                        <button
                                            onClick={handleDelete}
                                            className="w-full py-4 px-6 flex items-center justify-center gap-2 rounded-2xl font-bold text-red-600 bg-red-50 border border-red-100 hover:bg-red-600 hover:text-white transition-all shadow-sm hover:-translate-y-1"
                                        >
                                            <Trash2 size={20} />
                                            Delete Route PDF
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Status Side */}
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden flex flex-col justify-center">
                        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />

                        <div className="relative z-10 text-center space-y-4">
                            {activeBus?.route_pdf ? (
                                <>
                                    <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 ring-4 ring-emerald-500/30">
                                        <CheckCircle className="text-emerald-400 w-10 h-10" />
                                    </div>
                                    <h3 className="text-2xl font-black text-white">Route Active & Uploaded</h3>
                                    <p className="text-slate-400 font-medium">Students can currently view the route map for {selectedBus}.</p>
                                    <p className="text-xs text-slate-500 mt-4 bg-slate-800/50 inline-block px-4 py-2 rounded-full border border-slate-700">PDF Document size is optimized.</p>
                                </>
                            ) : (
                                <>
                                    <div className="w-20 h-20 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-600">
                                        <FileText className="text-slate-400 w-10 h-10" />
                                    </div>
                                    <h3 className="text-2xl font-black text-white">No Route Uploaded</h3>
                                    <p className="text-slate-400 font-medium">Please upload a route PDF for {selectedBus} so students can track boarding points.</p>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DriverRouteUpload;
