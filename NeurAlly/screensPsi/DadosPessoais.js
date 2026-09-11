import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useFonts } from 'expo-font';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function PerfilDadosPsi({ navigation }) {
  const [fontsLoaded] = useFonts({
    'Montserrat-Regular': require('../styles/fonts/Montserrat/static/Montserrat-Regular.ttf'),
    'Montserrat-Bold': require('../styles/fonts/Montserrat/static/Montserrat-Bold.ttf'),
  });

  if (!fontsLoaded) return null;

  const InputField = ({ label, value, icon, multiline, height = 45 }) => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrapper, { height: multiline ? height : 45 }]}>
        <TextInput 
          style={[styles.input, multiline && { textAlignVertical: 'top', paddingTop: 10 }]} 
          value={value} 
          multiline={multiline}
          editable={false}
        />
        {icon === 'edit' && <MaterialIcons name="edit" size={20} color="#000" />}
        {icon === 'info' && <MaterialIcons name="info" size={20} color="#000" />}
        {icon === 'dropdown' && <Ionicons name="caret-down" size={20} color="#000" />}
      </View>
    </View>
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
            <InputField label="Nome" value="Carlos Andrade" icon="edit" />
            <InputField label="Nome social" value="Carlos Andrade" icon="edit" />
            <InputField 
              label="Biografia" 
              value="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam venenatis dui dignissim finibus dignissim. Aenean tempus nibh placerat nisl ultricies placerat. Praesent tempor nibh non eleifend euismod." 
              icon="edit" 
              multiline 
              height={100} 
            />
            <InputField label="E-mail" value="carlosandrade@yahoo.com" icon="edit" />
            <InputField label="Telefone" value="+55 (11) 9 1234-5678" icon="edit" />
            <InputField label="Senha" value="***************" icon="edit" />
            <InputField label="Data de Nascimento" value="05/04/1992" icon="edit" />
            <InputField label="CPF" value="123.456.789-01" icon="info" />
            
            <View style={styles.row}>
              <View style={[styles.flex1, { marginRight: 10 }]}>
                <InputField label="CEP" value="12345-678" />
              </View>
              <View style={styles.flex2}>
                <InputField label="Rua" value="Avenida Aprígio" />
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.flex2, { marginRight: 10 }]}>
                <InputField label="Município" value="Taboão da Serra" icon="dropdown" />
              </View>
              <View style={[styles.flex1, { marginRight: 10 }]}>
                <InputField label="Nº" value="123" />
              </View>
              <View style={styles.flex1}>
                <InputField label="Complemento" value="22" />
              </View>
            </View>

            <View style={styles.spacerDivider} />

            <InputField label="CRP" value="05/04/1992" icon="info" />

            <TouchableOpacity style={styles.paymentButton}>
              <Text style={styles.paymentButtonText}>Método de pagamento</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#9EBDF0', padding: 20 },
  card: { flex: 1, backgroundColor: '#FFF', borderRadius: 20, overflow: 'hidden' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingBottom: 10 },
  headerTitle: { fontFamily: 'Montserrat-Bold', fontSize: 20, color: '#1A56DB', marginLeft: 10 },
  divider: { height: 2, backgroundColor: '#1A56DB', opacity: 0.5, marginHorizontal: 20, marginBottom: 10 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  inputContainer: { marginBottom: 15 },
  label: { fontFamily: 'Montserrat-Bold', fontSize: 10, color: '#1A56DB', marginBottom: 5, marginLeft: 5 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F4FF', borderRadius: 12, paddingHorizontal: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  input: { flex: 1, fontFamily: 'Montserrat-Regular', fontSize: 12, color: '#333' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  flex1: { flex: 1 },
  flex2: { flex: 2 },
  spacerDivider: { height: 2, backgroundColor: '#1A56DB', opacity: 0.5, marginVertical: 15 },
  paymentButton: { width: '100%', backgroundColor: '#F0F4FF', paddingVertical: 15, borderRadius: 15, alignItems: 'center', marginTop: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  paymentButtonText: { fontFamily: 'Montserrat-Bold', color: '#1A56DB', fontSize: 14 }
});