import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Image,
    FlatList,
    TouchableOpacity,
    SafeAreaView,
} from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';
import paleta from '../styles/Tema.js';
import NavBar from '../components/navBarCli.js';
import SearchBar from '../components/searchBar.js';
import ContatosOnline from '../components/ContatosOnline.js';
import { useFonts } from 'expo-font';
import { useNavigation } from '@react-navigation/native';
import { ouvirConversasDoUsuario, obterOuCriarChat } from '../services/chatService';
import { ouvirContatosOnline } from '../services/presencaService';
import { useAuth } from '../contexts/AuthContext.js';
import useProfissionais from '../hooks/useProfissionais.js';
import NovaConversaModal from '../components/NovaConversaModal.js';

export default function Conversas() {
    // ID do usuário logado atual
    const { usuario } = useAuth();
    const meuIdUsuario = usuario?.uid;

    const [conversas, setConversas] = useState([]);
    const [idsOnline, setIdsOnline] = useState([]);

    // Nova conversa: janela com os profissionais disponíveis para iniciar o chat.
    const [novaConversaAberta, setNovaConversaAberta] = useState(false);
    const [abrindoConversa, setAbrindoConversa] = useState(false);
    const [erroNovaConversa, setErroNovaConversa] = useState('');
    const { profissionais, carregando: carregandoProfissionais } = useProfissionais();

    const [fontsLoaded] = useFonts({
        'Montserrat-Regular': require('../styles/fonts/Montserrat/static/Montserrat-Regular.ttf'),
        'Montserrat-Bold': require('../styles/fonts/Montserrat/static/Montserrat-Bold.ttf'),
    });

    const navigation = useNavigation();

    // Efeito para escutar as conversas do usuário em tempo real no Firestore
    useEffect(() => {
        if (!meuIdUsuario) return undefined;
        const unsubscribe = ouvirConversasDoUsuario(meuIdUsuario, (listaDeChats) => {
            setConversas(listaDeChats);
        });

        return () => unsubscribe();
    }, [meuIdUsuario]);

    // Escuta em tempo real quem, entre os contatos das conversas, está online agora
    const idsDosContatos = conversas.map((c) => c.id).join('|');
    useEffect(() => {
        const unsubscribe = ouvirContatosOnline(conversas.map((c) => c.id), setIdsOnline);
        return () => unsubscribe();
    }, [idsDosContatos]);

    const contatosOnline = conversas.filter((c) => c.online || idsOnline.includes(c.id));

    // Função para abrir o chat existente
    const abrirChat = (chat) => {
        navigation.navigate('Conversa', {
            chatId: chat.chatId,
            usuarioId: meuIdUsuario,
            contato: {
                id: chat.id,
                name: chat.name,
                title: chat.title,
                profilePicture: chat.profilePicture,
            },
        });
    };

    // Escolheu um profissional na janela de nova conversa: cria (ou reaproveita) o chat e abre.
    const iniciarConversa = async (profissional) => {
        if (abrindoConversa) return;

        if (!profissional.uid) {
            setErroNovaConversa('Este profissional é apenas um exemplo (ainda não tem conta no app), então não dá para conversar com ele.');
            return;
        }
        if (!meuIdUsuario) {
            setErroNovaConversa('Entre na sua conta para iniciar uma conversa.');
            return;
        }

        setErroNovaConversa('');
        setAbrindoConversa(true);
        try {
            const chatId = await obterOuCriarChat(meuIdUsuario, profissional.uid);
            setNovaConversaAberta(false);
            navigation.navigate('Conversa', {
                chatId,
                usuarioId: meuIdUsuario,
                contato: {
                    id: profissional.uid,
                    name: profissional.nome,
                    title: 'Psicólogo',
                    profilePicture: profissional.img || require('../assets/Anderson.png'),
                },
            });
        } catch (erro) {
            console.warn('Erro ao iniciar conversa:', erro);
            setErroNovaConversa(
                erro?.code === 'permission-denied'
                    ? 'Sem permissão para criar a conversa. Atualize as regras do Firestore (arquivo firestore.rules do projeto).'
                    : 'Não foi possível iniciar a conversa. Verifique sua conexão e tente novamente.'
            );
        } finally {
            setAbrindoConversa(false);
        }
    };

    const abrirNovaConversa = () => {
        setErroNovaConversa('');
        setNovaConversaAberta(true);
    };

    if (!fontsLoaded) {
        return null;
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={{ flex: 1, paddingTop: 15 }}>
                <SearchBar />

                {/* Contatos online agora (bolinha verde) */}
                <ContatosOnline contatos={contatosOnline} onPress={abrirChat} />

                <View style={styles.activeNow}>
                    <Text style={styles.activeText}>Suas Conversas</Text>
                </View>

                {/* Lista de Chats vindos do Firebase */}
                <FlatList
                    style={styles.chatsList}
                    contentContainerStyle={styles.chatsListContent}
                    data={conversas}
                    showsVerticalScrollIndicator={false}
                    keyExtractor={(item) => item.chatId}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>Nenhuma conversa iniciada ainda.</Text>
                            <Text style={styles.emptySubText}>Toque no botão abaixo para iniciar uma nova conversa.</Text>
                        </View>
                    }
                    renderItem={({ item }) => {
                        // Você pode definir uma regra visual se a conversa está ativa/contratada
                        const isHired = true; 
                        return (
                            <TouchableOpacity
                                style={[
                                    styles.chatCard,
                                    isHired ? styles.chatCardHired : styles.chatCardNormal,
                                ]}
                                onPress={() => abrirChat(item)}
                            >
                                <Image source={item.profilePicture} style={styles.cardAvatar} />

                                <View style={styles.cardInfo}>
                                    <View style={styles.cardHeader}>
                                        <Text
                                            style={[styles.cardName, isHired && styles.textWhite]}
                                            numberOfLines={1}>
                                            {item.name}
                                        </Text>
                                        <Text
                                            style={[
                                                styles.cardTitle,
                                                isHired && styles.textWhiteSubtle,
                                            ]}>
                                            {item.title}
                                        </Text>
                                    </View>

                                    <Text
                                        style={[
                                            styles.cardMessage,
                                            isHired ? styles.textWhiteSubtle : styles.textDarkSubtle,
                                        ]}
                                        numberOfLines={1}>
                                        {item.recentMessage}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        );
                    }}
                />
            </View>

            {/* Botão Flutuante para Iniciar Nova Conversa */}
            <TouchableOpacity
                style={styles.fab}
                onPress={abrirNovaConversa}
                accessibilityLabel="Iniciar nova conversa"
            >
                <Ionicons name="chatbubbles-outline" size={26} color="#FFF" />
            </TouchableOpacity>

            <NovaConversaModal
                visivel={novaConversaAberta}
                onFechar={() => setNovaConversaAberta(false)}
                titulo="Nova conversa"
                placeholder="Procure por um profissional"
                opcoes={profissionais}
                carregando={carregandoProfissionais}
                ocupado={abrindoConversa}
                erro={erroNovaConversa}
                onSelecionar={iniciarConversa}
            />

            <NavBar />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: paleta.cor.fundo,
    },
    activeNow: {
        marginHorizontal: 16,
        marginTop: 10,
        marginBottom: 8,
    },
    activeText: {
        fontSize: 22,
        fontFamily: 'Montserrat-Bold',
        color: '#000',
    },
    chatsList: {
        flex: 1,
    },
    chatsListContent: {
        paddingHorizontal: 16,
        paddingBottom: 110,
    },
    chatCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 18,
        marginBottom: 12,
        width: '100%',
    },
    chatCardHired: {
        backgroundColor: paleta.cor.a4,
    },
    chatCardNormal: {
        backgroundColor: paleta.cor.a1,
    },
    cardAvatar: {
        width: 55,
        height: 55,
        borderRadius: 27.5,
        marginRight: 12,
    },
    cardInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    cardName: {
        fontSize: 16,
        fontFamily: 'Montserrat-Bold',
        color: '#1A1A1A',
        flex: 1,
    },
    cardTitle: {
        fontSize: 13,
        fontFamily: 'Montserrat-Bold',
        color: '#4A5568',
        marginLeft: 8,
    },
    cardMessage: {
        fontSize: 13,
        fontFamily: 'Montserrat-Regular',
    },
    textWhite: {
        color: '#FFFFFF',
        fontFamily: 'Montserrat-Bold',
    },
    textWhiteSubtle: {
        color: '#EAF2FF',
    },
    textDarkSubtle: {
        color: '#4A5568',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 50,
        paddingHorizontal: 20,
    },
    emptyText: {
        fontSize: 16,
        fontFamily: 'Montserrat-Bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 8,
    },
    emptySubText: {
        fontSize: 13,
        fontFamily: 'Montserrat-Regular',
        color: '#666',
        textAlign: 'center',
    },
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 90,
        backgroundColor: paleta.cor.a4 || '#1A56DB',
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
});