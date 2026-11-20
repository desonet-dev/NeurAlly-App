import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal, FlatList, TextInput, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import paleta from '../styles/Tema.js';
import ItemProfissional from './ItemProfissional.js';
import { filtrarProfissionais } from '../services/profissionaisService.js';

// Tela em janela com as opções para iniciar uma conversa: lista de pessoas com barra de pesquisa.
//  - opcoes: [{ id, nome, esp, crp, uid, ... }]  (esp aparece abaixo do nome)
//  - onSelecionar(opcao): chamado ao tocar numa pessoa
//  - erro / ocupado: mensagem de erro e indicador de "abrindo conversa..."
export default function NovaConversaModal({
  visivel,
  onFechar,
  titulo = 'Nova conversa',
  placeholder = 'Procure por um profissional',
  vazio = 'Nenhuma pessoa disponível para conversar ainda.',
  opcoes = [],
  carregando = false,
  ocupado = false,
  erro = '',
  onSelecionar,
}) {
  const insets = useSafeAreaInsets();
  const [busca, setBusca] = useState('');

  // Sempre abre com a busca limpa.
  useEffect(() => {
    if (visivel) setBusca('');
  }, [visivel]);

  const filtradas = useMemo(() => filtrarProfissionais(opcoes, busca), [opcoes, busca]);

  return (
    <Modal animationType="slide" visible={!!visivel} onRequestClose={onFechar} statusBarTranslucent>
      <View style={[styles.container, { paddingTop: insets.top + 10, paddingBottom: insets.bottom }]}>
        <View style={styles.header}>
          <Text style={styles.titulo}>{titulo}</Text>
          <TouchableOpacity onPress={onFechar} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} accessibilityLabel="Fechar">
            <Ionicons name="close" size={28} color="#1A56DB" />
          </TouchableOpacity>
        </View>

        <Text style={styles.subtitulo}>Escolha com quem você quer conversar.</Text>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={placeholder}
            placeholderTextColor="#999"
            value={busca}
            onChangeText={setBusca}
            autoCorrect={false}
            returnKeyType="search"
          />
          {busca.length > 0 && (
            <TouchableOpacity onPress={() => setBusca('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} accessibilityLabel="Limpar busca">
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>

        {!!erro && (
          <View style={styles.erroBox} accessibilityRole="alert" accessibilityLiveRegion="polite">
            <Ionicons name="alert-circle" size={18} color="#D64545" style={{ marginRight: 8 }} />
            <Text style={styles.erroTexto}>{erro}</Text>
          </View>
        )}

        <FlatList
          data={filtradas}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => <ItemProfissional profissional={item} onPress={onSelecionar} />}
          contentContainerStyle={styles.lista}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            carregando ? (
              <ActivityIndicator color="#6292D6" style={styles.vazio} />
            ) : (
              <Text style={[styles.vazio, styles.vazioTexto]}>
                {busca.trim() ? `Nenhum resultado para "${busca.trim()}".` : vazio}
              </Text>
            )
          }
        />

        {ocupado && (
          <View style={styles.ocupadoOverlay}>
            <ActivityIndicator size="large" color="#FFF" />
            <Text style={styles.ocupadoTexto}>Abrindo conversa...</Text>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: paleta.cor.fundo, paddingHorizontal: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  titulo: { fontFamily: 'Montserrat-Bold', fontSize: 22, color: '#1A1A1A' },
  subtitulo: { fontFamily: 'Montserrat-Regular', fontSize: 13, color: '#5A6B87', marginBottom: 16 },
  searchContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 12, paddingHorizontal: 15, height: 50, marginBottom: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontFamily: 'Montserrat-Regular', fontSize: 15, color: '#333' },
  erroBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FDEDED', borderWidth: 1, borderColor: '#F5C2C2', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 12, marginBottom: 12 },
  erroTexto: { flex: 1, fontFamily: 'Montserrat-Regular', fontSize: 12, color: '#B03030' },
  lista: { paddingBottom: 30 },
  vazio: { marginTop: 40 },
  vazioTexto: { textAlign: 'center', fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#5A6B87' },
  ocupadoOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center' },
  ocupadoTexto: { fontFamily: 'Montserrat-Bold', color: '#FFF', marginTop: 12, fontSize: 14 },
});
