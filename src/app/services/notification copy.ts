import { PushNotifications } from '@capacitor/push-notifications';

export const initNotifications = async () => {

  const permission = await PushNotifications.requestPermissions();

  if (permission.receive !== 'granted') {
    console.log("Notification permission denied");
    return;
  }

  await PushNotifications.register();

  // TOKEN
  PushNotifications.addListener(
    'registration',
    (token) => {

      console.log("FCM TOKEN:", token.value);

    }
  );

  // ERROR
  PushNotifications.addListener(
    'registrationError',
    (error) => {

      console.error("Registration Error:", error);

    }
  );

  // FOREGROUND NOTIFICATION
  PushNotifications.addListener(
    'pushNotificationReceived',
    (notification) => {

      console.log("Notification Received:", notification);

    }
  );

  // CLICK EVENT
  PushNotifications.addListener(
    'pushNotificationActionPerformed',
    (notification) => {

      console.log("Notification Clicked:", notification);

    }
  );
};