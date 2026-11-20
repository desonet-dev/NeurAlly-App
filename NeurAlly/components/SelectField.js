import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal, Pressable, ScrollView } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { useEstilos } from '../contexts/TemaContext.js';
// Campo que abre um menu de opções.
//  - multiple=false: `value` é uma string; escolher uma opção fecha o menu.
//  - multiple=true:  `value` é um array; as opções são marcadas/desmarcadas e o menu fecha em "Concluir".
export default function SelectField({
  label,
  value,
  options,
  onChange,
  multiple = false,
  placeholder = 'Selecionar',
  title,
  emptyText,
  containerStyle,
}) {
  const [styles, cor] = useEstilos(criarStyles);
  const [aberto, setAberto] = useState(false);

  const selecionados = multiple ? (Array.isArray(value) ? value : []) : value;

  const textoExibido = multiple
    ? (selecionados.length > 0 ? selecionados.join(', ') : (emptyText || placeholder))
    : (value || placeholder);

  const estaSelecionada = (opcao) => (multiple ? selecionados.includes(opcao) : value === opcao);

  const escolher = (opcao) => {
    if (multiple) {
      onChange(
        selecionados.includes(opcao)
          ? selecionados.filter((o) => o !== opcao)
          : [...selecionados, opcao]
      );
    } else {
      onChange(opcao);
      setAberto(false);
    }
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {!!label && <Text style={styles.label}>{label}</Text>}

      <TouchableOpacity style={styles.wrapper} onPress={() => setAberto(true)} activeOpacity={0.7}>
        <Text
          style={[styles.texto, (multiple ? selecionados.length === 0 : !value) && styles.placeholder]}
          numberOfLines={1}
        >
          {textoExibido}
        </Text>
        <Ionicons name="caret-down" size={20} color={cor.fg("#000")} />
      </TouchableOpacity>

      <Modal
        animationType="fade"
        transparent
        visible={aberto}
        onRequestClose={() => setAberto(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setAberto(false)}>
          {/* Pressable interno evita que tocar dentro do menu feche o modal */}
          <Pressable style={styles.menu} onPress={() => {}}>
            <Text style={styles.menuTitulo}>{title || label}</Text>

            <ScrollView style={styles.lista} showsVerticalScrollIndicator={false}>
              {options.map((opcao) => {
                const marcada = estaSelecionada(opcao);
                return (
                  <TouchableOpacity
                    key={opcao}
                    style={[styles.opcao, marcada && styles.opcaoMarcada]}
                    onPress={() => escolher(opcao)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.opcaoTexto, marcada && styles.opcaoTextoMarcado]}>{opcao}</Text>
                    {multiple ? (
                      <Ionicons
                        name={marcada ? 'checkbox' : 'square-outline'}
                        size={22}
                        color={cor.fg("#1A56DB")}
                      />
                    ) : (
                      marcada && <Ionicons name="checkmark" size={22} color={cor.fg("#1A56DB")} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {multiple ? (
              <TouchableOpacity style={styles.botaoConcluir} onPress={() => setAberto(false)}>
                <Text style={styles.botaoConcluirTexto}>Concluir</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.botaoCancelar} onPress={() => setAberto(false)}>
                <Text style={styles.botaoCancelarTexto}>Cancelar</Text>
              </TouchableOpacity>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const criarStyles = (cor) => StyleSheet.create({
  container: { marginBottom: 20 },
  label: { fontFamily: 'Montserrat-Bold', fontSize: 11, color: cor.fg('#1A56DB'), marginBottom: 5, marginLeft: 5 },
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: cor.bg('#F0F4FF'),
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 45,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  texto: { flex: 1, fontFamily: 'Montserrat-Regular', fontSize: 13, color: cor.fg('#333'), marginRight: 10 },
  placeholder: { color: cor.fg('#888') },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  menu: {
    width: '100%',
    maxHeight: '75%',
    backgroundColor: cor.bg('#FFF'),
    borderRadius: 20,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  menuTitulo: { fontFamily: 'Montserrat-Bold', fontSize: 16, color: cor.fg('#1A1A1A'), marginBottom: 12 },
  lista: { flexGrow: 0 },
  opcao: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 15,
    borderRadius: 12,
    marginBottom: 6,
    backgroundColor: cor.bg('#F7F9FF'),
  },
  opcaoMarcada: { backgroundColor: cor.bg('#E4ECFF') },
  opcaoTexto: { flex: 1, fontFamily: 'Montserrat-Regular', fontSize: 14, color: cor.fg('#333'), marginRight: 10 },
  opcaoTextoMarcado: { fontFamily: 'Montserrat-Bold', color: cor.fg('#1A56DB') },
  botaoConcluir: {
    backgroundColor: cor.bg('#1A56DB'),
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  botaoConcluirTexto: { fontFamily: 'Montserrat-Bold', color: cor.fg('#FFF'), fontSize: 14 },
  botaoCancelar: {
    backgroundColor: cor.bg('#F0F4FF'),
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  botaoCancelarTexto: { fontFamily: 'Montserrat-Bold', color: cor.fg('#1A56DB'), fontSize: 14 },
});
