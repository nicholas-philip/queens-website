import { useEffect } from 'react';
import { messaging, getToken, onMessage } from '../libs/firebase';
import axios from 'axios';

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const PushNotificationHandler = () => {
    
    useEffect(() => {
        const requestPermission = async () => {
            try {
                // 1. Request Browser Permission
                const permission = await Notification.requestPermission();
                if (permission === 'granted') {
                    console.log('🔔 Notification permission granted.');
                    
                    // 2. Register Service Worker with FCM
                    // (Already registered by registerServiceWorker below or by the browser)
                    
                    // 3. Get FCM Token
                    const token = await getToken(messaging, { vapidKey: VAPID_KEY });
                    
                    if (token) {
                        console.log('✅ FCM Token generated:', token);
                        // 4. Send token to backend
                        await axios.post(`${API_URL}/alerts/subscribe-push`, {
                            token,
                            platform: 'web'
                        });
                    } else {
                        console.warn('⚠️ No registration token available. Request permission to generate one.');
                    }
                } else {
                    console.warn('❌ Notification permission denied.');
                }
            } catch (err) {
                console.error('An error occurred while retrieving token. ', err);
            }
        };

        // Delay slightly to not block initial render
        const timer = setTimeout(() => {
            requestPermission();
        }, 3000);

        // Listen for foreground messages
        const unsubscribe = onMessage(messaging, (payload) => {
            console.log('📨 Message received in foreground: ', payload);
            // Browser might not show the notification automatically in the foreground
            // Custom toast or alert can be added here.
            if (Notification.permission === 'granted') {
                new Notification(payload.notification.title, {
                    body: payload.notification.body,
                    icon: payload.data?.imageUrl || '/logo.png'
                });
            }
        });

        return () => {
            clearTimeout(timer);
            unsubscribe();
        };
    }, []);

    return null; // This component doesn't render anything UI-wise
};

export default PushNotificationHandler;
