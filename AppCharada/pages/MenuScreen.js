import React, { useContext, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { UserContext } from '../UserContext';

export default function MenuScreen({ navigation }) {
  const { user, setUser } = useContext(UserContext);

  useEffect(() => {
    if (!user) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    }
  }, [user]);

  const handleNavigate = (status) => {
    navigation.navigate('Pedidos', { status });
  };

  const handleLogout = () => {
    setUser(null);
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Meus Pedidos</Text>

      <View style={styles.row}>
        <TouchableOpacity style={[styles.button, styles.andamento]} onPress={() => handleNavigate('Em andamento')}>
          <Text style={styles.icon}>🚚</Text>
          <Text style={styles.label}>Em andamento</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.entregue]} onPress={() => handleNavigate('Concluído')}>
          <Text style={styles.icon}>✅</Text>
          <Text style={styles.label}>Entregues</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.row}>
        <TouchableOpacity style={[styles.button, styles.cancelado]} onPress={() => handleNavigate('Cancelado')}>
          <Text style={styles.icon}>❌</Text>
          <Text style={styles.label}>Cancelados</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.exit]} onPress={handleLogout}>
          <Text style={styles.icon}>↩️</Text>
          <Text style={styles.label}>Sair</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, padding: 30, backgroundColor: '#fff', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 30, alignSelf: 'center' },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  button: {
    flex: 0.48,
    backgroundColor: '#0062ff',
    paddingVertical: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  exit: {
    backgroundColor: '#7f8c8d',
  },
  andamento: {
    backgroundColor: '#2c3e50',
  },
  cancelado: {
    backgroundColor: '#a00',
  },
  entregue: {
    backgroundColor: '#27ae60',
  },
  icon: {
    fontSize: 28,
    marginBottom: 8,
  },
  label: {
    color: '#fff',
    fontSize: 16,
  },
});
