import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { File, Paths } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Profile() {

    const [profileImage, setProfileImage] = useState("");
    const [profileFile, setProfileFile] = useState<any>(null);
    const route = useRouter();
    const [fname, setFname] = useState("");
    const [lname, setLname] = useState("");
    const [password, setPassword] = useState("");
    const [mobile, setMobile] = useState("");
    const [darkTheme, setDarkTheme] = useState(true);

    const styles = darkTheme ? darkStyles : lightStyles;

    useFocusEffect(() => {
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

    useEffect(() => {
        getUserData();

    }, []);

    async function imagePick() {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images']
        });
        if (!result.canceled) {
            const file = new File(result.assets[0].uri);
            const copiedFile = new File(Paths.document, 'profile' + new Date() + '.png');
            file.copySync(copiedFile);
            console.log(copiedFile.uri);
            console.log(Paths.document);
            setProfileImage(copiedFile.uri);
            setProfileFile(copiedFile);
        }
    }

    async function getUserData() {
        const userJson = await AsyncStorage.getItem("user");

        if (userJson) {
            const user = JSON.parse(userJson);
            setFname(user.fname);
            setLname(user.lname);
            setPassword(user.password);
            setMobile(user.mobile);
            const apiUrl = process.env.EXPO_PUBLIC_API_URL;
            setProfileImage(apiUrl + user.img);
        }
    }


    async function update() {
        try {
            const formData = new FormData();
            formData.append("fname", fname);
            formData.append("lname", lname);
            formData.append("password", password);
            formData.append("mobile", mobile);
            formData.append("image", profileFile);

            const apiUrl = process.env.EXPO_PUBLIC_API_URL;
            const response = await fetch(apiUrl + "/user/update", {
                method: "POST",
                body: formData,

            });

            console.log("Sent")
            const data = await response.json();
            console.log(data.data);
            const profileUrl = data.data;
            if (response.ok) {
                await AsyncStorage.setItem("user", JSON.stringify({ fname, lname, password, mobile, profileUrl }));

                route.back();
            }
        } catch (err) {
            console.error(err);
        }

    }

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "height" : "padding"}>
                <ScrollView contentContainerStyle={{ flexGrow: 1, gap: 18, alignItems: "center" }}>

                    <Pressable onPress={imagePick}>
                        <Image source={{ uri: (profileImage) ? profileImage : "https://cdn-icons-png.flaticon.com/512/4140/4140073.png" }} style={styles.img} />
                    </Pressable>
                    <View style={styles.textView}>
                        <Text style={styles.titleTxt}>{mobile}</Text>
                    </View>

                    <View style={styles.inputView}>
                        <FontAwesome5 name="user-edit" size={24} color={darkTheme ? "#a1a1a1" : "#696969"} />
                        <TextInput style={styles.input} value={fname} onChangeText={setFname} placeholderTextColor={darkTheme ? "#888888" : "#666666"} />
                    </View>

                    <View style={styles.inputView}>
                        <FontAwesome5 name="user-edit" size={24} color={darkTheme ? "#a1a1a1" : "#696969"} />
                        <TextInput style={styles.input} value={lname} onChangeText={setLname} placeholderTextColor={darkTheme ? "#888888" : "#666666"} />
                    </View>

                    <View style={styles.inputView}>
                        <Entypo name="lock" size={24} color={darkTheme ? "#a1a1a1" : "#696969"} />
                        <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholderTextColor={darkTheme ? "#888888" : "#666666"} />
                    </View>

                    <Pressable
                        style={[styles.btn, styles.save]}
                        onPress={update}>
                        <Text style={styles.btnTxt}>Save Changes</Text>
                    </Pressable>

                    <Pressable
                        style={[styles.btn, styles.logout]}
                        onPress={() => {
                            AsyncStorage.removeItem("user");
                            route.replace("/")
                        }}>
                        <Text style={styles.btnTxt}>Logout</Text>
                    </Pressable>


                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );

}

const lightStyles = StyleSheet.create({
    textView: {
        alignItems: "center",
    },
    titleTxt: {
        fontWeight: "bold",
        fontSize: 22,
        color: "black",
    },
    descriptionTxt: {
        color: "#707070",
        marginTop: 5,
    },

    btn: {
        borderRadius: 50,
        padding: 20,
        width: "100%",
        alignItems: "center",
    },
    logout: {
        backgroundColor: "#ff0000",

    },
    save: {
        backgroundColor: "#0066ff",

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
        width: 200,
        height: 200,
        borderRadius: 100
    },

    input: {
        width: "90%",
        padding: 5,
        color: "black",
    },
});

const darkStyles = StyleSheet.create({
    textView: {
        alignItems: "center",
    },
    titleTxt: {
        fontWeight: "bold",
        fontSize: 22,
        color: "#e7e7e7",
    },
    descriptionTxt: {
        color: "#707070",
        marginTop: 5,
    },

    btn: {
        borderRadius: 50,
        padding: 20,
        width: "100%",
        alignItems: "center",
    },
    logout: {
        backgroundColor: "#ff0000",

    },
    save: {
        backgroundColor: "#0066ff",

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
        backgroundColor: "#242424",
        borderRadius: 50,
        paddingHorizontal: 18,
        paddingVertical: 8,
        justifyContent: "center",
    },

    container: {
        flex: 1,
        backgroundColor: "#121212",
        padding: 20,
        alignItems: "center",
        justifyContent: "center",
        gap: 18,
    },

    img: {
        width: 200,
        height: 200,
        borderRadius: 100
    },

    input: {
        width: "90%",
        padding: 5,
        color: "#e7e7e7",
    },
});