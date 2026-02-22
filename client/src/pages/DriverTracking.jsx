import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Bus, Navigation, StopCircle, Play, CheckCircle2, AlertCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const DriverTracking = () => {
    const [buses, setBuses] = useState([]);
    const [selectedBusId, setSelectedBusId] = useState('');
    const [isTracking, setIsTracking] = useState(false);
    const [currentBus, setCurrentBus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [location, setLocation] = useState(null);
    const watchId = useRef(null);

    useEffect(() => {
        fetchBuses();
    }, []);

    const fetchBuses = async () => {
        try {
            const res = await axios.get(`${API_URL}/bus`);
            setBuses(res.data);
        } catch (err) {
            console.error('Error fetching buses', err);
            setError('Failed to load bus list');
        } finally {
            setLoading(false);
        }
    };

    const startTrip = async () => {
        if (!selectedBusId) {
            setError('Please select your assigned bus');
            return;
        }

        const bus = buses.find(b => b.id === parseInt(selectedBusId));
        if (!bus) return;

        try {
            // Update UI
            setCurrentBus(bus);
            setIsTracking(true);
            setError('');
            startLocationWatch(bus.id);
        } catch (err) {
            setError('Failed to start tracking session.');
            console.error(err);
        }
    };

    const stopTrip = () => {
        if (watchId.current) {
            navigator.geolocation.clearWatch(watchId.current);
        }
        setIsTracking(false);
        setCurrentBus(null);
        setLocation(null);
    };

    const startLocationWatch = (id) => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            return;
        }

        watchId.current = navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setLocation({ latitude, longitude });
                sendLocation(id, latitude, longitude);
            },
            (err) => {
                setError(`Location Access Denied: Please enable GPS/Location in your browser settings.`);
                console.error(err);
            },
            {
                enableHighAccuracy: true,
                maximumAge: 5000,
                timeout: 10000
            }
        );
    };

    const sendLocation = async (id, lat, lng) => {
        try {
            await axios.post(`${API_URL}/bus/location`, {
                bus_id: id,
                latitude: lat,
                longitude: lng
            });
        } catch (err) {
            console.error('Failed to send location to server', err);
        }
    };

    useEffect(() => {
        return () => {
            if (watchId.current) navigator.geolocation.clearWatch(watchId.current);
        };
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    return (
        <div className="max-w-2xl mx-auto p-4">
            <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 transition-all duration-500 hover:shadow-blue-900/10">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-white relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 mb-4">
                            <Bus className="w-10 h-10 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight">Driver Trip Portal</h2>
                        <p className="text-blue-100 text-sm mt-1 font-medium opacity-80 uppercase tracking-widest">DMI Live Tracking</p>
                    </div>
                </div>

                <div className="p-8 md:p-12">
                    {error && (
                        <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-medium flex items-center gap-3 animate-pulse">
                            <AlertCircle size={20} />
                            {error}
                        </div>
                    )}

                    {!isTracking ? (
                        <div className="space-y-8">
                            <div className="space-y-3">
                                <label className="text-sm font-bold text-slate-500 uppercase tracking-wider ml-1">Select Your Bus</label>
                                <div className="grid grid-cols-1 gap-4">
                                    {buses.length === 0 ? (
                                        <div className="text-center py-6 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                                            <p className="text-slate-400">No buses registered in system</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <select
                                                value={selectedBusId}
                                                onChange={(e) => setSelectedBusId(e.target.value)}
                                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all font-bold text-slate-700 appearance-none cursor-pointer"
                                            >
                                                <option value="">-- Choose Bus Number --</option>
                                                {buses.map(bus => (
                                                    <option key={bus.id} value={bus.id}>
                                                        Bus {bus.bus_number} - ({bus.driver_name})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={startTrip}
                                disabled={!selectedBusId}
                                className={`w-full font-bold py-5 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 text-lg ${selectedBusId
                                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:scale-[1.02] shadow-blue-500/25'
                                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                    }`}
                            >
                                <Play size={24} fill="currentColor" />
                                START LIVE SHARING
                            </button>
                        </div>
                    ) : (
                        <div className="text-center space-y-10 py-4">
                            <div className="relative inline-block">
                                <div className="w-32 h-32 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-xl">
                                    <Navigation className="text-green-600 w-16 h-16 animate-pulse" />
                                </div>
                                <div className="absolute top-2 right-2">
                                    <span className="flex h-5 w-5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-5 w-5 bg-green-500 border-2 border-white"></span>
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-3xl font-black text-slate-800 tracking-tight">Active Tracking</h3>
                                <div className="flex items-center justify-center gap-2 text-green-600 font-bold uppercase tracking-widest text-xs">
                                    <CheckCircle2 size={16} />
                                    Live in System
                                </div>
                            </div>

                            <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 space-y-4">
                                <div className="flex justify-between items-center px-2">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Assigned Bus</span>
                                    <span className="text-lg font-black text-blue-700">{currentBus?.bus_number}</span>
                                </div>
                                <div className="h-px bg-slate-200/60 w-full"></div>
                                <div className="flex justify-between items-center px-2">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Current Driver</span>
                                    <span className="font-bold text-slate-700">{currentBus?.driver_name}</span>
                                </div>

                                <div className="mt-6 pt-4 grid grid-cols-2 gap-4">
                                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-tighter mb-1">LATITUDE</p>
                                        <p className="font-mono font-bold text-blue-600">{location?.latitude?.toFixed(6) || 'Connecting...'}</p>
                                    </div>
                                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-tighter mb-1">LONGITUDE</p>
                                        <p className="font-mono font-bold text-blue-600">{location?.longitude?.toFixed(6) || 'Connecting...'}</p>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={stopTrip}
                                className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-5 rounded-2xl shadow-xl shadow-red-500/20 transition-all flex items-center justify-center gap-3 group"
                            >
                                <StopCircle size={24} className="group-hover:scale-110 transition-transform" />
                                END LIVE SESSION
                            </button>
                        </div>
                    )}
                </div>

                <div className="bg-slate-50/50 border-t border-slate-100 p-6 text-center">
                    <p className="text-xs text-slate-400 font-medium">
                        ⚠️ <span className="text-slate-500 font-bold">Important:</span> Keep your mobile screen active and browser open for continuous tracking
                    </p>
                </div>
            </div>
        </div>
    );
};

export default DriverTracking;
