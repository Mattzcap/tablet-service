import React, { useState, useEffect, useRef } from "react";
import { View, Alert, StyleSheet, TouchableOpacity, Text } from "react-native";
import MapView, { Marker, Circle } from "react-native-maps";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { startGeofencing, stopGeofencing, GEOFENCE_LOCATIONS } from "./geofencingService"; // Import geofence locations

const GeofencingMap = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [region, setRegion] = useState(null);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const mapRef = useRef(null);

  const saveLastLocation = async (location) => {
    try {
      await AsyncStorage.setItem("lastLocation", JSON.stringify(location));
    } catch (error) {
      console.error("Error saving last location:", error);
    }
  };

  const loadLastLocation = async () => {
    try {
      const savedLocation = await AsyncStorage.getItem("lastLocation");
      if (savedLocation) {
        const parsedLocation = JSON.parse(savedLocation);
        setRegion(parsedLocation);
      }
    } catch (error) {
      console.error("Error loading last location:", error);
    }
  };

  const getLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Enable location services to use this feature.");
        return;
      }

      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      if (!location || !location.coords) {
        throw new Error("Failed to get location.");
      }

      const { latitude, longitude } = location.coords;
      const newRegion = {
        latitude,
        longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      };

      setUserLocation({ latitude, longitude });
      setRegion(newRegion);
      setLocationEnabled(true);
      saveLastLocation(newRegion);

      if (mapRef.current) {
        mapRef.current.animateToRegion(newRegion, 1000);
      }
    } catch (error) {
      console.error("Error fetching location:", error);
      Alert.alert("Error", "Unable to fetch location. Please check your GPS settings.");
    }
  };

  useEffect(() => {
    loadLastLocation();
    startGeofencing(); // Start geofencing when the app loads
    return () => stopGeofencing(); // Stop geofencing when the app is closed
  }, []);

  return (
    <View style={styles.container}>
      {region ? (
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={region}
          region={region}
          showsUserLocation={locationEnabled}
          showsMyLocationButton={false}
        >

          {/* Display geofencing circles */}
          {GEOFENCE_LOCATIONS.map((location, index) => (
            <Circle
              key={index}
              center={{ latitude: location.latitude, longitude: location.longitude }}
              radius={location.radius}
              strokeColor="rgba(49, 49, 243, 0.85)" // Red outline
              fillColor="rgba(90, 178, 241, 0.9)" // Transparent red fill
            />
          ))}

          {userLocation && <Marker coordinate={userLocation} title="Your Location" pinColor="red" />}
        </MapView>
      ) : (
        <View style={styles.loadingContainer}>
          <Ionicons name="location-outline" size={32} color="gray" />
          <Text>Loading Map...</Text>
        </View>
      )}

      {/* Location Button */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity style={styles.button} onPress={getLocation}>
          <Ionicons name="locate-sharp" size={24} color="black" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: "100%", height: "100%" },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
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
  button: {
    padding: 10,
    alignItems: "center",
  },
});

export default GeofencingMap;
