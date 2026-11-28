import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ActivityIndicator, Linking, Vibration } from 'react-native';
import { useFonts } from 'expo-font';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAuth } from '../contexts/AuthContext.js';
import useChamada from '../hooks/useChamada.js';
import SalaDeVideo from '../components/SalaDeVideo';
import { SERVIDOR_VIDEO, ABRE_ANTES_MIN } from '../constants/video.js';
import { consultaTemVideo, montarUrlDaSala } from '../utils/chamada.js';
import { liberarCameraEMicrofone } from '../utils/permissoesDeVideo.js';
import { faixaDeHorario, formatarDataLonga } from '../utils/datas.js';

import { useEstilos } from '../contexts/TemaContext.js';
const doisDigitos = (n) => String(n).padStart(2, '0');
const horaDe = (data) => `${doisDigitos(data.getHours())}:${doisDigitos(data.getMinutes())}`;

// Sala da consulta on-line.
//  - O profissional abre a chamada (a partir de 10 minutos antes do horário).
//  - O paciente espera na "sala de espera" e entra quando o profissional abrir; a tela avisa na hora.
//  - Quem quiser sai sozinho; só o profissional encerra a chamada para todos.
export default function SalaConsulta({ navigation, route }) {
  const [styles, cor] = useEstilos(criarStyles);
  const consulta = route?.params?.consulta;
  const { perfil } = useAuth();
  const ehProfissional = perfil?.tipo === 'psicologo';
  const { chamada, salaAberta, carregando, erro, janela, abrir, encerrar } = useChamada(consulta);

  const [emChamada, setEmChamada] = useState(false);
  const [salaLocal, setSalaLocal] = useState(null); // sala recém-aberta (antes do banco confirmar)
  const [trabalhando, setTrabalhando] = useState(false);
  const [aviso, setAviso] = useState('');
  const viuAberta = useRef(false);
  const estavaAberta = useRef(false);

  const [fontsLoaded] = useFonts({
    'Montserrat-Regular': require('../styles/fonts/Montserrat/static/Montserrat-Regular.ttf'),
    'Montserrat-Bold': require('../styles/fonts/Montserrat/static/Montserrat-Bold.ttf'),
  });

  const sala = chamada?.sala || salaLocal;
  const url = useMemo(
    () => (sala ? montarUrlDaSala({ servidor: SERVIDOR_VIDEO, sala, nome: perfil?.nome }) : null),
    [sala, perfil?.nome]
  );

  // Paciente: avisa (vibração curta) quando o profissional abre a sala.
  useEffect(() => {
    if (!ehProfissional && salaAberta && !estavaAberta.current && !emChamada) {
      try {
        Vibration.vibrate(300);
      } catch (e) {
        // sem vibração neste aparelho: o aviso na tela basta
      }
    }
    estavaAberta.current = salaAberta;
  }, [salaAberta, ehProfissional, emChamada]);

  // Se a sala foi encerrada (ou a janela fechou) com a pessoa dentro, sai da chamada.
  useEffect(() => {
    if (!emChamada) return;
    if (salaAberta) {
      viuAberta.current = true;
    } else if (viuAberta.current) {
      setEmChamada(false);
      setAviso(ehProfissional ? 'A chamada foi encerrada.' : 'O profissional encerrou a chamada.');
    }
  }, [salaAberta, emChamada, ehProfissional]);

  if (!fontsLoaded) return null;

  if (!consulta || !consultaTemVideo(consulta)) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.topo}>
          <TouchableOpacity onPress={() => navigation.goBack()} accessibilityLabel="Voltar">
            <Ionicons name="chevron-back" size={28} color={cor.fg("#1A56DB")} />
          </TouchableOpacity>
          <Text style={styles.titulo}>Consulta on-line</Text>
        </View>
        <Text style={styles.textoSimples}>Esta consulta não tem chamada de vídeo (ela é presencial ou foi cancelada).</Text>
      </SafeAreaView>
    );
  }

  const outroNome = ehProfissional ? consulta.clienteNome || 'o paciente' : consulta.profissionalNome || 'o profissional';

  const entrar = async () => {
    setAviso('');
    const liberado = await liberarCameraEMicrofone();
    if (!liberado) {
      setAviso('Para entrar na chamada, permita o uso da câmera e do microfone nas configurações do aparelho.');
      return;
    }
    viuAberta.current = false;
    setEmChamada(true);
  };

  const iniciar = async () => {
    if (trabalhando) return;
    setTrabalhando(true);
    setAviso('');
    try {
      const nova = await abrir();
      setSalaLocal(nova.sala);
      await entrar();
    } catch (e) {
      console.warn('Erro ao abrir a chamada:', e);
      setAviso(
        e?.code === 'permission-denied'
          ? 'Sem permissão para abrir a chamada. Atualize as regras do Firestore (arquivo firestore.rules do projeto).'
          : 'Não foi possível abrir a chamada. Verifique sua conexão e tente novamente.'
      );
    } finally {
      setTrabalhando(false);
    }
  };

  const encerrarParaTodos = async () => {
    if (trabalhando) return;
    setTrabalhando(true);
    try {
      await encerrar();
      setEmChamada(false);
      setAviso('A chamada foi encerrada.');
    } catch (e) {
      console.warn('Erro ao encerrar a chamada:', e);
      setAviso('Não foi possível encerrar a chamada. Tente novamente.');
    } finally {
      setTrabalhando(false);
    }
  };

  // ---------- Dentro da chamada ----------
  if (emChamada && url) {
    return (
      <SafeAreaView style={styles.containerVideo}>
        <View style={styles.barraVideo}>
          <TouchableOpacity style={styles.botaoBarra} onPress={() => setEmChamada(false)} accessibilityLabel="Sair da chamada">
            <Ionicons name="exit-outline" size={18} color={cor.fg("#FFF")} style={{ marginRight: 6 }} />
            <Text style={styles.botaoBarraTexto}>Sair da chamada</Text>
          </TouchableOpacity>
          {ehProfissional && (
            <TouchableOpacity
              style={[styles.botaoBarra, styles.botaoBarraPerigo]}
              onPress={encerrarParaTodos}
              disabled={trabalhando}
              accessibilityLabel="Encerrar para todos"
            >
              <Ionicons name="stop-circle-outline" size={18} color={cor.fg("#FFF")} style={{ marginRight: 6 }} />
              <Text style={styles.botaoBarraTexto}>Encerrar para todos</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={{ flex: 1 }}>
          <SalaDeVideo url={url} onErro={() => setAviso('Não foi possível carregar a sala. Tente abrir no navegador.')} />
        </View>

        <TouchableOpacity style={styles.rodapeVideo} onPress={() => Linking.openURL(url)} accessibilityLabel="Abrir no navegador">
          <Text style={styles.rodapeVideoTexto}>Está com problema na chamada? Abrir no navegador</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // ---------- Sala de espera / informações ----------
  const cedo = janela.situacao === 'cedo';
  const encerrada = janela.situacao === 'encerrada';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topo}>
        <TouchableOpacity onPress={() => navigation.goBack()} accessibilityLabel="Voltar" hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="chevron-back" size={28} color={cor.fg("#1A56DB")} />
        </TouchableOpacity>
        <Text style={styles.titulo}>Consulta on-line</Text>
      </View>

      <View style={styles.conteudo}>
        <View style={styles.resumo}>
          <Ionicons name="videocam" size={22} color={cor.fg("#1A56DB")} style={{ marginRight: 10 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.resumoNome}>Consulta com {outroNome}</Text>
            <Text style={styles.resumoDetalhe}>
              {formatarDataLonga(consulta.data)} · {faixaDeHorario(consulta.horario)}
            </Text>
          </View>
        </View>

        <View style={styles.cartao}>
          {carregando ? (
            <ActivityIndicator color={cor.fg("#6292D6")} />
          ) : erro ? (
            <>
              <Ionicons name="alert-circle" size={36} color={cor.fg("#D64545")} />
              <Text style={styles.cartaoTitulo}>Não foi possível verificar a sala</Text>
              <Text style={styles.cartaoTexto}>
                {erro?.code === 'permission-denied'
                  ? 'Sem permissão para acessar a sala. Atualize as regras do Firestore (arquivo firestore.rules do projeto).'
                  : 'Verifique sua conexão e abra esta tela de novo.'}
              </Text>
            </>
          ) : cedo ? (
            <>
              <Ionicons name="time-outline" size={40} color={cor.fg("#6292D6")} />
              <Text style={styles.cartaoTitulo}>A sala ainda não abriu</Text>
              <Text style={styles.cartaoTexto}>
                A sala de vídeo abre às {horaDe(janela.abreEm)} ({ABRE_ANTES_MIN} minutos antes do horário da consulta).
                {janela.minutosParaAbrir > 0 ? ` Faltam ${janela.minutosParaAbrir} min.` : ''}
              </Text>
            </>
          ) : encerrada ? (
            <>
              <Ionicons name="checkmark-done-circle-outline" size={40} color={cor.fg("#5A6B87")} />
              <Text style={styles.cartaoTitulo}>Esta consulta já terminou</Text>
              <Text style={styles.cartaoTexto}>A sala de vídeo foi fechada.</Text>
            </>
          ) : ehProfissional ? (
            salaAberta ? (
              <>
                <Ionicons name="radio-button-on" size={36} color={cor.fg("#2E9E5B")} />
                <Text style={styles.cartaoTitulo}>Chamada em andamento</Text>
                <Text style={styles.cartaoTexto}>Você pode voltar para a chamada ou encerrá-la para todos.</Text>
                <TouchableOpacity style={styles.botao} onPress={entrar} accessibilityLabel="Entrar na chamada">
                  <Text style={styles.botaoTexto}>Entrar na chamada</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.botaoPerigo} onPress={encerrarParaTodos} disabled={trabalhando} accessibilityLabel="Encerrar chamada">
                  <Text style={styles.botaoPerigoTexto}>Encerrar chamada</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Ionicons name="videocam-outline" size={40} color={cor.fg("#1A56DB")} />
                <Text style={styles.cartaoTitulo}>Tudo pronto</Text>
                <Text style={styles.cartaoTexto}>Quando você iniciar, {outroNome} poderá entrar na chamada.</Text>
                <TouchableOpacity style={[styles.botao, trabalhando && { opacity: 0.7 }]} onPress={iniciar} disabled={trabalhando} accessibilityLabel="Iniciar chamada">
                  {trabalhando ? <ActivityIndicator color={cor.fg("#FFF")} /> : <Text style={styles.botaoTexto}>Iniciar chamada</Text>}
                </TouchableOpacity>
              </>
            )
          ) : salaAberta ? (
            <>
              <Ionicons name="checkmark-circle" size={40} color={cor.fg("#2E9E5B")} />
              <Text style={styles.cartaoTitulo}>A sala está aberta!</Text>
              <Text style={styles.cartaoTexto}>{outroNome} já abriu a chamada. Toque para entrar.</Text>
              <TouchableOpacity style={styles.botao} onPress={entrar} accessibilityLabel="Entrar na chamada">
                <Text style={styles.botaoTexto}>Entrar na chamada</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <ActivityIndicator size="large" color={cor.fg("#6292D6")} />
              <Text style={styles.cartaoTitulo}>Sala de espera</Text>
              <Text style={styles.cartaoTexto}>
                Aguardando {outroNome} abrir a sala. Deixe esta tela aberta: avisamos assim que a chamada começar.
              </Text>
            </>
          )}
        </View>

        {!!aviso && (
          <View style={styles.aviso} accessibilityLiveRegion="polite">
            <Text style={styles.avisoTexto}>{aviso}</Text>
          </View>
        )}

        <View style={styles.dicas}>
          <Text style={styles.dicasTitulo}>Antes de entrar</Text>
          <Text style={styles.dicasTexto}>Escolha um lugar tranquilo e reservado, use fones de ouvido se puder e confira sua conexão.</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const criarStyles = (cor) => StyleSheet.create({
  container: { flex: 1, backgroundColor: cor.bg('#E4F0F8') },
  containerVideo: { flex: 1, backgroundColor: cor.bg('#000') },
  topo: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 14, paddingBottom: 6, gap: 8 },
  titulo: { fontFamily: 'Montserrat-Bold', fontSize: 20, color: cor.fg('#1A1A1A') },
  textoSimples: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: cor.fg('#5A6B87'), textAlign: 'center', margin: 30 },
  conteudo: { paddingHorizontal: 20, paddingTop: 10 },
  resumo: { flexDirection: 'row', alignItems: 'center', backgroundColor: cor.bg('#FFF'), borderRadius: 16, padding: 14, marginBottom: 14 },
  resumoNome: { fontFamily: 'Montserrat-Bold', fontSize: 14, color: cor.fg('#1A56DB') },
  resumoDetalhe: { fontFamily: 'Montserrat-Regular', fontSize: 12, color: cor.fg('#5A6B87'), marginTop: 2 },
  cartao: { backgroundColor: cor.bg('#FFF'), borderRadius: 20, padding: 22, alignItems: 'center', minHeight: 190, justifyContent: 'center' },
  cartaoTitulo: { fontFamily: 'Montserrat-Bold', fontSize: 18, color: cor.fg('#1A1A1A'), marginTop: 12, textAlign: 'center' },
  cartaoTexto: { fontFamily: 'Montserrat-Regular', fontSize: 13, color: cor.fg('#5A6B87'), marginTop: 6, textAlign: 'center', lineHeight: 19 },
  botao: { alignSelf: 'stretch', backgroundColor: cor.bg('#1A56DB'), borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginTop: 18 },
  botaoTexto: { fontFamily: 'Montserrat-Bold', fontSize: 14, color: cor.fg('#FFF') },
  botaoPerigo: { alignSelf: 'stretch', borderWidth: 1, borderColor: cor.bd('#D64545'), borderRadius: 14, paddingVertical: 13, alignItems: 'center', marginTop: 10 },
  botaoPerigoTexto: { fontFamily: 'Montserrat-Bold', fontSize: 14, color: cor.fg('#D64545') },
  aviso: { backgroundColor: cor.bg('#E3F2FD'), borderRadius: 12, padding: 12, marginTop: 14 },
  avisoTexto: { fontFamily: 'Montserrat-Bold', fontSize: 12, color: cor.fg('#1A56DB'), textAlign: 'center' },
  dicas: { marginTop: 16, padding: 14, borderRadius: 14, backgroundColor: cor.bg('#F0F4FF') },
  dicasTitulo: { fontFamily: 'Montserrat-Bold', fontSize: 12, color: cor.fg('#1A56DB'), marginBottom: 3 },
  dicasTexto: { fontFamily: 'Montserrat-Regular', fontSize: 12, color: cor.fg('#333'), lineHeight: 18 },
  barraVideo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, backgroundColor: cor.bg('#111') },
  botaoBarra: { flexDirection: 'row', alignItems: 'center', backgroundColor: cor.bg('#333'), borderRadius: 18, paddingVertical: 8, paddingHorizontal: 14 },
  botaoBarraPerigo: { backgroundColor: cor.bg('#D64545') },
  botaoBarraTexto: { fontFamily: 'Montserrat-Bold', fontSize: 12, color: cor.fg('#FFF') },
  rodapeVideo: { backgroundColor: cor.bg('#111'), paddingVertical: 10, alignItems: 'center' },
  rodapeVideoTexto: { fontFamily: 'Montserrat-Regular', fontSize: 11, color: cor.fg('#AAA') },
});
