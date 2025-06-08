package com.example.appcharada

import android.content.ContentValues
import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity

class CadastrarClientePFActivity : AppCompatActivity() {

    private lateinit var dbHelper: DatabaseHelper

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_cadastrar_cliente_pf)

        dbHelper = DatabaseHelper(this)

        val etNome = findViewById<EditText>(R.id.etNome)
        val etEmail = findViewById<EditText>(R.id.etEmail)
        val etCPF = findViewById<EditText>(R.id.etCPF)
        val etDataNascimento = findViewById<EditText>(R.id.etDataNascimento)
        val etNomeLogin = findViewById<EditText>(R.id.etNomeLogin)
        val etSenha = findViewById<EditText>(R.id.etSenha)
        val etFuncao = findViewById<EditText>(R.id.etFuncao)
        val btnCadastrar = findViewById<Button>(R.id.btnCadastrar)

        btnCadastrar.setOnClickListener {
            val nome = etNome.text.toString()
            val email = etEmail.text.toString()
            val cpf = etCPF.text.toString()
            val dataNascimento = etDataNascimento.text.toString()
            val nomeLogin = etNomeLogin.text.toString()
            val senha = etSenha.text.toString()
            val funcao = etFuncao.text.toString()

            if (nome.isEmpty() || email.isEmpty() || cpf.isEmpty() || dataNascimento.isEmpty() ||
                nomeLogin.isEmpty() || senha.isEmpty() || funcao.isEmpty()) {
                Toast.makeText(this, "Por favor, preencha todos os campos", Toast.LENGTH_SHORT).show()
            } else {
                val db = dbHelper.writableDatabase
                val values = ContentValues().apply {
                    put("role", funcao)
                    put("cpf", cpf)
                    put("username", nomeLogin)
                    put("password", senha)
                    put("birthdate", dataNascimento)
                    put("name", nome)
                    put("email", email)
                }
                val newRowId = db.insert("User", null, values)
                if (newRowId != -1L) {
                    Toast.makeText(this, "Cliente cadastrado com sucesso!", Toast.LENGTH_SHORT).show()
                    finish()
                } else {
                    Toast.makeText(this, "Erro ao cadastrar cliente", Toast.LENGTH_SHORT).show()
                }
            }
        }
    }
}
