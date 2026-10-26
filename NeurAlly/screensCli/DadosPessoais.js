import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useFonts } from 'expo-font';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import paleta from '../styles/Tema.js';

export default function DadosPessoais({ navigation }) {
  const [fontsLoaded] = useFonts({
    'Montserrat-Regular': require('../styles/fonts/Montserrat/static/Montserrat-Regular.ttf'),
    'Montserrat-Bold': require('../styles/fonts/Montserrat/static/Montserrat-Bold.ttf'),
  });

  // Estados para gerenciar os valores dos inputs
  const [nome, setNome] = useState('Carlos Andrade');
  const [nomeSocial, setNomeSocial] = useState('Carlos Andrade');
  const [biografia, setBiografia] = useState('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam venenatis dui dignissim finibus dignissim.');
  const [email, setEmail] = useState('carlosandrade@yahoo.com');
  const [telefone, setTelefone] = useState('+55 (11) 9 1234-5678');
  const [senha, setSenha] = useState('***************');
  const [dataNascimento, setDataNascimento] = useState('05/04/1992');
  const [cpf, setCpf] = useState('123.456.789-01');
  const [cep, setCep] = useState('12345-678');
  const [rua, setRua] = useState('Avenida Aprígio');
  const [municipio, setMunicipio] = useState('Taboão da Serra');
  const [numero, setNumero] = useState('123');
  const [complemento, setComplemento] = useState('22');
  const [contatoEmergencia, setContatoEmergencia] = useState('05/04/1992');

  if (!fontsLoaded) return null;

  // Componente de input reutilizável e clicável/editável
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
          editable={editable && !onPress} // Se tiver onPress, bloqueia o TextInput interno para disparar o clique do container
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
            
            {/* CPF apenas leitura com aviso */}
            <InputField 
              label="CPF" 
              value={cpf} 
              icon="info" 
              editable={false}
              onPress={() => Alert.alert("Aviso", "O CPF não pode ser alterado.")} 
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
                {/* Exemplo de campo tipo select/dropdown clicável */}
                <InputField 
                  label="Município" 
                  value={municipio} 
                  icon="dropdown" 
                  onPress={() => Alert.alert("Selecionar Município", "Aqui você pode abrir um modal com a lista de cidades.")}
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

            <InputField label="Contato de emergência" value={contatoEmergencia} onChangeText={setContatoEmergencia} icon="info" />

            <TouchableOpacity 
              style={styles.paymentButton}
              onPress={() => Alert.alert("Método de Pagamento", "Navegar para a tela de gerenciamento de pagamentos.")}
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