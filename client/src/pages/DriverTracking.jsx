import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Bus, Navigation, StopCircle, Play, CheckCircle2, AlertCircle, RefreshCcw } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const DriverTracking = () => {
    const [buses, setBuses] = useState([]);
    const [selectedBusId, setSelectedBusId] = useState('');
    const [manualBusNumber, setManualBusNumber] = useState('');
    const [manualDriverName, setManualDriverName] = useState('');
    const [useManual, setUseManual] = useState(false);

    const [isTracking, setIsTracking] = useState(false);
    const [currentBus, setCurrentBus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [location, setLocation] = useState(null);
    const watchId = useRef(null);
    const wakeLock = useRef(null);

    // Function to request wake lock (keeps screen on)
    const requestWakeLock = async () => {
        if ('wakeLock' in navigator) {
            try {
                wakeLock.current = await navigator.wakeLock.request('screen');
                console.log('Wake Lock active');
            } catch (err) {
                console.error(`${err.name}, ${err.message}`);
            }
        }
    };

    const releaseWakeLock = async () => {
        if (wakeLock.current) {
            await wakeLock.current.release();
            wakeLock.current = null;
            console.log('Wake Lock released');
        }
    };


    useEffect(() => {
        fetchBuses();
    }, []);

    const fetchBuses = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/bus`);
            setBuses(res.data);
            if (res.data.length === 0) setUseManual(true);
        } catch (err) {
            console.error('Error fetching buses', err);
            setUseManual(true);
        } finally {
            setLoading(false);
        }
    };

    const startTrip = async () => {
        setError('');
        let busData = {};

        if (useManual) {
            if (!manualBusNumber || !manualDriverName) {
                setError('Please enter Bus Number and your Name');
                return;
            }
            busData = { bus_number: manualBusNumber, driver_name: manualDriverName };
        } else {
            const selected = buses.find(b => b.id === parseInt(selectedBusId));
            if (!selected) {
                setError('Please select a bus from the list');
                return;
            }
            busData = { bus_number: selected.bus_number, driver_name: selected.driver_name };
        }

        try {
            // 0. Request Wake Lock (Keep screen on)
            await requestWakeLock();

            // 1. Tell server we are starting
            const res = await axios.post(`${API_URL}/bus/start`, busData);
            const bus = res.data;

            // 2. Begin watching location
            setCurrentBus(bus);
            setIsTracking(true);
            startLocationWatch(bus.id);
        } catch (err) {
            setError('Failed to connect to tracking server. Please try again.');
            console.error(err);
        }
    };

    const stopTrip = async () => {
        if (watchId.current) {
            navigator.geolocation.clearWatch(watchId.current);
        }

        // Release Wake Lock
        releaseWakeLock();

        // Notify server to clear location
        if (currentBus) {
            try {
                await axios.delete(`${API_URL}/bus/location/${currentBus.id}`);
            } catch (err) {
                console.error('Failed to clear location on server', err);
            }
        }

        setIsTracking(false);
        setCurrentBus(null);
        setLocation(null);
    };


    const startLocationWatch = (id) => {
        if (!navigator.geolocation) {
            setError('Location services not available on this device');
            return;
        }

        watchId.current = navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setLocation({ latitude, longitude });
                sendLocation(id, latitude, longitude);
            },
            (err) => {
                let msg = 'Location Access Denied. Please enable GPS.';
                if (err.code === 1) msg = 'Please allow location permission in your browser.';
                if (err.code === 3) msg = 'Location request timed out. Retrying...';
                setError(msg);
            },
            { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
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
            console.error('Network Error: Syncing location failed');
        }
    };

    useEffect(() => {
        const handleVisibilityChange = async () => {
            if (wakeLock.current !== null && document.visibilityState === 'visible') {
                await requestWakeLock();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            if (watchId.current) navigator.geolocation.clearWatch(watchId.current);
            releaseWakeLock();
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-slate-400 font-medium animate-pulse">Initializing Portal...</p>
        </div>
    );

    return (
        <div className="max-w-2xl mx-auto p-4 md:pt-10">
            <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 relative">

                {/* Header Section */}
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-10 text-white relative text-center">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-24 -mt-24 blur-3xl"></div>
                    <div className="bg-white/10 backdrop-blur-xl p-5 rounded-3xl border border-white/20 inline-block mb-6 shadow-2xl shadow-blue-900/50">
                        <Bus className="w-12 h-12 text-white" />
                    </div>
                    <h2 className="text-4xl font-black tracking-tight mb-2">Driver Portal</h2>
                    <p className="text-blue-100/80 font-bold uppercase tracking-[0.2em] text-xs">Live Location Sharing System</p>
                </div>

                <div className="p-8 md:p-14 bg-white/50 backdrop-blur-sm">
                    {error && (
                        <div className="mb-8 p-5 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-bold flex items-center gap-4 animate-in slide-in-from-top-4 duration-300">
                            <div className="bg-red-500 text-white p-1 rounded-full"><AlertCircle size={18} /></div>
                            {error}
                        </div>
                    )}

                    {!isTracking ? (
                        <div className="space-y-8 animate-in fade-in duration-500">

                            {/* Toggle Manual/List */}
                            {!loading && buses.length > 0 && (
                                <div className="flex justify-end">
                                    <button
                                        onClick={() => setUseManual(!useManual)}
                                        className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors uppercase tracking-widest flex items-center gap-1"
                                    >
                                        <RefreshCcw size={12} />
                                        {useManual ? 'Choose from list instead' : 'Manual Entry mode'}
                                    </button>
                                </div>
                            )}

                            {useManual ? (
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Bus Number</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. TN 74 AD 1234"
                                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-5 px-6 outline-none focus:border-blue-500 transition-all font-bold text-slate-800 placeholder:text-slate-300"
                                            value={manualBusNumber}
                                            onChange={(e) => setManualBusNumber(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Driver Name</label>
                                        <input
                                            type="text"
                                            placeholder="Your full name"
                                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-5 px-6 outline-none focus:border-blue-500 transition-all font-bold text-slate-800 placeholder:text-slate-300"
                                            value={manualDriverName}
                                            onChange={(e) => setManualDriverName(e.target.value)}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Assigned Route / Bus</label>
                                    <select
                                        value={selectedBusId}
                                        onChange={(e) => setSelectedBusId(e.target.value)}
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-5 px-6 outline-none focus:border-blue-500 transition-all font-bold text-slate-800 appearance-none cursor-pointer"
                                    >
                                        <option value="">-- Click to select your bus --</option>
                                        {buses.map(bus => (
                                            <option key={bus.id} value={bus.id}>
                                                {bus.bus_number} ({bus.driver_name})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <button
                                onClick={startTrip}
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black py-6 rounded-2xl shadow-2xl shadow-blue-500/40 hover:scale-[1.02] hover:shadow-blue-500/50 transition-all flex items-center justify-center gap-4 text-xl"
                            >
                                <Play size={24} fill="currentColor" />
                                START LIVE TRACKING
                            </button>
                        </div>
                    ) : (
                        <div className="text-center space-y-12 py-4 animate-in zoom-in duration-300">
                            <div className="relative inline-block">
                                <div className="w-40 h-40 bg-green-50 rounded-[3rem] flex items-center justify-center mx-auto mb-4 border-8 border-white shadow-2xl relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-green-500/10 animate-ping group-hover:bg-green-500/20 transition-all"></div>
                                    <Navigation className="text-green-600 w-20 h-20 animate-pulse relative z-10" />
                                </div>
                                <div className="absolute -top-2 -right-2">
                                    <div className="bg-green-500 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border-4 border-white shadow-lg">
                                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                        LIVE
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-4xl font-black text-slate-800 tracking-tight">Trip in Progress</h3>
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Students can see your bus on map</p>
                            </div>

                            <div className="bg-slate-50/80 rounded-[2.5rem] p-10 border border-slate-100 shadow-inner space-y-8">
                                <div className="grid grid-cols-2 gap-8 text-left">
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bus Info</span>
                                        <p className="text-lg font-black text-blue-700">{currentBus?.bus_number}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Driver Name</span>
                                        <p className="text-lg font-bold text-slate-800">{currentBus?.driver_name}</p>
                                    </div>
                                </div>
                                <div className="h-px bg-slate-200/50 w-full"></div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group hover:border-blue-200 transition-colors">
                                        <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 -mr-8 -mt-8 rounded-full"></div>
                                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">LAT</p>
                                        <p className="font-mono text-xl font-black text-blue-600 tracking-tighter">
                                            {location?.latitude?.toFixed(6) || '...'}
                                        </p>
                                    </div>
                                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group hover:border-blue-200 transition-colors">
                                        <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 -mr-8 -mt-8 rounded-full"></div>
                                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">LONG</p>
                                        <p className="font-mono text-xl font-black text-blue-600 tracking-tighter">
                                            {location?.longitude?.toFixed(6) || '...'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={stopTrip}
                                className="w-full bg-slate-900 hover:bg-red-600 text-white font-black py-6 rounded-[2rem] shadow-2xl transition-all flex items-center justify-center gap-4 text-lg border-b-4 border-slate-800 hover:border-red-700 group"
                            >
                                <StopCircle size={24} className="group-hover:rotate-90 transition-transform duration-500" />
                                TERMINATE LIVE TRACKING
                            </button>
                        </div>
                    )}
                </div>

                <div className="bg-slate-50/50 border-t border-slate-100 p-8 text-center bg-white/50 backdrop-blur-md">
                    <p className="text-xs text-slate-400 font-bold leading-relaxed max-w-sm mx-auto">
                        <span className="text-blue-500 uppercase tracking-tighter mr-1">Smart Active:</span>
                        System will keep your screen active. For best results, keep this tab open even when the screen is dimmed.
                    </p>

                </div>
            </div>
        </div>
    );
};

export default DriverTracking;
