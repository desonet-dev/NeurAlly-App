import {
    TouchableOpacity,
    Text,
    View,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    ActivityIndicator,
    BackHandler,
    Linking,
} from 'react-native';
import { useState, useEffect } from 'react';
import { useFonts } from 'expo-font';
import Ionicons from '@expo/vector-icons/Ionicons';
import { salvarTriagem, buscarTriagem } from '../services/triagemService.js';

import { useEstilos } from '../contexts/TemaContext.js';
const QUESTOES = [
    {
        id: 'motivo',
        nome: 'Qual é o principal motivo pelo qual você está buscando ajuda neste momento?',
        a: 'Ansiedade e preocupações excessivas.',
        b: 'Tristeza, desânimo ou falta de motivação.',
        c: 'Problemas em relacionamentos pessoais ou familiares.',
        d: 'Autoconhecimento e desenvolvimento pessoal.',
    },
    {
        id: 'duracao',
        nome: 'Há quanto tempo você percebe esses sentimentos ou dificuldades?',
        a: 'Há poucas semanas.',
        b: 'Entre 1 e 6 meses.',
        c: 'Entre 6 meses e 2 anos.',
        d: 'Há mais de 2 anos.',
    },
    {
        id: 'frequencia',
        nome: 'Com que frequência esses problemas afetam seu dia a dia?',
        a: 'Raramente.',
        b: 'Algumas vezes por semana.',
        c: 'Quase todos os dias.',
        d: 'Constantemente.',
    },
    {
        id: 'acompanhamento',
        nome: 'Você já realizou acompanhamento em saúde mental anteriormente?',
        a: 'Nunca fiz acompanhamento.',
        b: 'Fiz terapia no passado.',
        c: 'Estou em acompanhamento atualmente.',
        d: 'Já fiz terapia e acompanhamento psiquiátrico.',
    },
    {
        id: 'medicacao',
        nome: 'Você utiliza ou já utilizou medicação para questões emocionais ou psicológicas?',
        a: 'Nunca utilizei.',
        b: 'Já utilizei no passado.',
        c: 'Utilizo atualmente com acompanhamento médico.',
        d: 'Utilizo atualmente, mas gostaria de reavaliar o tratamento.',
    },
    {
        id: 'modalidade',
        nome: 'Qual tipo de atendimento você prefere?',
        a: 'Online.',
        b: 'Presencial.',
        c: 'Tanto online quanto presencial.',
        d: 'Não tenho preferência.',
    },
    {
        id: 'valor',
        nome: 'Qual faixa de valor por sessão você procura?',
        a: 'Até R$ 80.',
        b: 'Entre R$ 80 e R$ 150.',
        c: 'Entre R$ 150 e R$ 250.',
        d: 'Acima de R$ 250.',
    },
    {
        id: 'foco',
        nome: 'Você gostaria de um acompanhamento focado em:',
        a: 'Controle da ansiedade e regulação emocional.',
        b: 'Relacionamentos e questões familiares.',
        c: 'Autoconhecimento e crescimento pessoal.',
        d: 'Diagnóstico, tratamento e manejo de sintomas.',
    },
    {
        id: 'sintoma',
        nome: 'Qual desses problemas você mais sente no seu dia a dia?',
        a: 'Ansiedade, preocupação excessiva ou crises de pânico.',
        b: 'Tristeza, desânimo ou falta de energia.',
        c: 'Insônia, alterações no sono ou fadiga constante.',
        d: 'Dificuldade de concentração, irritabilidade ou estresse intenso.',
    },
    {
        id: 'urgencia',
        nome: 'Você considera que precisa de atendimento com urgência?',
        a: 'Não, estou apenas buscando apoio.',
        b: 'Estou passando por dificuldades, mas consigo lidar com a rotina.',
        c: 'Estou com grande sofrimento emocional e preciso de ajuda em breve.',
        d: 'Sim, preciso de atendimento prioritário o quanto antes.',
    },
];

const OPCOES = ['a', 'b', 'c', 'd'];
const TOTAL = QUESTOES.length;
const NIVEIS_URGENCIA = { a: 'Baixa', b: 'Moderada', c: 'Alta', d: 'Prioritária' };

