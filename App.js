import { StatusBar } from 'expo-status-bar';
import { Button, StyleSheet, Text, View } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';

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

  useEffect(() => {
    const subs = Notifications.addNotificationReceivedListener(notification => {
      console.log(notification, 'received');
    })
    return () => {
      subs.remove();
    }
  }, []);

  async function scheduleNotificationHandler() {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.log('Failed to get permission for notifications')
      return;
    }

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

  return (
    <View style={styles.container}>
      <Button title="Schedule notification" onPress={scheduleNotificationHandler}/>
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
