import React, { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { UserContext } from '../UserContext';

export default function PedidosScreen({ navigation, route }) {
  const { status } = route.params;
  const { user } = useContext(UserContext);

  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://192.168.0.40/charadamobile/pedidos.php?id_usuario=${user.id}`)
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          const pedidosFiltrados = data.pedidos.filter(p => p.status === status);
          setPedidos(pedidosFiltrados);
        } else {
          Alert.alert('Erro', 'Não foi possível carregar os pedidos.');
        }
      })
      .catch(error => {
        console.log(error);
        Alert.alert('Erro', 'Falha na conexão com o servidor.');
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pedidos - {status}</Text>

      {loading ? (
        <Text>Carregando...</Text>
      ) : (
        <FlatList
          data={pedidos}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => {
                navigation.navigate('Detalhes', { pedido: item });

                // Zera a badge no backend
                fetch('http://192.168.0.40/CharadaMobile/marcar_como_visualizado.php', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                  body: `pedido_id=${item.id}`
                });

                // Zera a badge local no app
                const pedidosAtualizados = pedidos.map(p =>
                  p.id === item.id ? { ...p, atualizado: 0 } : p
                );
                setPedidos(pedidosAtualizados);
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={styles.cardTitle}>Pedido #{item.id}</Text>
                {item.atualizado === 1 && <View style={styles.badge} />}
              </View>

              <Text>Data: {item.data}</Text>
              <Text>Valor total: R$ {item.valor}</Text>
              <Text style={styles.status}>Status atual: {item.posicao}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>Nenhum pedido encontrado.</Text>
          }
        />
      )}

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
  badge: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'red',
    alignSelf: 'center',
  },
});
