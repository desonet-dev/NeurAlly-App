import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

import paleta from '../styles/Tema.js';
import Entypo from '@expo/vector-icons/Entypo';
import { useNavigation, useRoute } from '@react-navigation/native';


const buttons = [
    { name: "Home", icon: "home", label: "Início" },
    { name: "Notas", icon: "pencil", label: "Notas" },
    { name: "Agenda", icon: "calendar", label: "Agenda" },
    { name: "Conversas", icon: "chat", label: "Conversas" },
    { name: "Perfil", icon: "user", label: "Perfil" },
];

const screens = {
  Home: [
    'Home',
  ],
  Notas: [
    
  ],
  Agenda: [

  ],
  Conversas:[

  ],
  Perfil:[
    'Perfil',
  ]
}

export default function NavBar() {
  const navigation = useNavigation();
  const route = useRoute();

  const telaAtual = (grupo)=>{
    return screens[grupo].includes(route.name);
  }

  return (
      <View style={styles.barBackground}>
        {buttons.map((button) => (
    <TouchableOpacity
        key={button.name}
        style={styles.barOption}
        onPress={() => navigation.navigate(button.name)}
    >
        <View style={styles.barImage}>
        <Entypo
            name={button.icon}
            size={24}
            color={telaAtual(button.name) ? "white" : "black"}
        />
        </View>

        <Text
            style={[
                styles.barText,
                {
                    color: telaAtual(button.name)
                        ? "white"
                        : "black",
                },
            ]}
        >
            {button.label}
        </Text>
    </TouchableOpacity>
))}
    </View>
  );
}

const styles = StyleSheet.create({
  barBackground: {
    height:75,
    flexDirection: 'row',
    backgroundColor: paleta.cor.a5,
  },
  barOption: {
    flex: 1,
    marginTop: 5,
    alignContent: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    color: paleta.cor.branco,
  },
  barText: {
    flex: 1,
    fontSize: 12,
    textAlign: 'center',
    color: paleta.cor.branco,
    fontWeight: 'bold',
  },
  barImage: {
    flex: 1,
    alignContent: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
