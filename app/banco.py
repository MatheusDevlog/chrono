import os
import sqlite3


def _pasta_dados():
    base = os.environ.get('APPDATA') or os.path.expanduser('~')
    return os.path.join(base, 'Chrono')


PASTA_DADOS = _pasta_dados()
ARQUIVO_BANCO = os.path.join(PASTA_DADOS, 'chrono.db')


def conectar():
    os.makedirs(PASTA_DADOS, exist_ok=True)
    return sqlite3.connect(ARQUIVO_BANCO)


def criar_tabela():
    conexao = conectar()
    conexao.execute("""
        CREATE TABLE IF NOT EXISTS sessoes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            inicio TEXT NOT NULL,
            fim TEXT NOT NULL,
            duracao_segundos INTEGER NOT NULL
        )
    """)
    conexao.commit()
    conexao.close()


def salvar_sessao(inicio, fim, duracao_segundos):
    conexao = conectar()
    conexao.execute(
        "INSERT INTO sessoes (inicio, fim, duracao_segundos) VALUES (?, ?, ?)",
        (inicio, fim, duracao_segundos),
    )
    conexao.commit()
    conexao.close()


def listar_sessoes(limite=10):
    conexao = conectar()
    conexao.row_factory = sqlite3.Row
    cursor = conexao.execute(
        "SELECT inicio, fim, duracao_segundos "
        "FROM sessoes ORDER BY id DESC LIMIT ?",
        (limite,),
    )
    linhas = cursor.fetchall()
    conexao.close()

    return [
        {
            'inicio': linha['inicio'],
            'fim': linha['fim'],
            'duracao_segundos': linha['duracao_segundos'],
        }
        for linha in linhas
    ]