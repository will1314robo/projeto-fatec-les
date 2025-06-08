package com.example.appcharada

import android.content.ContentValues
import android.content.Intent
import android.database.Cursor
import android.database.sqlite.SQLiteDatabase
import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {

    private lateinit var dbHelper: DatabaseHelper
    private lateinit var database: SQLiteDatabase

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        dbHelper = DatabaseHelper(this)
        database = dbHelper.writableDatabase

        // Preencher com dados fictícios
        insertDummyData()

        val etUsername = findViewById<EditText>(R.id.etUsername)
        val etPassword = findViewById<EditText>(R.id.etPassword)
        val btnLogin = findViewById<Button>(R.id.btnLogin)

        btnLogin.setOnClickListener {
            val username = etUsername.text.toString()
            val password = etPassword.text.toString()

            val role = checkLogin(username, password)
            if (role != null) {
                // Armazena a "role" do usuário na sessão
                UserSession.role = role
                val userRole = UserSession.role
                if (userRole == "Admin") {
                    val intent = Intent(this, MenuAdminActivity::class.java)
                    startActivity(intent)
                    finish()
                } else if (userRole == "Funcionario") {
                    val intent = Intent(this, MenuFuncionarioActivity::class.java)
                    startActivity(intent)
                    finish()
                    // Faça algo específico para o funcionário
                } else if (userRole == "Cliente") {
                    val intent = Intent(this, MenuClienteActivity::class.java)
                    startActivity(intent)
                    finish()
                }

            } else {
                // Falha no login
                Toast.makeText(this, "Nome de Login ou Senha inválidos", Toast.LENGTH_SHORT).show()
            }
        }

    }

    private fun insertDummyData() {
        val values = ContentValues().apply {
            put("role", "Admin")
            put("cpf", "38227415822")
            put("username", "pedrocoiado")
            put("password", "Teste123")
            put("birthdate", "26/05/2004")
            put("name", "Pedro Coiado da Cunha")
            put("email", "pedrocoiado26@gmail.com")
        }
        database.insert("User", null, values)
    }

    private fun checkLogin(username: String, password: String): String? {
        val cursor: Cursor = database.rawQuery(
            "SELECT role FROM User WHERE username = ? AND password = ?",
            arrayOf(username, password)
        )
        return if (cursor.moveToFirst()) {
            val role = cursor.getString(cursor.getColumnIndexOrThrow("role"))
            cursor.close()
            role
        } else {
            cursor.close()
            null
        }
    }

}
