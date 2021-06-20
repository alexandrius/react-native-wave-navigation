import React, { useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import BoxDetails from "./BoxDetails";

export default function App() {
   const [detailsVisible, setDetailsVisible] = useState(false);
   return (
      <View style={styles.container}>
         <TouchableOpacity
            style={{ marginTop: 200 }}
            onPress={() => setDetailsVisible(true)}
         >
            <Text>Click me</Text>
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
