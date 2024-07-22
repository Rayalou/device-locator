import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

const MapComponent = ({ location, hasPermission }) => {
  const mapRef = useRef(null);
  const [currentRegion, setCurrentRegion] = useState(null);

  useEffect(() => {
    if (mapRef.current && location) {
      const newRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };

      if (!currentRegion || getDistance(currentRegion, newRegion) > 50) {
        mapRef.current.animateToRegion(newRegion, 1000);
        setCurrentRegion(newRegion);
      }
    }
  }, [location]);

  const getDistance = (region1, region2) => {
    const lat1 = region1.latitude;
    const lon1 = region1.longitude;
    const lat2 = region2.latitude;
    const lon2 = region2.longitude;

    const R = 6371e3; // metres
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const d = R * c; // in metres
    return d;
  };

  const initialRegion = {
    latitude: location?.coords.latitude || 49.03362, // default latitude
    longitude: location?.coords.longitude || -122.79635, // default longitude
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

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

const styles = StyleSheet.create({
  map: {
    width: '100%',
    height: '100%', // make it full height to fill the view
  },
});

export default MapComponent;
