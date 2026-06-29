import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useAuthStore } from '@/stores/authStore';

const REMINDER_ID = 'pull-reminder-6h';
const INTERVAL_SECONDS = 6 * 60 * 60;

const MESSAGES = [
  { title: '🍷 Time to pour?', body: 'Log your latest tasting before the details fade.' },
  { title: '🍇 What are you drinking?', body: 'Open your journal and capture the moment.' },
  { title: '📖 Pour Across America', body: 'Add a new wine to your collection.' },
  { title: '🥂 Cheers!', body: 'Don\'t forget to log that glass you just opened.' },
];

export function usePullReminder() {
  const { user } = useAuthStore();

  useEffect(() => {
    if (Platform.OS === 'web' || !user) return;

    let cancelled = false;

    (async () => {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted' || cancelled) return;

      await Notifications.cancelScheduledNotificationAsync(REMINDER_ID).catch(() => {});

      const msg = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];

      await Notifications.scheduleNotificationAsync({
        identifier: REMINDER_ID,
        content: {
          title: msg.title,
          body: msg.body,
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: INTERVAL_SECONDS,
          repeats: true,
        },
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  useEffect(() => {
    if (Platform.OS === 'web' || user) return;
    Notifications.cancelScheduledNotificationAsync(REMINDER_ID).catch(() => {});
  }, [user]);
}
