import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, ScrollView, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

export default function PedidoDetalhes({ route, navigation }) {
  const { pedido } = route.params;

  const [chamado, setChamado] = useState(null);
  const [loadingChamado, setLoadingChamado] = useState(true);

  const buscarChamado = () => {
    setLoadingChamado(true);
    fetch(`http://192.168.0.40/charadamobile/consultar_chamado.php?pedido_id=${pedido.id}`)
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setChamado(data.chamado);
        } else {
          setChamado(null);
        }
      })
      .catch(error => {
        console.log(error);
        Alert.alert('Erro', 'Erro ao consultar chamado.');
        setChamado(null);
      })
      .finally(() => setLoadingChamado(false));
  };

  useFocusEffect(
    useCallback(() => {
      buscarChamado();
    }, [])
  );

  const handleRastreio = () => {
    Linking.openURL('https://rodonaves.com.br/rastreio-de-mercadoria');
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <Text style={styles.title}>Detalhes do Pedido #{pedido.id}</Text>

      <View style={styles.card}>
        <Text style={styles.label}>📅 Data do Pedido:</Text>
        <Text style={styles.value}>{pedido.data}</Text>

        <Text style={styles.label}>📦 Status:</Text>
        <Text style={styles.value}>{pedido.status}</Text>

        <Text style={styles.label}>🚚 Posição Atual:</Text>
        <Text style={styles.value}>{pedido.posicao}</Text>

        <Text style={styles.label}>💰 Valor Total:</Text>
        <Text style={styles.value}>R$ {pedido.valor}</Text>

        {pedido.posicao === 'Com transportadora' && (
          <TouchableOpacity onPress={handleRastreio} style={styles.rastreioBox}>
            <Text style={styles.rastreioTexto}>
              Clique aqui para rastrear sua mercadoria
            </Text>
          </TouchableOpacity>
        )}

        {pedido.status === 'Concluído' && (
          loadingChamado ? (
            <Text>Verificando chamados...</Text>
          ) : chamado ? (
            <View style={styles.chamadoBox}>
              <Text style={styles.label}>🛠️ Chamado já aberto para este pedido:</Text>
              <Text style={styles.value}>📅 Data: {chamado.data}</Text>
              <Text style={styles.value}>📝 Descrição: {chamado.descricao}</Text>
              <Text style={styles.value}>📱 WhatsApp: {chamado.whatsapp}</Text>
              <Text style={styles.value}>📧 E-mail: {chamado.email}</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate('AbrirChamado', { pedido })}
            >
              <Text style={styles.buttonText}>🛠️ Relatar problema</Text>
            </TouchableOpacity>
          )
        )}
      </View>

      <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
        <Text style={styles.buttonText}>Voltar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 20,
    backgroundColor: '#fff',
    flexGrow: 1,
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 25,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 20,
    elevation: 2,
  },
  label: {
    fontWeight: '600',
    marginTop: 12,
  },
  value: {
    fontSize: 16,
    color: '#333',
  },
  rastreioBox: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#eaf4ff',
    borderRadius: 8,
  },
  rastreioTexto: {
    color: '#007aff',
    textAlign: 'center',
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  chamadoBox: {
    backgroundColor: '#eee',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  button: {
    marginTop: 30,
    backgroundColor: '#333',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    alignSelf: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});
