import { useCallback, useEffect, useState } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

import Animated, {
    useSharedValue,
    withTiming,
    useAnimatedStyle,
    Easing,
} from 'react-native-reanimated';
import { useAuth } from '../contexts/AuthContext.js';
import { lerTipoLocal } from '../services/perfilLocal.js';

SplashScreen.preventAutoHideAsync();

export default function Carregamento({ navigation }) {
    const [isReady, setIsReady] = useState(false);
    const translateX = useSharedValue(300);
    const { usuario, perfil, erroPerfil, carregando: autenticando } = useAuth();

    useEffect(() => {
        async function prepare() {
            try {
            } finally {
                setIsReady(true);
            }
        }
        prepare();
    }, []);

    useEffect(() => {
        if (isReady) {
            SplashScreen.hideAsync();
            translateX.value = withTiming(0, {
                duration: 600,
                easing: Easing.out(Easing.exp),
            });
        }
    }, [isReady]);

    useEffect(() => {
        if (!isReady || autenticando) return;

        let cancelado = false;

        const timer = setTimeout(async () => {
            if (!usuario) {
                navigation.replace('Login');
                return;
            }

            let tipo = perfil?.tipo;

            if (!tipo && erroPerfil) {
                tipo = await lerTipoLocal(usuario.uid);
                if (cancelado) return;
                if (!tipo) {
                    navigation.replace('Login', {
                        aviso: 'Não foi possível carregar seu perfil. Verifique sua conexão e entre novamente.',
                    });
                    return;
                }
            }

            if (cancelado) return;

            if (!tipo) {
                navigation.replace('CompletarCadastro', {
                    nome: usuario.displayName || '',
                    email: usuario.email || '',
                });
            } else if (tipo === 'psicologo') {
                navigation.replace('HomePsi');
            } else {
                navigation.replace('Home');
            }
        }, 1200);

        return () => {
            cancelado = true;
            clearTimeout(timer);
        };
    }, [isReady, autenticando, usuario, perfil, erroPerfil, navigation]);

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
