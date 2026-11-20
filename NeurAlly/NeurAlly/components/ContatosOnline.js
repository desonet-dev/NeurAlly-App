import React from 'react';
import { StyleSheet, Text, View, Image, FlatList, TouchableOpacity } from 'react-native';

// "Nome curto" para caber embaixo do avatar: tira "Dr."/"Dra." e usa só o primeiro nome.
const nomeCurto = (nome = '') => nome.replace(/^dra?\.\s*/i, '').split(' ')[0];

// Lista horizontal de contatos online (avatar + bolinha verde). Some quando ninguém está online.
export default function ContatosOnline({ contatos, onPress }) {
  if (!contatos || contatos.length === 0) return null;

  return (
    <View style={styles.container}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 10 },
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
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  nome: { marginTop: 4, fontSize: 11, fontFamily: 'Montserrat-Regular', color: '#1A1A1A' },
});
