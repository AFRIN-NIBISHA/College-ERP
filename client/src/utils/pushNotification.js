import axios from 'axios';

const VAPID_PUBLIC_KEY = 'BAL8aJcsVjQ3GNhDeRiWXAZrBv_EiLde08MOrxwqn9UdMS9a3_rM4XMg4nWEFtBr4534S5fi8usdzQbEoX1Ek6w';

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export const registerPushNotifications = async (userId) => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.warn('Push messaging is not supported');
        return;
    }

    try {
        // 1. Register Service Worker
        const registration = await navigator.serviceWorker.register('/service-worker.js', {
            scope: '/'
        });
        console.log('Service Worker registered');

        // 2. Wait for registration to be active
        await navigator.serviceWorker.ready;

        // 3. Subscribe for Push
        let subscription = await registration.pushManager.getSubscription();

        if (!subscription) {
            subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
            });
        }

        // 4. Send subscription to backend
        await axios.post('/api/notifications/subscribe', {
            userId,
            subscription
        });

        console.log('Push subscription successful');
    } catch (err) {
        console.error('Push registration failed:', err);
    }
};
