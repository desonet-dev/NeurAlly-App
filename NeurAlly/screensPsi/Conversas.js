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

import paleta from '../styles/Tema.js';
import NavBarPsi from '../components/navBarPsi.js';
import SearchBar from '../components/searchBar.js';
import { useFonts } from 'expo-font';
import { useNavigation } from '@react-navigation/native';
import { ouvirConversasDoPsicologo } from '../services/chatService';

export default function ConversasPsi() {
    const meuIdPsicologo = 'OVHfzNDwkZi54ELYFeiy693neo1'; 

    const [conversas, setConversas] = useState([]);

    const [fontsLoaded] = useFonts({
        'Montserrat-Regular': require('../styles/fonts/Montserrat/static/Montserrat-Regular.ttf'),
        'Montserrat-Bold': require('../styles/fonts/Montserrat/static/Montserrat-Bold.ttf'),
    });

    const navigation = useNavigation();

    useEffect(() => {
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
});