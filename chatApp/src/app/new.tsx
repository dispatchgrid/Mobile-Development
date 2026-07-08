import AntDesign from '@expo/vector-icons/AntDesign';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function New() {

    const [fname, setFname] = useState("");
    const [lname, setLname] = useState("");
    const [mobile, setMobile] = useState("");
    const [user, setUser] = useState("");
    const [darkTheme, setDarkTheme] = useState(false);
    const [profileImage, setProfileImage] = useState("");
    const router = useRouter();

    const styles = darkTheme ? darkStyles : lightStyles;

    useFocusEffect(
        useCallback(() => {
            async function loadUser() {
                const us = await AsyncStorage.getItem("user");
                const userObj = JSON.parse(us + "");
                setUser(userObj.mobile);
            }
            loadUser();

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
        }, [])
    );


    async function getUserInfo(inputText: String) {
        console.log(inputText);
        setMobile(inputText + "");
        setFname("");
        setLname("");
        setProfileImage("");
        if (inputText.length == 10) {
            try {
                const apiUrl = process.env.EXPO_PUBLIC_API_URL;

                const response = await fetch(apiUrl + "/user/user-info?mobile=" + inputText, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },

                });

                if (response.ok) {
                    const responseData = await response.json();
                    console.log(responseData.info);
                    setFname(responseData.info.fname)
                    setLname(responseData.info.lname)
                    setProfileImage(apiUrl + responseData.info.img);



                }
            } catch (err) {
                console.error(err);
            }

        }




    }


    async function add() {

        if (!fname) {
            return;
        }
        console.log(user)

        try {
            const apiUrl = process.env.EXPO_PUBLIC_API_URL;

            const response = await fetch(apiUrl + "/chat/create-chat?user=" + user + "&reciever=" + mobile, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },

            });

            if (response.ok) {
                const responseData = await response.json();
                console.log(responseData.chatId);

                router.back();


            } else {
                const responseData = await response.json();
                alert(responseData.msg);
            }
        } catch (err) {
            console.error(err);
        }
    }


    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "height" : "padding"}>
                <ScrollView contentContainerStyle={{ flexGrow: 1, gap: 18, alignItems: "center" }}>

                    <Image source={{ uri: (profileImage) ? profileImage : "https://cdn-icons-png.flaticon.com/512/4140/4140073.png" }} style={styles.img} />



                    <View style={styles.inputView}>
                        <AntDesign name="user" size={24} color={darkTheme ? "#a1a1a1" : "#696969"} />
                        <TextInput style={styles.input} keyboardType='phone-pad' onChangeText={getUserInfo} placeholderTextColor={darkTheme ? "#888888" : "#666666"} placeholder="Mobile Number" />
                    </View>


                    <View style={styles.inputView}>
                        <AntDesign name="user" size={24} color={darkTheme ? "#a1a1a1" : "#696969"} />
                        <TextInput style={[styles.input, styles.disabled]} value={fname ? fname : "Start Typing..."} editable={false} />
                    </View>

                    <View style={styles.inputView}>
                        <AntDesign name="user" size={24} color={darkTheme ? "#a1a1a1" : "#696969"} />
                        <TextInput style={[styles.input, styles.disabled]} value={lname ? lname : "Start Typing..."} editable={false} />
                    </View>



                    <Pressable
                        style={[styles.btn, styles.save]}
                        onPress={add}>
                        <Text style={styles.btnTxt}>Add to Chat</Text>
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
    disabled: {
        color: "#707070",
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
        borderRadius: 100,

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
    disabled: {
        color: "#a1a1a1",
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
        borderRadius: 100,
    },

    input: {
        width: "90%",
        padding: 5,
        color: "#e7e7e7",
    },
});