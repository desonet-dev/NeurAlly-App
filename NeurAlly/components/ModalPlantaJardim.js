import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import PlantaSvg, { GotaSvg } from './PlantaSvg.js';
import ChuvaDeGotas from './ChuvaDeGotas.js';
import { ESPECIES, NOMES_ESTAGIOS, estagioDaPlanta, plantaAdormecida, progressoDaPlanta } from '../utils/jardim.js';

import { useEstilos } from '../contexts/TemaContext.js';
// Janela de uma planta do jardim: estágio, progresso, simbolismo, curiosidade e os cuidados (regar/remover).
export default function ModalPlantaJardim({
  visivel,
  planta,
  indice = 0,
  gotas = 0,
  disparoChuva = 0,
  mensagem = '',
  onFechar,
  onRegar,
  onRemover,
  onIrParaDiario,
}) {
  const [styles, cor] = useEstilos(criarStyles);
  const insets = useSafeAreaInsets();
  if (!planta) return null;

  const especie = ESPECIES[planta.especie];
  const estagio = estagioDaPlanta(planta);
  const progresso = progressoDaPlanta(planta);
  const adormecida = plantaAdormecida(planta);
  const curiosidade = especie.curiosidades[(planta.pontos + indice) % especie.curiosidades.length];
  const semGotas = gotas < 1;

  return (
    <Modal animationType="slide" transparent visible={!!visivel} onRequestClose={onFechar} statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={[styles.folha, { paddingBottom: 20 + insets.bottom }]}>
          <View style={styles.cabecalho}>
            <Text style={styles.titulo}>{especie.nome}</Text>
            <TouchableOpacity onPress={onFechar} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} accessibilityLabel="Fechar">
              <Ionicons name="close" size={26} color={cor.fg("#1A56DB")} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.corpo}>
            <View style={styles.palco}>
              <PlantaSvg especie={planta.especie} estagio={estagio} tamanho={150} adormecida={adormecida} />
              <ChuvaDeGotas disparo={disparoChuva} altura={150} />
              {adormecida && <Text style={styles.zzz}>z z z</Text>}
            </View>

            <View style={styles.etiquetas}>
              <View style={styles.etiqueta}>
                <Text style={styles.etiquetaTexto}>{NOMES_ESTAGIOS[estagio]}</Text>
              </View>
              {adormecida && (
                <View style={[styles.etiqueta, styles.etiquetaSono]}>
                  <Text style={[styles.etiquetaTexto, styles.etiquetaSonoTexto]}>Adormecida</Text>
                </View>
              )}
            </View>

            {!!mensagem && <Text style={styles.feedback}>{mensagem}</Text>}

            {progresso ? (
              <View style={styles.progressoBloco}>
                <View style={styles.barra}>
                  <View style={[styles.barraPreenchida, { width: `${Math.max(4, Math.round(progresso.fracao * 100))}%` }]} />
                </View>
                <Text style={styles.progressoTexto}>
                  {progresso.atual} de {progresso.necessarios} pontos para virar {NOMES_ESTAGIOS[estagio + 1].toLowerCase()}
                </Text>
              </View>
            ) : (
              <Text style={styles.progressoTexto}>Totalmente crescida! Aproveite a vista.</Text>
            )}

            {adormecida && (
              <Text style={styles.avisoSono}>
                Sua planta está descansando. Ela não morre: com um pouquinho de cuidado, ela acorda!
              </Text>
            )}

            <View style={styles.caixa}>
              <Text style={styles.caixaRotulo}>Simboliza</Text>
              <Text style={styles.caixaTexto}>{especie.simbolo}</Text>
            </View>
            <View style={styles.caixa}>
              <Text style={styles.caixaRotulo}>Você sabia?</Text>
              <Text style={styles.caixaTexto}>{curiosidade}</Text>
            </View>
          </ScrollView>

          {semGotas && (
            <View style={styles.semGotas}>
              <Text style={styles.semGotasTexto}>
                Você está sem gotas. Registre como se sente no diário emocional para ganhar mais!
              </Text>
              <TouchableOpacity style={styles.botaoContorno} onPress={onIrParaDiario}>
                <Ionicons name="book-outline" size={18} color={cor.fg("#1A56DB")} style={{ marginRight: 8 }} />
                <Text style={styles.botaoContornoTexto}>Escrever no diário</Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity
            style={[styles.botaoRegar, semGotas && styles.botaoDesativado]}
            onPress={onRegar}
            disabled={semGotas}
            accessibilityLabel="Regar planta"
          >
            <GotaSvg tamanho={18} />
            <Text style={styles.botaoRegarTexto}>Regar · usa 1 gota (você tem {gotas})</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.botaoRemover} onPress={onRemover} accessibilityLabel="Remover planta">
            <Ionicons name="trash-outline" size={16} color={cor.fg("#D64545")} style={{ marginRight: 6 }} />
            <Text style={styles.botaoRemoverTexto}>Remover planta</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const criarStyles = (cor) => StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' },
  folha: { backgroundColor: cor.bg('#FFF'), borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '92%' },
  cabecalho: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  titulo: { fontFamily: 'Montserrat-Bold', fontSize: 20, color: cor.fg('#1A1A1A') },
  corpo: { flexGrow: 0, marginBottom: 12 },
  palco: { alignSelf: 'center', width: 190, height: 160, borderRadius: 24, backgroundColor: cor.bg('#E6F4DA'), alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  zzz: { position: 'absolute', top: 10, right: 18, fontFamily: 'Montserrat-Bold', fontSize: 16, color: cor.fg('#5A6B87') },
  etiquetas: { flexDirection: 'row', justifyContent: 'center', marginTop: 12, gap: 8 },
  etiqueta: { backgroundColor: cor.bg('#E3F2FD'), paddingVertical: 4, paddingHorizontal: 12, borderRadius: 12 },
  etiquetaTexto: { fontFamily: 'Montserrat-Bold', fontSize: 12, color: cor.fg('#1A56DB') },
  etiquetaSono: { backgroundColor: cor.bg('#EEF1F6') },
  etiquetaSonoTexto: { color: cor.fg('#5A6B87') },
  feedback: { fontFamily: 'Montserrat-Bold', fontSize: 13, color: cor.fg('#2E9E5B'), textAlign: 'center', marginTop: 12 },
  progressoBloco: { marginTop: 14 },
  barra: { height: 10, borderRadius: 5, backgroundColor: cor.bg('#E0E8FF'), overflow: 'hidden' },
  barraPreenchida: { height: 10, borderRadius: 5, backgroundColor: cor.bg('#4CAF50') },
  progressoTexto: { fontFamily: 'Montserrat-Regular', fontSize: 12, color: cor.fg('#5A6B87'), textAlign: 'center', marginTop: 6 },
  avisoSono: { fontFamily: 'Montserrat-Regular', fontSize: 12, color: cor.fg('#5A6B87'), textAlign: 'center', marginTop: 10 },
  caixa: { backgroundColor: cor.bg('#F0F4FF'), borderRadius: 14, padding: 12, marginTop: 12 },
  caixaRotulo: { fontFamily: 'Montserrat-Bold', fontSize: 11, color: cor.fg('#1A56DB'), marginBottom: 3 },
  caixaTexto: { fontFamily: 'Montserrat-Regular', fontSize: 13, color: cor.fg('#333'), lineHeight: 19 },
  semGotas: { marginBottom: 10 },
  semGotasTexto: { fontFamily: 'Montserrat-Regular', fontSize: 12, color: cor.fg('#B03030'), textAlign: 'center', marginBottom: 8 },
  botaoContorno: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: cor.bd('#1A56DB'), borderRadius: 12, paddingVertical: 11 },
  botaoContornoTexto: { fontFamily: 'Montserrat-Bold', fontSize: 13, color: cor.fg('#1A56DB') },
  botaoRegar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: cor.bg('#1A56DB'), borderRadius: 12, paddingVertical: 14, gap: 8 },
  botaoDesativado: { backgroundColor: cor.bg('#A0AABB') },
  botaoRegarTexto: { fontFamily: 'Montserrat-Bold', fontSize: 14, color: cor.fg('#FFF') },
  botaoRemover: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, marginTop: 4 },
  botaoRemoverTexto: { fontFamily: 'Montserrat-Bold', fontSize: 13, color: cor.fg('#D64545') },
});
