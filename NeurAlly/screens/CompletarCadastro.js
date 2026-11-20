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
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useFonts } from 'expo-font';
import { auth } from '../services/firebaseConfig.js';
import { completarPerfil, traduzErroFirebase } from '../services/authService.js';
import { useAuth } from '../contexts/AuthContext.js';

import { useEstilos } from '../contexts/TemaContext.js';
// Tela de primeiro acesso: aparece quando a pessoa entrou (ex.: com Google) mas ainda
// não escolheu se é cliente ou psicólogo. Cria o documento usuarios/{uid}.
function avisar(titulo, mensagem) {
    if (Platform.OS === 'web') {
        window.alert(`${titulo}\n\n${mensagem}`);
    } else {
        Alert.alert(titulo, mensagem);
    }
}

export default function CompletarCadastroScreen({ navigation, route }) {
  const [styles, cor] = useEstilos(criarStyles);
    const { recarregarPerfil, sair } = useAuth();

    const [isPsychologist, setIsPsychologist] = useState(false);
    const [nome, setNome] = useState(route?.params?.nome || '');
    const email = route?.params?.email || auth.currentUser?.email || '';
    const [dataNascimento, setDataNascimento] = useState('');
    const [cpf, setCpf] = useState('');
    const [telefone, setTelefone] = useState('');
    const [crp, setCrp] = useState('');
    const [salvando, setSalvando] = useState(false);

    const [fontsLoaded] = useFonts({
        'Montserrat-Regular': require('../styles/fonts/Montserrat/static/Montserrat-Regular.ttf'),
        'Montserrat-Bold': require('../styles/fonts/Montserrat/static/Montserrat-Bold.ttf'),
    });

    if (!fontsLoaded) return null;

    const handleConcluir = async () => {
        const uid = auth.currentUser?.uid;
        if (!uid) {
            avisar('Sessão expirada', 'Entre novamente para continuar.');
            navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
            return;
        }
        if (!nome.trim()) {
            avisar('Preencha o nome', 'Informe seu nome para continuar.');
            return;
        }
        if (isPsychologist && !crp.trim()) {
            avisar('Preencha o CRP', 'Informe o número de inscrição no CRP para se cadastrar como psicólogo.');
            return;
        }

        setSalvando(true);
        try {
            await completarPerfil(uid, {
                nome: nome.trim(),
                email,
                tipo: isPsychologist ? 'psicologo' : 'cliente',
                dataNascimento: dataNascimento.trim(),
                cpf: cpf.trim(),
                telefone: telefone.trim(),
                crp: crp.trim(),
            });
            await recarregarPerfil();

            navigation.reset({
                index: 0,
                routes: [{ name: isPsychologist ? 'HomePsi' : 'Home' }],
            });
        } catch (erro) {
            avisar('Não foi possível salvar', traduzErroFirebase(erro));
        } finally {
            setSalvando(false);
        }
    };

    const usarOutraConta = async () => {
        try {
            await sair();
        } finally {
            navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
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
                        <Text style={styles.title}>Quase lá!</Text>
                        <Text style={styles.subtitle}>Complete seu cadastro para continuar.</Text>

                        <TextInput style={styles.input} placeholder="Nome" placeholderTextColor={cor.fg("#666")} value={nome} onChangeText={setNome} editable={!salvando} />
                        <TextInput style={[styles.input, styles.inputBloqueado]} placeholder="E-mail" placeholderTextColor={cor.fg("#666")} value={email} editable={false} />
                        <TextInput style={styles.input} placeholder="Data de nascimento" placeholderTextColor={cor.fg("#666")} value={dataNascimento} onChangeText={setDataNascimento} editable={!salvando} />
                        <TextInput style={styles.input} placeholder="CPF" placeholderTextColor={cor.fg("#666")} keyboardType="numeric" value={cpf} onChangeText={setCpf} editable={!salvando} />
                        <TextInput style={styles.input} placeholder="Telefone" placeholderTextColor={cor.fg("#666")} keyboardType="phone-pad" value={telefone} onChangeText={setTelefone} editable={!salvando} />

                        {isPsychologist && (
                            <TextInput
                                style={styles.input}
                                placeholder="Número de inscrição no CRP"
                                placeholderTextColor={cor.fg("#666")}
                                value={crp}
                                onChangeText={setCrp}
                                editable={!salvando}
                            />
                        )}

                        <TouchableOpacity
                            style={[styles.submitButton, salvando && styles.submitButtonDisabled]}
                            onPress={handleConcluir}
                            disabled={salvando}
                        >
                            {salvando ? (
                                <ActivityIndicator size="small" color={cor.fg("#FFF")} />
                            ) : (
                                <Text style={styles.submitButtonText}>Concluir</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Toggle (Alternância de Perfil) */}
                    <View style={styles.toggleContainer}>
                        <TouchableOpacity
                            style={[styles.toggleButton, !isPsychologist && styles.toggleActive]}
                            onPress={() => setIsPsychologist(false)}
                            disabled={salvando}
                        >
                            <Text style={[styles.toggleText, !isPsychologist && styles.toggleTextActive]}>
                                Sou usuário
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.toggleButton, isPsychologist && styles.toggleActive]}
                            onPress={() => setIsPsychologist(true)}
                            disabled={salvando}
                        >
                            <Text style={[styles.toggleText, isPsychologist && styles.toggleTextActive]}>
                                Sou psicólogo
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.outraConta} onPress={usarOutraConta} disabled={salvando}>
                        <Text style={styles.textLinkBold}>Entrar com outra conta</Text>
                    </TouchableOpacity>

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
        marginBottom: 6,
    },
    subtitle: {
        fontSize: 13,
        fontFamily: 'Montserrat-Regular',
        color: cor.fg('#333'),
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        width: '100%',
        backgroundColor: cor.bg('#FFF'),
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
    inputBloqueado: {
        color: cor.fg('#777'),
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
        marginTop: 10,
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
    },
    outraConta: {
        marginTop: 25,
    },
    textLinkBold: {
        fontFamily: 'Montserrat-Bold',
        fontSize: 12,
        color: cor.fg('#1A56DB'),
    },
});
