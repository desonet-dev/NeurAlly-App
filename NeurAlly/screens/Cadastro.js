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
    Image,
    SafeAreaView,
    Alert,
    ActivityIndicator
} from 'react-native';
import { useFonts } from 'expo-font';
import SocialButtons from '../components/SocialButtons.js';
import useLoginGoogle from '../hooks/useLoginGoogle.js';
import { cadastrarUsuario, traduzErroFirebase } from '../services/authService.js';
import { useAuth } from '../contexts/AuthContext.js';

import { useEstilos } from '../contexts/TemaContext.js';
import { campoWeb } from '../styles/campos.js';
import { formatarCpf, formatarDataNascimento, formatarTelefone } from '../utils/formatacao.js';
import LinksLegais from '../components/LinksLegais.js';
export default function CadastroScreen({ navigation }) {
  const [styles, cor] = useEstilos(criarStyles);
    const [isPsychologist, setIsPsychologist] = useState(false);

    const [nome, setNome] = useState('');
    const [dataNascimento, setDataNascimento] = useState('');
    const [cpf, setCpf] = useState('');
    const [email, setEmail] = useState('');
    const [telefone, setTelefone] = useState('');
    const [senha, setSenha] = useState('');
    const [crp, setCrp] = useState('');
    const [cadastrando, setCadastrando] = useState(false);
    const { entrarComGoogle } = useLoginGoogle(navigation);
    const { recarregarPerfil } = useAuth();

    const [fontsLoaded] = useFonts({
        'Montserrat-Regular': require('../styles/fonts/Montserrat/static/Montserrat-Regular.ttf'),
        'Montserrat-Bold': require('../styles/fonts/Montserrat/static/Montserrat-Bold.ttf'),
    });

    if (!fontsLoaded) return null;

    const handleCadastrar = async () => {
        if (!nome.trim() || !email.trim() || !senha) {
            Alert.alert('Preencha os campos', 'Nome, e-mail e senha são obrigatórios.');
            return;
        }
        if (senha.length < 6) {
            Alert.alert('Senha muito curta', 'A senha precisa ter pelo menos 6 caracteres.');
            return;
        }
        if (isPsychologist && !crp.trim()) {
            Alert.alert('Preencha o CRP', 'Informe o número de inscrição no CRP para se cadastrar como psicólogo.');
            return;
        }

        setCadastrando(true);
        try {
            await cadastrarUsuario({
                nome: nome.trim(),
                email: email.trim(),
                senha,
                tipo: isPsychologist ? 'psicologo' : 'cliente',
                dataNascimento: dataNascimento.trim(),
                cpf: cpf.trim(),
                telefone: telefone.trim(),
                crp: crp.trim(),
            });

            // O Firebase avisa o app da nova conta antes de o perfil ser gravado no Firestore;
            // recarrega agora para o nome informado no cadastro aparecer nas telas.
            try {
                await recarregarPerfil();
            } catch (e) {
                console.warn('Não foi possível recarregar o perfil após o cadastro:', e);
            }

            navigation.reset({
                index: 0,
                routes: [{ name: isPsychologist ? 'HomePsi' : 'Home' }],
            });
        } catch (erro) {
            Alert.alert('Não foi possível cadastrar', traduzErroFirebase(erro));
        } finally {
            setCadastrando(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

                {/* Card Azul Claro */}
                <View style={styles.card}>
                    <Text style={styles.title}>Cadastro</Text>

                    {/* Campos em comum */}
                    <TextInput style={styles.input} placeholder="Nome" placeholderTextColor={cor.fg("#666")} value={nome} onChangeText={setNome} editable={!cadastrando} />
                    <TextInput style={styles.input} placeholder="Data de nascimento (DD/MM/AAAA)" placeholderTextColor={cor.fg("#666")} keyboardType="numeric" maxLength={10} value={dataNascimento} onChangeText={(t) => setDataNascimento(formatarDataNascimento(t))} editable={!cadastrando} />
                    <TextInput style={styles.input} placeholder="CPF" placeholderTextColor={cor.fg("#666")} keyboardType="numeric" maxLength={14} value={cpf} onChangeText={(t) => setCpf(formatarCpf(t))} editable={!cadastrando} />
                    <TextInput style={styles.input} placeholder="E-mail" placeholderTextColor={cor.fg("#666")} keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} editable={!cadastrando} />
                    <TextInput style={styles.input} placeholder="Telefone" placeholderTextColor={cor.fg("#666")} keyboardType="phone-pad" maxLength={15} value={telefone} onChangeText={(t) => setTelefone(formatarTelefone(t))} editable={!cadastrando} />
                    <TextInput style={styles.input} placeholder="Senha" placeholderTextColor={cor.fg("#666")} secureTextEntry={true} value={senha} onChangeText={setSenha} editable={!cadastrando} />

                    {/* Renderização Condicional: Só aparece se for Psicólogo */}
                    {isPsychologist && (
                        <TextInput
                            style={styles.input}
                            placeholder="Número de inscrição no CRP"
                            placeholderTextColor={cor.fg("#666")}
                            value={crp}
                            onChangeText={setCrp}
                            editable={!cadastrando}
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
                    <TouchableOpacity
                        style={[styles.submitButton, cadastrando && styles.submitButtonDisabled]}
                        onPress={handleCadastrar}
                        disabled={cadastrando}
                    >
                        {cadastrando ? (
                            <ActivityIndicator size="small" color={cor.fg("#FFF")} />
                        ) : (
                            <Text style={styles.submitButtonText}>Cadastrar</Text>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Termos e política de privacidade */}
                <LinksLegais navigation={navigation} />

                {/* Toggle (Alternância de Perfil) */}
                <View style={styles.toggleContainer}>
                    <TouchableOpacity
                        style={[styles.toggleButton, !isPsychologist && styles.toggleActive]}
                        onPress={() => setIsPsychologist(false)}
                        disabled={cadastrando}
                    >
                        <Text style={[styles.toggleText, !isPsychologist && styles.toggleTextActive]}>
                            Sou usuário
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.toggleButton, isPsychologist && styles.toggleActive]}
                        onPress={() => setIsPsychologist(true)}
                        disabled={cadastrando}
                    >
                        <Text style={[styles.toggleText, isPsychologist && styles.toggleTextActive]}>
                            Sou psicólogo
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Ícones Sociais */}
                <SocialButtons style={{ marginTop: 30 }} onGooglePress={entrarComGoogle} />

            </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const criarStyles = (cor) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: cor.bg('#FFF'),
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 30,
        alignItems: 'center',
    },
    card: {
        backgroundColor: cor.bg('#9EBDF0'),
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
        color: cor.fg('#000'),
        marginBottom: 20,
    },
    input: {
        width: '100%',
        backgroundColor: cor.bg('#FFF'),
        color: cor.fg('#333'),
        ...campoWeb(cor),
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
        color: cor.fg('#333'),
    },
    textLinkBold: {
        fontFamily: 'Montserrat-Bold',
        fontSize: 12,
        color: cor.fg('#1A56DB'),
    },
    submitButton: {
        backgroundColor: cor.bg('#2563EB'),
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 8,
        width: '60%',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 44,
    },
    submitButtonDisabled: {
        opacity: 0.7,
    },
    submitButtonText: {
        color: cor.fg('#FFF'),
        fontFamily: 'Montserrat-Regular',
        fontSize: 16,
    },
    toggleContainer: {
        flexDirection: 'row',
        marginTop: 30,
        backgroundColor: cor.bg('#F0F0F0'),
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
        backgroundColor: cor.bg('#9EBDF0'),
    },
    toggleText: {
        fontFamily: 'Montserrat-Regular',
        fontSize: 14,
        color: cor.fg('#555'),
    },
    toggleTextActive: {
        color: cor.fg('#000'),
        fontFamily: 'Montserrat-Bold',
    }
});
