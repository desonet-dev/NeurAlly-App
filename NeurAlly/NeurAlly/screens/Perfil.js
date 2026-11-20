import {
    TouchableOpacity,
    Text,
    View,
    StyleSheet,
    useWindowDimensions,
} from 'react-native';
import { useState } from 'react';
import { useFonts } from 'expo-font';
import paleta from '../styles/Tema.js';
import NavBar from '../components/navBarCli.js';

export default function TriagemScreen() {
    const [val, setVal] = useState(90);
    const [questao, setQuestao] = useState(0);
    const [resposta, setResposta] = useState("");
    const [respostas, setRespostas] = useState("");

    const [fontsLoaded] = useFonts({
        'Montserrat-Regular': require('../styles/fonts/Montserrat/static/Montserrat-Regular.ttf'),
        'Montserrat-Bold': require('../styles/fonts/Montserrat/static/Montserrat-Bold.ttf'),
    });

    if (!fontsLoaded) {
        return null;
    }

    return (
        <View style={styles.container}>
            <NavBar />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
});