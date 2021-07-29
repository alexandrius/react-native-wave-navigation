import React, { useState } from "react";
import {
   StyleSheet,
   Text,
   Image,
   View,
   TouchableOpacity,
   StatusBar,
} from "react-native";
import BoxDetails from "./BoxDetails";

StatusBar.setBarStyle("dark-content");

export default function App() {
   const [detailsVisible, setDetailsVisible] = useState(false);
   return (
      <View style={styles.container}>
         <TouchableOpacity
            style={{
               marginTop: 200,
               alignItems: "center",
               backgroundColor: "rgb(235,235,240)",
               marginHorizontal: 20,
               borderRadius: 50,
            }}
            onPress={() => setDetailsVisible(true)}
         >
            <Image
               source={require("./assets/headphones.png")}
               style={{ height: 200, width: 200, marginTop: 40 }}
               resizeMode="contain"
            />

            <Text
               style={{
                  fontSize: 20,
                  marginTop: 40,
                  marginBottom: 40,
                  color: "rgb(0,64,221)",
               }}
            >
               Open headphone details
            </Text>
         </TouchableOpacity>
         <BoxDetails show={detailsVisible} setShow={setDetailsVisible} />
      </View>
   );
}

const styles = StyleSheet.create({
   container: {
      flex: 1,
   },
});
