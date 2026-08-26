import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';

import paleta from '../styles/Tema.js';
import NavBar from '../components/navBarPsi.js';
import Entypo from '@expo/vector-icons/Entypo';

export default function HomeScreen() {
    return (
        <View style={styles.container}>
            <View style={{ flex: 1 }}>
                <View style={styles.titleView}>
                    <Image
                        source={require('../assets/Logo.png')}
                        style={styles.titleImage}
                    />
                    <Text style={styles.titleText}> NeurAlly </Text>
                </View>

                <View style={styles.greetingView}>
                    <Text style={styles.greetingText}>
                        Olá, NOME!
                    </Text>
                </View>

                <View style={styles.nextView}>
                    <View style={styles.nextTextView}>
                        <Text style={styles.nextMinorText}> Próxima Consulta </Text>
                        <Text style={styles.nextMinorText}> Carlos Andrade </Text>
                        <Text style={styles.nextDateText}> 01/02 </Text>
                    </View>
                    <View style={styles.nextImageView}>
                        <Image
                            source={require('../assets/Anderson.png')}
                            style={styles.nextImage}
                        />
                    </View>
                </View>
                <TouchableOpacity style={styles.noteView}>
                    <View style={styles.noteTextView}>
                        <Text style={styles.noteTitle}>Anotações anteriores</Text>
                        <Text style={styles.noteText}>Falar sobre expressão de desconforto, e burnout.</Text>
                    </View>

                    <View style={styles.optionImageView}>
                        <View style={{ flex: 1 }} />
                        <Entypo name="arrow-bold-right" size={30} color="black" />
                    </View>

                </TouchableOpacity>

                <TouchableOpacity style={styles.optionView}>
                    <View style={styles.optionTextView}>
                        <Text style={styles.optionTitle}>Anotações</Text>
                        <Text style={styles.optionText}>Verifique as anotações para seus 2 atendimentos.</Text>
                    </View>

                    <View style={styles.optionImageView}>
                        <Entypo name="pencil" size={48} color="black" style={{ paddingRight: 5 }} />
                        <View style={{ flex: 1 }} />
                        <Entypo name="arrow-bold-right" size={30} color="black" />
                    </View>

                </TouchableOpacity>

                <TouchableOpacity style={styles.optionView}>
                    <View style={styles.optionTextView}>
                        <Text style={styles.optionTitle}>Atendimentos</Text>

                        <Text style={styles.optionText}>Você possui 2 atendimentos para hoje.</Text>
                    </View>

                    <View style={styles.optionImageView}>
                        <Entypo name="calendar" size={48} color="black" style={{ paddingRight: 5 }} />
                        <View style={{ flex: 1 }} />
                        <Entypo name="arrow-bold-right" size={30} color="black" />
                    </View>

                </TouchableOpacity>
            </View>
            <NavBar />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    titleView: {
        flex: 0.5,
        padding: 20,
        marginTop: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    titleImage: {
        resizeMode: 'stretch',
        height: 70,
        width: 70,
    },
    titleText: {
        color: paleta.cor.a4,
        fontSize: 32,
        fontWeight: 'bold',
    },
    greetingView: {
        marginTop: 5,
        marginBottom: 15,
    },
    greetingText: {
        fontSize: 25,
        textAlign: 'center',
    },
    nextView: {
        flex: 0.8,
        backgroundColor: paleta.cor.a4,
        borderRadius: 20,
        marginHorizontal: 40,
        flexDirection: 'row',
        marginBottom: 20,
    },
    nextTextView: {
        flex: 2,
        paddingTop: 10,
        paddingLeft: 15,
        flexDirection: 'column',
    },
    nextMinorText: {
        fontSize: 14,
        color: paleta.cor.branco,
    },
    nextDateText: {
        fontSize: 24,
        marginTop: -2,
        color: paleta.cor.branco,
        fontWeight: 'bold',
    },
    nextImageView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    nextImage: {
        flex: 1,
        resizeMode: 'stretch',
        margin: 5,
        aspectRatio: 1,
        borderRadius: 100,
    },

    noteView: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: paleta.cor.a3,
        marginHorizontal: 20,
        borderRadius: 20,
        marginBottom: 20,
    },
    noteTextView: {
        flex: 6,
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
    },
    noteTitle: {
        fontSize: 21,
        marginLeft: 15,
        marginTop: 20,
        color: paleta.cor.preto,
    },
    noteText: {
        fontSize: 14,
        marginLeft: 30,
        marginTop: 5,
    },


    optionView: {
        flex: 1.5,
        flexDirection: 'row',
        backgroundColor: paleta.cor.a3,
        marginHorizontal: 20,
        borderRadius: 20,
        marginBottom: 20,
    },
    optionTextView: {
        flex: 3,
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
    },
    optionTitle: {
        fontSize: 25,
        marginLeft: 30,
        marginTop: 20,
        color: paleta.cor.preto,
    },
    optionText: {
        fontSize: 18,
        marginLeft: 30,
        marginTop: 20,
    },
    optionImageView: {
        flex: 1,
        alignItems: 'flex-end',
        justifyContent: 'center',
        paddingTop: 18,
        paddingBottom: 10,
        paddingRight: 10,
    },
});
