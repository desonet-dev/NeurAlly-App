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
    SafeAreaView,
    ActivityIndicator,
} from 'react-native';
import { useFonts } from 'expo-font';
import Ionicons from '@expo/vector-icons/Ionicons';
import paleta from '../styles/Tema.js';
import SocialButtons from '../components/SocialButtons.js';
import { buscarPerfilComTentativas, entrarComEmailSenha, rotaInicial, traduzErroFirebase } from '../services/authService.js';
import useLoginGoogle from '../hooks/useLoginGoogle.js';

export default function LoginScreen({ navigation, route }) {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [entrando, setEntrando] = useState(false);
    // Aviso mostrado na própria tela (Alert.alert não aparece no navegador/react-native-web).
    const [aviso, setAviso] = useState(route?.params?.aviso || '');
    const [campoInvalido, setCampoInvalido] = useState({ email: false, senha: false });
    const { entrarComGoogle } = useLoginGoogle(navigation);

    const [fontsLoaded] = useFonts({
        'Montserrat-Regular': require('../styles/fonts/Montserrat/static/Montserrat-Regular.ttf'),
        'Montserrat-Bold': require('../styles/fonts/Montserrat/static/Montserrat-Bold.ttf'),
    });

    if (!fontsLoaded) return null;

    const limparAviso = () => {
        setAviso('');
        setCampoInvalido({ email: false, senha: false });
    };

    const handleEntrar = async () => {
        const emailVazio = !email.trim();
        const senhaVazia = !senha;

        if (emailVazio || senhaVazia) {
            setCampoInvalido({ email: emailVazio, senha: senhaVazia });
            if (emailVazio && senhaVazia) setAviso('Preencha o e-mail e a senha para entrar.');
            else if (emailVazio) setAviso('Digite seu e-mail para entrar.');
            else setAviso('Digite sua senha para entrar.');
            return;
        }

        limparAviso();
        setEntrando(true);
        try {
            const usuario = await entrarComEmailSenha({ email: email.trim(), senha });
            const perfil = await buscarPerfilComTentativas(usuario.uid);

            const rota = rotaInicial(perfil);
            navigation.reset({
                index: 0,
                routes: [{
                    name: rota,
                    params: rota === 'CompletarCadastro' ? { nome: usuario.displayName || '', email: usuario.email || '' } : undefined,
                }],
            });
        } catch (erro) {
            setAviso(traduzErroFirebase(erro));
        } finally {
            setEntrando(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

                <View style={styles.card}>
                    <Text style={styles.title}>Login</Text>

                    <TextInput
                        style={[styles.input, campoInvalido.email && styles.inputInvalido]}
                        placeholder="E-mail"
                        placeholderTextColor="#666"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={email}
                        onChangeText={(texto) => {
                            setEmail(texto);
                            if (aviso || campoInvalido.email) limparAviso();
                        }}
                        editable={!entrando}
                    />
                    <TextInput
                        style={[styles.input, campoInvalido.senha && styles.inputInvalido]}
                        placeholder="Senha"
                        placeholderTextColor="#666"
                        secureTextEntry={true}
                        value={senha}
                        onChangeText={(texto) => {
                            setSenha(texto);
                            if (aviso || campoInvalido.senha) limparAviso();
                        }}
                        editable={!entrando}
                    />

                    {/* Aviso de erro (campos vazios ou falha no login) */}
                    {!!aviso && (
                        <View style={styles.avisoBox} accessibilityRole="alert" accessibilityLiveRegion="polite">
                            <Ionicons name="alert-circle" size={18} color="#D64545" style={{ marginRight: 8 }} />
                            <Text style={styles.avisoTexto}>{aviso}</Text>
                        </View>
                    )}

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
                        style={[styles.submitButton, entrando && styles.submitButtonDisabled]}
                        onPress={handleEntrar}
                        disabled={entrando}
                    >
                        {entrando ? (
                            <ActivityIndicator size="small" color="#FFF" />
                        ) : (
                            <Text style={styles.submitButtonText}>Entrar</Text>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Ícones Sociais */}
                <SocialButtons style={{ marginTop: 40 }} onGooglePress={entrarComGoogle} />

            </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: paleta.cor.fundoAuth,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 80,
        paddingBottom: 30,
        alignItems: 'center',
    },
    card: {
        backgroundColor: paleta.cor.fundoCard,
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
        fontSize: 28,
        fontFamily: 'Montserrat-Regular',
        color: '#000',
        marginBottom: 30,
    },
    input: {
        width: '100%',
        backgroundColor: paleta.cor.fundoAuth,
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
    inputInvalido: {
        borderWidth: 1.5,
        borderColor: '#D64545',
    },
    avisoBox: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FDEDED',
        borderWidth: 1,
        borderColor: '#F5C2C2',
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 12,
        marginTop: 5,
    },
    avisoTexto: {
        flex: 1,
        fontFamily: 'Montserrat-Regular',
        fontSize: 12,
        color: '#B03030',
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
        minWidth: 120,
        justifyContent: 'center',
    },
    submitButtonDisabled: {
        opacity: 0.7,
    },
    submitButtonText: {
        color: '#FFF',
        fontFamily: 'Montserrat-Regular',
        fontSize: 16,
    }
});
