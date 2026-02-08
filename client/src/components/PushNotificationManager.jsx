import { useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const PushNotificationManager = () => {
    const { user } = useAuth();
    const publicVapidKey = 'BAL8aJcsVjQ3GNhDeRiWXAZrBv_EiLde08MOrxwqn9UdMS9a3_rM4XMg4nWEFtBr4534S5fi8usdzQbEoX1Ek6w';

    useEffect(() => {
        if (user && 'serviceWorker' in navigator && 'PushManager' in window) {
            registerPush();
        }
    }, [user]);

    const registerPush = async () => {
        try {
            // 1. Register Service Worker
            const register = await navigator.serviceWorker.register('/service-worker.js', {
                scope: '/'
            });

            // 2. Wait for registration to be ready
            await navigator.serviceWorker.ready;

            // 3. Request Permission
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                console.log('Notification permission denied');
                return;
            }

            // 4. Subscribe to Push
            const subscription = await register.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
            });

            // 5. Send subscription to server
            await axios.post('/api/notifications/subscribe', {
                userId: user.id,
                subscription: subscription
            });

            console.log('Push Registered for User:', user.id);
        } catch (err) {
            console.error('Push registration failed:', err);
        }
    };

    // Helper function
    function urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }

    return null; // This component doesn't render anything
};

export default PushNotificationManager;
