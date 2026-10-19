import { PushNotifications } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';
import { router } from '../routes';

export const initNotifications = async () => {
  const permission = await PushNotifications.requestPermissions();

  if (permission.receive !== 'granted') {
    console.log('Notification permission not granted');
    return;
  }

  await PushNotifications.register();

  await LocalNotifications.requestPermissions();

  // TOKEN
  PushNotifications.addListener(
    'registration',
    async (token) => {

      console.log('FCM TOKEN:', token.value);

      localStorage.setItem(
        'fcm_token',
        token.value
      );

      const mobile =
        localStorage.getItem('userMobile');

      if (!mobile) return;

      await fetch(
        'https://api.fundsarthi.in/api/save-fcm-token',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            mobile,
            fcm_token: token.value
          })
        }
      );
    }
  );

  // ERROR
  PushNotifications.addListener('registrationError', (error) => {
    console.error('Registration Error:', error);
    alert(`Registration Error:\n${JSON.stringify(error)}`);
  });

  // FOREGROUND NOTIFICATION
  PushNotifications.addListener(
    'pushNotificationReceived',
    async (notification) => {

      console.log(
        'Notification Received',
        notification
      );

      await LocalNotifications.schedule({
        notifications: [
          {
            id: Date.now(),
            title: notification.title || 'Notification',
            body: notification.body || '',
            extra: notification.data
          }
        ]
      });

    }
  );

  // CLICK EVENT
  PushNotifications.addListener(
    'pushNotificationActionPerformed',
    (notification) => {

      console.log(
        'Notification Clicked',
        notification
      );

      const route =
        notification.notification.data?.route;

      console.log(
        'ROUTE:',
        route
      );

      if (route) {
        router.navigate(route);
      }
    }
  );
};

LocalNotifications.addListener(
  'localNotificationActionPerformed',
  (notification) => {

    const route =
      notification.notification.extra?.route;

    console.log('LOCAL ROUTE:', route);

    if (route) {
      router.navigate(route);
    }
  }
);