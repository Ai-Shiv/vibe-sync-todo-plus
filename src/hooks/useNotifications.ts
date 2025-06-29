
import { useEffect } from 'react';
import { LocalNotifications } from '@capacitor/local-notifications';
import { useLocalStorage } from './useLocalStorage';
import { AppSettings } from '@/types';

export const useNotifications = () => {
  const [settings] = useLocalStorage<AppSettings>('appSettings', {
    theme: 'dark',
    notifications: true,
    soundEnabled: true,
  });

  useEffect(() => {
    if (settings.notifications) {
      requestPermissions();
    }
  }, [settings.notifications]);

  const requestPermissions = async () => {
    try {
      const permission = await LocalNotifications.requestPermissions();
      console.log('Notification permission:', permission);
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
    }
  };

  const scheduleNotification = async (title: string, body: string, scheduleAt: Date) => {
    if (!settings.notifications) return;

    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            title,
            body,
            id: Date.now(),
            schedule: { at: scheduleAt },
            sound: settings.soundEnabled ? 'default' : undefined,
          }
        ]
      });
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  };

  return {
    scheduleNotification,
    requestPermissions,
  };
};
