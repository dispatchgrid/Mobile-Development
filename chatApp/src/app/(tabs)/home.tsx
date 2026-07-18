import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Octicons from "@expo/vector-icons/Octicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, FlatList, Image, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


export default function Home() {

    const [chatData, setChatData] = useState<any[]>([]);
    const [isRefresh, setIsRefreshed] = useState(false);
    const [userName, setUserName] = useState("");
    const [userMobile, setUserMobile] = useState("");
    const [AIChatInfo, setAIChatInfo] = useState<any>(null);


    const [darkTheme, setDarkTheme] = useState(true);

    const router = useRouter();

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


    async function loadChats(mobile: string,searchQuery: string = "") {

        setIsRefreshed(true);
        try {

            const apiUrl = process.env.EXPO_PUBLIC_API_URL;

            const response = await fetch(apiUrl + "/chat/get-chats?mobile=" + mobile+"&searchQuery="+searchQuery);

            const data = await response.json();
            setIsRefreshed(false);

            if (response.ok) {

                setChatData(data);
                data.forEach((chat: any) => {
                    console.log(chat.user.mobile)
                    if (chat.user.mobile === "0000000000") {
                        setAIChatInfo(chat);
                        console.log("Found AI chat");
                        console.log(chat);
                    }
                });


            } else {

                alert(response.status + ":" + data.msg)

            }

        } catch (err) {
            console.error(err);
            setIsRefreshed(false);
        }
    }


    async function getUser() {
        const userString = await AsyncStorage.getItem("user");

        if (userString) {
            const userObj = JSON.parse(userString);
            setUserMobile(userObj.mobile);
            setUserName(userObj.fname);
            loadChats(userObj.mobile,"");

        } else {

        }

    }

    useFocusEffect(() => {
        getUser();
    });

    function timeFormat(time: string) {


        const date = new Date(time);
        const now = new Date();

        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfYesterday = new Date(startOfToday);
        startOfYesterday.setDate(startOfYesterday.getDate() - 1);
        const startOfWeek = new Date(startOfToday);
        startOfWeek.setDate(startOfWeek.getDate() - 6);

        const timeStr = date.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        });

        if (date >= startOfToday) {
            return timeStr;
        } else if (date >= startOfYesterday) {
            return "Yesterday ";
        } else if (date >= startOfWeek) {
            return date.toLocaleDateString("en-US", { weekday: "long" }) + " ";
        } else {
            const day = date.getDate();
            const suffix =
                day % 10 === 1 && day !== 11 ? "st" :
                    day % 10 === 2 && day !== 12 ? "nd" :
                        day % 10 === 3 && day !== 13 ? "rd" : "th";
            const month = date.toLocaleDateString("en-US", { month: "long" });
            return day + suffix + " " + month + " ";
        }


    }

    function formatMessage(message: String) {
        if (!message) return "";
        return message.length > 30
            ? message.substring(0, 30) + "..."
            : message;
    }



    if (isRefresh && chatData.length === 0) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={darkTheme ? "#005eff" : "#005eff"} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerView}>
                <Text style={styles.headerTxt}>{userName}</Text>
                <Pressable>
                    <Octicons name="bell" size={20} color={darkTheme ? "#e7e7e7" : "#a1a1a1"} />
                </Pressable>
            </View>

            <View style={styles.searchView}>
                <Octicons name="search" size={20} color={darkTheme ? "#a1a1a1" : "#a1a1a1"} />
                <TextInput
                    placeholder="Search"
                    autoFocus={false}
                    style={styles.searchInput}
                    placeholderTextColor={darkTheme ? "#888888" : "#666666"}
                    onChangeText={(text) => {
                        loadChats(userMobile, text);
                    }}
                />
            </View>

            <FlatList
                data={chatData}
                keyExtractor={(item) => item.chatId.toString()} 
                renderItem={({ item }) => {
                    if (item.user.mobile !== "0000000000") {

                        console.log("Imgurl:" + item.user.img);

                        return (
                            <Pressable style={styles.chatView} onPress={() => {
                                router.push({
                                    pathname: "/chat",
                                    params: {
                                        chatId: item.chatId,
                                        fname: item.user.fname,
                                        lname:item.user.lname,
                                        userMobile: item.user.mobile,
                                        profileImage: item.user.img

                                    }
                                });
                            }}>
                                <Image source={{ uri: item.user.img ? "http://192.168.1.4:3000" + item.user.img : "https://picsum.photos/200" }} style={styles.profilePic} />
                                <View style={{ gap: 3, flex: 1 }}>
                                    <Text style={styles.nameTxt}>{item.user.fname + " " + item.user.lname}</Text>
                                    <Text style={styles.msgTxt}>{item.last_message[0] ? formatMessage(item.last_message[0].message) : ""}</Text>
                                </View>
                                <Text style={styles.time}>{item.last_message[0] ? timeFormat(item.last_message[0].sent_at) : ""}</Text>
                            </Pressable>
                        )
                    } else {
                        return (null)
                    }
                }}

                refreshing={isRefresh}
                onRefresh={() => {
                    if (userMobile) {
                        loadChats(userMobile,"");
                    }
                }}
            />

            <Pressable
                style={styles.addBtn}
                onPress={() => {
                    router.push("/new");
                }}
            >
                <MaterialIcons name="add" size={28} color="white" />
            </Pressable>

            <Pressable
                style={styles.aiBtn}
                onPress={() => {
                    if (AIChatInfo) {
                        router.push({
                            pathname: "/chat",
                            params: {
                                chatId: AIChatInfo.chatId,
                                fname: AIChatInfo.user.fname,
                                lname: AIChatInfo.user.lname,
                                userMobile: AIChatInfo.user.mobile,
                                profileImage: AIChatInfo.user.img
                            }
                        });
                    }
                }}
            >
                <FontAwesome5 name="brain" size={24} color="white" />
            </Pressable>

        </SafeAreaView>
    );
}
// --- LIGHT THEME ---
const lightStyles = StyleSheet.create({
    container: {
        paddingHorizontal: 10,
        paddingTop: 10,
        gap: 15,
        backgroundColor: "white",
        flex: 1,
    },
    headerView: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 10,
    },
    headerTxt: {
        fontSize: 16,
        color: "#000000",
    },
    searchView: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#e7e7e7",
        paddingHorizontal: 15,
        borderRadius: 50,
        gap: 10,
    },
    searchInput: {
        color: "#000000",
        flex: 1,
        paddingVertical: 8,
    },
    profilePic: {
        width: 60,
        height: 60,
        borderRadius: 50,
    },
    chatView: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingVertical: 5,
    },
    msgTxt: {
        color: "#a1a1a1",
        fontSize: 14,
    },
    nameTxt: {
        fontSize: 16,
        fontWeight: "600",
        color: "#000000",
    },
    time: {
        flex: 1,
        textAlign: "right",
        color: "#979797",
        fontSize: 12,
    },
    addBtn: {
        position: "absolute",
        bottom: 10,
        right: 10,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: "#005eff",
        alignItems: "center",
        justifyContent: "center",
        elevation: 5,
    },
    aiBtn: {
        position: "absolute",
        bottom: 80,
        right: 12,
        width: 48,
        height: 48,
        borderRadius: 28,
        backgroundColor: "#005eff",
        alignItems: "center",
        justifyContent: "center",
        elevation: 5,
    },
});

