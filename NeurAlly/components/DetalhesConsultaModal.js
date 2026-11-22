import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal, ScrollView, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { MAPEADOR_CLARO } from '../styles/coresTema.js';
import { consultaEhFutura, faixaDeHorario, formatarDataBR, formatarDataLonga, paraISO } from '../utils/datas.js';

import { useEstilos } from '../contexts/TemaContext.js';
const METODOS = { pix: 'Pix', cartao: 'Cartão', google: 'Google Pay', apple: 'Apple Pay' };

const formatarValor = (valor) => {
  const numero = Number(valor);
  if (!Number.isFinite(numero) || numero <= 0) return '';
  return `R$ ${numero.toFixed(2).replace('.', ',')}`;
};

// Situação da consulta para mostrar na etiqueta.
// `cor` é o mapeador de cores do tema (vem de useEstilos); sem ele usa as cores do tema claro.
export function situacaoDaConsulta(consulta, cor = MAPEADOR_CLARO) {
  if (consulta?.status === 'cancelada') return { texto: 'Cancelada', corTexto: cor.fg('#D64545'), fundo: cor.bg('#FDEDED') };
  if (consultaEhFutura(consulta)) return { texto: 'Agendada', corTexto: cor.fg('#1A56DB'), fundo: cor.bg('#E3F2FD') };
  return { texto: 'Realizada', corTexto: cor.fg('#2E9E5B'), fundo: cor.bg('#E6F6EC') };
}

function Linha({ icone, rotulo, valor }) {
  const [styles, cor] = useEstilos(criarStyles);
  if (!valor) return null;
  return (
    <View style={styles.linha}>
      <View style={styles.linhaIcone}>
        <Ionicons name={icone} size={18} color={cor.fg("#6292D6")} />
      </View>
      <View style={styles.linhaTextos}>
        <Text style={styles.linhaRotulo}>{rotulo}</Text>
        <Text style={styles.linhaValor}>{valor}</Text>
      </View>
    </View>
  );
}

