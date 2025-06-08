package com.example.appcharada

import android.content.Context
import android.database.sqlite.SQLiteDatabase
import android.database.sqlite.SQLiteOpenHelper

class DatabaseHelper(context: Context) : SQLiteOpenHelper(context, DATABASE_NAME, null, DATABASE_VERSION) {

    override fun onCreate(db: SQLiteDatabase) {
        db.execSQL(CREATE_USER_TABLE)
    }

    override fun onUpgrade(db: SQLiteDatabase, oldVersion: Int, newVersion: Int) {
        db.execSQL("DROP TABLE IF EXISTS $TABLE_USER")
        onCreate(db)
    }

    companion object {
        private const val DATABASE_VERSION = 1
        private const val DATABASE_NAME = "UserDatabase"
        private const val TABLE_USER = "User"
        private const val KEY_ID = "id"
        private const val KEY_ROLE = "role"
        private const val KEY_CPF = "cpf"
        private const val KEY_USERNAME = "username"
        private const val KEY_PASSWORD = "password"
        private const val KEY_BIRTHDATE = "birthdate"
        private const val KEY_NAME = "name"
        private const val KEY_EMAIL = "email"

        private const val CREATE_USER_TABLE = (
                "CREATE TABLE " + TABLE_USER + "("
                        + KEY_ID + " INTEGER PRIMARY KEY AUTOINCREMENT,"
                        + KEY_ROLE + " TEXT,"
                        + KEY_CPF + " TEXT,"
                        + KEY_USERNAME + " TEXT,"
                        + KEY_PASSWORD + " TEXT,"
                        + KEY_BIRTHDATE + " TEXT,"
                        + KEY_NAME + " TEXT,"
                        + KEY_EMAIL + " TEXT" + ")")
    }
}
