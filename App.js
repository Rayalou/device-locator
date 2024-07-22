// Import necessary modules and components from React and React Native
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Platform, Text } from 'react-native';
import * as Location from 'expo-location';

// Define the main App component
export default function App() {
  // State variables to hold location data, error message, and permission status
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [hasPermission, setHasPermission] = useState(false);

  // useEffect hook to run the location fetching logic when the component mounts
  useEffect(() => {
    let subscription;

    // Function to get the location of the device
    const getLocation = async () => {
      if (Platform.OS === 'web') {
        // For web platform, use the browser's geolocation API
        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              // If location is successfully fetched, update state
              setLocation({
                coords: {
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
                },
              });
              setHasPermission(true);
            },
            (error) => {
              // If there's an error, update the error message state
              setErrorMsg(`Error: ${error.message}`);
              setHasPermission(false);
            },
            { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
          );
        } else {
          // If geolocation is not supported, update the error message state
          setErrorMsg("Geolocation is not supported by this browser.");
          setHasPermission(false);
        }
      } else {
        // For non-web platforms, use the expo-location library
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          // If permission is not granted, update the error message state
          setErrorMsg('Permission to access location was denied');
          setHasPermission(false);
          return;
        }

        setHasPermission(true);

        // Subscribe to location updates
        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 2000,
            distanceInterval: 1,
          },
          (location) => {
            // Update state with the new location data
            setLocation(location);
          }
        );
      }
    };

    // Call the getLocation function
    getLocation();

    // Cleanup function to remove the location subscription when the component unmounts
    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  // Function to render the map
  const renderMap = () => {
    if (Platform.OS === 'web') {
      // For web platform, use an iframe to embed Google Maps
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
      // For non-web platforms, use a custom MapComponent
      const MapComponent = require('./MapComponent').default;
      return <MapComponent location={location} hasPermission={hasPermission} />;
    }
  };

  // Render a loading or error message if location is not yet fetched
  if (!location && hasPermission) {
    return (
      <View style={styles.container}>
        {errorMsg ? <Text>{errorMsg}</Text> : <Text>Fetching location...</Text>}
      </View>
    );
  }

  // Render the map view
  return (
    <View style={styles.container}>
      {renderMap()}
    </View>
  );
}

// Define styles for the container view
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
