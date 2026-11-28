import React, { useState, useEffect, useRef } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Image,
    FlatList,
    TouchableOpacity,
    TextInput,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import Feather from '@expo/vector-icons/Feather';
import { useFonts } from 'expo-font';
import { ouvirMensagens, enviarMensagem } from '../services/chatService';
import { useAuth } from '../contexts/AuthContext.js';
import useContatosDeConsulta from '../hooks/useContatosDeConsulta.js';
import { carregarPerfilPublico } from '../services/perfilPublicoService.js';

import { useEstilos } from '../contexts/TemaContext.js';
export default function Conversa({ route, navigation }) {
  const [styles, cor] = useEstilos(criarStyles);
    const [inputText, setInputText] = useState('');
    const [messages, setMessages] = useState([]);
    const insets = useSafeAreaInsets();
    const listaRef = useRef(null);
    const [fotoContato, setFotoContato] = useState(null);

    // A conversa só aceita mensagens depois que existe pelo menos uma consulta marcada com a outra pessoa
    // (depois disso fica liberada, mesmo sem consulta marcada no momento).
    const { perfil } = useAuth();
    const papel = perfil?.tipo === 'psicologo' ? 'profissional' : 'cliente';
    const { podeConversarCom, carregando: carregandoConsultas } = useContatosDeConsulta(papel);

    // Recebe o contato, o chatId e o ID do usuário logado via route.params
    const { contato, chatId, usuarioId } = route.params || {};
    const abrirPerfil = () => {
        if (contato?.id) navigation.navigate('PerfilPublico', { usuarioId: contato.id, nome: contato.name });
    };

    // Foto de perfil atual do contato (a lista de conversas só leva uma imagem padrão).
    useEffect(() => {
        let ativo = true;
        if (contato?.id) {
            carregarPerfilPublico(contato.id)
                .then((p) => ativo && p.foto && setFotoContato(p.foto))
                .catch(() => {});
        }
        return () => { ativo = false; };
    }, [contato?.id]);

    const conversaLiberada = carregandoConsultas || podeConversarCom(contato?.id);

    // Efeito para escutar as mensagens do Firestore em tempo real
    useEffect(() => {
        if (!chatId) return;

        const unsubscribe = ouvirMensagens(chatId, (novasMensagens) => {
            setMessages(novasMensagens);
        });

        // Limpa o listener ao sair da tela
        return () => unsubscribe();
    }, [chatId]);

    // Função para enviar a mensagem
    const handleEnviar = async () => {
        if (inputText.trim() === '' || !chatId || !usuarioId || !conversaLiberada) return;

        const textoParaEnviar = inputText;
        setInputText(''); // Limpa o input imediatamente para melhor fluidez

        await enviarMensagem(chatId, textoParaEnviar, usuarioId);
    };

    // Formata o timestamp do Firestore para exibição (ex: "15/06/26 12:03")
    const formatarHora = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const dataFormatada = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });
        const horaFormatada = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        return `${dataFormatada} ${horaFormatada}`;
    };

    const renderItem = ({ item }) => {
        // Se sua mensagem vier com tipo 'date' do banco ou quiser manter compatibilidade
        if (item.type === 'date') {
            return (
                <View style={styles.dateContainer}>
                    <View style={styles.dateLine} />
                    <Text style={styles.dateText}>{item.text}</Text>
                    <View style={styles.dateLine} />
                </View>
            );
        }

        // Verifica se a mensagem foi enviada pelo usuário logado atual
        const isUser = item.remetenteId === usuarioId;

        return (
            <View style={[styles.messageWrapper, isUser ? styles.userWrapper : styles.otherWrapper]}>
                <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.otherBubble]}>
                    <Text style={styles.messageText}>{item.texto || item.text}</Text>
                </View>
                <Text style={[styles.timeText, isUser ? styles.userTime : styles.otherTime]}>
                    {formatarHora(item.criadoEm)}
                </Text>
            </View>
        );
    };

    const [fontsLoaded] = useFonts({
        'Montserrat-Regular': require('../styles/fonts/Montserrat/static/Montserrat-Regular.ttf'),
        'Montserrat-Bold': require('../styles/fonts/Montserrat/static/Montserrat-Bold.ttf'),
    });

    if (!fontsLoaded) {
        return null;
    }

    return (
        <View style={styles.container}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                {/* Cabeçalho */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={28} color={cor.fg("#FFF")} />
                    </TouchableOpacity>

                    {/* Tocar na foto ou no nome abre o perfil público da pessoa */}
                    <TouchableOpacity
                        style={styles.headerPerfil}
                        onPress={abrirPerfil}
                        disabled={!contato?.id}
                        accessibilityRole="button"
                        accessibilityLabel={`Ver perfil de ${contato?.name || 'contato'}`}
                    >
                        <Image
                            source={fotoContato ? { uri: fotoContato } : contato?.profilePicture || require('../assets/perfil.png')}
                            style={styles.headerAvatar}
                        />

                        <View style={styles.headerTitleContainer}>
                            <Text style={styles.headerName} numberOfLines={1}>
                                {contato?.name || 'Carregando...'}
                            </Text>
                        </View>
                    </TouchableOpacity>

                    <Text style={styles.headerRole}>{contato?.title || 'Profissional'}</Text>
                </View>

                {/* Mensagens em tempo real */}
                <FlatList
                    ref={listaRef}
                    testID="lista-mensagens"
                    // Abre já na mensagem mais recente (no fim da lista) e acompanha as novas mensagens.
                    onContentSizeChange={() => listaRef.current?.scrollToEnd({ animated: false })}
                    onLayout={() => listaRef.current?.scrollToEnd({ animated: false })}
                    data={messages}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.messagesList}
                    showsVerticalScrollIndicator={false}
                />

                {/* Sem consulta marcada: só leitura */}
                {!conversaLiberada && (
                    <View style={[styles.avisoSemConsulta, { paddingBottom: 14 + insets.bottom }]}>
                        <Ionicons name="calendar-outline" size={18} color={cor.fg("#5A6B87")} style={{ marginRight: 8 }} />
                        <Text style={styles.avisoSemConsultaTexto}>
                            Para conversar, é preciso ter marcado pelo menos uma consulta com {contato?.name || 'esta pessoa'}.
                        </Text>
                    </View>
                )}

                {/* Parte inferior da tela (input e botões) */}
                {conversaLiberada && (
                <View style={[styles.inputContainer, { paddingBottom: 10 + insets.bottom }]}>
                    <View style={styles.textInputWrapper}>
                        <TouchableOpacity style={styles.iconButton}>
                            <Feather name="smile" size={22} color={cor.fg("#555")} />
                        </TouchableOpacity>

                        <TextInput
                            style={styles.input}
                            placeholder="Escreva aqui"
                            placeholderTextColor={cor.fg("#888")}
                            value={inputText}
                            onChangeText={setInputText}
                            multiline={true}
                        />

                        <TouchableOpacity style={styles.iconButton}>
                            <Feather name="camera" size={22} color={cor.fg("#555")} />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.sendButton} onPress={handleEnviar} accessibilityLabel="Enviar mensagem">
                        <Ionicons name="send" size={18} color={cor.fg("#FFF")} style={{ marginLeft: 3 }} />
                    </TouchableOpacity>
                </View>
                )}
            </KeyboardAvoidingView>
        </View>
    );
}

