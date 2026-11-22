import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ScrollView, PanResponder, useWindowDimensions, ActivityIndicator,
} from 'react-native';
import { useFonts } from 'expo-font';
import Ionicons from '@expo/vector-icons/Ionicons';
import PlantaSvg, { ErvaSvg, GotaSvg } from '../components/PlantaSvg.js';
import ModalPlantaJardim from '../components/ModalPlantaJardim.js';
import ModalSementes from '../components/ModalSementes.js';
import ModalGotasDiario from '../components/ModalGotasDiario.js';
import ModalConfirmacao from '../components/ModalConfirmacao.js';
import useJardim from '../hooks/useJardim.js';
import { useEstilos } from '../contexts/TemaContext.js';
import {
  COLUNAS, ESPECIES, NOMES_ESTAGIOS, NUM_CANTEIROS, POSICOES_ERVAS,
  ervasTocadas, estagioDaPlanta, plantaAdormecida, proximaSemente, quantidadeDeErvas,
} from '../utils/jardim.js';

const ESPACO = 8; // distância entre os canteiros
const PADDING_PAINEL = 10;

const COMO_FUNCIONA = [
  'Toque em um canteiro vazio para plantar uma semente. Toque em uma planta para ver como ela está e regar.',
  'Regar gasta 1 gota. Você ganha gotas toda vez que faz um registro no diário emocional (dias de tristeza rendem mais gotas).',
  'Deslize o dedo sobre as ervinhas do jardim para limpá-las. Cada ervinha limpa ajuda a planta a crescer.',
  'Cada planta passa por 4 estágios: semente, broto, planta jovem e planta adulta.',
  'Se você ficar um tempo sem cuidar, a planta não morre: ela só adormece e acorda quando você voltar.',
  'Novas sementes são liberadas quando você registra o diário em 3, 7 e 15 dias diferentes (não precisam ser seguidos).',
].join('\n\n');

