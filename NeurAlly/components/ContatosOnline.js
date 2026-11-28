import React from 'react';
import { StyleSheet, Text, View, Image, FlatList, TouchableOpacity } from 'react-native';

import { useEstilos } from '../contexts/TemaContext.js';
// "Nome curto" para caber embaixo do avatar: tira "Dr."/"Dra." e usa só o primeiro nome.
const nomeCurto = (nome = '') => nome.replace(/^dra?\.\s*/i, '').split(' ')[0];

// Seção "Ativos agora": lista horizontal dos contatos que estão online (avatar + bolinha verde).
// A seção fica sempre visível no topo; sem ninguém online, mostra um aviso.
export default function ContatosOnline({ contatos, onPress, titulo = 'Ativos agora' }) {
  const [styles, cor] = useEstilos(criarStyles);
  const vazio = !contatos || contatos.length === 0;

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>{titulo}</Text>
      {vazio ? (
        <Text style={styles.vazio}>Ninguém online agora.</Text>
      ) : (
      <FlatList
        data={contatos}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.chatId || item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item} onPress={() => onPress?.(item)} activeOpacity={0.7}>
            <View>
              <Image source={item.profilePicture} style={styles.avatar} />
              <View style={styles.onlineBadge} />
            </View>
            <Text style={styles.nome} numberOfLines={1}>{nomeCurto(item.name)}</Text>
          </TouchableOpacity>
        )}
      />
      )}
    </View>
  );
}

const criarStyles = (cor) => StyleSheet.create({
  container: { marginTop: 10 },
  titulo: { fontSize: 14, fontFamily: 'Montserrat-Bold', color: cor.fg('#1A1A1A'), marginHorizontal: 16, marginBottom: 8 },
  vazio: { fontSize: 12, fontFamily: 'Montserrat-Regular', color: cor.fg('#5A6B87'), marginHorizontal: 16, marginBottom: 4 },
  listContent: { paddingHorizontal: 16 },
  item: { width: 64, alignItems: 'center', marginRight: 12 },
  avatar: { width: 56, height: 56, borderRadius: 28 },
  onlineBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: cor.bg('#22C55E'),
    borderWidth: 2,
    borderColor: cor.bd('#FFF'),
  },
  nome: { marginTop: 4, fontSize: 11, fontFamily: 'Montserrat-Regular', color: cor.fg('#1A1A1A') },
});
