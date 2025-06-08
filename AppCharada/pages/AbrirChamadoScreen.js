import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';

export default function AbrirChamadoScreen({ route, navigation }) {
  const { pedido } = route.params;

  const [descricao, setDescricao] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');

  const handleEnviarChamado = () => {
    if (!descricao.trim() || !whatsapp.trim() || !email.trim()) {
      Alert.alert('Campos obrigatórios', 'Por favor, preencha todos os campos antes de enviar.');
      return;
    }
  
    fetch('http://192.168.0.40/CharadaMobile/abrir_chamado.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `pedido_id=${pedido.id}&descricao=${encodeURIComponent(descricao)}&whatsapp=${encodeURIComponent(whatsapp)}&email=${encodeURIComponent(email)}`
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          Alert.alert('Relato enviado com sucesso!', 'Em breve entraremos em contato para resolver seu problema!');
          navigation.goBack();
        } else {
          Alert.alert('Erro', data.message);
        }
      })
      .catch(error => {
        console.log(error);
        Alert.alert('Erro', 'Falha na conexão com o servidor.');
      });
  };
  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <Text style={styles.title}>Abrir chamado</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Pedido #{pedido.id}</Text>
      </View>

      <Text style={styles.label}>Descreva o problema:</Text>
      <TextInput
        style={styles.inputArea}
        placeholder="Ex: Produto chegou avariado, produto veio na cor errada, etc..."
        placeholderTextColor="#888"
        value={descricao}
        onChangeText={setDescricao}
        multiline
        numberOfLines={4}
      />

      <Text style={styles.label}>WhatsApp para contato:</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite seu número de Whatsapp"
        placeholderTextColor="#888"
        keyboardType="phone-pad"
        value={whatsapp}
        onChangeText={setWhatsapp}
      />

      <Text style={styles.label}>E-mail para contato:</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite seu e-mail"
        placeholderTextColor="#888"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <TouchableOpacity style={styles.button} onPress={handleEnviarChamado}>
        <Text style={styles.buttonText}>📨 Enviar chamado</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.voltar} onPress={() => navigation.goBack()}>
        <Text style={styles.voltarText}>↩️ Voltar</Text>
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
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  label: { fontWeight: '600', fontSize: 16, marginTop: 10, marginBottom: 5 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#fff',
  },
  inputArea: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 12,
    textAlignVertical: 'top',
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#2c3e50',
    marginTop: 25,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  voltar: {
  marginTop: 15,
  padding: 12,
  alignItems: 'center',
  borderRadius: 10,
  backgroundColor: '#7f8c8d',
},
  voltarText: {
    color: '#fff',
    fontWeight: 'bold',
  }

});
