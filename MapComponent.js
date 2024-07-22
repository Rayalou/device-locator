// Import necessary modules and components from React and React Native
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

// Define the MapComponent functional component
const MapComponent = ({ location, hasPermission }) => {
  // useRef hook to hold a reference to the MapView
  const mapRef = useRef(null);
  
  // State variable to hold the current region displayed on the map
  const [currentRegion, setCurrentRegion] = useState(null);

  // useEffect hook to update the map's region when the location changes
  useEffect(() => {
    if (mapRef.current && location) {
      // Define the new region based on the location
      const newRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };

      // If the current region is not set or the distance between the current region and new region is greater than 50 meters, animate the map to the new region
      if (!currentRegion || getDistance(currentRegion, newRegion) > 50) {
        mapRef.current.animateToRegion(newRegion, 1000);
        setCurrentRegion(newRegion);
      }
    }
  }, [location]);

  // Function to calculate the distance between two regions
  const getDistance = (region1, region2) => {
    const lat1 = region1.latitude;
    const lon1 = region1.longitude;
    const lat2 = region2.latitude;
    const lon2 = region2.longitude;

    // Radius of the Earth in meters
    const R = 6371e3; 
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    // Haversine formula to calculate the distance
    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const d = R * c; // in meters
    return d;
  };

  // Define the initial region for the map with default latitude and longitude
  const initialRegion = {
    latitude: location?.coords.latitude || 49.03362, // default latitude
    longitude: location?.coords.longitude || -122.79635, // default longitude
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  // Render the MapView component with a Marker if location permission is granted
  return (
    <MapView
      ref={mapRef}
      style={styles.map}
      initialRegion={initialRegion}
      showsUserLocation={hasPermission}
      zoomEnabled={true}
      zoomControlEnabled={true}
    >
      {hasPermission && location && (
        <Marker
          coordinate={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          }}
          title="You are here"
        />
      )}
    </MapView>
  );
};

// Define styles for the MapView
const styles = StyleSheet.create({
  map: {
    width: '100%',
    height: '100%', // make it full height to fill the view
  },
});

// Export the MapComponent as the default export
export default MapComponent;

