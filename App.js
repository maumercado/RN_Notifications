import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Alert, Button, StyleSheet, View, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

import appJson from './app.json'

Notifications.setNotificationHandler({
  handleNotification: async () => {
    return {
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowAlert: true,
    };
  },
});

export default function App() {
  const [pushToken, setPushToken] = useState();

  useEffect(() => {
    async function configurePushNotifications() {
      const { status } = await Notifications.getPermissionsAsync()
      let finalStatus = status;
      if (finalStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (status !== 'granted') {
        Alert.alert(
          'Insufficient permissions!',
          'You need to grant notification permissions to use this app.',
          [{ text: 'Okay' }]
        );
        return;
      }

      const pushTokenData = await Notifications.getExpoPushTokenAsync({ projectId: appJson.expo?.extra?.eas?.projectId })
      setPushToken(pushTokenData.data);
    }

    configurePushNotifications();
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.DEFAULT,
        description: 'Default channel for notifications',
      });
    }

  }, []);

  useEffect(() => {
    const subs1 = Notifications.addNotificationReceivedListener(notification => {
      console.log(JSON.stringify(notification, null, 2), 'received');
    })

    const subs2 = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(JSON.stringify(response, null, 2), 'response');
    })

    return () => {
      subs1.remove();
      subs2.remove();
    }
  }, []);

  async function scheduleNotificationHandler() {
    try {
      Notifications.scheduleNotificationAsync({
        content: {
          title: 'My first local notification',
          body: 'This is the first local notification we are sending!',
          data: { userName: 'Mau' },
        },
        trigger: {
          seconds: 4,
        },
      });
    } catch (err) {
      console.log(err);
    }
  }

  function sendPushNotificationHandler() {
    try {
      fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: pushToken,
          data: { extraData: 'Some data' },
          title: 'Sent via the app',
          body: 'This push notification was sent via the app!',
        }),
      });
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <View style={styles.container}>
      <Button title="Schedule notification" onPress={scheduleNotificationHandler}/>
      <Button title="Send push notification" onPress={sendPushNotificationHandler}/>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