// Linhas exibidas no resumo da tela final: [rótulo, id da questão].
const RESUMO = [
    ['Motivo principal', 'motivo'],
    ['Foco do acompanhamento', 'foco'],
    ['Tipo de atendimento', 'modalidade'],
    ['Valor por sessão', 'valor'],
];

function formatarData(timestamp) {
    const data = timestamp?.toDate ? timestamp.toDate() : null;
    return data ? data.toLocaleDateString('pt-BR') : null;
}

export default function TriagemScreen({ navigation }) {
  const [styles, cor] = useEstilos(criarStyles);
    const [etapa, setEtapa] = useState('inicio'); // 'inicio' | 'perguntas' | 'fim'
    const [indice, setIndice] = useState(0);
    const [respostas, setRespostas] = useState(Array(TOTAL).fill(null));
    const [salvando, setSalvando] = useState(false);
    const [erroAoSalvar, setErroAoSalvar] = useState(false);
    const [ultimaTriagem, setUltimaTriagem] = useState(null);

    const [fontsLoaded] = useFonts({
        'Montserrat-Regular': require('../styles/fonts/Montserrat/static/Montserrat-Regular.ttf'),
        'Montserrat-Bold': require('../styles/fonts/Montserrat/static/Montserrat-Bold.ttf'),
    });

    // Se o usuário já fez a triagem antes, avisamos na tela inicial.
    useEffect(() => {
        let ativo = true;
        buscarTriagem()
            .then((dados) => { if (ativo) setUltimaTriagem(dados); })
            .catch(() => {});
        return () => { ativo = false; };
    }, []);

    // Botão "voltar" do Android: durante as perguntas, volta uma questão.
    useEffect(() => {
        const inscricao = BackHandler.addEventListener('hardwareBackPress', () => {
            if (etapa === 'perguntas') {
                voltarQuestao();
                return true;
            }
            return false;
        });
        return () => inscricao.remove();
    }, [etapa]);

    function sairDaTriagem() {
        if (navigation.canGoBack()) {
            navigation.goBack();
        } else {
            navigation.navigate('Home');
        }
    }

    function comecar() {
        setRespostas(Array(TOTAL).fill(null));
        setIndice(0);
        setErroAoSalvar(false);
        setEtapa('perguntas');
    }

    function escolher(opcao) {
        setRespostas((atual) => atual.map((r, i) => (i === indice ? opcao : r)));
    }

    function voltarQuestao() {
        if (indice > 0) {
            setIndice((i) => i - 1);
        } else {
            setEtapa('inicio');
        }
    }

    function nivelDeUrgencia() {
        return NIVEIS_URGENCIA[respostas[TOTAL - 1]] || NIVEIS_URGENCIA.a;
    }

    async function gravar() {
        setSalvando(true);
        setErroAoSalvar(false);
        try {
            await salvarTriagem({
                urgencia: nivelDeUrgencia(),
                respostas: QUESTOES.map((q, i) => ({
                    id: q.id,
                    pergunta: q.nome,
                    opcao: respostas[i],
                    texto: q[respostas[i]],
                })),
            });
        } catch (erro) {
            console.warn('Erro ao salvar a triagem:', erro);
            setErroAoSalvar(true);
        } finally {
            setSalvando(false);
        }
    }

    async function avancar() {
        if (respostas[indice] === null || salvando) return;

        if (indice < TOTAL - 1) {
            setIndice(indice + 1);
            return;
        }

        setEtapa('fim');
        await gravar();
    }

    function ligar(numero) {
        Linking.openURL(`tel:${numero}`).catch(() => {});
    }

    if (!fontsLoaded) {
        return null;
    }

    /* ------------------------------ TELA INICIAL ------------------------------ */
    if (etapa === 'inicio') {
        const dataUltima = formatarData(ultimaTriagem?.concluidaEm);

        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.topBar}>
                    <TouchableOpacity onPress={sairDaTriagem} hitSlop={12}>
                        <Ionicons name="chevron-back" size={28} color={cor.fg('#2A59C2')} />
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.centerContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.heroIcon}>
                        <Ionicons name="clipboard-outline" size={52} color={cor.fg("#FFF")} />
                    </View>

                    <Text style={styles.heroTitle}>Triagem inicial</Text>
                    <Text style={styles.heroText}>
                        Responda algumas perguntas rápidas para que possamos entender o que você está
                        buscando e indicar os profissionais mais adequados.
                    </Text>

                    <View style={styles.infoCard}>
                        <View style={styles.infoRow}>
                            <Ionicons name="time-outline" size={22} color={cor.fg('#2A59C2')} />
                            <Text style={styles.infoText}>{TOTAL} perguntas, cerca de 2 minutos.</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Ionicons name="lock-closed-outline" size={22} color={cor.fg('#2A59C2')} />
                            <Text style={styles.infoText}>Suas respostas ficam salvas apenas na sua conta.</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Ionicons name="refresh-outline" size={22} color={cor.fg('#2A59C2')} />
                            <Text style={styles.infoText}>Você pode refazer a triagem quando quiser.</Text>
                        </View>
                    </View>

                    <Text style={styles.disclaimer}>
                        A triagem não é um diagnóstico nem substitui a avaliação de um profissional.
                    </Text>

                    {!!dataUltima && (
                        <Text style={styles.lastTriage}>
                            Última triagem feita em {dataUltima}. Ao concluir uma nova, o resultado anterior será substituído.
                        </Text>
                    )}
                </ScrollView>

                <View style={styles.footer}>
                    <TouchableOpacity style={styles.sendButton} onPress={comecar}>
                        <Text style={styles.sendText}>{dataUltima ? 'Refazer triagem' : 'Começar'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.secondaryButton} onPress={sairDaTriagem}>
                        <Text style={styles.secondaryText}>Agora não</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    /* ------------------------------- TELA FINAL ------------------------------- */
    if (etapa === 'fim') {
        const nivel = nivelDeUrgencia();
        const mostrarAjudaImediata = nivel === 'Alta' || nivel === 'Prioritária';

        return (
            <SafeAreaView style={styles.container}>
                <ScrollView contentContainerStyle={styles.centerContent} showsVerticalScrollIndicator={false}>
                    <View style={[styles.heroIcon, { backgroundColor: cor.bg('#3FAE7A') }]}>
                        <Ionicons name="checkmark" size={56} color={cor.fg("#FFF")} />
                    </View>

                    <Text style={styles.heroTitle}>Triagem concluída!</Text>
                    <Text style={styles.heroText}>
                        Obrigado por responder. Com base nas suas respostas, já podemos mostrar profissionais
                        que combinam com o que você procura.
                    </Text>

                    {mostrarAjudaImediata && (
                        <View style={styles.alertCard}>
                            <View style={styles.alertHeader}>
                                <Ionicons name="heart" size={20} color={cor.fg("#D64545")} />
                                <Text style={styles.alertTitle}>Precisa de ajuda agora?</Text>
                            </View>
                            <Text style={styles.alertText}>
                                Se o sofrimento estiver muito intenso, não espere pela consulta. Você pode falar
                                com alguém agora, de graça e a qualquer hora.
                            </Text>
                            <View style={styles.alertButtons}>
                                <TouchableOpacity style={styles.alertButton} onPress={() => ligar('188')}>
                                    <Text style={styles.alertButtonText}>CVV · 188</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.alertButton} onPress={() => ligar('192')}>
                                    <Text style={styles.alertButtonText}>SAMU · 192</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    <View style={styles.summaryCard}>
                        <Text style={styles.summaryTitle}>Seu resumo</Text>

                        {RESUMO.map(([rotulo, id]) => {
                            const i = QUESTOES.findIndex((q) => q.id === id);
                            return (
                                <View key={id} style={styles.summaryRow}>
                                    <Text style={styles.summaryLabel}>{rotulo}</Text>
                                    <Text style={styles.summaryValue}>{QUESTOES[i][respostas[i]]}</Text>
                                </View>
                            );
                        })}

                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Prioridade de atendimento</Text>
                            <Text style={styles.summaryValue}>{nivel}</Text>
                        </View>
                    </View>

                    {salvando && (
                        <View style={styles.statusRow}>
                            <ActivityIndicator size="small" color={cor.fg('#2A59C2')} />
                            <Text style={styles.statusText}>Salvando suas respostas...</Text>
                        </View>
                    )}

                    {erroAoSalvar && !salvando && (
                        <View style={styles.errorCard}>
                            <Text style={styles.errorText}>
                                Não foi possível salvar suas respostas. Verifique sua conexão e tente novamente.
                            </Text>
                            <TouchableOpacity onPress={gravar}>
                                <Text style={styles.errorLink}>Tentar novamente</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </ScrollView>

                <View style={styles.footer}>
                    <TouchableOpacity
                        style={styles.sendButton}
                        onPress={() => navigation.navigate('BuscaProfissionais')}
                    >
                        <Text style={styles.sendText}>Ver profissionais</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('Home')}>
                        <Text style={styles.secondaryText}>Voltar ao início</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    /* -------------------------------- PERGUNTAS ------------------------------- */
    const questao = QUESTOES[indice];
    const resposta = respostas[indice];
    const concluidas = indice + (resposta !== null ? 1 : 0);
    const ultima = indice === TOTAL - 1;

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.questionHeader}>
                <TouchableOpacity onPress={voltarQuestao} hitSlop={12}>
                    <Ionicons name="chevron-back" size={28} color={cor.fg('#2A59C2')} />
                </TouchableOpacity>

                <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${(concluidas / TOTAL) * 100}%` }]} />
                </View>

                <TouchableOpacity onPress={sairDaTriagem} hitSlop={12}>
                    <Ionicons name="close" size={26} color={cor.fg("#777")} />
                </TouchableOpacity>
            </View>

            <Text style={styles.progressText}>{indice + 1} de {TOTAL}</Text>

            <ScrollView
                style={styles.mainView}
                contentContainerStyle={styles.questionContent}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.questionText}>{questao.nome}</Text>

                {OPCOES.map((opcao) => {
                    const escolhida = resposta === opcao;
                    return (
                        <TouchableOpacity
                            key={opcao}
                            style={escolhida ? styles.chosenAnswerView : styles.answerView}
                            onPress={() => escolher(opcao)}
                            activeOpacity={0.8}
                        >
                            <Text style={escolhida ? styles.chosenAnswerText : styles.answerText}>
                                {questao[opcao]}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.sendButton, resposta === null && styles.sendButtonDisabled]}
                    onPress={avancar}
                    disabled={resposta === null}
                >
                    <Text style={styles.sendText}>{ultima ? 'Finalizar' : 'Continuar'}</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const criarStyles = (cor) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: cor.bg('#FFF'),
    },

    /* Perguntas */
    questionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 10,
        marginTop: 35,
    },
    progressBar: {
        flex: 1,
        height: 12.5,
        marginHorizontal: 10,
        borderRadius: 100,
        overflow: 'hidden',
        backgroundColor: cor.bg('#F2F2FF'),
    },
    progressFill: {
        height: '100%',
        borderRadius: 100,
        backgroundColor: cor.bg('#6196DA'),
    },
    progressText: {
        marginLeft: 20,
        marginTop: 6,
        fontSize: 14,
        color: cor.fg('#777'),
        fontFamily: 'Montserrat-Bold',
    },
    mainView: {
        flex: 1,
        marginHorizontal: 10,
    },
    questionContent: {
        paddingVertical: 10,
        paddingBottom: 20,
    },
    questionText: {
        fontSize: 20,
        marginHorizontal: 10,
        marginTop: 5,
        marginBottom: 10,
        minHeight: 30,
        fontFamily: 'Montserrat-Bold',
    },
    answerView: {
        minHeight: 70,
        marginVertical: 8,
        marginHorizontal: 15,
        borderRadius: 20,
        backgroundColor: cor.bg('#F2F2FF'),
        borderBottomWidth: 5,
        borderColor: cor.bd('#99BCEE'),
        justifyContent: 'center',
    },
    chosenAnswerView: {
        minHeight: 70,
        marginVertical: 8,
        marginHorizontal: 15,
        borderRadius: 20,
        backgroundColor: cor.bg('#99BCEE'),
        borderBottomWidth: 5,
        borderColor: cor.bd('#6196DA'),
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
        color: cor.fg('#FFF'),
        fontFamily: 'Montserrat-Bold',
    },

    /* Rodapé e botões */
    footer: {
        paddingHorizontal: 40,
        paddingTop: 10,
        paddingBottom: 25,
    },
    sendButton: {
        height: 56,
        backgroundColor: cor.bg('#6196DA'),
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonDisabled: {
        opacity: 0.4,
    },
    sendText: {
        fontSize: 20,
        color: cor.fg('#FFF'),
        fontFamily: 'Montserrat-Bold',
    },
    secondaryButton: {
        height: 48,
        marginTop: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    secondaryText: {
        fontSize: 15,
        color: cor.fg('#2A59C2'),
        fontFamily: 'Montserrat-Bold',
    },

    /* Início e fim */
    topBar: {
        marginHorizontal: 10,
        marginTop: 35,
    },
    centerContent: {
        flexGrow: 1,
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 30,
        paddingBottom: 20,
    },
    heroIcon: {
        width: 104,
        height: 104,
        borderRadius: 52,
        backgroundColor: cor.bg('#6196DA'),
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    heroTitle: {
        fontSize: 26,
        color: cor.fg('#131A22'),
        textAlign: 'center',
        marginBottom: 10,
        fontFamily: 'Montserrat-Bold',
    },
    heroText: {
        fontSize: 15,
        lineHeight: 22,
        color: cor.fg('#5A6B87'),
        textAlign: 'center',
        marginBottom: 24,
        fontFamily: 'Montserrat-Regular',
    },
    infoCard: {
        width: '100%',
        backgroundColor: cor.bg('#F2F2FF'),
        borderRadius: 20,
        padding: 18,
        marginBottom: 16,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
    },
    infoText: {
        flex: 1,
        marginLeft: 12,
        fontSize: 14,
        color: cor.fg('#333'),
        fontFamily: 'Montserrat-Regular',
    },
    disclaimer: {
        fontSize: 12,
        lineHeight: 18,
        color: cor.fg('#777'),
        textAlign: 'center',
        fontFamily: 'Montserrat-Regular',
    },
    lastTriage: {
        marginTop: 14,
        fontSize: 12,
        lineHeight: 18,
        color: cor.fg('#2A59C2'),
        textAlign: 'center',
        fontFamily: 'Montserrat-Bold',
    },
    summaryCard: {
        width: '100%',
        backgroundColor: cor.bg('#F2F2FF'),
        borderRadius: 20,
        padding: 18,
        marginBottom: 16,
    },
    summaryTitle: {
        fontSize: 16,
        color: cor.fg('#131A22'),
        marginBottom: 8,
        fontFamily: 'Montserrat-Bold',
    },
    summaryRow: {
        paddingVertical: 8,
        borderTopWidth: 1,
        borderColor: cor.bd('#D4E6F1'),
    },
    summaryLabel: {
        fontSize: 11,
        color: cor.fg('#2A59C2'),
        marginBottom: 2,
        fontFamily: 'Montserrat-Bold',
    },
    summaryValue: {
        fontSize: 14,
        color: cor.fg('#333'),
        fontFamily: 'Montserrat-Regular',
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    statusText: {
        marginLeft: 8,
        fontSize: 13,
        color: cor.fg('#5A6B87'),
        fontFamily: 'Montserrat-Regular',
    },
    errorCard: {
        width: '100%',
        backgroundColor: cor.bg('#FDEDED'),
        borderRadius: 16,
        padding: 14,
        alignItems: 'center',
    },
    errorText: {
        fontSize: 13,
        lineHeight: 19,
        color: cor.fg('#D64545'),
        textAlign: 'center',
        fontFamily: 'Montserrat-Regular',
    },
    errorLink: {
        marginTop: 8,
        fontSize: 14,
        color: cor.fg('#D64545'),
        textDecorationLine: 'underline',
        fontFamily: 'Montserrat-Bold',
    },
    alertCard: {
        width: '100%',
        backgroundColor: cor.bg('#FDEDED'),
        borderRadius: 20,
        padding: 18,
        marginBottom: 16,
    },
    alertHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    alertTitle: {
        marginLeft: 8,
        fontSize: 15,
        color: cor.fg('#D64545'),
        fontFamily: 'Montserrat-Bold',
    },
    alertText: {
        fontSize: 13,
        lineHeight: 19,
        color: cor.fg('#5A2A2A'),
        marginBottom: 12,
        fontFamily: 'Montserrat-Regular',
    },
    alertButtons: {
        flexDirection: 'row',
    },
    alertButton: {
        flex: 1,
        backgroundColor: cor.bg('#D64545'),
        borderRadius: 12,
        paddingVertical: 12,
        alignItems: 'center',
        marginRight: 8,
    },
    alertButtonText: {
        color: cor.fg('#FFF'),
        fontSize: 14,
        fontFamily: 'Montserrat-Bold',
    },
});
