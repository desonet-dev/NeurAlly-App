import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { useEstilos } from '../contexts/TemaContext.js';
// Campo de texto bloqueado por padrão. Só fica editável depois de tocar no lápis
// e volta a ficar bloqueado quando perde o foco (toque fora / fechar o teclado).
//
// IMPORTANTE: este componente fica FORA das telas de propósito. Quando um componente
// é declarado dentro de outro, ele é recriado a cada renderização (a cada tecla digitada)
// e o TextInput perde o foco.
//
// Props:
//  - locked: campo que nunca pode ser editado (ex.: CPF/CRP). Mostra ícone "info" e chama onLockedPress ao tocar.
//  - compact: versão com menos espaçamento, para colunas estreitas.
//  - secure: esconde o texto (senha).
export default function EditableField({
  label,
  value,
  onChangeText,
  multiline = false,
  height = 100,
  secure = false,
  keyboardType,
  locked = false,
  onLockedPress,
  compact = false,
  containerStyle,
}) {
  const [styles, cor] = useEstilos(criarStyles);
  const [editando, setEditando] = useState(false);
  const inputRef = useRef(null);

  // Só dá foco depois que o campo já foi renderizado como editável.
  useEffect(() => {
    if (editando) {
      inputRef.current?.focus();
    }
  }, [editando]);

  const alturaCaixa = multiline ? height : 45;

  if (locked) {
    return (
      <View style={[styles.container, containerStyle]}>
        <Text style={styles.label}>{label}</Text>
        <TouchableOpacity
          style={[styles.wrapper, compact && styles.wrapperCompact, { height: alturaCaixa }]}
          activeOpacity={0.7}
          onPress={onLockedPress}
        >
          <Text style={styles.textoBloqueado} numberOfLines={1}>{value}</Text>
          <MaterialIcons name="info" size={compact ? 16 : 20} color={cor.fg("#000")} />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.wrapper,
          compact && styles.wrapperCompact,
          { height: alturaCaixa },
          editando && styles.wrapperEditando,
        ]}
      >
        <TextInput
          ref={inputRef}
          style={[styles.input, multiline && styles.inputMultiline]}
          value={value}
          onChangeText={onChangeText}
          multiline={multiline}
          editable={editando}
          secureTextEntry={secure}
          keyboardType={keyboardType}
          onBlur={() => setEditando(false)}
        />
        <TouchableOpacity
          onPress={() => setEditando(true)}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityRole="button"
          accessibilityLabel={`Editar ${label}`}
        >
          <MaterialIcons name="edit" size={compact ? 16 : 20} color={editando ? cor.fg('#1A56DB') : cor.fg('#000')} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const criarStyles = (cor) => StyleSheet.create({
  container: { marginBottom: 15 },
  label: { fontFamily: 'Montserrat-Bold', fontSize: 10, color: cor.fg('#1A56DB'), marginBottom: 5, marginLeft: 5 },
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: cor.bg('#F0F4FF'),
    borderRadius: 12,
    paddingHorizontal: 15,
    borderWidth: 1.5,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  wrapperCompact: { paddingHorizontal: 10 },
  wrapperEditando: { borderColor: cor.bd('#1A56DB'), backgroundColor: cor.bg('#FFF') },
  input: {
    flex: 1,
    fontFamily: 'Montserrat-Regular',
    fontSize: 12,
    color: cor.fg('#333'),
    marginRight: 8,
    height: '100%',
  },
  inputMultiline: { textAlignVertical: 'top', paddingTop: 10 },
  textoBloqueado: { flex: 1, fontFamily: 'Montserrat-Regular', fontSize: 12, color: cor.fg('#333'), marginRight: 8 },
});
