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

export default function ConversasPsi() {
    // Mesmo formato usado na tela de Conversas do cliente. Aqui,
    // "emAcompanhamento" faz o papel do "hired": destaca os pacientes
    // que já são atendidos pelo profissional.
    const data = [
        {
            name: 'Marina Alves',
            title: 'Em acompanhamento',
            recentMessage: 'Obrigada pela sessão de hoje!',
            emAcompanhamento: true,
            profilePicture: require('../assets/Anderson.png'),
        },
        {
            name: 'Rafael Dias',
            title: 'Primeira consulta',
            recentMessage: 'Posso remarcar para quinta?',
            emAcompanhamento: true,
            profilePicture: require('../assets/Anderson.png'),
        },
        {
            name: 'Carla Souza',
            title: 'Em acompanhamento',
            recentMessage: 'Fiz os exercícios que combinamos.',
            emAcompanhamento: false,
            profilePicture: require('../assets/Anderson.png'),
        },
        {
            name: 'Bruno Lima',
            title: 'Retorno',
            recentMessage: 'Até a próxima semana.',
            emAcompanhamento: false,
            profilePicture: require('../assets/Anderson.png'),
        },
        {
            name: 'Helena Costa',
            title: 'Primeira consulta',
            recentMessage: 'Gostaria de marcar um horário.',
            emAcompanhamento: false,
            profilePicture: require('../assets/Anderson.png'),
        },
        {
            name: 'Diego Martins',
            title: 'Em acompanhamento',
            recentMessage: 'Consegui dormir melhor esta semana.',
            emAcompanhamento: false,
            profilePicture: require('../assets/Anderson.png'),
        },
    ];

    const [fontsLoaded] = useFonts({
        'Montserrat-Regular': require('../styles/fonts/Montserrat/static/Montserrat-Regular.ttf'),
        'Montserrat-Bold': require('../styles/fonts/Montserrat/static/Montserrat-Bold.ttf'),
    });

    const navigation = useNavigation();

    if (!fontsLoaded) {
        return null;
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={{ flex: 1, paddingTop: 15 }}>
                <SearchBar placeholder="Procure por um paciente" />

                <View style={styles.activeNow}>
                    <Text style={styles.activeText}>Ativos agora</Text>
                </View>

                {/* ATIVOS AGORA */}
                <View style={styles.activeListContainer}>
                    <FlatList
                        data={data}
                        horizontal={true}
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(item) => item.name}
                        contentContainerStyle={{ paddingHorizontal: 12 }}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.activeAvatarWrapper}
                                onPress={() => navigation.navigate('Conversa', { contato: item })}
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

                {/* Linha */}
                <View style={styles.dividerLine} />

                {/* Chats disponíveis */}
                <FlatList
                    style={styles.chatsList}
                    contentContainerStyle={styles.chatsListContent}
                    data={data}
                    showsVerticalScrollIndicator={false}
                    keyExtractor={(item) => item.name}
                    renderItem={({ item }) => {
                        const emAcompanhamento = item.emAcompanhamento;
                        return (
                            <TouchableOpacity
                                style={[
                                    styles.chatCard,
                                    emAcompanhamento ? styles.chatCardHired : styles.chatCardNormal,
                                ]}
                                onPress={() => navigation.navigate('Conversa', { contato: item })}
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
