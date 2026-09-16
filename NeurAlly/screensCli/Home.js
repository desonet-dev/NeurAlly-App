import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, ScrollView, SafeAreaView } from 'react-native';

import paleta from '../styles/Tema.js';
import NavBar from '../components/navBarCli.js';
import SmallCalendar from '../components/smallCalendar.js';
import SearchBar from '../components/searchBar.js';
import Entypo from '@expo/vector-icons/Entypo';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useFonts } from 'expo-font';
import { useAuth } from '../contexts/AuthContext.js';

export default function HomeScreen() {
    const { perfil } = useAuth();
    const primeiroNome = perfil?.nome?.trim().split(' ')[0] || '';
    const [fontsLoaded] = useFonts({
        'Montserrat-Regular': require('../styles/fonts/Montserrat/static/Montserrat-Regular.ttf'),
        'Montserrat-Bold': require('../styles/fonts/Montserrat/static/Montserrat-Bold.ttf'),
    });

    if (!fontsLoaded) {
        return null;
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={styles.mainView}
                showsVerticalScrollIndicator={false}
            >

                {/* Bom dia ao usuário */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greetingText}>Olá,</Text>
                        <Text style={styles.greetingName}>{primeiroNome || 'Maria'}</Text>
                    </View>
                    <Image
                        source={require('../assets/Anderson.png')}
                        style={styles.headerAvatar}
                    />
                </View>

                {/* Barra de pesquisa */}
                <SearchBar />

                {/* Próxima consulta */}
                <TouchableOpacity style={styles.professionalCard} activeOpacity={0.8}>
                    {/* Nome e título do profissional */}
                    <View style={styles.cardTop}>
                        <Image
                            source={require('../assets/Anderson.png')}
                            style={styles.professionalAvatar}
                        />
                        <View style={styles.professionalInfo}>
                            <Text style={styles.professionalName}>Dr. Cristian Sousa</Text>
                            <Text style={styles.professionalTitle}>Psicólogo Geral</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={24} color="#FFF" />
                    </View>

                    {/* Linha divisória */}
                    <View style={styles.divider} />

                    {/* Data e hora */}
                    <View style={styles.cardBottom}>
                        <View style={styles.dateTimeItem}>
                            <Ionicons name="calendar-outline" size={18} color={paleta.cor.branco} style={styles.iconSpaced} />
                            <Text style={styles.dateTimeText}>Domingo, 12 Jun.</Text>
                        </View>
                        <View style={styles.dateTimeItem}>
                            <Ionicons name="time-outline" size={18} color={paleta.cor.branco} style={styles.iconSpaced} />
                            <Text style={styles.dateTimeText}>11:00 - 12:00</Text>
                        </View>
                    </View>
                </TouchableOpacity>

                {/* Calendário curto de sessões */}
                <Text style={styles.sectionTitle}>Sessões</Text>

                <SmallCalendar />

                {/* Jogos relaxantes */}
                <TouchableOpacity style={styles.optionCard} activeOpacity={0.8}>
                    <Text style={styles.optionTitle}>Jogos relaxantes</Text>
                    <Text style={styles.optionDescription}>
                        Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                    </Text>

                    <View style={styles.optionIconContainer}>
                        <Entypo name="chevron-right" size={28} color={paleta.cor.branco} />
                    </View>
                </TouchableOpacity>

            </ScrollView>
            <NavBar />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: paleta.cor.fundo,
    },
    mainView: {
        paddingBottom: 110,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 25,
        marginBottom: 20,
        marginHorizontal: 20,
    },
    greetingText: {
        fontSize: 16,
        fontFamily: 'Montserrat-Regular',
        color: '#6B7A93',
    },
    greetingName: {
        fontSize: 24,
        fontFamily: 'Montserrat-Bold',
        color: '#131A22',
        marginTop: 2,
    },
    headerAvatar: {
        width: 55,
        height: 55,
        borderRadius: 27.5,
        backgroundColor: '#E5E5E5',
    },
    professionalCard: {
        backgroundColor: paleta.cor.a7,
        borderRadius: 20,
        padding: 18,
        marginBottom: 30,
        shadowColor: '#4E8BFA',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        marginHorizontal: 20,
        shadowRadius: 8,
        elevation: 5,
    },
    cardTop: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    professionalAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 14,
    },
    professionalInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    professionalName: {
        fontSize: 16,
        fontFamily: 'Montserrat-Bold',
        color: '#FFFFFF',
    },
    professionalTitle: {
        fontSize: 14,
        fontFamily: 'Montserrat-Regular',
        color: '#E0EAFF',
        marginTop: 2,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        marginVertical: 14,
    },
    cardBottom: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dateTimeItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconSpaced: {
        marginRight: 6,
    },
    dateTimeText: {
        fontSize: 13,
        fontFamily: 'Montserrat-Regular',
        color: '#FFFFFF',
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: 'Montserrat-Bold',
        color: '#131A22',
        marginBottom: 15,
        marginHorizontal: 20,
    },
    optionCard: {
        backgroundColor: paleta.cor.a3,
        borderRadius: 20,
        padding: 24,
        marginBottom: 10,
        marginHorizontal: 20,
    },
    optionTitle: {
        fontSize: 20,
        fontFamily: 'Montserrat-Bold',
        color: paleta.cor.branco,
        marginBottom: 10,
    },
    optionDescription: {
        fontSize: 14,
        fontFamily: 'Montserrat-Regular',
        color: paleta.cor.branco,
        lineHeight: 20,
        paddingRight: 20,
    },
    optionIconContainer: {
        alignItems: 'flex-end',
        marginTop: 10,
    },
});