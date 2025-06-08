package com.example.appcharada

import android.annotation.SuppressLint
import android.content.Intent
import android.os.Bundle
import android.widget.Button
import androidx.appcompat.app.AppCompatActivity

class MenuClienteActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_menu_cliente)

        val btnRelatorios = findViewById<Button>(R.id.btnRelatorios)


        btnRelatorios.setOnClickListener {
            // Implemente a funcionalidade de relatórios
            // Por enquanto, vamos apenas mostrar uma mensagem
            // Você pode substituir isso pela lógica real de geração de relatórios
            // ou criar uma nova activity para isso
        }
    }
}
