import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ContactInfo() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const apiUrl = process.env.EXPO_PUBLIC_API_URL;

    const fname = params.fname;
    const lname = params.lname;
    const mobile = params.mobile;
    const chatId = params.chatId;
    const [imgUri, setImgUri] = useState("https://cdn-icons-png.flaticon.com/512/4140/4140073.png");
    const [darkTheme, setDarkTheme] = useState(false);
    const styles = darkTheme ? darkStyles : lightStyles;

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
        if (apiUrl) {
            
            setImgUri(params.img ? params.img+"" : "");
            console.log(imgUri);
        }
    }, [])


    async function deleteChat() {
        try {
            const apiUrl = process.env.EXPO_PUBLIC_API_URL;
            const response = await fetch(apiUrl + "/chat/delete-chat?chatId="+chatId, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (response.ok) {
                router.replace("/(tabs)/home");
            } else {
                Alert.alert("Error", "Failed to delete chat");
            }
        } catch (err) {
            console.error(err);
            Alert.alert("Error", "Something went wrong");
        }
    }

    return (
        <SafeAreaView style={styles.container} edges={["top", "left", "right", "bottom"]}>
            <View style={styles.topBar}>
                <MaterialIcons
                    name="arrow-back"
                    size={28}
                    color={darkTheme ? "#e7e7e7" : "#000000"}
                    onPress={() => router.back()}
                />
            </View>

            <View style={styles.mainContent}>
                <View style={styles.imgContainer}>
                    <Image source={{ uri: imgUri }} style={styles.profilePic} />
                </View>

                <Text style={styles.nameTxt}>{fname} {lname}</Text>

                <View style={styles.mobileView}>
                    <MaterialIcons name="phone" size={20} color={darkTheme ? "#a1a1a1" : "#696969"} />
                    <Text style={styles.mobileTxt}>{mobile}</Text>
                </View>

                <View style={styles.spacer} />

                <Pressable
                    style={styles.deleteBtn}
                    onPress={() => {
                        Alert.alert(
                            "Delete Chat",
                            "Are you sure you want to delete this chat? This action cannot be undone.",
                            [
                                { text: "Cancel", style: "cancel" },
                                { text: "Delete", style: "destructive", onPress: deleteChat }
                            ]
                        );
                    }}
                >
                    <MaterialIcons name="delete-outline" size={24} color="white" />
                    <Text style={styles.deleteBtnTxt}>Delete Chat</Text>
                </Pressable>
            </View>
        </SafeAreaView>
    );
}

const lightStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
    },
    topBar: {
        padding: 15,
    },
    mainContent: {
        flex: 1,
        alignItems: "center",
        paddingHorizontal: 20,
    },
    imgContainer: {
        width: 150,
        height: 150,
        borderRadius: 75,
        borderWidth: 4,
        borderColor: "#ececec",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        marginBottom: 20,
    },
    profilePic: {
        width: "100%",
        height: "100%",
    },
    nameTxt: {
        fontSize: 26,
        fontWeight: "700",
        color: "#000000",
        marginBottom: 10,
    },
    mobileView: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        backgroundColor: "#ececec",
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 50,
        marginBottom: 20,
    },
    mobileTxt: {
        fontSize: 16,
        color: "#555555",
        fontWeight: "500",
    },
    spacer: {
        flex: 1,
    },
    deleteBtn: {
        width: "100%",
        backgroundColor: "#ff0000",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        paddingVertical: 18,
        borderRadius: 50,
        marginBottom: 20,
    },
    deleteBtnTxt: {
        color: "white",
        fontSize: 18,
        fontWeight: "700",
    },
});

const darkStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#121212",
    },
    topBar: {
        padding: 15,
    },
    mainContent: {
        flex: 1,
        alignItems: "center",
        paddingHorizontal: 20,
    },
    imgContainer: {
        width: 150,
        height: 150,
        borderRadius: 75,
        borderWidth: 4,
        borderColor: "#333333",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        marginBottom: 20,
    },
    profilePic: {
        width: "100%",
        height: "100%",
    },
    nameTxt: {
        fontSize: 26,
        fontWeight: "700",
        color: "#e7e7e7",
        marginBottom: 10,
    },
    mobileView: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        backgroundColor: "#242424",
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 50,
        marginBottom: 20,
    },
    mobileTxt: {
        fontSize: 16,
        color: "#a1a1a1",
        fontWeight: "500",
    },
    spacer: {
        flex: 1,
    },
    deleteBtn: {
        width: "100%",
        backgroundColor: "#ff0000",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        paddingVertical: 18,
        borderRadius: 50,
        marginBottom: 20,
    },
    deleteBtnTxt: {
        color: "white",
        fontSize: 18,
        fontWeight: "700",
    },
});