import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { GotaSvg } from './PlantaSvg.js';
import PlantaSvg from './PlantaSvg.js';
import { ESPECIES } from '../utils/jardim.js';

import { useEstilos } from '../contexts/TemaContext.js';
// Janela de recompensa: gotas ganhas, mensagem acolhedora e sementes novas desbloqueadas.
// Aparece depois de salvar um registro no diário (e quando o jardim credita gotas de registros antigos).
export default function ModalGotasDiario({
  visivel,
  gotas = 0,
  mensagem = '',
  novasEspecies = [],
  textoPrincipal = 'Continuar',
  onPrincipal,
  textoSecundario,
  onSecundario,
}) {
  const [styles, cor] = useEstilos(criarStyles);
  return (
    <Modal animationType="fade" transparent visible={!!visivel} onRequestClose={onPrincipal} statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.conteudo}>
            {gotas > 0 && (
              <View style={styles.gotasLinha}>
                <GotaSvg tamanho={34} />
                <Text style={styles.gotasTexto}>+{gotas} {gotas === 1 ? 'gota' : 'gotas'}</Text>
              </View>
            )}

            {!!mensagem && <Text style={styles.mensagem}>{mensagem}</Text>}

            {novasEspecies.length > 0 && (
              <View style={styles.novas}>
                <Text style={styles.novasTitulo}>
                  {novasEspecies.length === 1 ? 'Nova semente desbloqueada!' : 'Novas sementes desbloqueadas!'}
                </Text>
                {novasEspecies.map((id) => (
                  <View key={id} style={styles.novaLinha}>
                    <View style={styles.novaMiniatura}>
                      <PlantaSvg especie={id} estagio={3} tamanho={52} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.novaNome}>{ESPECIES[id].nome}</Text>
                      <Text style={styles.novaSimbolo}>{ESPECIES[id].simbolo}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>

          <TouchableOpacity style={styles.botao} onPress={onPrincipal}>
            <Text style={styles.botaoTexto}>{textoPrincipal}</Text>
          </TouchableOpacity>
          {!!textoSecundario && (
            <TouchableOpacity style={styles.botaoSecundario} onPress={onSecundario}>
              <Text style={styles.botaoSecundarioTexto}>{textoSecundario}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

const criarStyles = (cor) => StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  container: { width: '100%', maxWidth: 420, maxHeight: '85%', backgroundColor: cor.bg('#FFF'), borderRadius: 22, padding: 22 },
  conteudo: { alignItems: 'center' },
  gotasLinha: { flexDirection: 'row', alignItems: 'center', backgroundColor: cor.bg('#E1F5FE'), borderRadius: 16, paddingVertical: 8, paddingHorizontal: 16, gap: 8, marginBottom: 14 },
  gotasTexto: { fontFamily: 'Montserrat-Bold', fontSize: 22, color: cor.fg('#0277BD') },
  mensagem: { fontFamily: 'Montserrat-Bold', fontSize: 16, color: cor.fg('#1A1A1A'), textAlign: 'center', lineHeight: 24, marginBottom: 12 },
  novas: { alignSelf: 'stretch', backgroundColor: cor.bg('#F0F4FF'), borderRadius: 16, padding: 12, marginTop: 4 },
  novasTitulo: { fontFamily: 'Montserrat-Bold', fontSize: 13, color: cor.fg('#1A56DB'), marginBottom: 8, textAlign: 'center' },
  novaLinha: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  novaMiniatura: { width: 60, height: 60, borderRadius: 12, backgroundColor: cor.bg('#E6F4DA'), alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  novaNome: { fontFamily: 'Montserrat-Bold', fontSize: 14, color: cor.fg('#333') },
  novaSimbolo: { fontFamily: 'Montserrat-Regular', fontSize: 11, color: cor.fg('#5A6B87'), marginTop: 1 },
  botao: { backgroundColor: cor.bg('#1A56DB'), borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 16 },
  botaoTexto: { fontFamily: 'Montserrat-Bold', fontSize: 14, color: cor.fg('#FFF') },
  botaoSecundario: { backgroundColor: cor.bg('#F2F4F8'), borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  botaoSecundarioTexto: { fontFamily: 'Montserrat-Bold', fontSize: 14, color: cor.fg('#5A6B87') },
});
