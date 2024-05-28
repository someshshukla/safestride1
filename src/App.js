import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Button, Alert } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import axios from 'axios';

const ESP32_IP = 'http://192.168.4.1'; // IP of the ESP32 hotspot

const App = () => {
  const [sensorData, setSensorData] = useState(null);
  const [location, setLocation] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(ESP32_IP);
        const data = await response.text();
        setSensorData(data);

        // Check for fall or slip detection
        const parsedData = JSON.parse(data);
        if (parsedData.fallDetected || parsedData.slipDetected) {
          sendAlert(parsedData);
        }
      } catch (error) {
        console.error('Error fetching sensor data:', error);
      }
    };

    const intervalId = setInterval(fetchData, 1000); // Fetch data every second

    return () => clearInterval(intervalId); // Clean up the interval on unmount
  }, []);

  const getLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        setLocation(position);
      },
      (error) => {
        console.error(error);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const sendAlert = async (sensorData) => {
    getLocation();
    if (location) {
      const alertData = {
        sensorData,
        location: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
      };

      try {
        await axios.post('https://your-server-endpoint.com/sendAlert', alertData);
        Alert.alert('Alert sent!', 'Your location has been sent to emergency services and loved ones.');
      } catch (error) {
        console.error('Error sending alert:', error);
        Alert.alert('Error', 'There was an error sending the alert.');
      }
    } else {
      Alert.alert('Error', 'Location not available.');
    }
  };

  return (
    <View style={styles.container}>
      <Text>ESP32 Sensor Data:</Text>
      <Text>{sensorData}</Text>
      <Button title="Get Location" onPress={getLocation} />
      {location && (
        <Text>
          Location: {location.coords.latitude}, {location.coords.longitude}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
});

export default App;
