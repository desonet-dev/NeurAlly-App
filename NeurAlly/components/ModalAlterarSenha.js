import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Modal, ScrollView, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { alterarSenha, contaUsaSenha, traduzErroFirebase } from '../services/authService.js';

import { useEstilos } from '../contexts/TemaContext.js';
// Janela "Alterar senha": pede a senha atual, a nova senha e a confirmação.
export default function ModalAlterarSenha({ visivel, onFechar }) {
  const [styles, cor] = useEstilos(criarStyles);
  const insets = useSafeAreaInsets();
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [mostrar, setMostrar] = useState(false);
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [concluido, setConcluido] = useState(false);

  // Sempre abre limpa.
  useEffect(() => {
    if (visivel) {
      setSenhaAtual('');
      setNovaSenha('');
      setConfirmacao('');
      setMostrar(false);
      setErro('');
      setSalvando(false);
      setConcluido(false);
    }
  }, [visivel]);

  const usaSenha = visivel ? contaUsaSenha() : true;

  const salvar = async () => {
    if (salvando) return;
    if (!senhaAtual) return setErro('Digite sua senha atual.');
    if (novaSenha.length < 6) return setErro('A nova senha precisa ter pelo menos 6 caracteres.');
    if (novaSenha === senhaAtual) return setErro('A nova senha precisa ser diferente da atual.');
    if (novaSenha !== confirmacao) return setErro('A confirmação não é igual à nova senha.');

    setErro('');
    setSalvando(true);
    try {
      await alterarSenha({ senhaAtual, novaSenha });
      setConcluido(true);
    } catch (e) {
      const codigo = e?.code || '';
      setErro(
        codigo === 'auth/invalid-credential' || codigo === 'auth/wrong-password'
          ? 'A senha atual está incorreta.'
          : traduzErroFirebase(e)
      );
    } finally {
      setSalvando(false);
    }
  };

  const campo = (rotulo, valor, aoMudar, placeholder) => (
    <View style={styles.campoContainer}>
      <Text style={styles.rotulo}>{rotulo}</Text>
      <View style={styles.campo}>
        <TextInput
          style={styles.input}
          value={valor}
          onChangeText={(texto) => { setErro(''); aoMudar(texto); }}
          placeholder={placeholder}
          placeholderTextColor={cor.fg("#999")}
          secureTextEntry={!mostrar}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>
    </View>
  );

  return (
    <Modal animationType="fade" transparent visible={!!visivel} onRequestClose={onFechar} statusBarTranslucent>
      <View style={[styles.overlay, { paddingTop: insets.top + 40 }]}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scroll}>
          <View style={styles.container}>
            <View style={styles.cabecalho}>
              <Text style={styles.titulo}>Alterar senha</Text>
              <TouchableOpacity onPress={onFechar} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} accessibilityLabel="Fechar">
                <Ionicons name="close" size={24} color={cor.fg("#1A56DB")} />
              </TouchableOpacity>
            </View>

            {concluido ? (
              <View style={styles.centro}>
                <Ionicons name="checkmark-circle" size={48} color={cor.fg("#2E9E5B")} />
                <Text style={styles.mensagem}>Senha alterada com sucesso!</Text>
                <TouchableOpacity style={styles.botao} onPress={onFechar}>
                  <Text style={styles.botaoTexto}>Ok</Text>
                </TouchableOpacity>
              </View>
            ) : !usaSenha ? (
              <View style={styles.centro}>
                <Ionicons name="logo-google" size={40} color={cor.fg("#1A56DB")} />
                <Text style={styles.mensagem}>
                  Sua conta usa o login com o Google, então não tem uma senha do NeurAlly. Para trocar a senha, altere-a na sua conta Google.
                </Text>
                <TouchableOpacity style={styles.botao} onPress={onFechar}>
                  <Text style={styles.botaoTexto}>Entendi</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {campo('Senha atual', senhaAtual, setSenhaAtual, 'Digite sua senha atual')}
                {campo('Nova senha', novaSenha, setNovaSenha, 'Mínimo de 6 caracteres')}
                {campo('Confirmar nova senha', confirmacao, setConfirmacao, 'Repita a nova senha')}

                <TouchableOpacity style={styles.mostrarLinha} onPress={() => setMostrar((v) => !v)}>
                  <Ionicons name={mostrar ? 'eye-off-outline' : 'eye-outline'} size={18} color={cor.fg("#1A56DB")} />
                  <Text style={styles.mostrarTexto}>{mostrar ? 'Ocultar senhas' : 'Mostrar senhas'}</Text>
                </TouchableOpacity>

                {!!erro && (
                  <View style={styles.erroBox} accessibilityRole="alert" accessibilityLiveRegion="polite">
                    <Ionicons name="alert-circle" size={18} color={cor.fg("#D64545")} style={{ marginRight: 8 }} />
                    <Text style={styles.erroTexto}>{erro}</Text>
                  </View>
                )}

                <TouchableOpacity style={[styles.botao, salvando && { opacity: 0.7 }]} onPress={salvar} disabled={salvando}>
                  {salvando ? <ActivityIndicator size="small" color={cor.fg("#FFF")} /> : <Text style={styles.botaoTexto}>Salvar nova senha</Text>}
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const criarStyles = (cor) => StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },
  container: { backgroundColor: cor.bg('#FFF'), borderRadius: 20, padding: 20 },
  cabecalho: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  titulo: { fontFamily: 'Montserrat-Bold', fontSize: 20, color: cor.fg('#1A1A1A') },
  campoContainer: { marginBottom: 14 },
  rotulo: { fontFamily: 'Montserrat-Bold', fontSize: 11, color: cor.fg('#1A56DB'), marginBottom: 5, marginLeft: 5 },
  campo: { backgroundColor: cor.bg('#F0F4FF'), borderRadius: 12, paddingHorizontal: 15, height: 46, justifyContent: 'center' },
  input: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: cor.fg('#333') },
  mostrarLinha: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, alignSelf: 'flex-start' },
  mostrarTexto: { fontFamily: 'Montserrat-Regular', fontSize: 12, color: cor.fg('#1A56DB'), marginLeft: 6 },
  erroBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: cor.bg('#FDEDED'), borderWidth: 1, borderColor: cor.bd('#F5C2C2'), borderRadius: 12, paddingVertical: 10, paddingHorizontal: 12, marginBottom: 14 },
  erroTexto: { flex: 1, fontFamily: 'Montserrat-Regular', fontSize: 12, color: cor.fg('#B03030') },
  botao: { backgroundColor: cor.bg('#1A56DB'), borderRadius: 12, paddingVertical: 14, alignItems: 'center', alignSelf: 'stretch' },
  botaoTexto: { fontFamily: 'Montserrat-Bold', color: cor.fg('#FFF'), fontSize: 14 },
  centro: { alignItems: 'center' },
  mensagem: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: cor.fg('#5A6B87'), textAlign: 'center', marginVertical: 16 },
});
