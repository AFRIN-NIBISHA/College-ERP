import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Bus, Navigation, StopCircle, Play } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const DriverTracking = () => {
    const [busNumber, setBusNumber] = useState('');
    const [driverName, setDriverName] = useState('');
    const [isTracking, setIsTracking] = useState(false);
    const [busId, setBusId] = useState(null);
    const [error, setError] = useState('');
    const [location, setLocation] = useState(null);
    const watchId = useRef(null);

    const startTrip = async () => {
        if (!busNumber || !driverName) {
            setError('Please enter Bus Number and Driver Name');
            return;
        }

        try {
            const res = await axios.post(`${API_URL}/bus/start`, { bus_number: busNumber, driver_name: driverName });
            setBusId(res.data.id);
            setIsTracking(true);
            setError('');
            startLocationWatch(res.data.id);
        } catch (err) {
            setError('Failed to start trip. Please try again.');
            console.error(err);
        }
    };

    const stopTrip = () => {
        if (watchId.current) {
            navigator.geolocation.clearWatch(watchId.current);
        }
        setIsTracking(false);
        setBusId(null);
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
                setError(`Location error: ${err.message}`);
                console.error(err);
            },
            {
                enableHighAccuracy: true,
                maximumAge: 10000,
                timeout: 5000
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

    return (
        <div className="max-w-2xl mx-auto p-4">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white text-center">
                    <Bus className="w-12 h-12 mx-auto mb-2 opacity-90" />
                    <h2 className="text-2xl font-bold">Driver Trip Portal</h2>
                    <p className="text-blue-100 text-sm opacity-80 uppercase tracking-widest mt-1">Live Location Sharing</p>
                </div>

                <div className="p-8">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r-lg animate-pulse">
                            {error}
                        </div>
                    )}

                    {!isTracking ? (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 ml-1">Bus Number</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. TN 74 AD 1234"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-slate-700"
                                        value={busNumber}
                                        onChange={(e) => setBusNumber(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 ml-1">Driver Name</label>
                                    <input
                                        type="text"
                                        placeholder="Your Name"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-slate-700"
                                        value={driverName}
                                        onChange={(e) => setDriverName(e.target.value)}
                                    />
                                </div>
                            </div>
                            <button
                                onClick={startTrip}
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 hover:shadow-xl hover:scale-[1.01] transition-all flex items-center justify-center gap-3 lg:text-lg"
                            >
                                <Play size={24} />
                                START TRIP
                            </button>
                        </div>
                    ) : (
                        <div className="text-center space-y-8 py-6">
                            <div className="relative">
                                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                                    <Navigation className="text-green-600 w-12 h-12" />
                                </div>
                                <div className="absolute top-0 right-1/2 translate-x-12">
                                    <span className="flex h-4 w-4">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500"></span>
                                    </span>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-2xl font-bold text-slate-800">Trip Active</h3>
                                <p className="text-slate-500 mt-1">Bus {busNumber} is now live</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="text-center p-3">
                                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">Latitude</p>
                                    <p className="font-mono font-bold text-blue-600">{location?.latitude?.toFixed(6) || '---'}</p>
                                </div>
                                <div className="text-center p-3 border-l border-slate-200">
                                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">Longitude</p>
                                    <p className="font-mono font-bold text-blue-600">{location?.longitude?.toFixed(6) || '---'}</p>
                                </div>
                            </div>

                            <button
                                onClick={stopTrip}
                                className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-red-200 transition-all flex items-center justify-center gap-3"
                            >
                                <StopCircle size={24} />
                                END TRIP
                            </button>
                        </div>
                    )}
                </div>

                <div className="bg-slate-50 border-t border-slate-100 p-4 text-center">
                    <p className="text-xs text-slate-400 italic">
                        Keep this screen open for continuous location sharing
                    </p>
                </div>
            </div>
        </div>
    );
};

export default DriverTracking;
