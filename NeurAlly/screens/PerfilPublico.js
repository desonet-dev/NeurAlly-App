import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native';
import { useFonts } from 'expo-font';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAuth } from '../contexts/AuthContext.js';
import { carregarPerfilPublico } from '../services/perfilPublicoService.js';

import { useEstilos } from '../contexts/TemaContext.js';
// Perfil público de outra pessoa (aberto ao tocar no nome dela na conversa).
// Mostra só dados públicos: nome e foto; para psicólogos, também CRP, especialidade e sobre.
export default function PerfilPublico({ navigation, route }) {
  const [styles, cor] = useEstilos(criarStyles);
  const { usuarioId, nome: nomeInformado } = route?.params || {};
  const { perfil: meuPerfil } = useAuth();
  const souPsicologo = meuPerfil?.tipo === 'psicologo';

  const [pessoa, setPessoa] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);
  const [tentativa, setTentativa] = useState(0);

  const [fontsLoaded] = useFonts({
    'Montserrat-Regular': require('../styles/fonts/Montserrat/static/Montserrat-Regular.ttf'),
    'Montserrat-Bold': require('../styles/fonts/Montserrat/static/Montserrat-Bold.ttf'),
  });

  useEffect(() => {
    let ativo = true;
    if (!usuarioId) {
      setCarregando(false);
      setErro(true);
      return undefined;
    }
    setCarregando(true);
    setErro(false);
    carregarPerfilPublico(usuarioId)
      .then((dados) => ativo && setPessoa(dados))
      .catch((e) => {
        console.warn('Erro ao carregar o perfil público:', e);
        if (ativo) setErro(true);
      })
      .finally(() => ativo && setCarregando(false));
    return () => {
      ativo = false;
    };
  }, [usuarioId, tentativa]);

  if (!fontsLoaded) return null;

  const nome = pessoa?.nome || nomeInformado || 'Perfil';
  const ehPsicologo = pessoa?.tipo === 'psicologo';
  const foto = pessoa?.foto ? { uri: pessoa.foto } : require('../assets/perfil.png');

  // O cliente pode ir direto para os horários do psicólogo.
  const verHorarios = () =>
    navigation.navigate('PerfilProfissional', {
      profissional: {
        id: pessoa.id,
        uid: pessoa.id,
        nome: pessoa.nome,
        esp: pessoa.especialidade || 'Psicólogo(a)',
        crp: pessoa.crp ? `CRP ${pessoa.crp}` : '',
        foto: pessoa.foto || '',
      },
    });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topo}>
        <TouchableOpacity onPress={() => navigation.goBack()} accessibilityLabel="Voltar" hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="chevron-back" size={28} color={cor.fg("#1A56DB")} />
        </TouchableOpacity>
        <Text style={styles.topoTitulo}>Perfil</Text>
      </View>

      <ScrollView contentContainerStyle={styles.conteudo} showsVerticalScrollIndicator={false}>
        {carregando ? (
          <ActivityIndicator color={cor.fg("#6292D6")} style={{ marginTop: 60 }} />
        ) : erro || !pessoa ? (
          <View style={styles.erroBox}>
            <Ionicons name="alert-circle" size={20} color={cor.fg("#D64545")} style={{ marginRight: 8 }} />
            <Text style={styles.erroTexto}>Não foi possível carregar este perfil. Verifique sua conexão.</Text>
            <TouchableOpacity onPress={() => setTentativa((n) => n + 1)}>
              <Text style={styles.erroLink}>Tentar de novo</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.cabecalho}>
              <Image source={foto} style={styles.avatar} accessibilityLabel={`Foto de ${nome}`} />
              <Text style={styles.nome} accessibilityRole="header">{nome}</Text>
              <View style={styles.etiqueta}>
                <Text style={styles.etiquetaTexto}>{ehPsicologo ? 'Psicólogo(a)' : 'Paciente'}</Text>
              </View>
            </View>

            {ehPsicologo && (
              <>
                {!!pessoa.crp && (
                  <View style={styles.cartao}>
                    <Text style={styles.cartaoRotulo}>CRP</Text>
                    <Text style={styles.cartaoTexto}>{pessoa.crp}</Text>
                  </View>
                )}
                <View style={styles.cartao}>
                  <Text style={styles.cartaoRotulo}>Especialidade</Text>
                  <Text style={styles.cartaoTexto}>{pessoa.especialidade || 'Psicólogo(a)'}</Text>
                </View>
                {!!pessoa.biografia && (
                  <View style={styles.cartao}>
                    <Text style={styles.cartaoRotulo}>Sobre</Text>
                    <Text style={styles.cartaoTexto}>{pessoa.biografia}</Text>
                  </View>
                )}

                {!souPsicologo && (
                  <TouchableOpacity style={styles.botao} onPress={verHorarios} accessibilityLabel="Ver horários e agendar consulta">
                    <Ionicons name="calendar-outline" size={18} color={cor.fg("#FFF")} style={{ marginRight: 8 }} />
                    <Text style={styles.botaoTexto}>Ver horários e agendar</Text>
                  </TouchableOpacity>
                )}
              </>
            )}

            {!ehPsicologo && (
              <Text style={styles.nota}>
                Por privacidade, o perfil de pacientes mostra apenas o nome e a foto.
              </Text>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const criarStyles = (cor) => StyleSheet.create({
  container: { flex: 1, backgroundColor: cor.bg('#E4F0F8') },
  topo: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 14, paddingBottom: 6, gap: 8 },
  topoTitulo: { fontFamily: 'Montserrat-Bold', fontSize: 20, color: cor.fg('#1A1A1A') },
  conteudo: { paddingHorizontal: 20, paddingBottom: 40 },
  cabecalho: { alignItems: 'center', marginTop: 10, marginBottom: 20 },
  avatar: { width: 130, height: 130, borderRadius: 65, backgroundColor: cor.bg('#E4F0F8') },
  nome: { fontFamily: 'Montserrat-Bold', fontSize: 22, color: cor.fg('#1A56DB'), marginTop: 14, textAlign: 'center' },
  etiqueta: { backgroundColor: cor.bg('#E3F2FD'), borderRadius: 12, paddingVertical: 4, paddingHorizontal: 14, marginTop: 8 },
  etiquetaTexto: { fontFamily: 'Montserrat-Bold', fontSize: 12, color: cor.fg('#1A56DB') },
  cartao: { backgroundColor: cor.bg('#FFF'), borderRadius: 16, padding: 16, marginBottom: 12 },
  cartaoRotulo: { fontFamily: 'Montserrat-Bold', fontSize: 11, color: cor.fg('#1A56DB'), marginBottom: 4 },
  cartaoTexto: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: cor.fg('#333'), lineHeight: 21 },
  botao: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: cor.bg('#1A56DB'), borderRadius: 14, paddingVertical: 15, marginTop: 8 },
  botaoTexto: { fontFamily: 'Montserrat-Bold', fontSize: 14, color: cor.fg('#FFF') },
  nota: { fontFamily: 'Montserrat-Regular', fontSize: 12, color: cor.fg('#5A6B87'), textAlign: 'center', marginTop: 4 },
  erroBox: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', backgroundColor: cor.bg('#FDEDED'), borderWidth: 1, borderColor: cor.bd('#F5C2C2'), borderRadius: 12, padding: 12, marginTop: 30 },
  erroTexto: { flex: 1, fontFamily: 'Montserrat-Regular', fontSize: 12, color: cor.fg('#B03030') },
  erroLink: { fontFamily: 'Montserrat-Bold', fontSize: 12, color: cor.fg('#1A56DB'), marginTop: 8, width: '100%' },
});
