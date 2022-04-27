export interface User {
  id: number;
  uuid: string;
  roles: string;
  os: string;
  email: string;
  timezoneOffsetMinutes: number;
  expoPushToken: string;
  lastNotificationTime: Date;
}
