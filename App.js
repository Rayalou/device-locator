import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Platform, Text } from 'react-native';
import * as Location from 'expo-location';

export default function App() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    let subscription;
    const getLocation = async () => {
      if (Platform.OS === 'web') {
        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setLocation({
                coords: {
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
                },
              });
              setHasPermission(true);
            },
            (error) => {
              setErrorMsg(`Error: ${error.message}`);
              setHasPermission(false);
            },
            { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
          );
        } else {
          setErrorMsg("Geolocation is not supported by this browser.");
          setHasPermission(false);
        }
      } else {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied');
          setHasPermission(false);
          return;
        }

        setHasPermission(true);

        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 2000,
            distanceInterval: 1,
          },
          (location) => {
            setLocation(location);
          }
        );
      }
    };

    getLocation();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  const renderMap = () => {
    if (Platform.OS === 'web') {
      return (
        <View style={{ height: '90%', width: '100%' }}>
          {location && hasPermission ? (
            <iframe
              width="100%"
              height="100%"
              frameBorder="0"
              style={{ border: 0 }}
              src={`https://www.google.com/maps?q=${location.coords.latitude},${location.coords.longitude}&z=15&output=embed`}
              allowFullScreen
              allow="geolocation"
            ></iframe>
          ) : (
            <iframe
              width="100%"
              height="100%"
              frameBorder="0"
              style={{ border: 0 }}
              src={`https://www.google.com/maps?z=15&output=embed`}
              allowFullScreen
              allow="geolocation"
            ></iframe>
          )}
        </View>
      );
    } else {
      const MapComponent = require('./MapComponent').default;
      return <MapComponent location={location} hasPermission={hasPermission} />;
    }
  };

  if (!location && hasPermission) {
    return (
      <View style={styles.container}>
        {errorMsg ? <Text>{errorMsg}</Text> : <Text>Fetching location...</Text>}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderMap()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
