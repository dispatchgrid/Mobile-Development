import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, useFocusEffect } from "expo-router";
import { useState } from "react";

export default function Layout() {

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="chat" />
      <Stack.Screen name="new" />

    </Stack>
  );
}
