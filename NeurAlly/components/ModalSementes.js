import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import PlantaSvg from './PlantaSvg.js';
import { ESPECIES, ORDEM_ESPECIES } from '../utils/jardim.js';

import { useEstilos } from '../contexts/TemaContext.js';
// Sementes e espécies do jardim.
//  - modo 'plantar': aberto ao tocar em um canteiro vazio; as sementes liberadas têm o botão "Plantar".
//  - modo 'info': aberto pelo botão "Sementes"; mostra todas as espécies, seus simbolismos e curiosidades.
// As sementes bloqueadas mostram quantos dias com registro no diário faltam.
export default function ModalSementes({ visivel, modo = 'info', dias = 0, liberadas = [], onFechar, onEscolher }) {
  const [styles, cor] = useEstilos(criarStyles);
  const insets = useSafeAreaInsets();
  const [aberta, setAberta] = useState(null);

  return (
    <Modal animationType="slide" transparent visible={!!visivel} onRequestClose={onFechar} statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={[styles.folha, { paddingBottom: 20 + insets.bottom }]}>
          <View style={styles.cabecalho}>
            <Text style={styles.titulo}>{modo === 'plantar' ? 'Escolha uma semente' : 'Sementes e espécies'}</Text>
            <TouchableOpacity onPress={onFechar} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} accessibilityLabel="Fechar">
              <Ionicons name="close" size={26} color={cor.fg("#1A56DB")} />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitulo}>
            Novas sementes são liberadas quando você registra o diário emocional em dias diferentes (não precisam ser seguidos).
            Você já registrou em {dias} {dias === 1 ? 'dia' : 'dias'}.
          </Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            {ORDEM_ESPECIES.map((id) => {
              const especie = ESPECIES[id];
              const liberada = liberadas.includes(id);
              const expandida = aberta === id;
              return (
                <View key={id} style={[styles.item, !liberada && styles.itemBloqueado]}>
                  <View style={styles.itemTopo}>
                    <View style={styles.miniatura}>
                      <PlantaSvg especie={id} estagio={3} tamanho={liberada ? 62 : 56} adormecida={!liberada} />
                    </View>
                    <View style={styles.itemTextos}>
                      <Text style={styles.itemNome}>{especie.nome}</Text>
                      <Text style={styles.itemSimbolo}>{especie.simbolo}</Text>
                      {!liberada && (
                        <View style={styles.bloqueioLinha}>
                          <Ionicons name="lock-closed" size={13} color={cor.fg("#5A6B87")} />
                          <Text style={styles.bloqueioTexto}>
                            Registre o diário em {especie.diasParaDesbloquear} dias diferentes (faltam {Math.max(0, especie.diasParaDesbloquear - dias)})
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>

                  <View style={styles.acoes}>
                    <TouchableOpacity onPress={() => setAberta(expandida ? null : id)} accessibilityLabel={`Curiosidades sobre ${especie.nome}`}>
                      <Text style={styles.link}>{expandida ? 'Ocultar curiosidades' : 'Ver curiosidades'}</Text>
                    </TouchableOpacity>
                    {modo === 'plantar' && liberada && (
                      <TouchableOpacity style={styles.botaoPlantar} onPress={() => onEscolher?.(id)} accessibilityLabel={`Plantar ${especie.nome}`}>
                        <Ionicons name="leaf" size={16} color={cor.fg("#FFF")} style={{ marginRight: 6 }} />
                        <Text style={styles.botaoPlantarTexto}>Plantar</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {expandida && (
                    <View style={styles.curiosidades}>
                      <Text style={styles.descricao}>{especie.descricao}</Text>
                      {especie.curiosidades.map((texto) => (
                        <View key={texto} style={styles.curiosidadeLinha}>
                          <Text style={styles.ponto}>•</Text>
                          <Text style={styles.curiosidadeTexto}>{texto}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const criarStyles = (cor) => StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' },
  folha: { backgroundColor: cor.bg('#FFF'), borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '90%' },
  cabecalho: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  titulo: { fontFamily: 'Montserrat-Bold', fontSize: 19, color: cor.fg('#1A1A1A') },
  subtitulo: { fontFamily: 'Montserrat-Regular', fontSize: 12, color: cor.fg('#5A6B87'), marginBottom: 14, lineHeight: 18 },
  item: { backgroundColor: cor.bg('#F0F4FF'), borderRadius: 16, padding: 12, marginBottom: 10 },
  itemBloqueado: { backgroundColor: cor.bg('#F2F4F8') },
  itemTopo: { flexDirection: 'row', alignItems: 'center' },
  miniatura: { width: 70, height: 70, borderRadius: 14, backgroundColor: cor.bg('#E6F4DA'), alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  itemTextos: { flex: 1 },
  itemNome: { fontFamily: 'Montserrat-Bold', fontSize: 15, color: cor.fg('#1A56DB') },
  itemSimbolo: { fontFamily: 'Montserrat-Regular', fontSize: 12, color: cor.fg('#333'), marginTop: 2 },
  bloqueioLinha: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 6 },
  bloqueioTexto: { flex: 1, fontFamily: 'Montserrat-Regular', fontSize: 11, color: cor.fg('#5A6B87') },
  acoes: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
  link: { fontFamily: 'Montserrat-Bold', fontSize: 12, color: cor.fg('#1A56DB') },
  botaoPlantar: { flexDirection: 'row', alignItems: 'center', backgroundColor: cor.bg('#2E9E5B'), borderRadius: 10, paddingVertical: 8, paddingHorizontal: 14 },
  botaoPlantarTexto: { fontFamily: 'Montserrat-Bold', fontSize: 13, color: cor.fg('#FFF') },
  curiosidades: { marginTop: 10, borderTopWidth: 1, borderTopColor: cor.bd('#E0E8FF'), paddingTop: 10 },
  descricao: { fontFamily: 'Montserrat-Regular', fontSize: 12, color: cor.fg('#333'), lineHeight: 18, marginBottom: 8 },
  curiosidadeLinha: { flexDirection: 'row', marginBottom: 6 },
  ponto: { fontFamily: 'Montserrat-Bold', fontSize: 13, color: cor.fg('#1A56DB'), marginRight: 6 },
  curiosidadeTexto: { flex: 1, fontFamily: 'Montserrat-Regular', fontSize: 12, color: cor.fg('#333'), lineHeight: 18 },
});
