import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

import paleta from '../styles/Tema.js';
import Entypo from '@expo/vector-icons/Entypo';
import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

import { useNavigation, useRoute } from '@react-navigation/native';

const buttons = [
    { name: "Home", icon: "home", label: "Início", library: Feather },
    { name: "Diario", icon: "book-outline", label: "Diário", library: MaterialCommunityIcons },
    { name: "Agenda", icon: "calendar-outline", label: "Agenda", library: Ionicons },
    { name: "Conversas", icon: "chatbox-ellipses-outline", label: "Conversas", library: Ionicons },
    { name: "Perfil", icon: "user", label: "Perfil", library: FontAwesome6 },
];

const screens = {
  Home: [
    'Home',
  ],
  Diario: [
    'DiarioEmocional',
    'EscreverDiario',
  ],
  Agenda: [
    'Agendamento',
    'BuscaProfissionais',
    'PerfilProfissional',
  ],
  Conversas: [
    'Conversas',
    'Conversa',
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
        {buttons.map((button) => {
            const IconComponent = button.library;

            return (
                <TouchableOpacity
                    key={button.name}
                    style={telaAtual(button.name) ? styles.chosenBarOption : styles.barOption}
                    onPress={() => navigation.navigate(button.name)}
                >
                    <View style={styles.barImage}>
                        <IconComponent
                            name={button.icon}
                            size={25}
                            color={telaAtual(button.name) ? paleta.cor.a4 : paleta.cor.cinzaescuro}
                        />
                    </View>
                    {telaAtual(button.name) && (
                        <Text style={styles.barText}>
                            {button.label}
                        </Text>
                    )}
                </TouchableOpacity>
            );
        })}
    </View>
  );
}

const styles = StyleSheet.create({
  barBackground: {
    height: 80,
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: paleta.cor.a1,
    marginHorizontal: 10,
    marginBottom: 35,
    paddingHorizontal: 10,
    borderRadius: 35,
  },
  barOption: {
    flex: 1,
    marginTop: 5,
    alignContent: 'center',
    justifyContent: 'center',
    color: paleta.cor.branco,
  },
  chosenBarOption: {
    marginVertical: 18,
    paddingLeft: 10,
    paddingRight: 5,
    color: paleta.cor.branco,
    backgroundColor: paleta.cor.a8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    borderRadius: 16,
  },
  barText: {
    marginRight: 12,
    fontSize: 14,
    textAlign: 'center',
    color: paleta.cor.a4,
    fontWeight: 'bold',
  },
  barImage: {
    alignContent: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    paddingRight: 10,
  },
});