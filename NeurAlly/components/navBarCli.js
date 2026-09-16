import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  const insets = useSafeAreaInsets();

  const telaAtual = (grupo)=>{
    return screens[grupo].includes(route.name);
  }

  return (
      <View
        style={[
          styles.barBackground,
          { bottom: insets.bottom > 0 ? insets.bottom + 10 : 20 },
        ]}
        pointerEvents="box-none"
      >
        {buttons.map((button) => {
            const IconComponent = button.library;

            return (
                <TouchableOpacity
                    key={button.name}
                    style={telaAtual(button.name) ? styles.chosenBarOption : styles.barOption}
                    onPress={() => navigation.navigate(screens[button.name][0])}
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
    position: 'absolute',
    left: 10,
    right: 10,
    height: 70,
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    paddingHorizontal: 10,
    borderRadius: 35,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  barOption: {
    flex: 1,
    marginTop: 5,
    alignContent: 'center',
    justifyContent: 'center',
    color: paleta.cor.branco,
  },
  chosenBarOption: {
    marginVertical: 13,
    paddingLeft: 10,
    paddingRight: 5,
    color: paleta.cor.branco,
    backgroundColor: 'rgba(228, 236, 255, 0.85)',
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