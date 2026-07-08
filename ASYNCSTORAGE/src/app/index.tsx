import MyButton from "@/components/mybtn";
import { Image, StyleSheet, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Home() {
  return (
    <SafeAreaView style={styles.container}>
      <Image
        source={{
          uri: "https://www.yourtango.com/sites/default/files/image_blog/2024-10/signs-genuinely-kind-pe",
        }}
        style={styles.img}
      />
      <TextInput style={styles.input} placeholder="Type your email" />
      <TextInput style={styles.input} placeholder="Type your password" />
      <MyButton title="Click Me" onPress={() => {
        console.log("Button pressed!");
        alert("Button pressed!");
        }} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f4f4f4",
    alignItems: "center",
  },
  img: {
    width: 200,
    height: 200,
    marginBottom: 20,
    borderRadius: 10,
  },
  input: {
    width: "100%",
    padding: 10,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    backgroundColor: "#fff",
  },
});
