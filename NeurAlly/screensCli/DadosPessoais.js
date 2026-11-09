import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useFonts } from 'expo-font';
import Ionicons from '@expo/vector-icons/Ionicons';
import paleta from '../styles/Tema.js';
import EditableField from '../components/EditableField.js';
import SelectField from '../components/SelectField.js';
import { MUNICIPIOS } from '../constants/opcoes.js';
import { useAuth } from '../contexts/AuthContext.js';

export default function DadosPessoais({ navigation }) {
  const [fontsLoaded] = useFonts({
    'Montserrat-Regular': require('../styles/fonts/Montserrat/static/Montserrat-Regular.ttf'),
    'Montserrat-Bold': require('../styles/fonts/Montserrat/static/Montserrat-Bold.ttf'),
  });

  const { perfil } = useAuth();

  // Estados para gerenciar os valores dos campos (iniciam com os dados da conta)
  const [nome, setNome] = useState(perfil?.nome || '');
  const [nomeSocial, setNomeSocial] = useState(perfil?.nomeSocial || '');
  const [biografia, setBiografia] = useState(perfil?.biografia || '');
  const [email, setEmail] = useState(perfil?.email || '');
  const [telefone, setTelefone] = useState(perfil?.telefone || '');
  const [senha, setSenha] = useState('***************');
  const [dataNascimento, setDataNascimento] = useState(perfil?.dataNascimento || '');
  const [cpf, setCpf] = useState(perfil?.cpf || '');
  const [cep, setCep] = useState(perfil?.cep || '');
  const [rua, setRua] = useState(perfil?.rua || '');
  const [municipio, setMunicipio] = useState(perfil?.municipio || '');
  const [numero, setNumero] = useState(perfil?.numero || '');
  const [complemento, setComplemento] = useState(perfil?.complemento || '');
  const [contatoEmergencia, setContatoEmergencia] = useState(perfil?.contatoEmergencia || '');

  // O perfil pode terminar de carregar depois da tela abrir: sincroniza quando ele mudar.
  useEffect(() => {
    if (!perfil) return;
    setNome(perfil.nome || '');
    setNomeSocial(perfil.nomeSocial || '');
    setBiografia(perfil.biografia || '');
    setEmail(perfil.email || '');
    setTelefone(perfil.telefone || '');
    setDataNascimento(perfil.dataNascimento || '');
    setCpf(perfil.cpf || '');
    setCep(perfil.cep || '');
    setRua(perfil.rua || '');
    setMunicipio(perfil.municipio || '');
    setNumero(perfil.numero || '');
    setComplemento(perfil.complemento || '');
    setContatoEmergencia(perfil.contatoEmergencia || '');
  }, [perfil]);

  if (!fontsLoaded) return null;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.card}>

          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="chevron-back" size={28} color="#1A56DB" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Dados Pessoais</Text>
          </View>

          <View style={styles.divider} />

          {/* keyboardShouldPersistTaps="handled" deixa o toque no lápis funcionar com o teclado aberto */}
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <EditableField label="Nome" value={nome} onChangeText={setNome} />
            <EditableField label="Nome social" value={nomeSocial} onChangeText={setNomeSocial} />
            <EditableField label="Biografia" value={biografia} onChangeText={setBiografia} multiline height={100} />
            <EditableField label="E-mail" value={email} onChangeText={setEmail} keyboardType="email-address" />
            <EditableField label="Telefone" value={telefone} onChangeText={setTelefone} keyboardType="phone-pad" />
            <EditableField label="Senha" value={senha} onChangeText={setSenha} secure />
            <EditableField label="Data de Nascimento" value={dataNascimento} onChangeText={setDataNascimento} />

            {/* CPF apenas leitura com aviso */}
            <EditableField
              label="CPF"
              value={cpf || 'Não informado'}
              locked
              onLockedPress={() => Alert.alert('Aviso', 'O CPF não pode ser alterado.')}
            />

            <View style={styles.row}>
              <View style={[styles.flex1, { marginRight: 10 }]}>
                <EditableField label="CEP" value={cep} onChangeText={setCep} keyboardType="numeric" compact />
              </View>
              <View style={styles.flex2}>
                <EditableField label="Rua" value={rua} onChangeText={setRua} compact />
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.flex2, { marginRight: 10 }]}>
                <SelectField
                  label="Município"
                  title="Selecionar município"
                  value={municipio}
                  options={MUNICIPIOS}
                  onChange={setMunicipio}
                  containerStyle={{ marginBottom: 15 }}
                />
              </View>
              <View style={[styles.flex1, { marginRight: 10 }]}>
                <EditableField label="Nº" value={numero} onChangeText={setNumero} keyboardType="numeric" compact />
              </View>
              <View style={styles.flex1}>
                <EditableField label="Complemento" value={complemento} onChangeText={setComplemento} compact />
              </View>
            </View>

            <View style={styles.spacerDivider} />

            <EditableField label="Contato de emergência" value={contatoEmergencia} onChangeText={setContatoEmergencia} />

            <TouchableOpacity
              style={styles.paymentButton}
              onPress={() => Alert.alert('Método de Pagamento', 'Navegar para a tela de gerenciamento de pagamentos.')}
            >
              <Text style={styles.paymentButtonText}>Método de pagamento</Text>
            </TouchableOpacity>

          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: paleta.cor.fundoCard, 
    padding: 20 
  },
  card: { 
    flex: 1, 
    backgroundColor: '#FFF', 
    borderRadius: 20, 
    overflow: 'hidden' 
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 20, 
    paddingBottom: 10 
  },
  headerTitle: { 
    fontFamily: 'Montserrat-Bold', 
    fontSize: 20, 
    color: '#1A56DB', 
    marginLeft: 10 
  },
  divider: { 
    height: 2, 
    backgroundColor: '#1A56DB', 
    opacity: 0.5, 
    marginHorizontal: 20, 
    marginBottom: 10 
  },
  scrollContent: { 
    paddingHorizontal: 20, 
    paddingBottom: 120 
  },
  inputContainer: { 
    marginBottom: 15 
  },
  label: { 
    fontFamily: 'Montserrat-Bold', 
    fontSize: 10, color: '#1A56DB', 
    marginBottom: 5, 
    marginLeft: 5 
  },
  inputWrapper: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#F0F4FF', 
    borderRadius: 12, 
    paddingHorizontal: 15, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 1 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 2, 
    elevation: 2 
  },
  input: { 
    flex: 1, 
    fontFamily: 'Montserrat-Regular', 
    fontSize: 12, 
    color: '#333' 
  },
  row: { 
    flexDirection: 'row', 
    justifyContent: 'space-between' 
  },
  flex1: { 
    flex: 1 
  },
  flex2: { 
    flex: 2 
  },
  spacerDivider: { 
    height: 2, 
    backgroundColor: '#1A56DB', 
    opacity: 0.5, 
    marginVertical: 15 
  },
  paymentButton: { 
    width: '100%', 
    backgroundColor: '#F0F4FF', 
    paddingVertical: 15, 
    borderRadius: 15, 
    alignItems: 'center', 
    marginTop: 10, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 1 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 2, 
    elevation: 2 
  },
  paymentButtonText: { 
    fontFamily: 'Montserrat-Bold', 
    color: '#1A56DB', 
    fontSize: 14 
  }
});