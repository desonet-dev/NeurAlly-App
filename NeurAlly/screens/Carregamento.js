import { useCallback, useEffect, useState } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

import Animated, {
    useSharedValue,
    withTiming,
    useAnimatedStyle,
    Easing,
} from 'react-native-reanimated';

SplashScreen.preventAutoHideAsync();

export default function App() {
    const [isReady, setIsReady] = useState(false);
    const translateX = useSharedValue(300); // start off-screen to the right

    useEffect(() => {
        async function prepare() {
            try {
                // load resources here
            } finally {
                setIsReady(true);
            }
        }
        prepare();
    }, []);

    useEffect(() => {
        if (isReady) {
            SplashScreen.hideAsync();
            // Trigger slide-in animation
            translateX.value = withTiming(0, {
                duration: 600,
                easing: Easing.out(Easing.exp),
            });
        }
    }, [isReady]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
    }));

    if (!isReady) return null;

    return (
        <View style={styles.container}>
            <Image source={require('../assets/Logo.png')} style={styles.image} />
            <Animated.Text style={[styles.text, animatedStyle]}>
                NeurAlly
            </Animated.Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000',
        borderColor: '#00F',
        borderRadius: 10,
    },
    image: {
        height: 70,
        width: 70,
        margin: 5,
    }
});