// Jardim Zen: jogo relaxante em que a pessoa planta, rega e cuida de plantas com as gotas ganhas no diário emocional.
export default function JardimZen({ navigation }) {
  const [styles, cor] = useEstilos(criarStyles);
  const { width } = useWindowDimensions();
  const jardim = useJardim();
  const { estado, carregando, erro, erroAoSalvar, dias, novidades } = jardim;

  const [seletor, setSeletor] = useState(null); // { indice } (plantar) ou { info: true }
  const [plantaAberta, setPlantaAberta] = useState(null); // índice do canteiro
  const [mensagemPlanta, setMensagemPlanta] = useState('');
  const [disparoChuva, setDisparoChuva] = useState(0);
  const [aviso, setAviso] = useState('');
  const [removendo, setRemovendo] = useState(null);
  const [ajuda, setAjuda] = useState(false);
  const [limpando, setLimpando] = useState(false);

  const [fontsLoaded] = useFonts({
    'Montserrat-Regular': require('../styles/fonts/Montserrat/static/Montserrat-Regular.ttf'),
    'Montserrat-Bold': require('../styles/fonts/Montserrat/static/Montserrat-Bold.ttf'),
  });

  // Medidas do jardim na tela.
  const larguraPainel = Math.min(width - 40, 400);
  const lado = Math.floor((larguraPainel - PADDING_PAINEL * 2 - ESPACO * (COLUNAS - 1)) / COLUNAS);

  // Mensagens rápidas (somem sozinhas).
  const temporizadorAviso = useRef(null);
  const mostrarAviso = (texto) => {
    setAviso(texto);
    if (temporizadorAviso.current) clearTimeout(temporizadorAviso.current);
    temporizadorAviso.current = setTimeout(() => setAviso(''), 3200);
  };
  useEffect(() => () => temporizadorAviso.current && clearTimeout(temporizadorAviso.current), []);

  // O gesto de limpar é criado uma vez só, então lê sempre os valores mais recentes por aqui.
  const recente = useRef({});
  recente.current = { estado, lado, jardim, mostrarAviso };
  const grade = useRef(null);
  const origemDaGrade = useRef({ x: 0, y: 0 });
  const medirGrade = () => grade.current?.measureInWindow?.((x, y) => { origemDaGrade.current = { x, y }; });

  const gesto = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        // Ao encostar o dedo: descobre onde a grade está na tela (sem tomar o toque, para o toque simples continuar funcionando).
        onStartShouldSetPanResponderCapture: () => {
          medirGrade();
          return false;
        },
        // Ao arrastar o dedo sobre o jardim: o gesto assume (e a tela não rola).
        onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) + Math.abs(g.dy) > 6,
        onMoveShouldSetPanResponderCapture: (_, g) => Math.abs(g.dx) + Math.abs(g.dy) > 6,
        onPanResponderGrant: () => setLimpando(true),
        onPanResponderTerminationRequest: () => false,
        onPanResponderMove: (_, g) => {
          const { estado: atual, lado: l, jardim: j, mostrarAviso: avisar } = recente.current;
          if (!atual) return;
          const x = g.moveX - origemDaGrade.current.x;
          const y = g.moveY - origemDaGrade.current.y;
          ervasTocadas(atual, x, y, l, ESPACO).forEach(({ indice, slot }) => {
            const r = j.limpar(indice, slot);
            if (r.subiuDeEstagio) {
              const planta = atual.canteiros[indice];
              avisar(`Sua ${ESPECIES[planta.especie].nome.toLowerCase()} cresceu: ${NOMES_ESTAGIOS[r.estagio].toLowerCase()}!`);
            }
          });
        },
        onPanResponderRelease: () => setLimpando(false),
        onPanResponderTerminate: () => setLimpando(false),
      }),
    []
  );

  if (!fontsLoaded) return null;

  const gotas = estado?.gotas || 0;
  const proxima = proximaSemente(dias);
  const plantaAtual = plantaAberta !== null && estado ? estado.canteiros[plantaAberta] : null;
  const totalErvas = estado ? estado.canteiros.reduce((s, p) => s + quantidadeDeErvas(p), 0) : 0;

  const tocarCanteiro = (indice) => {
    if (!estado) return;
    if (estado.canteiros[indice]) {
      setMensagemPlanta('');
      setPlantaAberta(indice);
    } else {
      setSeletor({ indice });
    }
  };

  const escolherSemente = (especieId) => {
    if (!seletor || seletor.indice === undefined) return;
    const r = jardim.plantar(seletor.indice, especieId);
    setSeletor(null);
    if (r.estado) mostrarAviso(`Você plantou ${ESPECIES[especieId].nome.toLowerCase()}. Regue para ela crescer!`);
  };

  const regarPlanta = () => {
    if (plantaAberta === null) return;
    const planta = estado.canteiros[plantaAberta];
    const r = jardim.regar(plantaAberta);
    if (r.erro === 'sem-gotas') {
      setMensagemPlanta('Você está sem gotas. Registre seu dia no diário para ganhar mais!');
      return;
    }
    if (r.erro) return;
    setDisparoChuva((d) => d + 1);
    const nome = ESPECIES[planta.especie].nome;
    if (r.subiuDeEstagio) setMensagemPlanta(`✨ Sua ${nome.toLowerCase()} virou: ${NOMES_ESTAGIOS[r.estagio].toLowerCase()}!`);
    else if (r.acordou) setMensagemPlanta(`Sua ${nome.toLowerCase()} acordou. Que bom te ver de volta!`);
    else setMensagemPlanta('Regada com carinho. 💧');
  };

  const confirmarRemocao = () => {
    if (removendo !== null) {
      jardim.remover(removendo);
      setRemovendo(null);
      setPlantaAberta(null);
      mostrarAviso('Planta removida. O canteiro está livre para uma nova semente.');
    }
  };

  const irParaDiario = () => {
    setPlantaAberta(null);
    navigation.navigate('EscreverDiario');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topo}>
        <TouchableOpacity onPress={() => navigation.goBack()} accessibilityLabel="Voltar" hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="chevron-back" size={28} color={cor.fg('#1A56DB')} />
        </TouchableOpacity>
        <Text style={styles.titulo}>Jardim Zen</Text>
        <View style={styles.gotasChip} accessibilityLabel={`${gotas} gotas`}>
          <GotaSvg tamanho={16} />
          <Text style={styles.gotasChipTexto}>{gotas}</Text>
        </View>
        <TouchableOpacity onPress={() => setAjuda(true)} accessibilityLabel="Como funciona" hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="help-circle-outline" size={26} color={cor.fg('#1A56DB')} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.conteudo} showsVerticalScrollIndicator={false} scrollEnabled={!limpando}>
        {carregando && !estado ? (
          <ActivityIndicator color={cor.fg('#6292D6')} style={{ marginTop: 60 }} />
        ) : erro && !estado ? (
          <View style={styles.erroBox}>
            <Ionicons name="alert-circle" size={20} color={cor.fg('#D64545')} style={{ marginRight: 8 }} />
            <Text style={styles.erroTexto}>
              {erro?.code === 'permission-denied'
                ? 'Sem permissão para abrir o jardim. Verifique as regras do Firestore.'
                : 'Não foi possível abrir o jardim. Verifique sua conexão.'}
            </Text>
            <TouchableOpacity onPress={jardim.recarregar}>
              <Text style={styles.erroLink}>Tentar de novo</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={styles.instrucao}>
              {totalErvas > 0
                ? 'Deslize o dedo sobre as ervinhas para limpar o jardim. Toque nos canteiros para plantar e regar.'
                : 'Toque em um canteiro para plantar ou cuidar. Seu jardim está limpinho!'}
            </Text>

            {!!aviso && (
              <View style={styles.aviso} accessibilityLiveRegion="polite">
                <Text style={styles.avisoTexto}>{aviso}</Text>
              </View>
            )}

            <View style={[styles.painel, { width: larguraPainel, padding: PADDING_PAINEL }]}>
              <View
                ref={grade}
                testID="jardim-grade"
                onLayout={medirGrade}
                style={[styles.grade, { width: lado * COLUNAS + ESPACO * (COLUNAS - 1) }]}
                {...gesto.panHandlers}
              >
                {estado.canteiros.slice(0, NUM_CANTEIROS).map((planta, i) => {
                  const estagio = estagioDaPlanta(planta);
                  const dormindo = plantaAdormecida(planta);
                  const rotulo = planta
                    ? `Canteiro ${i + 1}, ${ESPECIES[planta.especie].nome}, ${NOMES_ESTAGIOS[estagio]}${dormindo ? ', adormecida' : ''}${planta.ervas.length ? `, com ${planta.ervas.length} ${planta.ervas.length === 1 ? 'ervinha' : 'ervinhas'}` : ''}`
                    : `Canteiro ${i + 1}, vazio`;
                  return (
                    <TouchableOpacity
                      key={i}
                      testID={`canteiro-${i}`}
                      style={[
                        styles.canteiro,
                        { width: lado, height: lado, marginRight: i % COLUNAS < COLUNAS - 1 ? ESPACO : 0, marginBottom: i < NUM_CANTEIROS - COLUNAS ? ESPACO : 0 },
                        !planta && styles.canteiroVazio,
                      ]}
                      onPress={() => tocarCanteiro(i)}
                      activeOpacity={0.8}
                      accessibilityRole="button"
                      accessibilityLabel={rotulo}
                    >
                      {planta ? (
                        <PlantaSvg especie={planta.especie} estagio={estagio} tamanho={lado * 0.92} adormecida={dormindo} />
                      ) : (
                        <Ionicons name="add" size={28} color={cor.fg('#6B7A93')} />
                      )}
                      {dormindo && <Text style={styles.zzz}>z z</Text>}
                      {planta &&
                        planta.ervas.map((slot) => (
                          <View
                            key={slot}
                            pointerEvents="none"
                            style={{ position: 'absolute', left: POSICOES_ERVAS[slot].x * lado - 13, top: POSICOES_ERVAS[slot].y * lado - 15 }}
                          >
                            <ErvaSvg tamanho={26} />
                          </View>
                        ))}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {erroAoSalvar && (
              <Text style={styles.erroSalvar}>Não foi possível salvar o jardim agora. Vamos tentar de novo no próximo cuidado.</Text>
            )}

            <View style={styles.cartao}>
              <Text style={styles.cartaoTitulo}>Seu progresso</Text>
              <Text style={styles.cartaoTexto}>
                Dias com registro no diário: <Text style={styles.negrito}>{dias}</Text>
              </Text>
              <Text style={styles.cartaoTexto}>
                {proxima
                  ? `Próxima semente: ${proxima.especie.nome} (faltam ${proxima.faltam} ${proxima.faltam === 1 ? 'dia' : 'dias'} com registro)`
                  : 'Você já desbloqueou todas as sementes. Que jardim lindo!'}
              </Text>
            </View>

            <View style={styles.botoes}>
              <TouchableOpacity style={styles.botaoSecundario} onPress={() => setSeletor({ info: true })} accessibilityLabel="Ver sementes e espécies">
                <Ionicons name="leaf-outline" size={18} color={cor.fg('#1A56DB')} style={{ marginRight: 8 }} />
                <Text style={styles.botaoSecundarioTexto}>Sementes</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.botaoPrincipal} onPress={irParaDiario} accessibilityLabel="Escrever no diário para ganhar gotas">
                <Ionicons name="book-outline" size={18} color={cor.fg('#FFF')} style={{ marginRight: 8 }} />
                <Text style={styles.botaoPrincipalTexto}>Ganhar gotas</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>

      <ModalSementes
        visivel={!!seletor}
        modo={seletor && seletor.indice !== undefined ? 'plantar' : 'info'}
        dias={dias}
        liberadas={estado?.especiesLiberadas || ['suculenta']}
        onFechar={() => setSeletor(null)}
        onEscolher={escolherSemente}
      />

      <ModalPlantaJardim
        visivel={plantaAberta !== null && !!plantaAtual}
        planta={plantaAtual}
        indice={plantaAberta || 0}
        gotas={gotas}
        disparoChuva={disparoChuva}
        mensagem={mensagemPlanta}
        onFechar={() => setPlantaAberta(null)}
        onRegar={regarPlanta}
        onRemover={() => setRemovendo(plantaAberta)}
        onIrParaDiario={irParaDiario}
      />

      <ModalConfirmacao
        visivel={removendo !== null}
        tipo="perigo"
        titulo="Remover esta planta?"
        mensagem="O canteiro ficará livre para uma nova semente. A planta e o crescimento dela serão perdidos."
        textoConfirmar="Sim, remover"
        textoCancelar="Voltar"
        onConfirmar={confirmarRemocao}
        onCancelar={() => setRemovendo(null)}
      />

      <ModalConfirmacao
        visivel={ajuda}
        tipo="info"
        titulo="Como funciona o jardim"
        mensagem={COMO_FUNCIONA}
        textoConfirmar="Entendi"
        onConfirmar={() => setAjuda(false)}
      />

      <ModalGotasDiario
        visivel={!!novidades}
        gotas={novidades?.gotasGanhas || 0}
        mensagem={
          novidades?.gotasGanhas
            ? 'Contabilizamos as gotas dos seus registros anteriores no diário.'
            : 'Seu diário liberou novas sementes!'
        }
        novasEspecies={novidades?.novasEspecies || []}
        textoPrincipal="Ótimo!"
        onPrincipal={jardim.limparNovidades}
      />
    </SafeAreaView>
  );
}

const criarStyles = (cor) => StyleSheet.create({
  container: { flex: 1, backgroundColor: cor.bg('#E4F0F8') },
  topo: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 14, paddingBottom: 8, gap: 10 },
  titulo: { flex: 1, fontFamily: 'Montserrat-Bold', fontSize: 22, color: cor.fg('#1A1A1A') },
  gotasChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: cor.bg('#E1F5FE'), borderRadius: 16, paddingVertical: 5, paddingHorizontal: 12, gap: 6 },
  gotasChipTexto: { fontFamily: 'Montserrat-Bold', fontSize: 16, color: cor.fg('#0277BD') },
  conteudo: { alignItems: 'center', paddingHorizontal: 20, paddingBottom: 40 },
  instrucao: { fontFamily: 'Montserrat-Regular', fontSize: 13, color: cor.fg('#5A6B87'), textAlign: 'center', marginTop: 6, marginBottom: 12, lineHeight: 19 },
  aviso: { alignSelf: 'stretch', backgroundColor: cor.bg('#E6F6EC'), borderRadius: 12, paddingVertical: 10, paddingHorizontal: 14, marginBottom: 12 },
  avisoTexto: { fontFamily: 'Montserrat-Bold', fontSize: 12, color: cor.fg('#2E9E5B'), textAlign: 'center' },
  painel: { borderRadius: 24, backgroundColor: cor.escuro ? cor.bg('#1B3328') : cor.bg('#CDE8B5'), alignItems: 'center' },
  grade: { flexDirection: 'row', flexWrap: 'wrap' },
  canteiro: { borderRadius: 16, backgroundColor: cor.escuro ? cor.bg('#25463A') : cor.bg('#DCEFC9'), alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  canteiroVazio: { borderWidth: 1.5, borderStyle: 'dashed', borderColor: cor.escuro ? cor.bd('#3F6B58') : cor.bd('#9CC27E') },
  zzz: { position: 'absolute', top: 6, right: 8, fontFamily: 'Montserrat-Bold', fontSize: 11, color: cor.fg('#5A6B87') },
  erroSalvar: { fontFamily: 'Montserrat-Regular', fontSize: 11, color: cor.fg('#B03030'), textAlign: 'center', marginTop: 10 },
  cartao: { alignSelf: 'stretch', backgroundColor: cor.bg('#FFF'), borderRadius: 18, padding: 16, marginTop: 16 },
  cartaoTitulo: { fontFamily: 'Montserrat-Bold', fontSize: 14, color: cor.fg('#1A56DB'), marginBottom: 6 },
  cartaoTexto: { fontFamily: 'Montserrat-Regular', fontSize: 13, color: cor.fg('#333'), lineHeight: 19, marginTop: 2 },
  negrito: { fontFamily: 'Montserrat-Bold' },
  botoes: { alignSelf: 'stretch', flexDirection: 'row', gap: 10, marginTop: 14 },
  botaoSecundario: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: cor.bd('#1A56DB'), borderRadius: 14, paddingVertical: 13, backgroundColor: cor.bg('#FFF') },
  botaoSecundarioTexto: { fontFamily: 'Montserrat-Bold', fontSize: 13, color: cor.fg('#1A56DB') },
  botaoPrincipal: { flex: 1.3, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: cor.bg('#1A56DB'), borderRadius: 14, paddingVertical: 13 },
  botaoPrincipalTexto: { fontFamily: 'Montserrat-Bold', fontSize: 13, color: cor.fg('#FFF') },
  erroBox: { alignSelf: 'stretch', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', backgroundColor: cor.bg('#FDEDED'), borderWidth: 1, borderColor: cor.bd('#F5C2C2'), borderRadius: 12, padding: 12, marginTop: 30 },
  erroTexto: { flex: 1, fontFamily: 'Montserrat-Regular', fontSize: 12, color: cor.fg('#B03030') },
  erroLink: { fontFamily: 'Montserrat-Bold', fontSize: 12, color: cor.fg('#1A56DB'), marginTop: 8, width: '100%' },
});
