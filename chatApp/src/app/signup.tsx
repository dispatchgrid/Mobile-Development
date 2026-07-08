import AntDesign from "@expo/vector-icons/AntDesign";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Signup() {
  const [accepted, setAccepted] = useState(false);
  const route = useRouter();
  const [fname, setfname] = useState("");
  const [lname, setlname] = useState("");
  const [mobile, setmobile] = useState("");
  const [password, setpassword] = useState("");
  const [cpassword, setcpassword] = useState("");
  async function signUpRequest() {
    if (fname != "" && lname != "" && mobile != "" && password != "" && cpassword != "") {
      if (password == cpassword) {
        if (accepted != false) {
          const signupData = {
            fname: fname,
            lname: lname,
            mobile: mobile,
            password: password,
          };
          try {
            const apiUrl = process.env.EXPO_PUBLIC_API_URL;

            const response = await fetch(apiUrl + "/user/signup", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(signupData),
            });
            if (response.status === 200) {
              console.log("Signup successful");
              alert("Signup successful!");
            } else if (response.status === 400) {
              alert("Mobile number already exists.");
            } else {
              console.error("Signup failed with unexpected status:", response.status);
              alert("Signup failed. Please try again.");
            }
          } catch (error) {
            console.error("Error during signup:", error);
            alert("An error occurred during signup. Please try again later.");
          }
        } else {
          alert("Please accept the Privacy Policy and Terms of Use.");
        }
      } else {
        alert("Passwords do not match.");
      }
    } else {
      alert("Please fill all the fields.");
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "height" : "padding"}>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            gap: 18,
            alignItems: "center",
            padding: 20,
          }}>
          <Image source={require("../../assets/images/bg-signin.jpg")} style={styles.img} />
          <View style={styles.textView}>
            <Text style={styles.titleTxt}>Sign Up</Text>
            <Text style={styles.descriptionTxt}>Create an account to get started</Text>
          </View>

          <View style={styles.inputView}>
            <AntDesign name="mobile" size={20} color="#696969" />
            <TextInput style={styles.input} placeholder="Enter your Mobile" keyboardType="phone-pad" onChangeText={setmobile} />
          </View>

          <View style={styles.inputView}>
            <AntDesign name="user" size={20} color="#696969" />
            <TextInput style={styles.input} placeholder="Enter your First Name" onChangeText={setfname} />
          </View>

          <View style={styles.inputView}>
            <AntDesign name="user" size={20} color="#696969" />
            <TextInput style={styles.input} placeholder="Enter your Last Name" onChangeText={setlname} />
          </View>

          <View style={styles.inputView}>
            <MaterialIcons name="lock-outline" size={24} color="#696969" />
            <TextInput style={styles.input} placeholder="Enter your Password" secureTextEntry onChangeText={setpassword} />
          </View>

          <View style={styles.inputView}>
            <MaterialIcons name="lock-outline" size={24} color="#696969" />
            <TextInput style={styles.input} placeholder="Confirm your Password" secureTextEntry onChangeText={setcpassword} />
          </View>
          <View style={styles.checkboxRow}>
            <Pressable onPress={() => setAccepted(!accepted)} style={[styles.checkbox, accepted && styles.checkboxChecked]}>
              {accepted && <FontAwesome name="check" size={12} color="white" />}
            </Pressable>
            <Text style={styles.policyText}>
              {"I accept the "}
              <Text style={styles.policyLink}>Privacy Policy</Text>
              {" and "}
              <Text style={styles.policyLink}>Terms of Use</Text>
            </Text>
          </View>

          <Pressable
            style={styles.btn}
            onPress={() => {
              console.log(fname, lname, mobile, password, cpassword);
              signUpRequest();
            }}>
            <Text style={styles.btnTxt}>Sign Up</Text>
          </Pressable>

          <View style={{ flexDirection: "row", gap: 5 }}>
            <Text style={{ color: "#8b8b8b" }}>Already have an account?</Text>
            <Pressable onPress={() => route.back()}>
              <Text style={{ fontWeight: "bold", fontSize: 15 }}>Sign in</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
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
    alignItems: "center",
  },
  container: {
    flex: 1,
    backgroundColor: "white",
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
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    gap: 10,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: "#0066ff",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
  },
  checkboxChecked: {
    backgroundColor: "#0066ff",
  },
  policyText: {
    color: "#8b8b8b",
    fontSize: 13,
    flexShrink: 1,
  },
  policyLink: {
    color: "#0066ff",
    fontWeight: "600",
    fontSize: 13,
  },
});
