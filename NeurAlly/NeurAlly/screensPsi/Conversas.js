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
import NavBarPsi from '../components/navBarPsi.js';
import NovaConversaModal from '../components/NovaConversaModal.js';
import { useAuth } from '../contexts/AuthContext.js';
import useConsultas from '../hooks/useConsultas.js';
import SearchBar from '../components/searchBar.js';
import { useFonts } from 'expo-font';
import { useNavigation } from '@react-navigation/native';
import { ouvirConversasDoPsicologo, obterOuCriarChat } from '../services/chatService';

export default function ConversasPsi() {
    const { usuario } = useAuth();
    const meuIdPsicologo = usuario?.uid;

    const [conversas, setConversas] = useState([]);

    // Nova conversa: pacientes que já marcaram consulta com este psicólogo.
    const [novaConversaAberta, setNovaConversaAberta] = useState(false);
    const [abrindoConversa, setAbrindoConversa] = useState(false);
    const [erroNovaConversa, setErroNovaConversa] = useState('');
    const { todas: consultasDoPsicologo, carregando: carregandoPacientes } = useConsultas('profissional');
    const pacientes = React.useMemo(() => {
        const porId = new Map();
        consultasDoPsicologo.forEach((c) => {
            if (c.clienteId && !porId.has(c.clienteId)) {
                porId.set(c.clienteId, { id: c.clienteId, uid: c.clienteId, nome: c.clienteNome || 'Paciente', esp: 'Paciente' });
            }
        });
        return [...porId.values()].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
    }, [consultasDoPsicologo]);

    const [fontsLoaded] = useFonts({
        'Montserrat-Regular': require('../styles/fonts/Montserrat/static/Montserrat-Regular.ttf'),
        'Montserrat-Bold': require('../styles/fonts/Montserrat/static/Montserrat-Bold.ttf'),
    });

    const navigation = useNavigation();

    useEffect(() => {
        if (!meuIdPsicologo) return undefined;
        const unsubscribe = ouvirConversasDoPsicologo(meuIdPsicologo, (listaDeChats) => {
            setConversas(listaDeChats);
        });

        return () => unsubscribe();
    }, [meuIdPsicologo]);

    // Função para abrir o chat selecionado
    const abrirChat = (chat) => {
        navigation.navigate('Conversa', {
            chatId: chat.chatId,
            usuarioId: meuIdPsicologo,
            contato: {
                id: chat.id,
                name: chat.name,
                title: chat.title,
                profilePicture: chat.profilePicture,
            },
        });
    };

    const iniciarConversa = async (paciente) => {
        if (abrindoConversa || !meuIdPsicologo) return;
        setErroNovaConversa('');
        setAbrindoConversa(true);
        try {
            const chatId = await obterOuCriarChat(meuIdPsicologo, paciente.uid);
            setNovaConversaAberta(false);
            navigation.navigate('Conversa', {
                chatId,
                usuarioId: meuIdPsicologo,
                contato: {
                    id: paciente.uid,
                    name: paciente.nome,
                    title: 'Paciente',
                    profilePicture: require('../assets/Anderson.png'),
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

    if (!fontsLoaded) {
        return null;
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={{ flex: 1, paddingTop: 15 }}>
                <SearchBar placeholder="Procure por um paciente" />

                <View style={styles.activeNow}>
                    <Text style={styles.activeText}>Pacientes Ativos</Text>
                </View>

                <View style={styles.activeListContainer}>
                    <FlatList
                        data={conversas}
                        horizontal={true}
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(item) => item.chatId || item.id}
                        contentContainerStyle={{ paddingHorizontal: 12 }}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.activeAvatarWrapper}
                                onPress={() => abrirChat(item)}
                            >
                                <Image
                                    source={item.profilePicture}
                                    style={styles.activeImage}
                                />
                                <View style={styles.onlineBadge} />
                            </TouchableOpacity>
                        )}
                    />
                </View>

                <View style={styles.dividerLine} />

                <FlatList
                    style={styles.chatsList}
                    contentContainerStyle={styles.chatsListContent}
                    data={conversas}
                    showsVerticalScrollIndicator={false}
                    keyExtractor={(item) => item.chatId || item.id}
                    renderItem={({ item }) => {
                        const emAcompanhamento = item.emAcompanhamento;
                        return (
                            <TouchableOpacity
                                style={[
                                    styles.chatCard,
                                    emAcompanhamento ? styles.chatCardHired : styles.chatCardNormal,
                                ]}
                                onPress={() => abrirChat(item)}
                            >
                                <Image source={item.profilePicture} style={styles.cardAvatar} />

                                <View style={styles.cardInfo}>
                                    <View style={styles.cardHeader}>
                                        <Text
                                            style={[styles.cardName, emAcompanhamento && styles.textWhite]}
                                            numberOfLines={1}>
                                            {item.name}
                                        </Text>
                                        <Text
                                            style={[
                                                styles.cardTitle,
                                                emAcompanhamento && styles.textWhiteSubtle,
                                            ]}>
                                            {item.title}
                                        </Text>
                                    </View>

                                    <Text
                                        style={[
                                            styles.cardMessage,
                                            emAcompanhamento ? styles.textWhiteSubtle : styles.textDarkSubtle,
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
                onPress={() => { setErroNovaConversa(''); setNovaConversaAberta(true); }}
                accessibilityLabel="Iniciar nova conversa"
            >
                <Ionicons name="chatbubbles-outline" size={26} color="#FFF" />
            </TouchableOpacity>

            <NovaConversaModal
                visivel={novaConversaAberta}
                onFechar={() => setNovaConversaAberta(false)}
                titulo="Nova conversa"
                placeholder="Procure por um paciente"
                vazio="Os pacientes que marcarem consulta com você aparecem aqui para você iniciar uma conversa."
                opcoes={pacientes}
                carregando={carregandoPacientes}
                ocupado={abrindoConversa}
                erro={erroNovaConversa}
                onSelecionar={iniciarConversa}
            />

            <NavBarPsi />
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
    activeListContainer: {
        height: 70,
    },
    activeAvatarWrapper: {
        marginHorizontal: 6,
        position: 'relative',
    },
    activeImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
    },
    onlineBadge: {
        position: 'absolute',
        top: 45,
        right: 0,
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#10B981',
        borderWidth: 2,
        borderColor: '#FFF',
    },
    dividerLine: {
        width: '92%',
        height: 2,
        backgroundColor: paleta.cor.a7,
        alignSelf: 'center',
        marginVertical: 10,
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