import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Button } from 'react-native';

const pedidosMock = [
  { id: '1', data: '05/05/2025', status: 'Em andamento', total: 'R$ 2699,00', pagamento: 'PIX', posicao: 'Em produção' },
  { id: '2', data: '03/05/2025', status: 'Entregue', total: 'R$ 1199,00', pagamento: 'PIX', posicao: 'Entregue' },
  { id: '3', data: '01/05/2025', status: 'Cancelado', total: 'R$ 89,00', pagamento: 'Cartão de crédito', posicao: 'Cancelado' },
  { id: '4', data: '10/05/2025', status: 'Em andamento', total: 'R$ 3399,00', pagamento: 'PIX', posicao: 'Embalando' },
  { id: '5', data: '30/04/2025', status: 'Em andamento', total: 'R$ 3499,00', pagamento: 'Cartão de crédito', posicao: 'Com transportadora' },
];

export default function PedidosScreen({ navigation, route }) {
  const { status } = route.params;
  const pedidosFiltrados = pedidosMock.filter(pedido => pedido.status === status);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pedidos - {status}</Text>

      <FlatList
        data={pedidosFiltrados}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('Detalhes', { pedido: item })}
          >
            <Text style={styles.cardTitle}>Pedido #{item.id}</Text>
            <Text>Data: {item.data}</Text>
            <Text>Pagamento: {item.pagamento}</Text>
            <Text>Valor total: {item.total}</Text>
            <Text style={styles.status}>Status atual: {item.posicao}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>Nenhum pedido encontrado.</Text>
        }
      />

      <TouchableOpacity style={styles.exitButton} onPress={() => navigation.navigate('Menu')}>
        <Text style={styles.exitText}>Voltar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 15, alignSelf: 'center' },
  card: {
    borderWidth: 1,
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    backgroundColor: '#f8f8f8',
  },
  cardTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
  },
  status: {
    marginTop: 8,
    fontStyle: 'italic',
    color: '#555',
  },
  exitButton: {
    marginTop: 20,
    alignSelf: 'center',
    backgroundColor: '#333',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  exitText: {
    color: '#fff',
    fontSize: 16,
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: '#888',
  },
});
