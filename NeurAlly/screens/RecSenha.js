import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    Alert,
    ActivityIndicator
} from 'react-native';
import { useFonts } from 'expo-font';
import Ionicons from '@expo/vector-icons/Ionicons';
import { recuperarSenha, traduzErroFirebase } from '../services/authService.js';

import { useEstilos } from '../contexts/TemaContext.js';
export default function EsqueciSenhaScreen({ navigation }) {
  const [styles, cor] = useEstilos(criarStyles);
    const [email, setEmail] = useState('');
    const [enviando, setEnviando] = useState(false);

    const [fontsLoaded] = useFonts({
        'Montserrat-Regular': require('../styles/fonts/Montserrat/static/Montserrat-Regular.ttf'),
        'Montserrat-Bold': require('../styles/fonts/Montserrat/static/Montserrat-Bold.ttf'),
    });

    if (!fontsLoaded) return null;

    const handleEnviar = async () => {
        if (!email.trim()) {
            Alert.alert('Digite seu e-mail', 'Informe o e-mail da sua conta para receber o link de redefinição.');
            return;
        }

        setEnviando(true);
        try {
            await recuperarSenha({ email: email.trim() });
            Alert.alert(
                'E-mail enviado',
                'Verifique sua caixa de entrada para redefinir sua senha.',
                [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
            );
        } catch (erro) {
            Alert.alert('Não foi possível enviar', traduzErroFirebase(erro));
        } finally {
            setEnviando(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                {/* Botão de voltar sutil no topo (opcional, mas recomendado) */}
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={28} color={cor.fg("#333")} />
                </TouchableOpacity>

                <View style={styles.content}>
                    <View style={styles.card}>
                        <Text style={styles.title}>Alterar a senha</Text>

                        <Text style={styles.description}>
                            Coloque o seu e-mail abaixo para enviarmos uma mensagem para a alteração de sua senha.
                        </Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Digite seu E-mail"
                            placeholderTextColor={cor.fg("#666")}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={email}
                            onChangeText={setEmail}
                            editable={!enviando}
                        />

                        <TouchableOpacity
                            style={[styles.submitButton, enviando && styles.submitButtonDisabled]}
                            onPress={handleEnviar}
                            disabled={enviando}
                        >
                            {enviando ? (
                                <ActivityIndicator size="small" color={cor.fg("#FFF")} />
                            ) : (
                                <Text style={styles.submitButtonText}>Enviar e-mail</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const criarStyles = (cor) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: cor.bg('#FFF'),
    },
    keyboardView: {
        flex: 1,
    },
    backButton: {
        padding: 20,
        alignSelf: 'flex-start',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        justifyContent: 'center',
        paddingBottom: 50,
    },
    card: {
        backgroundColor: cor.bg('#9EBDF0'),
        width: '100%',
        borderRadius: 15,
        padding: 25,
        paddingVertical: 40,
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    title: {
        fontSize: 26,
        fontFamily: 'Montserrat-Regular',
        color: cor.fg('#000'),
        marginBottom: 20,
        textAlign: 'center',
    },
    description: {
        fontSize: 13,
        fontFamily: 'Montserrat-Regular',
        color: cor.fg('#333'),
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 30,
        paddingHorizontal: 10,
    },
    input: {
        width: '100%',
        backgroundColor: cor.bg('#FFF'),
        borderRadius: 8,
        height: 45,
        paddingHorizontal: 15,
        marginBottom: 30,
        fontFamily: 'Montserrat-Regular',
        fontSize: 14,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    submitButton: {
        backgroundColor: cor.bg('#2563EB'),
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 44,
        minWidth: 160,
    },
    submitButtonDisabled: {
        opacity: 0.7,
    },
    submitButtonText: {
        color: cor.fg('#FFF'),
        fontFamily: 'Montserrat-Regular',
        fontSize: 16,
    }
});