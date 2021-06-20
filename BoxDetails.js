import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, Image, Dimensions } from "react-native";
import Animated, {
   useAnimatedGestureHandler,
   useSharedValue,
   useAnimatedStyle,
   withTiming,
   runOnJS,
   useDerivedValue,
} from "react-native-reanimated";
import { PanGestureHandler } from "react-native-gesture-handler";
import * as ImageManipulator from "expo-image-manipulator";
import ViewShot from "react-native-view-shot";

const { width, height } = Dimensions.get("screen");

const AnimatedImage = Animated.createAnimatedComponent(Image);

export default function BoxDetails({ show, setShow, stripCount = 20 }) {
   const prevShownRef = useRef(false);
   const contentRef = useRef(null);
   const [captured, setCaptured] = useState([]);
   const translateX = new Array(stripCount)
      .fill(0)
      .map(() => useSharedValue(width));
   const animatedIndex = useSharedValue(0);
   const opacityIndex = useSharedValue(stripCount - 1);

   useEffect(() => {
      if (prevShownRef.current !== show) {
         prevShownRef.current = show;
         if (show) {
            opacityIndex.value = stripCount - 1;
            animatedIndex.value = 0;
            translateX[0].value = withTiming(0, { duration: 300 });
         }
      }
   }, [show]);

   const onGestureEvent = useAnimatedGestureHandler({
      onStart: ({ absoluteY }, ctx) => {
         animatedIndex.value = ~~(absoluteY / (height / stripCount));
         opacityIndex.value =
            animatedIndex.value > stripCount / 2 ? 0 : stripCount - 1;

         ctx.offsetX = translateX[animatedIndex.value].value;
      },
      onActive: (event, ctx) => {
         let nextX = ctx.offsetX + event.translationX;
         if (nextX < 0) nextX = 0;
         translateX[animatedIndex.value].value = nextX;
      },
      onEnd: (event) => {
         let nextX = 0;
         if (event.velocityX > 800) {
            nextX = width;
         }

         translateX[animatedIndex.value].value = withTiming(
            nextX,
            { duration: 200 },
            (isFinished) => {
               if (isFinished && nextX > 0) {
                  runOnJS(setShow)(false);
               }
            }
         );
      },
   });

   useDerivedValue(() => {
      let inCount = 0;
      let outCount = 0;

      for (let i = animatedIndex.value + 1; i < stripCount; i++) {
         const nextIndex = animatedIndex.value + outCount++;
         translateX[i].value = withTiming(translateX[nextIndex].value, {
            duration: 40,
         });
      }

      for (let i = animatedIndex.value - 1; i >= 0; i--) {
         const nextIndex = animatedIndex.value + inCount--;
         translateX[i].value = withTiming(translateX[nextIndex].value, {
            duration: 40,
         });
      }
   });

   const translateAnimations = translateX.map((_, i) => {
      return useAnimatedStyle(() => {
         return {
            transform: [{ translateX: translateX[i].value }],
            opacity: translateX[opacityIndex.value].value === 0 ? 0 : 1,
         };
      });
   });
   const contentOpacityAnim = useAnimatedStyle(() => {
      return {
         opacity: translateX[opacityIndex.value].value === 0 ? 1 : 0,
      };
   });

   const onImageLoadEnd = async () => {
      const uri = await contentRef.current.capture({
         format: "jpg",
         quality: 0.8,
      });
      Image.getSize(uri, async (width, height) => {
         let reqHeight = height / stripCount;

         let images = [];
         for (let i = 0; i < stripCount; i++) {
            const res = await ImageManipulator.manipulateAsync(
               uri,
               [
                  {
                     crop: {
                        originX: 0,
                        originY: i * reqHeight,
                        width,
                        height: reqHeight,
                     },
                  },
               ],
               { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
            );
            images.push(res.uri);
         }
         setCaptured(images);
      });
   };

   return (
      <View
         pointerEvents={show ? "auto" : "none"}
         style={StyleSheet.absoluteFill}
      >
         <Animated.View style={[StyleSheet.absoluteFill, contentOpacityAnim]}>
            <ViewShot ref={contentRef} style={styles.root}>
               <Image
                  style={StyleSheet.absoluteFill}
                  onLoadEnd={() => onImageLoadEnd()}
                  source={{ uri: "https://loremflickr.com/400/800" }}
               />
            </ViewShot>
         </Animated.View>

         <PanGestureHandler {...{ onGestureEvent }}>
            <Animated.View style={styles.fakeContent(stripCount)}>
               {captured.map((uri, i) => {
                  return (
                     <AnimatedImage
                        key={uri}
                        source={{ uri }}
                        style={[
                           styles.fakeContent(stripCount),
                           translateAnimations[i],
                        ]}
                     />
                  );
               })}
            </Animated.View>
         </PanGestureHandler>
      </View>
   );
}
const styles = StyleSheet.create({
   root: {
      flex: 1,
   },
   fakeContent: (stripCount) => ({
      width,
      height: height / stripCount,
   }),
});
