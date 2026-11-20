import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { useEstilos } from '../contexts/TemaContext.js';
// Linha compacta de um profissional (avatar, nome, especialidade e CRP). Usada nas listas
// de escolha: agendamento e nova conversa.
export default function ItemProfissional({ profissional, onPress, selecionado = false }) {
  const [styles, cor] = useEstilos(criarStyles);
  return (
    <TouchableOpacity
      style={[styles.item, selecionado && styles.itemSelecionado]}
      onPress={() => onPress?.(profissional)}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={`${profissional.nome}, ${profissional.esp || 'Psicólogo(a)'}`}
    >
      <Image source={profissional.img || require('../assets/Anderson.png')} style={styles.avatar} />
      <View style={styles.info}>
        <Text style={styles.nome} numberOfLines={1}>{profissional.nome}</Text>
        <Text style={styles.esp} numberOfLines={1}>{profissional.esp || 'Psicólogo(a)'}</Text>
        {!!profissional.crp && <Text style={styles.crp} numberOfLines={1}>{profissional.crp}</Text>}
      </View>
      <Ionicons
        name={selecionado ? 'checkmark-circle' : 'chevron-forward'}
        size={22}
        color={selecionado ? cor.fg('#2E9E5B') : cor.fg('#6292D6')}
      />
    </TouchableOpacity>
  );
}

const criarStyles = (cor) => StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: cor.bg('#FFF'),
    borderRadius: 15,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  itemSelecionado: { borderColor: cor.bd('#2E9E5B') },
  avatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: cor.bg('#EEE'), marginRight: 12 },
  info: { flex: 1 },
  nome: { fontFamily: 'Montserrat-Bold', fontSize: 14, color: cor.fg('#1A56DB') },
  esp: { fontFamily: 'Montserrat-Regular', fontSize: 12, color: cor.fg('#333'), marginTop: 2 },
  crp: { fontFamily: 'Montserrat-Regular', fontSize: 11, color: cor.fg('#777'), marginTop: 1 },
});
