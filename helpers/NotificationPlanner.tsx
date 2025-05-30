import {
  cancelNotification,
  scheduleNotification,
} from "@/modules/NotificationManager";
import AsyncStorage from "@react-native-async-storage/async-storage";

const NOTIF_KEY = "notifications";

export const createAndStoreNotification = async (
  seconds: number,
  title: string,
  body: string
) => {
  const notifId = await scheduleNotification(seconds, title, body);
  const existing = await AsyncStorage.getItem(NOTIF_KEY);
  const currentIds = existing ? JSON.parse(existing) : [];
  const updated = [...currentIds, notifId];
  await AsyncStorage.setItem(NOTIF_KEY, JSON.stringify(updated));
};

export const cancelAllNotifications = async () => {
  const existing = await AsyncStorage.getItem(NOTIF_KEY);
  const currentIds: string[] = existing ? JSON.parse(existing) : [];
  for (const id of currentIds) {
    await cancelNotification(id);
  }
  await AsyncStorage.setItem(NOTIF_KEY, JSON.stringify([]));
};

export const cancelNotificationById = async (notifId: string) => {
  const existing = await AsyncStorage.getItem(NOTIF_KEY);
  const currentIds: string[] = existing ? JSON.parse(existing) : [];
  const updated = currentIds.filter((id) => id !== notifId);
  await cancelNotification(notifId);
  await AsyncStorage.setItem(NOTIF_KEY, JSON.stringify(updated));
};
