package com.example.appcharada

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import androidx.appcompat.app.AppCompatActivity

class MenuAdminActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_menu_admin)

        val btnCadastrarUsuario = findViewById<Button>(R.id.btnCadastrarUsuario)
        val btnCadastrarMesa = findViewById<Button>(R.id.btnCadastrarMesa)
        val btnRelatorios = findViewById<Button>(R.id.btnRelatorios)


        btnCadastrarUsuario.setOnClickListener {
            // Implemente a funcionalidade de cadastrar funcionário
            val intent = Intent(this, CadastrarUsuarioActivity::class.java)
            startActivity(intent)
        }


        btnCadastrarMesa.setOnClickListener {
            // Implemente a funcionalidade de cadastrar mesa
            // Por enquanto, vamos apenas mostrar uma mensagem
            // Você pode substituir isso pela lógica real de cadastro de mesa
            // ou criar uma nova activity para isso
        }

        btnRelatorios.setOnClickListener {
            // Implemente a funcionalidade de relatórios
            // Por enquanto, vamos apenas mostrar uma mensagem
            // Você pode substituir isso pela lógica real de geração de relatórios
            // ou criar uma nova activity para isso
        }
    }
}
