import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { useFonts } from 'expo-font';
import paleta from '../styles/Tema.js';

export default function LoginScreen({ navigation }) {
    const [fontsLoaded] = useFonts({
        'Montserrat-Regular': require('../styles/fonts/Montserrat/static/Montserrat-Regular.ttf'),
        'Montserrat-Bold': require('../styles/fonts/Montserrat/static/Montserrat-Bold.ttf'),
    });

    if (!fontsLoaded) return null;

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Card Azul Claro */}
                <View style={styles.card}>
                    <Text style={styles.title}>Login</Text>

                    <TextInput
                        style={styles.input}
                        placeholder="E-mail"
                        placeholderTextColor="#666"
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Senha"
                        placeholderTextColor="#666"
                        secureTextEntry={true}
                    />

                    {/* Links de Acesso */}
                    <View style={styles.linksContainer}>
                        <View style={styles.linkRow}>
                            <Text style={styles.textLink}>Esqueceu sua senha? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('EsqueciSenha')}>
                                <Text style={styles.textLinkBold}>Redefini-a</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.linkRow}>
                            <Text style={styles.textLink}>Não tem uma conta? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Cadastro')}>
                                <Text style={styles.textLinkBold}>Crie uma</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Botão Entrar */}
                    <TouchableOpacity
                        style={styles.submitButton}
                        onPress={() => navigation.navigate('Home')} // Ajuste para o nome da sua tela inicial
                    >
                        <Text style={styles.submitButtonText}>Entrar</Text>
                    </TouchableOpacity>
                </View>

                {/* Ícones Sociais */}
                <View style={styles.socialContainer}>
                    <TouchableOpacity style={styles.socialIcon}>
                        <Text style={styles.socialTextPlaceholder}>f</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.socialIcon}>
                        <Text style={[styles.socialTextPlaceholder, { color: '#DB4437' }]}>G</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 80,
        paddingBottom: 30,
        alignItems: 'center',
    },
    card: {
        backgroundColor: '#9EBDF0',
        width: '100%',
        borderRadius: 15,
        padding: 25,
        paddingVertical: 40, // Um pouco mais de espaço vertical no login
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    title: {
        fontSize: 28,
        fontFamily: 'Montserrat-Regular',
        color: '#000',
        marginBottom: 30,
    },
    input: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        height: 45,
        paddingHorizontal: 15,
        marginBottom: 15,
        fontFamily: 'Montserrat-Regular',
        fontSize: 14,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    linksContainer: {
        width: '100%',
        alignItems: 'flex-start',
        marginTop: 5,
        marginBottom: 30,
        paddingLeft: 5,
    },
    linkRow: {
        flexDirection: 'row',
        marginBottom: 5,
    },
    textLink: {
        fontFamily: 'Montserrat-Regular',
        fontSize: 12,
        color: '#333',
    },
    textLinkBold: {
        fontFamily: 'Montserrat-Bold',
        fontSize: 12,
        color: '#1A56DB',
    },
    submitButton: {
        backgroundColor: '#2563EB',
        paddingVertical: 12,
        paddingHorizontal: 40,
        borderRadius: 8,
        alignItems: 'center',
    },
    submitButtonText: {
        color: '#FFF',
        fontFamily: 'Montserrat-Regular',
        fontSize: 16,
    },
    socialContainer: {
        flexDirection: 'row',
        marginTop: 40,
        gap: 20,
    },
    socialIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    socialTextPlaceholder: {
        fontSize: 24,
        fontFamily: 'Montserrat-Bold',
        color: '#1877F2', // Azul do facebook
    }
});