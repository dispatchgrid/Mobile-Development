import FontAwesome from '@expo/vector-icons/FontAwesome';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Tabs } from "expo-router";
import { useEffect, useState } from "react";

export default function TabLayout() {
  const [darkTheme, setDarkTheme] = useState(true);
  useEffect(() => {
    async function getTheme() {
        try {
            const storedTheme = await AsyncStorage.getItem("darkTheme");
            if (storedTheme !== null) {
                setDarkTheme(JSON.parse(storedTheme));
            }
        } catch (err) {
            console.error(err);
        }
    }

    getTheme();
});

  return (
    <Tabs screenOptions={{ 
      headerShown: false,
      tabBarStyle: {
        backgroundColor: darkTheme ? "#121212" : "white",
        borderTopColor: darkTheme ? "#333333" : "#e5e5e5",
      },
      tabBarActiveTintColor: darkTheme ? "#e7e7e7" : "#005eff",
      tabBarInactiveTintColor: darkTheme ? "#888888" : "#a1a1a1",
    }}>
      
      <Tabs.Screen
        name="home"
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ color, size }) => {
            return (
            <MaterialIcons name="home" size={size} color={color} />
            );
          },
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarLabel: "Profile",
          tabBarIcon: ({ color, size }) => {
            return (
            <FontAwesome name="user-circle-o" size={size} color={color} />
            );
          },
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarLabel: "Settings",
          tabBarIcon: ({ color, size }) => {
            return (
            <Ionicons name="settings-sharp" size={size} color={color} />
            );
          },
        }}
      />
    </Tabs>
  );
}