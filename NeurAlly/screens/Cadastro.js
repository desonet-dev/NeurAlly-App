import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Image
} from 'react-native';
import { useFonts } from 'expo-font';
import { theme } from '../styles/Tema.js';
import paleta from '../styles/Tema.js';

export default function CadastroScreen({ navigation }) {
    // Estado para controlar qual aba está ativa (false = usuário, true = psicólogo)
    const [isPsychologist, setIsPsychologist] = useState(false);

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
                    <Text style={styles.title}>Cadastro</Text>

                    {/* Campos em comum */}
                    <TextInput style={styles.input} placeholder="Nome" placeholderTextColor="#666" />
                    <TextInput style={styles.input} placeholder="Data de nascimento" placeholderTextColor="#666" />
                    <TextInput style={styles.input} placeholder="CPF" placeholderTextColor="#666" keyboardType="numeric" />
                    <TextInput style={styles.input} placeholder="E-mail" placeholderTextColor="#666" keyboardType="email-address" />
                    <TextInput style={styles.input} placeholder="Telefone" placeholderTextColor="#666" keyboardType="phone-pad" />
                    <TextInput style={styles.input} placeholder="Senha" placeholderTextColor="#666" secureTextEntry={true} />

                    {/* Renderização Condicional: Só aparece se for Psicólogo */}
                    {isPsychologist && (
                        <TextInput
                            style={styles.input}
                            placeholder="Número de inscrição no CRP"
                            placeholderTextColor="#666"
                        />
                    )}

                    {/* Link para Login */}
                    <View style={styles.loginLinkContainer}>
                        <Text style={styles.textLink}>Já tem uma conta? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <Text style={styles.textLinkBold}>Entre</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Botão Cadastrar */}
                    <TouchableOpacity style={styles.submitButton} onPress={() => navigation.navigate('Login')}>
                        <Text style={styles.submitButtonText}>Cadastrar</Text>
                    </TouchableOpacity>
                </View>

                {/* Toggle (Alternância de Perfil) */}
                <View style={styles.toggleContainer}>
                    <TouchableOpacity
                        style={[styles.toggleButton, !isPsychologist && styles.toggleActive]}
                        onPress={() => setIsPsychologist(false)}
                    >
                        <Text style={[styles.toggleText, !isPsychologist && styles.toggleTextActive]}>
                            Sou usuário
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.toggleButton, isPsychologist && styles.toggleActive]}
                        onPress={() => setIsPsychologist(true)}
                    >
                        <Text style={[styles.toggleText, isPsychologist && styles.toggleTextActive]}>
                            Sou psicólogo
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Ícones Sociais (Exemplo de placeholders) */}
                <View style={styles.socialContainer}>
                    <TouchableOpacity style={styles.socialIcon}>
                        {/* Substitua pelo ícone/imagem real do Facebook */}
                        <Text style={styles.socialTextPlaceholder}>F</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.socialIcon}>
                        {/* Substitua pelo ícone/imagem real do Google */}
                        <Text style={styles.socialTextPlaceholder}>G</Text>
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
        paddingTop: 60,
        paddingBottom: 30,
        alignItems: 'center',
    },
    card: {
        backgroundColor: '#9EBDF0',
        width: '100%',
        borderRadius: 15,
        padding: 25,
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
        marginBottom: 20,
    },
    input: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        height: 45,
        paddingHorizontal: 15,
        marginBottom: 12,
        fontFamily: 'Montserrat-Regular',
        fontSize: 14,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    loginLinkContainer: {
        flexDirection: 'row',
        alignSelf: 'flex-start',
        marginTop: 5,
        marginBottom: 20,
        marginLeft: 5,
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
        paddingHorizontal: 30,
        borderRadius: 8,
        width: '60%',
        alignItems: 'center',
    },
    submitButtonText: {
        color: '#FFF',
        fontFamily: 'Montserrat-Regular',
        fontSize: 16,
    },

    // Alterar entre cliente e profissional
    toggleContainer: {
        flexDirection: 'row',
        marginTop: 30,
        backgroundColor: '#F0F0F0',
        borderRadius: 25,
        padding: 4,
        width: '90%',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    toggleButton: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 20,
    },
    toggleActive: {
        backgroundColor: '#9EBDF0',
    },
    toggleText: {
        fontFamily: 'Montserrat-Regular',
        fontSize: 14,
        color: '#555',
    },
    toggleTextActive: {
        color: '#000',
        fontFamily: 'Montserrat-Bold',
    },

    // Método de entrada rápida (Google, Facebook)
    socialContainer: {
        flexDirection: 'row',
        marginTop: 30,
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
    },
    socialTextPlaceholder: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1A56DB',
    }
});