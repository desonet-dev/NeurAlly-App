import {
    StyleSheet,
    Text,
    View,
    Image,
    FlatList,
    TouchableOpacity,
} from 'react-native';

import paleta from '../styles/Tema.js';
import NavBar from '../components/navBarCli.js';
import SearchBar from '../components/searchBar.js';
import { useFonts } from 'expo-font';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function Conversas() {
    const data = [
        {
            name: 'Dra. Brinquedos',
            title: 'Psiquiatra',
            recentMessage: 'Próxima consulta dia 01/02.',
            hired: true,
            profilePicture: require('../assets/Anderson.png'),
        },
        {
            name: 'Dra. Aline Juliana',
            title: 'Psicólogo',
            recentMessage: 'Você é capaz em casos de trauma?',
            hired: true,
            profilePicture: require('../assets/Anderson.png'),
        },
        {
            name: 'Dr. Carrinhos',
            title: 'Psicólogo',
            recentMessage: 'Você é noob em casos de trauma?',
            hired: false,
            profilePicture: require('../assets/Anderson.png'),
        },
        {
            name: 'Dr. Adriel',
            title: 'Psicólogo',
            recentMessage: 'Você sabe de casos de trauma?',
            hired: false,
            profilePicture: require('../assets/Anderson.png'),
        },
        {
            name: 'Dra. Pâmela',
            title: 'Psicólogo',
            recentMessage: 'Você é capaz em casos de trauma?',
            hired: false,
            profilePicture: require('../assets/Anderson.png'),
        },
        {
            name: 'Dra. Juliana',
            title: 'Psicólogo',
            recentMessage: 'Você é capaz em casos de trauma?',
            hired: false,
            profilePicture: require('../assets/Anderson.png'),
        },
    ];

    const [fontsLoaded] = useFonts({
        'Montserrat-Regular': require('../styles/fonts/Montserrat/static/Montserrat-Regular.ttf'),
        'Montserrat-Bold': require('../styles/fonts/Montserrat/static/Montserrat-Bold.ttf'),
    });

    const navigation = useNavigation();
    const route = useRoute();

    if (!fontsLoaded) {
        return null;
    }

    return (
        <View style={styles.container}>
            <View style={{ flex: 1 }}>
                <View style={{ height: 40 }} />
                <SearchBar />

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
                        const isHired = item.hired;
                        return (
                            <TouchableOpacity
                                style={[
                                    styles.chatCard,
                                    isHired ? styles.chatCardHired : styles.chatCardNormal,
                                ]}
                                onPress={() => navigation.navigate('Conversa', { contato: item })}
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

            <NavBar />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
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
        paddingBottom: 20,
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