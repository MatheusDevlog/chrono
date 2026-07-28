import sqlite3

from banco import conectar


def criar_tabela():
    conexao = conectar()
    conexao.execute("""
        CREATE TABLE IF NOT EXISTS apps_bloqueados (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            processo TEXT NOT NULL
        )
    """)
    conexao.commit()
    conexao.close()


def salvar_app(nome, processo):
    conexao = conectar()
    conexao.execute(
        "INSERT INTO apps_bloqueados (nome, processo) VALUES (?, ?)",
        (nome, processo),
    )
    conexao.commit()
    conexao.close()


def listar_apps():
    conexao = conectar()
    conexao.row_factory = sqlite3.Row
    cursor = conexao.execute(
        "SELECT id, nome, processo FROM apps_bloqueados ORDER BY nome"
    )
    linhas = cursor.fetchall()
    conexao.close()
    return [dict(linha) for linha in linhas]


def remover_app(id_app):
    conexao = conectar()
    conexao.execute("DELETE FROM apps_bloqueados WHERE id = ?", (id_app,))
    conexao.commit()
    conexao.close()

def editar_app(id_app, nome, processo):
    conexao = conectar()
    conexao.execute(
        "UPDATE apps_bloqueados SET nome=?, processo=? WHERE id=?",
        (nome, processo, id_app),
    )
    conexao.commit()
    conexao.close()