// --- DARK THEME ---
const darkStyles = StyleSheet.create({
    container: {
        paddingHorizontal: 10,
        paddingTop: 10,
        gap: 15,
        backgroundColor: "#121212",
        flex: 1,
    },
    headerView: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 10,
    },
    headerTxt: {
        fontSize: 16,
        color: "#e7e7e7", 
    },
    searchView: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#242424",
        paddingHorizontal: 15,
        borderRadius: 50,
        gap: 10,
    },
    searchInput: {
        color: "#e7e7e7",
        flex: 1,
        paddingVertical: 8,
    },
    profilePic: {
        width: 60,
        height: 60,
        borderRadius: 50,
    },
    chatView: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingVertical: 5,
    },
    msgTxt: {
        color: "#bbbbbb",
        fontSize: 14,
    },
    nameTxt: {
        fontSize: 16,
        fontWeight: "600",
        color: "#e7e7e7",
    },
    time: {
        flex: 1,
        textAlign: "right",
        color: "#979797",
        fontSize: 12,
    },
    addBtn: {
        position: "absolute",
        bottom: 10,
        right: 10,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: "#005eff",
        alignItems: "center",
        justifyContent: "center",
        elevation: 5,
    },
    aiBtn: {
        position: "absolute",
        bottom: 80,
        right: 12,
        width: 48,
        height: 48,
        borderRadius: 28,
        backgroundColor: "#005eff",
        alignItems: "center",
        justifyContent: "center",
        elevation: 5,
    },
});

