import { NativeModules } from "react-native";

const { NotificationManagerModule } = NativeModules;

interface NotificationManagerModuleType {
  requestPermission: () => void;
  scheduleNotification: (
    seconds: number,
    title: string,
    body: string
  ) => Promise<string>;
  cancelNotification: (identifier: string) => void;
}

const NotifManager = NotificationManagerModule as NotificationManagerModuleType;

export const requestPermission = NotifManager.requestPermission;
export const scheduleNotification = NotifManager.scheduleNotification;
export const cancelNotification = NotifManager.cancelNotification;
