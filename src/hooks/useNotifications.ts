
import { useEffect } from 'react';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

export const useNotifications = () => {
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      LocalNotifications.requestPermissions();
    }
  }, []);

  const scheduleNotification = async (id: number, title: string, body: string, date: Date) => {
    if (Capacitor.isNativePlatform()) {
      await LocalNotifications.schedule({
        notifications: [
          {
            title,
            body,
            id,
            schedule: { at: date },
            sound: 'beep.wav',
            attachments: [],
            actionTypeId: '',
            extra: null
          }
        ]
      });
    } else {
      // Web notification fallback
      if ('Notification' in window && Notification.permission === 'granted') {
        setTimeout(() => {
          new Notification(title, { body });
        }, date.getTime() - Date.now());
      }
    }
  };

  const cancelNotification = async (id: number) => {
    if (Capacitor.isNativePlatform()) {
      await LocalNotifications.cancel({ notifications: [{ id: id.toString() }] });
    }
  };

  return { scheduleNotification, cancelNotification };
};
