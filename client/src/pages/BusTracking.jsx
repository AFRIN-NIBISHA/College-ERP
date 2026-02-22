import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Bus, User, MapPin, RefreshCcw } from 'lucide-react';

// Fix Leaflet icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom Bus Icon
const busIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/3448/3448339.png',
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -38],
});

const API_URL = import.meta.env.VITE_API_URL || '/api';

// Component to recenter map
const RecenterMap = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        if (center) map.setView(center);
    }, [center]);
    return null;
};

const BusTracking = () => {
    const [buses, setBuses] = useState([]);
    const [selectedBus, setSelectedBus] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchBusLocations = async () => {
        try {
            const res = await axios.get(`${API_URL}/bus/locations`);
            const activeBuses = res.data.filter(b => b.latitude && b.longitude);
            setBuses(activeBuses);
            setLoading(false);

            // If already selected a bus, update its position
            if (selectedBus) {
                const updated = activeBuses.find(b => b.id === selectedBus.id);
                if (updated) setSelectedBus(updated);
            }
        } catch (err) {
            console.error('Error fetching bus locations', err);
        }
    };

    useEffect(() => {
        fetchBusLocations();
        const interval = setInterval(fetchBusLocations, 10000); // Polling every 10s
        return () => clearInterval(interval);
    }, []);

    const defaultCenter = [8.1883, 77.2415]; // DMI College location roughly

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                        <MapPin className="text-blue-600" />
                        Live Bus Tracking
                    </h2>
                    <p className="text-slate-500">Track your college bus in real-time</p>
                </div>
                <button
                    onClick={fetchBusLocations}
                    className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
                >
                    <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
                    Refresh
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-[500px] h-[calc(100vh-250px)]">
                {/* Sidebar - Bus List */}
                <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                    <div className="p-4 bg-slate-50 border-b border-slate-200">
                        <h3 className="font-bold text-slate-700 uppercase text-xs tracking-wider">Active Buses</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {buses.length === 0 ? (
                            <div className="p-8 text-center">
                                <Bus className="w-12 h-12 mx-auto text-slate-200 mb-2" />
                                <p className="text-slate-400 text-sm">No buses currently active</p>
                            </div>
                        ) : (
                            buses.map(bus => (
                                <div
                                    key={bus.id}
                                    onClick={() => setSelectedBus(bus)}
                                    className={`p-4 border-b border-slate-100 cursor-pointer transition-all hover:bg-blue-50 ${selectedBus?.id === bus.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                            <Bus size={20} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800">{bus.bus_number}</p>
                                            <div className="flex items-center gap-1 text-[11px] text-slate-500">
                                                <User size={12} />
                                                <span>{bus.driver_name}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-2 flex items-center justify-between">
                                        <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter">Live</span>
                                        <span className="text-[10px] text-slate-400">
                                            {new Date(bus.updated_at).toLocaleTimeString()}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Map View */}
                <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative z-0">
                    <MapContainer
                        center={selectedBus ? [selectedBus.latitude, selectedBus.longitude] : defaultCenter}
                        zoom={13}
                        style={{ height: '100%', width: '100%' }}
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        {buses.map(bus => (
                            <Marker
                                key={bus.id}
                                position={[bus.latitude, bus.longitude]}
                                icon={busIcon}
                                eventHandlers={{
                                    click: () => setSelectedBus(bus),
                                }}
                            >
                                <Popup>
                                    <div className="p-1">
                                        <p className="font-bold text-blue-600 m-0">{bus.bus_number}</p>
                                        <p className="text-xs text-slate-500 m-0">Driver: {bus.driver_name}</p>
                                        <p className="text-[10px] text-slate-400 mt-1 italic">
                                            Last update: {new Date(bus.updated_at).toLocaleTimeString()}
                                        </p>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                        {selectedBus && <RecenterMap center={[selectedBus.latitude, selectedBus.longitude]} />}
                    </MapContainer>
                </div>
            </div>
        </div>
    );
};

export default BusTracking;
