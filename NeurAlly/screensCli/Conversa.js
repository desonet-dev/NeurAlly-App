import React, { useState, useEffect } from 'react';
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
import Ionicons from '@expo/vector-icons/Ionicons';
import Feather from '@expo/vector-icons/Feather';
import paleta from '../styles/Tema.js';
import { useFonts } from 'expo-font';
import { ouvirMensagens, enviarMensagem } from '../services/chatService';

export default function Conversa({ route, navigation }) {
    const [inputText, setInputText] = useState('');
    const [messages, setMessages] = useState([]);

    // Recebe o contato, o chatId e o ID do usuário logado via route.params
    const { contato, chatId, usuarioId } = route.params || {};

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
        if (inputText.trim() === '' || !chatId || !usuarioId) return;

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
                        <Ionicons name="arrow-back" size={28} color="#FFF" />
                    </TouchableOpacity>

                    <Image
                        source={contato?.profilePicture || require('../assets/Anderson.png')}
                        style={styles.headerAvatar}
                    />

                    <View style={styles.headerTitleContainer}>
                        <Text style={styles.headerName} numberOfLines={1}>
                            {contato?.name || 'Carregando...'}
                        </Text>
                    </View>

                    <Text style={styles.headerRole}>{contato?.title || 'Profissional'}</Text>
                </View>

                {/* Mensagens em tempo real */}
                <FlatList
                    data={messages}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.messagesList}
                    showsVerticalScrollIndicator={false}
                />

                {/* Parte inferior da tela (input e botões) */}
                <View style={styles.inputContainer}>
                    <View style={styles.textInputWrapper}>
                        <TouchableOpacity style={styles.iconButton}>
                            <Feather name="smile" size={22} color="#555" />
                        </TouchableOpacity>

                        <TextInput
                            style={styles.input}
                            placeholder="Escreva aqui"
                            placeholderTextColor="#888"
                            value={inputText}
                            onChangeText={setInputText}
                            multiline={true}
                        />

                        <TouchableOpacity style={styles.iconButton}>
                            <Feather name="camera" size={22} color="#555" />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.sendButton} onPress={handleEnviar}>
                        <Ionicons name="send" size={18} color="#FFF" style={{ marginLeft: 3 }} />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: paleta.cor.fundo,
    },
    header: {
        paddingTop: 30,
        paddingBottom: 15,
        paddingHorizontal: 16,
        backgroundColor: paleta.cor.a4,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
    },
    backButton: {
        marginRight: 10,
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
        color: '#FFF',
        fontFamily: 'Montserrat-Bold',
    },
    headerRole: {
        fontSize: 14,
        color: '#FFF',
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
        backgroundColor: '#D1E3F8',
        borderBottomRightRadius: 6,
    },
    otherBubble: {
        backgroundColor: '#F3F2F8',
        borderBottomLeftRadius: 6,
    },
    messageText: {
        fontSize: 15,
        color: '#222',
        fontFamily: 'Montserrat-Regular',
        lineHeight: 22,
    },
    timeText: {
        fontSize: 13,
        fontFamily: 'Montserrat-Bold',
        color: '#D0D0D0',
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
        backgroundColor: '#EAEAEA',
    },
    dateText: {
        marginHorizontal: 14,
        fontSize: 13,
        fontFamily: 'Montserrat-Bold',
        color: '#D0D0D0',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: '#FFF',
        marginBottom: 40,
    },
    textInputWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F2F2F4',
        borderRadius: 24,
        paddingHorizontal: 12,
        minHeight: 48,
        maxHeight: 120,
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: '#333',
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
        backgroundColor: paleta.cor.a4,
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