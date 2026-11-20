import {
    TouchableOpacity,
    Text,
    View,
    StyleSheet,
    useWindowDimensions,
} from 'react-native';
import { useState } from 'react';
import { useFonts } from 'expo-font';
import NavBar from '../components/navBarCli.js';

import { useEstilos } from '../contexts/TemaContext.js';
export default function TriagemScreen() {
  const [styles, cor] = useEstilos(criarStyles);
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

const criarStyles = (cor) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: cor.bg('#FFF'),
    },
});