const criarStyles = (cor) => StyleSheet.create({
    avisoSemConsulta: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 14,
        paddingHorizontal: 20,
        backgroundColor: cor.bg('#FFF'),
        borderTopWidth: 1,
        borderTopColor: cor.bd('#EEE'),
    },
    avisoSemConsultaTexto: {
        flex: 1,
        fontFamily: 'Montserrat-Regular',
        fontSize: 12,
        color: cor.fg('#5A6B87'),
    },
    container: {
        flex: 1,
        backgroundColor: cor.bg('#E4F0F8'),
    },
    header: {
        paddingTop: 30,
        paddingBottom: 15,
        paddingHorizontal: 16,
        backgroundColor: cor.bg('#6196DA'),
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
    },
    backButton: {
        marginRight: 10,
    },
    headerPerfil: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        marginRight: 12,
    },
    headerTitleContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    headerName: {
        fontSize: 18,
        color: cor.fg('#FFF'),
        fontFamily: 'Montserrat-Bold',
    },
    headerRole: {
        fontSize: 14,
        color: cor.fg('#FFF'),
        alignSelf: 'center',
        fontFamily: 'Montserrat-Bold',
    },
    messagesList: {
        paddingHorizontal: 16,
        paddingVertical: 20,
        paddingBottom: 10,
    },
    messageWrapper: {
        marginVertical: 8,
        maxWidth: '85%',
    },
    userWrapper: {
        alignSelf: 'flex-end',
    },
    otherWrapper: {
        alignSelf: 'flex-start',
    },
    messageBubble: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 3,
        elevation: 3,
    },
    userBubble: {
        backgroundColor: cor.bg('#D1E3F8'),
        borderBottomRightRadius: 6,
    },
    otherBubble: {
        backgroundColor: cor.bg('#F3F2F8'),
        borderBottomLeftRadius: 6,
    },
    messageText: {
        fontSize: 15,
        color: cor.fg('#222'),
        fontFamily: 'Montserrat-Regular',
        lineHeight: 22,
    },
    timeText: {
        fontSize: 13,
        fontFamily: 'Montserrat-Bold',
        color: cor.fg('#D0D0D0'),
        marginTop: 6,
    },
    userTime: {
        alignSelf: 'flex-end',
    },
    otherTime: {
        alignSelf: 'flex-start',
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 18,
    },
    dateLine: {
        flex: 1,
        height: 1.5,
        backgroundColor: cor.bg('#EAEAEA'),
    },
    dateText: {
        marginHorizontal: 14,
        fontSize: 13,
        fontFamily: 'Montserrat-Bold',
        color: cor.fg('#D0D0D0'),
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: cor.bg('#FFF'),
    },
    textInputWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: cor.bg('#F2F2F4'),
        borderRadius: 24,
        paddingHorizontal: 12,
        minHeight: 48,
        maxHeight: 120,
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: cor.fg('#333'),
        fontFamily: 'Montserrat-Regular',
        paddingHorizontal: 10,
        paddingVertical: 10,
    },
    iconButton: {
        padding: 6,
    },
    sendButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: cor.bg('#6196DA'),
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
        elevation: 3,
    },
});