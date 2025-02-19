import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, TouchableOpacity, Text, Alert } from "react-native";
import MapView, { Circle } from "react-native-maps";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { startGeofencing, stopGeofencing, GEOFENCE_LOCATIONS } from "./geofencingService";

const GeofencingMap = () => {
  const [region, setRegion] = useState(null);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [geofencingEnabled, setGeofencingEnabled] = useState(false);
  const [locationClicked, setLocationClicked] = useState(0);
  const mapRef = useRef(null);
  const lastKnownLocation = useRef(null);

  const saveLastViewedLocation = async (location) => {
    try {
      await AsyncStorage.setItem("lastViewedLocation", JSON.stringify(location));
    } catch (error) {
      console.error("Error saving last viewed location:", error);
    }
  };

  const loadLastViewedLocation = async () => {
    try {
      const savedLocation = await AsyncStorage.getItem("lastViewedLocation");
      if (savedLocation) {
        setRegion(JSON.parse(savedLocation));
      }
    } catch (error) {
      console.error("Error loading last viewed location:", error);
    }
  };

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Enable location permissions to use this feature.");
        return;
      }

      if (locationClicked === 0) {
        // First click: Enable location but do not move the map
        setLocationEnabled(true);
        setLocationClicked(1);

        // Fetch location without blocking UI updates
        Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High })
          .then((location) => {
            if (location?.coords) {
              lastKnownLocation.current = location.coords;
            }
          })
          .catch((error) => console.error("Error fetching background location:", error));

        // Start geofencing if not enabled
        if (!geofencingEnabled) {
          startGeofencing().then(() => setGeofencingEnabled(true));
        }
      } else {
        // Second click: Zoom into user location
        if (lastKnownLocation.current && mapRef.current) {
          mapRef.current.animateToRegion(
            {
              latitude: lastKnownLocation.current.latitude,
              longitude: lastKnownLocation.current.longitude,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            },
            1500
          );
        }
      }
    } catch (error) {
      console.error("Error fetching location:", error);
    }
  };

  useEffect(() => {
    loadLastViewedLocation();
  }, []);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={region || {
          latitude: 14.5995,
          longitude: 120.9842,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
        region={region}
        onRegionChangeComplete={saveLastViewedLocation}
        showsUserLocation={locationEnabled}
        showsMyLocationButton={false}
      >
        {locationEnabled &&
          GEOFENCE_LOCATIONS.map((location, index) => (
            <Circle
              key={index}
              center={{ latitude: location.latitude, longitude: location.longitude }}
              radius={location.radius}
              strokeColor="rgba(49, 49, 243, 0.85)"
              fillColor="rgba(90, 178, 241, 0.9)"
            />
          ))}
      </MapView>
      <View style={styles.controlsContainer}>
        <TouchableOpacity style={styles.button} onPress={getLocation}>
          <Ionicons name={locationEnabled ? "locate-sharp" : "location-outline"} size={24} color="black" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: "100%", height: "100%" },
  controlsContainer: {
    position: "absolute",
    right: 20,
    top: "70%",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 12,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  button: { padding: 10, alignItems: "center" },
});

export default GeofencingMap;
