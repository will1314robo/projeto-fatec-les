import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './pages/LoginScreen';
import PedidosScreen from './pages/PedidosScreen';
import PedidoDetalhes from './pages/PedidoDetalhes';
import MenuScreen from './pages/MenuScreen.js';
import AbrirChamadoScreen from './pages/AbrirChamadoScreen.js';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Pedidos" component={PedidosScreen} />
        <Stack.Screen name="Detalhes" component={PedidoDetalhes} />
        <Stack.Screen name="Menu" component={MenuScreen} />
        <Stack.Screen name="AbrirChamado" component={AbrirChamadoScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
