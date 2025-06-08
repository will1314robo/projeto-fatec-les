import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Image, TouchableOpacity, Linking, Modal } from 'react-native';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

const handleLogin = () => {
  if (!email || !senha) {
    alert('Por favor, preencha todos os campos!');
    return;
  }

  fetch('http://192.168.0.28/charada/login.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `email=${encodeURIComponent(email)}&senha=${encodeURIComponent(senha)}`,
  })
    .then(response => response.json())
    .then(responseJson => {
      if (responseJson.success) {
        alert(`Bem-vindo, ${responseJson.nome}`);
        navigation.navigate('Menu');
      } else {
        alert(responseJson.message);
      }
    })
    .catch(error => {
      console.error(error);
      alert('Erro na conexão com o servidor.');
    });
};

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      <View style={styles.loginBox}>
        <Text style={styles.title}>Login</Text>

        <TextInput
          style={styles.input}
          placeholder="E-mail"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Senha"
          secureTextEntry
          value={senha}
          onChangeText={setSenha}
        />

        <Button title="Entrar" onPress={handleLogin} />
      </View>

      <TouchableOpacity style={styles.helpButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.helpText}>?</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>
              Aplicativo desenvolvido para clientes da empresa Charada Diversões localizarem seus pedidos.
              Caso não tenha conta, registre-se{' '}
              <Text
                style={styles.link}
                onPress={() => Linking.openURL('https://www.charadadiversao.com/')}
              >
                clicando aqui
              </Text>.
            </Text>
            <Button title="Fechar" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 10,
    justifyContent: 'flex-start',
  },
  logo: {
    width: '100%',
    height: 100,
    marginBottom: 10,
  },
  loginBox: {
    padding: 20,
    backgroundColor: '#f3f3f3',
    borderRadius: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    alignSelf: 'center',
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  helpButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#333',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  helpText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000099',
    justifyContent: 'center',
    padding: 30,
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 25,
    borderRadius: 10,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
  },
  link: {
    color: '#007bff',
    textDecorationLine: 'underline',
  },
});
