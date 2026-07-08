import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Ionicons from '@expo/vector-icons/Ionicons';
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { FlatList, Image, Keyboard, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Chat() {

    const [chatHistory, setChatHistory] = useState<any[]>([]);
    const [fname, setFname] = useState("");
    const [lname, setLname] = useState("");
    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
    const [text, setText] = useState("");
    const [loggedUser, setLoggedUser] = useState<any>();
    const [darkTheme, setDarkTheme] = useState(true);
    const [profileImage, setProfileImage] = useState("");
    const [isOnline,setIsOnline] = useState(false);
    let lastMsgDate = "";


    const [bgImg, setBgImg] = useState("../../assets/images/chatBgLight.jpg");
    const webSocket = useRef<WebSocket>(null);

    const router = useRouter();
    const params = useLocalSearchParams();
    const chatId = params.chatId;
    const userMobile = params.userMobile;

    const styles = darkTheme ? darkStyles : lightStyles;
    useFocusEffect(() => {
        async function getTheme() {
            try {
                const storedTheme = await AsyncStorage.getItem("darkTheme");
                if (storedTheme !== null) {
                    setDarkTheme(JSON.parse(storedTheme));
                    if (JSON.parse(storedTheme)) {
                        setBgImg("../../assets/images/chatBgDark.jpg");
                    }
                }
            } catch (err) {
                console.error(err);
            }
        }

        getTheme();
    });

    useEffect(() => {

        setFname(params.fname + "");
        setLname(params.lname + "");



        loadChatHistory();
        connectWebSocket();
        const keyboardShowListener = Keyboard.addListener("keyboardDidShow", () => {
            setIsKeyboardVisible(true);
            // console.log("Keyboard open")
        });

        const keyboardHideListener = Keyboard.addListener("keyboardDidHide", () => {
            setIsKeyboardVisible(false);
            // console.log("Keyboard close")

        });

        return () => {
            keyboardShowListener.remove();
            keyboardHideListener.remove();
            webSocket.current?.close();
            // console.log("Websocket Closed");
        };

    }, []);



    async function connectWebSocket() {


        const user = await AsyncStorage.getItem("user");

        let userObj: any;

        if (user) {
            userObj = JSON.parse(user);
            setLoggedUser(userObj);
        }

        const wsUrl = process.env.EXPO_PUBLIC_WS_URL;

        webSocket.current = new WebSocket(wsUrl + "");

        // console.log("Starting websocket");

        webSocket.current.onopen = () => {

            // console.log("Websocket started and connected")
            if (webSocket.current) {
                const data = {
                    type: "register",
                    data: userObj.mobile,
                    chatId: chatId,
                    reciever: userMobile,
                }
                webSocket.current.send(JSON.stringify(data));
            }
        }

        webSocket.current.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.type != "status") {
                 console.log(message);
                setChatHistory(old => addSeperators([message, ...old]));
            } else {
                 console.log("Status update received");
                 if(message.data === "online"){
                    setIsOnline(true);
                 }else{
                    setIsOnline(false);
                 }

                 
                 console.log(message);
            }
        }
    }

    async function loadChatHistory() {

        const user = await AsyncStorage.getItem("user");
        const apiUrl = process.env.EXPO_PUBLIC_API_URL;


        if (apiUrl) {
            if (params.profileImage) {
                setProfileImage(apiUrl + params.profileImage);
            }
        }
        const response = await fetch(apiUrl + "/chat-history/get-chat-history?id=" + chatId);

        const data = await response.json();

        if (response.ok) {


            setChatHistory(addSeperators(data));

        } else {
            alert("Something went wrong");
        }

    }


    function timeFormat(time: string) {
        const date = new Date(time);



        const timeStr = date.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        });


        return timeStr;

    }


    function addSeperators(data: any[]) {
        let output = [];
        let lastMsgDate = "";
        // console.log("Adding seperators");
        // console.log(data);
        for (let i = data.length - 1; i >= 0; i--) {
            if (data[i].type !== "date") {
                let d = new Date(data[i].sent_at);
                // console.log(data[i]);
                if (lastMsgDate !== d.toDateString()) {
                    const pushData = {
                        message: dateFormat(data[i].sent_at) + "",
                        type: "date"
                    }
                    output.push(pushData);
                    // console.log(pushData.message);

                }
                lastMsgDate = d.toDateString();
                const pushData = {
                    message: data[i].message,
                    sent_at: data[i].sent_at,
                    sender: data[i].sender,
                    type: "chat",
                    msg_status_id: data[i].msg_status_id
                }
                // console.log(pushData.message);
                output.push(pushData);
            }
        }
        // console.log("Output");
        // console.log(output);
        output.reverse();
        return output;
    }

    function dateFormat(time: string) {
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
            return "Today";
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


    function stripMarkdownSymbols(message: string) {
        if (!message) return "";

        return message
            .replace(/\*\*(.*?)\*\*/g, "$1")
            .replace(/\*(.*?)\*/g, "$1")
            .replace(/~~(.*?)~~/g, "$1");
    }


    return (


        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
            style={
                !isKeyboardVisible
                    ? [{ flexGrow: 1 }]
                    : [{ flex: 1 }]
            }
            enabled={isKeyboardVisible}
        >
            <SafeAreaView style={styles.container} edges={isKeyboardVisible ? ["top", "left", "right"] : ["top", "left", "right", "bottom"]}>



                <View style={styles.headerView}>
                    <Entypo name="chevron-left" size={24} color={darkTheme ? "#e7e7e7" : "black"} onPress={() => {
                        router.back();
                    }} />
                    <Image
                        source={{ uri: profileImage == "" ? "https://cdn-icons-png.flaticon.com/512/4140/4140073.png" : profileImage }}
                        style={styles.profilePic}
                    />
                    <View style={{ flex: 1, gap: 3 }}>
                        <Text style={styles.nameTxt}>{fname + " " + lname}</Text>
                        <View style={styles.statusView}>
                            <View style={[styles.statusBall, { backgroundColor: isOnline ? "#4CAF50" : "#f44336" }]} />
                            <Text style={styles.statusTxt}>{isOnline ? "Online" : "Offline"}</Text>
                        </View>
                    </View>
                    <Pressable onPress={() => {
                        router.push({
                            pathname: "/contactInfo",
                            params: {
                                fname: fname,
                                lname: lname,
                                mobile: userMobile,
                                img: profileImage,
                                chatId: chatId
                            }
                        })
                    }}>
                        <SimpleLineIcons name="options-vertical" size={16} color={darkTheme ? "#e7e7e7" : "black"} />
                    </Pressable>
                </View>

                <View style={styles.bodyView}>
                    <FlatList
                        data={chatHistory}
                        renderItem={({ item }) => {

                            if (item.type === "chat") {
                                return (
                                    <View style={[styles.messageView, { alignItems: userMobile === item.sender ? "flex-start" : "flex-end" }]}>
                                        <Text style={[styles.message, userMobile === item.sender ? styles.receiveMsg : styles.sendMsg]}>{stripMarkdownSymbols(item.message + "")}</Text>

                                        <View style={styles.timeStatusView}>
                                            <Text style={styles.msgTime}>{timeFormat(item.sent_at)}</Text>

                                            {loggedUser.mobile === item.sender && (
                                                <Ionicons
                                                    name={item.msg_status_id == "2" ? "checkmark-done-outline" : "checkmark-outline"}
                                                    size={14}
                                                    color={item.msg_status_id == "2" ? "#4fc3f7" : "#a1a1a1"}
                                                />
                                            )}
                                        </View>
                                    </View>
                                );
                            } else {
                                return (
                                    <View style={styles.seperatorView}>
                                        <Text style={styles.seperatorTxt}>{(item.message)}</Text>
                                    </View>
                                )
                            }

                        }}
                        inverted
                        showsVerticalScrollIndicator={false}
                        showsHorizontalScrollIndicator={false}
                    />

                </View>
                <View style={styles.inputView}>
                    <TextInput style={styles.input} placeholder='Enter Message' placeholderTextColor={darkTheme ? "#888888" : "#666666"} onChangeText={setText} value={text} />
                    <Pressable style={styles.sendBtn} onPress={() => {

                        if (webSocket.current) {
                            if (text !== "") {
                                const msg = {
                                    message: text,
                                    sent_at: new Date().toISOString(),
                                    sender: loggedUser.mobile,
                                    msg_status_id: 1,
                                }

                                setChatHistory(old => addSeperators([msg, ...old]));
                                const data = {
                                    type: "chat",
                                    data: text,
                                    reciever: userMobile,
                                    sender: loggedUser.mobile,
                                    chatId: chatId,

                                }
                                webSocket.current.send(JSON.stringify(data));
                                setText("");
                            }
                        }

                    }}>
                        <FontAwesome name="send" size={24} color="white" />
                    </Pressable>
                </View>

            </SafeAreaView>

        </KeyboardAvoidingView>



    );


}

const lightStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white"
    },
    headerView: {
        backgroundColor: "white",
        padding: 20,
        flexDirection: "row",
        alignItems: "center",
        gap: 15
    },
    profilePic: {
        width: 50,
        height: 50,
        borderRadius: 50,
    },
    nameTxt: {
        color: "black",
        fontWeight: '500',
        fontSize: 18
    },
    statusView: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5
    },
    statusTxt: {
        color: "#a4a4a4",
        fontSize: 12,
    },
    statusBall: {
        width: 10,
        height: 10,
        borderRadius: 50,
        backgroundColor: "#64fd85"
    },

    bodyView: {
        flex: 1,
        backgroundColor: "#eff3ff",
        padding: 20,
    },
    timeStatusView: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: 4,
        marginRight: 5,
        marginBottom: 2,
    },
    msgTime: {
        color: "#8f8f8f",
        fontSize: 12,

    },

    message: {
        fontWeight: "600",
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 20,
        maxWidth: "90%",
    },

    messageView: {
        width: "100%",
        gap: 5,
    },

    sendMsg: {
        backgroundColor: "#005eff",
        color: "white",
        borderTopRightRadius: 0,
    },

    receiveMsg: {
        backgroundColor: "#ffffff",
        color: "black",
        borderTopLeftRadius: 0,
    },

    seperatorView: {
        alignItems: "center",
        marginVertical: 10,

    },

    seperatorTxt: {
        color: "#696969",
        fontSize: 12,
        backgroundColor: "#e0e5ee",
        padding: 5,
        borderRadius: 5,
        flex: 1,
        paddingHorizontal: 20,
        paddingVertical: 5,
    },


    inputView: {
        backgroundColor: "#eff3ff",
        padding: 20,
        flexDirection: "row",
        alignItems: "center",
        gap: 15,
    },

    input: {
        backgroundColor: "white",
        flex: 1,
        height: 50,
        borderRadius: 20,
        paddingHorizontal: 20,
        paddingVertical: 15,
        color: "black",
    },
    sendBtn: {
        backgroundColor: "#005eff",
        padding: 10,
        borderRadius: 50,
        width: 50,
        height: 50
    },
});

const darkStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#121212"
    },
    headerView: {
        backgroundColor: "#121212",
        padding: 20,
        flexDirection: "row",
        alignItems: "center",
        gap: 15
    },
    profilePic: {
        width: 50,
        height: 50,
        borderRadius: 50,
    },
    nameTxt: {
        color: "#e7e7e7",
        fontWeight: '500',
        fontSize: 18
    },
    statusView: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5
    },
    statusTxt: {
        color: "#a4a4a4",
        fontSize: 12,
    },
    statusBall: {
        width: 10,
        height: 10,
        borderRadius: 50,
        backgroundColor: "#64fd85"
    },

    bodyView: {
        flex: 1,
        backgroundColor: "#1e1e1e",
        padding: 20,
    },
    timeStatusView: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: 4,
        marginRight: 5,
        marginBottom: 2,
    },
    msgTime: {
        color: "#8f8f8f",
        fontSize: 12,
    },

    message: {
        fontWeight: "600",
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 20,
        maxWidth: "90%",
    },

    messageView: {
        width: "100%",
        gap: 5,
    },

    sendMsg: {
        backgroundColor: "#005eff",
        color: "white",
        borderTopRightRadius: 0,
    },

    receiveMsg: {
        backgroundColor: "#2a2a2a",
        color: "#e7e7e7",
        borderTopLeftRadius: 0,
    },
    seperatorView: {
        alignItems: "center",
        marginVertical: 10,

    },

    seperatorTxt: {
        color: "#a1a1a1",
        fontSize: 12,
        backgroundColor: "#2a2a2a",
        padding: 5,
        borderRadius: 5,
        flex: 1,
        paddingHorizontal: 20,
        paddingVertical: 5,
    },


    inputView: {
        backgroundColor: "#1e1e1e",
        padding: 20,
        flexDirection: "row",
        alignItems: "center",
        gap: 15,
    },

    input: {
        backgroundColor: "#2a2a2a",
        flex: 1,
        height: 50,
        borderRadius: 20,
        paddingHorizontal: 20,
        paddingVertical: 15,
        color: "#e7e7e7",
    },
    sendBtn: {
        backgroundColor: "#005eff",
        padding: 10,
        borderRadius: 50,
        width: 50,
        height: 50
    },
});