import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useFonts } from 'expo-font';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import paleta from '../styles/Tema.js';

export default function PerfilDadosPsi({ navigation }) {
  const [fontsLoaded] = useFonts({
    'Montserrat-Regular': require('../styles/fonts/Montserrat/static/Montserrat-Regular.ttf'),
    'Montserrat-Bold': require('../styles/fonts/Montserrat/static/Montserrat-Bold.ttf'),
  });

  // Estados locais para gerenciar os dados do perfil do psicólogo
  const [nome, setNome] = useState('Dra. Aline Juliana');
  const [nomeSocial, setNomeSocial] = useState('Dra. Aline');
  const [biografia, setBiografia] = useState('Psicóloga clínica especialista em TCC, atendendo adultos e adolescentes com foco em ansiedade e trauma.');
  const [email, setEmail] = useState('aline.juliana@psicologia.com');
  const [telefone, setTelefone] = useState('+55 (11) 9 8765-4321');
  const [senha, setSenha] = useState('***************');
  const [dataNascimento, setDataNascimento] = useState('15/08/1985');
  const [crp, setCrp] = useState('06/123456');
  const [cep, setCep] = useState('06767-000');
  const [rua, setRua] = useState('Rodovia Regis Bittencourt');
  const [municipio, setMunicipio] = useState('Taboão da Serra');
  const [numero, setNumero] = useState('450');
  const [complemento, setComplemento] = useState('Sala 12');

  if (!fontsLoaded) return null;

  // Componente de input reutilizável com suporte a cliques e edição
  const InputField = ({ label, value, onChangeText, icon, multiline, height = 45, onPress, editable = true }) => (
    <TouchableOpacity 
      style={styles.inputContainer} 
      activeOpacity={onPress ? 0.7 : 1} 
      onPress={onPress}
    >
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrapper, { height: multiline ? height : 45 }]}>
        <TextInput 
          style={[styles.input, multiline && { textAlignVertical: 'top', paddingTop: 10 }]} 
          value={value} 
          onChangeText={onChangeText}
          multiline={multiline}
          editable={editable && !onPress}
          pointerEvents={onPress ? 'none' : 'auto'}
        />
        {icon === 'edit' && <MaterialIcons name="edit" size={20} color="#000" />}
        {icon === 'info' && <MaterialIcons name="info" size={20} color="#000" />}
        {icon === 'dropdown' && <Ionicons name="caret-down" size={20} color="#000" />}
      </View>
    </TouchableOpacity>
  );

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

          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <InputField label="Nome" value={nome} onChangeText={setNome} icon="edit" />
            <InputField label="Nome social" value={nomeSocial} onChangeText={setNomeSocial} icon="edit" />
            <InputField 
              label="Biografia" 
              value={biografia} 
              onChangeText={setBiografia}
              icon="edit" 
              multiline 
              height={100} 
            />
            <InputField label="E-mail" value={email} onChangeText={setEmail} icon="edit" />
            <InputField label="Telefone" value={telefone} onChangeText={setTelefone} icon="edit" />
            <InputField label="Senha" value={senha} onChangeText={setSenha} icon="edit" />
            <InputField label="Data de Nascimento" value={dataNascimento} onChangeText={setDataNascimento} icon="edit" />
            
            {/* CRP bloqueado para alteração com aviso */}
            <InputField 
              label="CRP" 
              value={crp} 
              icon="info" 
              editable={false}
              onPress={() => Alert.alert("Aviso", "O registro do CRP não pode ser alterado diretamente.")}
            />
            
            <View style={styles.row}>
              <View style={[styles.flex1, { marginRight: 10 }]}>
                <InputField label="CEP" value={cep} onChangeText={setCep} />
              </View>
              <View style={styles.flex2}>
                <InputField label="Rua" value={rua} onChangeText={setRua} />
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.flex2, { marginRight: 10 }]}>
                <InputField 
                  label="Município" 
                  value={municipio} 
                  icon="dropdown" 
                  onPress={() => Alert.alert("Município", "Selecione o município de atendimento.")}
                />
              </View>
              <View style={[styles.flex1, { marginRight: 10 }]}>
                <InputField label="Nº" value={numero} onChangeText={setNumero} />
              </View>
              <View style={styles.flex1}>
                <InputField label="Complemento" value={complemento} onChangeText={setComplemento} />
              </View>
            </View>

            <View style={styles.spacerDivider} />

            <TouchableOpacity 
              style={styles.paymentButton}
              onPress={() => Alert.alert("Método de Pagamento", "Gerenciar contas e recebimentos do profissional.")}
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
    paddingBottom: 40 
  },
  inputContainer: { 
    marginBottom: 15 
  },
  label: { 
    fontFamily: 'Montserrat-Bold', 
    fontSize: 10, 
    color: '#1A56DB', 
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