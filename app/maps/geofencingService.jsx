import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import { Alert } from "react-native";

const GEOFENCING_TASK = "GEOFENCING_TASK";

// Define multiple geofence locations
export const GEOFENCE_LOCATIONS = [
  {
    identifier: "Location 1",
    latitude: 14.5995, // Example: Manila
    longitude: 120.9842,
    radius: 200, // Radius in meters
    notifyOnEnter: true,
    notifyOnExit: true,
  },
  {
    identifier: "Location 2",
    latitude: 14.681626270672984, // Example: Quezon City
    longitude: 121.06321455325424,
    radius: 50,
    notifyOnEnter: true,
    notifyOnExit: true,
  },
];

// Background task for geofencing
TaskManager.defineTask(GEOFENCING_TASK, async ({ data, error }) => {
  if (error) {
    console.error("Geofencing error:", error);
    return;
  }

  if (data) {
    const { eventType, region } = data;
    
    // Fetch the current user location for debugging
    let location = await Location.getCurrentPositionAsync({});
    console.log("Current Device Location:", location.coords.latitude, location.coords.longitude);

    if (eventType === Location.GeofencingEventType.Enter) {
      console.log(`✅ ENTERED geofence: ${region.identifier}`);
      Alert.alert("Geofence Alert", `Entered: ${region.identifier}`);
    } else if (eventType === Location.GeofencingEventType.Exit) {
      console.log(`❌ EXITED geofence: ${region.identifier}`);
      Alert.alert("Geofence Alert", `Exited: ${region.identifier}`);
    }
  }
});

// Function to start geofencing
export const startGeofencing = async () => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();

    if (status !== "granted" || backgroundStatus !== "granted") {
      Alert.alert("Permission Denied", "Enable location permissions for geofencing.");
      return;
    }

    const isRegistered = await TaskManager.isTaskRegisteredAsync(GEOFENCING_TASK);
    if (!isRegistered) {
      await Location.startGeofencingAsync(GEOFENCING_TASK, GEOFENCE_LOCATIONS);
      console.log("✅ Geofencing started successfully.");
    } else {
      console.log("ℹ️ Geofencing is already running.");
    }
  } catch (error) {
    console.error("Error starting geofencing:", error);
  }
};

// Function to stop geofencing
export const stopGeofencing = async () => {
  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(GEOFENCING_TASK);
    if (isRegistered) {
      await Location.stopGeofencingAsync(GEOFENCING_TASK);
      console.log("🛑 Geofencing stopped.");
    }
  } catch (error) {
    console.error("Error stopping geofencing:", error);
  }
};

export default { startGeofencing, stopGeofencing, GEOFENCE_LOCATIONS };
