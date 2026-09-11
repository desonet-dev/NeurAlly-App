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

export default function TriagemScreen() {
    const [val, setVal] = useState(90);
    const [questao, setQuestao] = useState(0);
    const [resposta, setResposta] = useState("");
    const [respostas, setRespostas] = useState("");

    const { width } = useWindowDimensions();

    const [fontsLoaded] = useFonts({
        'Montserrat-Regular': require('../styles/fonts/Montserrat/static/Montserrat-Regular.ttf'),
        'Montserrat-Bold': require('../styles/fonts/Montserrat/static/Montserrat-Bold.ttf'),
    });



    const alterarQuestao = (num) => {
        setQuestao(num);
        setVal((10 - (num + 1)) * 10);
        setRespostas(respostas + resposta);
        setResposta("");
    }

    const respostaEscolhida = (resp) => {
        setResposta(resp);
    }

    const questoes = [
        {
            nome: 'Qual é o principal motivo pelo qual você está buscando ajuda neste momento?',
            a: 'Ansiedade e preocupações excessivas.',
            b: 'Tristeza, desânimo ou falta de motivação.',
            c: 'Problemas em relacionamentos pessoais ou familiares.',
            d: 'Autoconhecimento e desenvolvimento pessoal.',
        },
        {
            nome: 'Há quanto tempo você percebe esses sentimentos ou dificuldades? ',
            a: 'Há poucas semanas.',
            b: 'Entre 1 e 6 meses.',
            c: 'Entre 6 meses e 2 anos.',
            d: 'Há mais de 2 anos.',
        },
        {
            nome: 'Com que frequência esses problemas afetam seu dia a dia? ',
            a: 'Raramente.',
            b: 'Algumas vezes por semana.',
            c: 'Quase todos os dias.',
            d: 'Constantemente.',
        },
        {
            nome: 'Você já realizou acompanhamento em saúde mental anteriormente?',
            a: 'Nunca fiz acompanhamento.',
            b: 'Fiz terapia no passado.',
            c: 'Estou em acompanhamento atualmente.',
            d: 'Já fiz terapia e acompanhamento psiquiátrico.',
        },
        {
            nome: "Você utiliza ou já utilizou medicação para questões emocionais ou psicológicas?",
            a: 'Nunca utilizei.',
            b: 'Já utilizei no passado.',
            c: 'Utilizo atualmente com acompanhamento médico.',
            d: 'Utilizo atualmente, mas gostaria de reavaliar o tratamento.',
        },
        {
            nome: "Qual tipo de atendimento você prefere?",
            a: 'Online.',
            b: 'Presencial.',
            c: 'Tanto online quanto presencial.',
            d: 'Não tenho preferência.',
        },
        {
            nome: "Qual faixa de valor por sessão você procura?",
            a: 'Até R$ 80.',
            b: 'Entre R$ 80 e R$ 150.',
            c: 'Entre R$ 150 e R$ 250.',
            d: 'Acima de R$ 250.',
        },
        {
            nome: "Você gostaria de um acompanhamento focado em:",
            a: 'Controle da ansiedade e regulação emocional.',
            b: 'Relacionamentos e questões familiares.',
            c: 'Autoconhecimento e crescimento pessoal.',
            d: 'Diagnóstico, tratamento e manejo de sintomas.',
        },
        {
            nome: "Qual desses problemas você mais sente no seu dia a dia?",
            a: 'Ansiedade, preocupação excessiva ou crises de pânico.',
            b: 'Tristeza, desânimo ou falta de energia.',
            c: 'Insônia, alterações no sono ou fadiga constante.',
            d: 'Dificuldade de concentração, irritabilidade ou estresse intenso.',
        },
        {
            nome: "Você considera que precisa de atendimento com urgência?",
            a: 'Não, estou apenas buscando apoio.',
            b: 'Estou passando por dificuldades, mas consigo lidar com a rotina.',
            c: 'Estou com grande sofrimento emocional e preciso de ajuda em breve.',
            d: 'Sim, preciso de atendimento prioritário o quanto antes.',
        }
    ];

    const opcoes = ['a', 'b', 'c', 'd'];

    if (!fontsLoaded) {
        return null;
    }

    return (
        <View style={styles.container}>
            <View style={styles.progressBar}>
                <View style={styles.bar} />
                <View
                    style={{
                        width: (val * (width - 20)) / 100,
                    }}
                />
            </View>
            <Text style={styles.progressText}> {questao + 1} de 10 </Text>

            <View style={styles.mainView}>
                <View style={{ height: 100 }}>
                    <Text style={styles.questionText}> {questoes[questao].nome} </Text>
                </View>

                <View style={styles.questionView}>
                    {opcoes.map((opcao) => (
                        <TouchableOpacity
                            key={opcao}
                            style={resposta === opcao ? styles.chosenAnswerView : styles.answerView}
                            onPress={() => respostaEscolhida(opcao)}
                        >
                            <Text style={resposta === opcao ? styles.chosenAnswerText : styles.answerText}>
                                {questoes[questao][opcao]}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <TouchableOpacity
                    style={styles.sendButton}
                    onPress={() => {
                        if (questao < questoes.length - 1 && resposta != '') {
                            alterarQuestao(questao + 1);
                        }
                    }}
                >
                    <Text style={styles.sendText}> {questao < 9 ? 'Continuar' : 'Finalizar'} </Text>
                </TouchableOpacity>
            </View>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    progressBar: {
        height: 12.5,
        marginHorizontal: 10,
        marginTop: 35,
        borderRadius: 100,
        flexDirection: 'row',
        backgroundColor: paleta.cor.a1,
    },
    bar: {
        flex: 1,
        borderRadius: 100,
        backgroundColor: paleta.cor.a3,
    },
    progressText: {
        marginLeft: 10,
        fontSize: 14,
        color: '#777',
        fontFamily: 'Montserrat-Bold',
    },
    mainView: {
        flex: 1,
        marginHorizontal: 10,
        paddingVertical: 10,
    },
    questionView: {
        flex: 10,
        marginBottom: -20,
    },
    answerView: {
        flex: 1,
        marginVertical: 15,
        marginHorizontal: 15,
        borderRadius: 20,
        backgroundColor: paleta.cor.a1,
        borderBottomWidth: 5,
        borderColor: paleta.cor.a3,
        justifyContent: 'center',
    },
    chosenAnswerView: {
        flex: 1,
        marginVertical: 15,
        marginHorizontal: 15,
        borderRadius: 20,
        backgroundColor: paleta.cor.a3,
        borderBottomWidth: 5,
        borderColor: paleta.cor.a4,
        justifyContent: 'center',
    },
    answerText: {
        fontSize: 18,
        margin: 10,
        fontFamily: 'Montserrat-Bold',
    },
    chosenAnswerText: {
        fontSize: 18,
        margin: 10,
        color: '#FFF',
        fontFamily: 'Montserrat-Bold',
    },
    questionText: {
        fontSize: 20,
        marginHorizontal: 10,
        marginTop: 5,
        minHeight: 30,
        fontFamily: 'Montserrat-Bold',
    },
    sendButton: {
        flex: 1,
        backgroundColor: paleta.cor.a4,
        borderRadius: 50,
        marginHorizontal: 60,
        marginTop: 60,
        marginBottom: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendText: {
        fontSize: 24,
        color: '#FFF',
        fontFamily: 'Montserrat-Bold',
    }
});