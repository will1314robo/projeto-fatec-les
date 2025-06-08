package com.example.appcharada

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import androidx.appcompat.app.AppCompatActivity

class CadastrarUsuarioFunActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_cadastrar_usuario_fun)

        val btnCadastrarClientePJ = findViewById<Button>(R.id.btnCadastrarClientePJ)
        val btnCadastrarClientePF = findViewById<Button>(R.id.btnCadastrarClientePF)


        btnCadastrarClientePJ.setOnClickListener {
            val intent = Intent(this, CadastrarClientePJActivity::class.java)
            startActivity(intent)
        }

        btnCadastrarClientePF.setOnClickListener {
            val intent = Intent(this, CadastrarClientePFActivity::class.java)
            startActivity(intent)
        }
    }
}
