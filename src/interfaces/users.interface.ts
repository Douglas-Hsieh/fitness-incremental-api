export interface User {
  id: number;
  sub: string;
  roles: string;
  os: string;
  email: string;
  timezoneOffsetMinutes: number;
  expoPushToken: string;
  lastNotificationTime: Date;
  oAuthCredentials: string;
}
