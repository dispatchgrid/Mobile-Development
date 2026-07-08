import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Login() {
    const [mobile, setMobile] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        async function checkUser() {

            const user = await AsyncStorage.getItem("user");

            if (user) {
                router.replace("/(tabs)/home");
            } else {
                setIsLoading(false);
            }
        }
        checkUser();
    }, []);


    


    async function signIn() {
        if (mobile !== "" && password !== "") {
            const loginData = {
                mobile: mobile,
                password: password,
            };
            console.log("Mobile:", mobile);
            console.log("Password:", password);
            try {
                const apiUrl = process.env.EXPO_PUBLIC_API_URL;

                const response = await fetch(apiUrl + "/user/login", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(loginData),
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log("Login successful:", data);
                    await AsyncStorage.setItem("user", JSON.stringify(data.user));

                    router.push("/(tabs)/home");
                } else {
                    console.error("Login failed:", response.status);
                    alert("Login failed. Please check your credentials.");
                }
            } catch (error) {
                console.error("Error during login:", error);
                alert("An error occurred during login. Please try again later.");
            }
        }
    }
    if (!isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "height" : "padding"}>
                    <ScrollView contentContainerStyle={{ flexGrow: 1, gap: 18, alignItems: "center" }}>
                        <Image source={require("../../assets/images/bg-signin.jpg")} style={styles.img} />

                        <View style={styles.textView}>
                            <Text style={styles.titleTxt}>Sign In</Text>
                            <Text style={styles.descriptionTxt}>Please sign in to continue</Text>
                        </View>

                        <View style={styles.inputView}>
                            <AntDesign name="user-add" size={20} color="#696969" />
                            <TextInput style={styles.input} placeholder="Enter your Mobile" onChangeText={(value) => setMobile(value)} keyboardType="phone-pad" />
                        </View>

                        <View style={styles.inputView}>
                            <MaterialIcons name="lock-outline" size={24} color="black" />
                            <TextInput style={styles.input} placeholder="Enter your Password" onChangeText={(value) => setPassword(value)} />
                        </View>

                        <Pressable
                            style={styles.btn}
                            onPress={() => {
                                signIn();
                            }}>
                            <Text style={styles.btnTxt}>Sign in</Text>
                        </Pressable>

                        <View style={{ flexDirection: "row", gap: 5 }}>
                            <Text style={{ color: "#8b8b8b" }}>{"Don't have an account?"}</Text>

                            <Pressable onPress={() => router.push("/signup")}>
                                <Text style={{ fontWeight: "bold", fontSize: 15 }}>Sign up</Text>
                            </Pressable>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        );
    }
}

const styles = StyleSheet.create({
    textView: {
        alignItems: "center",
    },
    titleTxt: {
        fontWeight: "bold",
        fontSize: 22,
    },
    descriptionTxt: {
        color: "#707070",
        marginTop: 5,
    },

    btn: {
        backgroundColor: "#0066ff",
        borderRadius: 50,
        padding: 20,
        width: "100%",
        alignItems: "center",
    },

    btnTxt: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
    },

    inputView: {
        width: "100%",
        height: "auto",
        flexDirection: "row",
        backgroundColor: "#ececec",
        borderRadius: 50,
        paddingHorizontal: 18,
        paddingVertical: 8,
        justifyContent: "center",
    },

    container: {
        flex: 1,
        backgroundColor: "white",
        padding: 20,
        alignItems: "center",
        justifyContent: "center",
        gap: 18,
    },

    img: {
        width: 300,
        height: 300,
    },

    input: {
        width: "90%",
        padding: 5,
    },
});
