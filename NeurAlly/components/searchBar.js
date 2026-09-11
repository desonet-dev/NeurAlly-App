import { StyleSheet, Text, View, TouchableOpacity, TextInput } from 'react-native';

import paleta from '../styles/Tema.js';
import Entypo from '@expo/vector-icons/Entypo';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useFonts } from 'expo-font';

const dates = [
  {dayNum: 1, dayName: 'Segunda', abrv: 'Seg'},
  {dayNum: 2, dayName: 'Ter', abrv: 'Ter'},
  {dayNum: 3, dayName: 'Qua', abrv: 'Qua'},
  {dayNum: 4, dayName: 'Qui', abrv: 'Qui'},
  {dayNum: 5, dayName: 'Sex', abrv: 'Sex'},
]

export default function SearchBar() {
  const [fontsLoaded] = useFonts({
    'Montserrat-Regular': require('../styles/fonts/Montserrat/static/Montserrat-Regular.ttf'),
    'Montserrat-Bold': require('../styles/fonts/Montserrat/static/Montserrat-Bold.ttf'),
  });
  if (!fontsLoaded) {
    return null;
  }
  return (
  <View style={styles.searchView}>
    <TouchableOpacity>
      <Entypo name="magnifying-glass" size={30} color='#CCC' />
    </TouchableOpacity>
    <TextInput style={styles.textInput} placeholder='Procure por um profissional' placeholderTextColor='#AAA'>

    </TextInput>
  </View>)
}

const styles = StyleSheet.create({
  searchView: {
    height: 56,
    flexDirection: 'row',
    backgroundColor: '#FAFAFA',
    marginHorizontal: 20,
    marginBottom: 35,
    borderRadius: 20,
    paddingHorizontal: 12.5,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    marginHorizontal: 5,
    fontFamily: 'Montserrat-Regular',
    color: paleta.cor.preto,
    fontSize: 15,
  },
});