// Janela com todas as informações de uma consulta.
//  - papel: 'cliente' ou 'profissional' (muda quem aparece como "outra pessoa")
//  - onConversar / onCancelar / onAgendarNovamente: botões opcionais (só aparecem se informados)
//  - erro / ocupado: mensagem de erro e indicador de carregamento dos botões
export default function DetalhesConsultaModal({
  consulta,
  papel = 'cliente',
  onFechar,
  onConversar,
  onCancelar,
  onAgendarNovamente,
  onReagendar,
  erro = '',
  ocupado = false,
}) {
  const [styles, cor] = useEstilos(criarStyles);
  const insets = useSafeAreaInsets();
  if (!consulta) return null;

  const ehProfissional = papel === 'profissional';
  const situacao = situacaoDaConsulta(consulta, cor);
  const nomeOutro = ehProfissional ? consulta.clienteNome || 'Paciente' : consulta.profissionalNome || 'Profissional';
  const criadaEm = consulta.criadoEm?.toDate?.();
  const canceladaPor =
    consulta.status === 'cancelada'
      ? consulta.canceladaPor === 'profissional'
        ? ehProfissional ? 'Você' : 'O profissional'
        : ehProfissional ? 'O paciente' : 'Você'
      : '';

  return (
    <Modal animationType="slide" transparent visible onRequestClose={onFechar} statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={[styles.folha, { paddingBottom: 20 + insets.bottom }]}>
          <View style={styles.cabecalho}>
            <Text style={styles.titulo}>Detalhes da consulta</Text>
            <TouchableOpacity onPress={onFechar} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} accessibilityLabel="Fechar">
              <Ionicons name="close" size={26} color={cor.fg("#1A56DB")} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.corpo}>
            <View style={styles.pessoa}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={26} color={cor.fg("#6292D6")} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.pessoaPapel}>{ehProfissional ? 'Paciente' : 'Profissional'}</Text>
                <Text style={styles.pessoaNome} numberOfLines={2}>{nomeOutro}</Text>
                {!ehProfissional && !!consulta.profissionalEsp && (
                  <Text style={styles.pessoaEsp} numberOfLines={1}>{consulta.profissionalEsp}</Text>
                )}
              </View>
              <View style={[styles.etiqueta, { backgroundColor: situacao.fundo }]}>
                <Text style={[styles.etiquetaTexto, { color: situacao.corTexto }]}>{situacao.texto}</Text>
              </View>
            </View>

            <Linha icone="calendar-outline" rotulo="Data" valor={formatarDataLonga(consulta.data)} />
            <Linha icone="time-outline" rotulo="Horário" valor={faixaDeHorario(consulta.horario)} />
            <Linha
              icone={consulta.modalidade === 'online' ? 'videocam-outline' : 'location-outline'}
              rotulo="Modalidade"
              valor={consulta.modalidade === 'online' ? 'On-line' : 'Presencial'}
            />
            <Linha
              icone="card-outline"
              rotulo="Pagamento"
              valor={[METODOS[consulta.metodoPagamento] || consulta.metodoPagamento, formatarValor(consulta.valor)].filter(Boolean).join(' · ')}
            />
            <Linha icone="create-outline" rotulo="Marcada em" valor={criadaEm ? formatarDataBR(paraISO(criadaEm)) : ''} />
            <Linha icone="close-circle-outline" rotulo="Cancelada por" valor={canceladaPor} />
          </ScrollView>

          {!!erro && (
            <View style={styles.erroBox} accessibilityRole="alert" accessibilityLiveRegion="polite">
              <Ionicons name="alert-circle" size={18} color={cor.fg("#D64545")} style={{ marginRight: 8 }} />
              <Text style={styles.erroTexto}>{erro}</Text>
            </View>
          )}

          {!!onConversar && (
            <TouchableOpacity style={[styles.botao, ocupado && { opacity: 0.7 }]} onPress={onConversar} disabled={ocupado}>
              {ocupado ? (
                <ActivityIndicator size="small" color={cor.fg("#FFF")} />
              ) : (
                <>
                  <Ionicons name="chatbubble-ellipses-outline" size={18} color={cor.fg("#FFF")} style={{ marginRight: 8 }} />
                  <Text style={styles.botaoTexto}>{ehProfissional ? 'Conversar com o paciente' : 'Conversar com o profissional'}</Text>
                </>
              )}
            </TouchableOpacity>
          )}
          {!!onReagendar && (
            <TouchableOpacity style={styles.botaoContorno} onPress={onReagendar}>
              <Ionicons name="calendar-outline" size={18} color={cor.fg("#1A56DB")} style={{ marginRight: 8 }} />
              <Text style={styles.botaoContornoTexto}>Reagendar</Text>
            </TouchableOpacity>
          )}
          {!!onAgendarNovamente && (
            <TouchableOpacity style={styles.botaoContorno} onPress={onAgendarNovamente}>
              <Ionicons name="calendar-outline" size={18} color={cor.fg("#1A56DB")} style={{ marginRight: 8 }} />
              <Text style={styles.botaoContornoTexto}>Agendar novamente</Text>
            </TouchableOpacity>
          )}
          {!!onCancelar && (
            <TouchableOpacity style={styles.botaoPerigo} onPress={onCancelar}>
              <Ionicons name="close-circle-outline" size={18} color={cor.fg("#D64545")} style={{ marginRight: 8 }} />
              <Text style={styles.botaoPerigoTexto}>Cancelar consulta</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

const criarStyles = (cor) => StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' },
  folha: { backgroundColor: cor.bg('#FFF'), borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '88%' },
  cabecalho: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  titulo: { fontFamily: 'Montserrat-Bold', fontSize: 18, color: cor.fg('#1A1A1A') },
  corpo: { flexGrow: 0, marginBottom: 12 },
  pessoa: { flexDirection: 'row', alignItems: 'center', backgroundColor: cor.bg('#F0F4FF'), borderRadius: 16, padding: 14, marginBottom: 14 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: cor.bg('#FFF'), justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  pessoaPapel: { fontFamily: 'Montserrat-Regular', fontSize: 11, color: cor.fg('#5A6B87') },
  pessoaNome: { fontFamily: 'Montserrat-Bold', fontSize: 16, color: cor.fg('#1A56DB') },
  pessoaEsp: { fontFamily: 'Montserrat-Regular', fontSize: 12, color: cor.fg('#5A6B87'), marginTop: 1 },
  etiqueta: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 12, marginLeft: 8 },
  etiquetaTexto: { fontFamily: 'Montserrat-Bold', fontSize: 11 },
  linha: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: cor.bd('#EEE') },
  linhaIcone: { width: 34, height: 34, borderRadius: 17, backgroundColor: cor.bg('#F0F4FF'), justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  linhaTextos: { flex: 1 },
  linhaRotulo: { fontFamily: 'Montserrat-Regular', fontSize: 11, color: cor.fg('#777') },
  linhaValor: { fontFamily: 'Montserrat-Bold', fontSize: 14, color: cor.fg('#333') },
  erroBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: cor.bg('#FDEDED'), borderWidth: 1, borderColor: cor.bd('#F5C2C2'), borderRadius: 12, paddingVertical: 10, paddingHorizontal: 12, marginBottom: 10 },
  erroTexto: { flex: 1, fontFamily: 'Montserrat-Regular', fontSize: 12, color: cor.fg('#B03030') },
  botao: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: cor.bg('#1A56DB'), borderRadius: 12, paddingVertical: 14, marginBottom: 8 },
  botaoTexto: { fontFamily: 'Montserrat-Bold', color: cor.fg('#FFF'), fontSize: 14 },
  botaoContorno: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: cor.bd('#1A56DB'), borderRadius: 12, paddingVertical: 13, marginBottom: 8 },
  botaoContornoTexto: { fontFamily: 'Montserrat-Bold', color: cor.fg('#1A56DB'), fontSize: 14 },
  botaoPerigo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: cor.bd('#D64545'), borderRadius: 12, paddingVertical: 13 },
  botaoPerigoTexto: { fontFamily: 'Montserrat-Bold', color: cor.fg('#D64545'), fontSize: 14 },
});
