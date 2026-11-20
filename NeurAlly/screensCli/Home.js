import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, ScrollView, SafeAreaView } from 'react-native';

import NavBar from '../components/navBarCli.js';
import SmallCalendar from '../components/smallCalendar.js';
import SearchBar from '../components/searchBar.js';
import Entypo from '@expo/vector-icons/Entypo';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useFonts } from 'expo-font';
import { useAuth } from '../contexts/AuthContext.js';
import { useOrigemDaFoto } from '../hooks/useFotoPerfil.js';
import useConsultas from '../hooks/useConsultas.js';
import { formatarDataLonga } from '../utils/datas.js';

import { useEstilos } from '../contexts/TemaContext.js';
export default function HomeScreen({ navigation }) {
  const [styles, cor] = useEstilos(criarStyles);
    const { perfil } = useAuth();
    const fotoPerfil = useOrigemDaFoto();
    const { proximas, datasComConsulta } = useConsultas();
    const proximaConsulta = proximas[0];
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

                <View style={styles.header}>
                    <View>
                        <Text style={styles.greetingText}>Olá,</Text>
                        <Text style={styles.greetingName}>{primeiroNome || 'Maria'}</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('Perfil')}
                        accessibilityRole="button"
                        accessibilityLabel="Abrir meu perfil"
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                        <Image source={fotoPerfil} style={styles.headerAvatar} />
                    </TouchableOpacity>
                </View>

                <SearchBar />

                {proximaConsulta ? (
                    <TouchableOpacity
                        style={styles.professionalCard}
                        activeOpacity={0.8}
                        onPress={() => navigation.navigate('Agendamento')}
                    >
                        <View style={styles.cardTop}>
                            <Image
                                source={require('../assets/Anderson.png')}
                                style={styles.professionalAvatar}
                            />
                            <View style={styles.professionalInfo}>
                                <Text style={styles.professionalName}>{proximaConsulta.profissionalNome}</Text>
                                {!!proximaConsulta.profissionalEsp && (
                                    <Text style={styles.professionalTitle}>{proximaConsulta.profissionalEsp}</Text>
                                )}
                            </View>
                            <Ionicons name="chevron-forward" size={24} color={cor.fg("#FFF")} />
                        </View>

                        {/* Linha divisória */}
                        <View style={styles.divider} />

                        {/* Data e hora da próxima consulta */}
                        <View style={styles.cardBottom}>
                            <View style={styles.dateTimeItem}>
                                <Ionicons name="calendar-outline" size={18} color={cor.fg('#FFF')} style={styles.iconSpaced} />
                                <Text style={styles.dateTimeText}>{formatarDataLonga(proximaConsulta.data)}</Text>
                            </View>
                            <View style={styles.dateTimeItem}>
                                <Ionicons name="time-outline" size={18} color={cor.fg('#FFF')} style={styles.iconSpaced} />
                                <Text style={styles.dateTimeText}>{proximaConsulta.horario}</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={styles.professionalCard}
                        activeOpacity={0.8}
                        onPress={() => navigation.navigate('Agendamento')}
                    >
                        <View style={styles.cardTop}>
                            <View style={styles.professionalInfo}>
                                <Text style={styles.professionalName}>Nenhuma consulta agendada</Text>
                                <Text style={styles.professionalTitle}>Toque para agendar sua próxima consulta</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={24} color={cor.fg("#FFF")} />
                        </View>
                    </TouchableOpacity>
                )}

                <Text style={styles.sectionTitle}>Sessões</Text>

                <SmallCalendar datasConsulta={datasComConsulta} />

                <TouchableOpacity style={styles.optionCard} activeOpacity={0.8}>
                    <Text style={styles.optionTitle}>Jogos relaxantes</Text>
                    <Text style={styles.optionDescription}>
                        Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                    </Text>

                    <View style={styles.optionIconContainer}>
                        <Entypo name="chevron-right" size={28} color={cor.fg('#FFF')} />
                    </View>
                </TouchableOpacity>

            </ScrollView>
            <NavBar />
        </SafeAreaView>
    );
}

const criarStyles = (cor) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: cor.bg('#E4F0F8'),
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
        color: cor.fg('#6B7A93'),
    },
    greetingName: {
        fontSize: 24,
        fontFamily: 'Montserrat-Bold',
        color: cor.fg('#131A22'),
        marginTop: 2,
    },
    headerAvatar: {
        width: 55,
        height: 55,
        borderRadius: 27.5,
        backgroundColor: cor.bg('#E5E5E5'),
    },
    professionalCard: {
        backgroundColor: cor.bg('#4894FE'),
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
        color: cor.fg('#FFFFFF'),
    },
    professionalTitle: {
        fontSize: 14,
        fontFamily: 'Montserrat-Regular',
        color: cor.fg('#E0EAFF'),
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
        color: cor.fg('#FFFFFF'),
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: 'Montserrat-Bold',
        color: cor.fg('#131A22'),
        marginBottom: 15,
        marginHorizontal: 20,
    },
    optionCard: {
        backgroundColor: cor.bg('#99BCEE'),
        borderRadius: 20,
        padding: 24,
        marginBottom: 10,
        marginHorizontal: 20,
    },
    optionTitle: {
        fontSize: 20,
        fontFamily: 'Montserrat-Bold',
        color: cor.fg('#FFF'),
        marginBottom: 10,
    },
    optionDescription: {
        fontSize: 14,
        fontFamily: 'Montserrat-Regular',
        color: cor.fg('#FFF'),
        lineHeight: 20,
        paddingRight: 20,
    },
    optionIconContainer: {
        alignItems: 'flex-end',
        marginTop: 10,
    },
});