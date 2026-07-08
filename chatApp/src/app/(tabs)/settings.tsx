import Ionicons from '@expo/vector-icons/Ionicons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from 'expo-router';
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


export default function Settings() {
    const [darkTheme, setDarkTheme] = useState(false);
    const styles = darkTheme ? darkStyles : lightStyles;
    const route = useRouter();


    useEffect(() => {
        loadTheme();
    }, []);

    async function loadTheme() {
        try {
            const storedTheme = await AsyncStorage.getItem("darkTheme");
            if (storedTheme !== null) {
                setDarkTheme(JSON.parse(storedTheme));
            }
        } catch (err) {
            console.error(err);
        }
    }

    async function toggleTheme() {
        try {
            const newValue = !darkTheme;
            setDarkTheme(newValue);
            await AsyncStorage.setItem("darkTheme", JSON.stringify(newValue));
            route.replace("/");
        } catch (err) {
            console.error(err);
        }
    }

    return (
        <SafeAreaView style={styles.container} edges={["top", "left", "right", "bottom"]}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.sectionTitle}>Appearance</Text>
                
                <View style={styles.card}>
                    <View style={styles.optionRow}>
                        <Ionicons name="moon" size={24} color={darkTheme ? "#e7e7e7" : "#000000"} />
                        <Text style={styles.optionTxt}>Dark Mode</Text>
                        <Pressable 
                            style={[styles.toggle, { backgroundColor: darkTheme ? "#005eff" : "#e7e7e7" }]} 
                            onPress={toggleTheme}
                        >
                            <View style={[styles.toggleCircle, { transform: [{ translateX: darkTheme ? 20 : 0 }] }]} />
                        </Pressable>
                    </View>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const lightStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
    },
    scrollContent: {
        padding: 20,
        gap: 20,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: "600",
        color: "#a1a1a1",
        textTransform: "uppercase",
        paddingLeft: 5,
    },
    card: {
        backgroundColor: "#ececec",
        borderRadius: 20,
        padding: 5,
    },
    optionRow: {
        flexDirection: "row",
        alignItems: "center",
        padding: 15,
        gap: 15,
    },
    optionTxt: {
        flex: 1,
        fontSize: 16,
        fontWeight: "500",
        color: "black",
    },
    toggle: {
        width: 50,
        height: 28,
        borderRadius: 14,
        padding: 4,
        justifyContent: "center",
    },
    toggleCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: "white",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1,
        elevation: 2,
    },
});

const darkStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#121212",
    },
    scrollContent: {
        padding: 20,
        gap: 20,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: "600",
        color: "#888888",
        textTransform: "uppercase",
        paddingLeft: 5,
    },
    card: {
        backgroundColor: "#242424",
        borderRadius: 20,
        padding: 5,
    },
    optionRow: {
        flexDirection: "row",
        alignItems: "center",
        padding: 15,
        gap: 15,
    },
    optionTxt: {
        flex: 1,
        fontSize: 16,
        fontWeight: "500",
        color: "#e7e7e7",
    },
    toggle: {
        width: 50,
        height: 28,
        borderRadius: 14,
        padding: 4,
        justifyContent: "center",
    },
    toggleCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: "white",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1,
        elevation: 2,
    },
});