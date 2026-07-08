import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.text}>Hello</Text>

      <TouchableOpacity
        style={styles.btn}
        onPress={() => {
          console.log("Log1");
          console.log("Log2");

          const startTime = Date.now();

          while (Date.now() - startTime < 5000) {}

          console.log("Log3");
          console.log("Log4");
          console.log("Log5");
        }}
      >
        <Text style={styles.btnTxt}>Button1</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.btn}
        onPress={() => {
          console.log("Log1");
          console.log("Log2");

          setTimeout(() => {
            console.log("Log3");
          }, 5000);

          console.log("Log4");
          console.log("Log5");
        }}
      >
        <Text style={styles.btnTxt}>Button2</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btn}>
        <Text style={styles.btnTxt}>Button3</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: "100%",
    padding: 10,
    alignItems: "center",
    backgroundColor: "blue",
    borderRadius: 15,
  },
  btnTxt: {
    color: "white",
    fontSize: 15,
    fontWeight: "bold",
  },

  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
  },

  text: {
    fontSize: 18,
  },
});

const loadData = async () => {
  try{
    const user = await loadUser();
    console.log(user);
  }
  catch(error){
    console.log(error);
  }
}
