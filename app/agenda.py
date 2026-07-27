import sqlite3

from banco import conectar


def criar_tabela():
    conexao = conectar()
    conexao.execute("""
        CREATE TABLE IF NOT EXISTS blocos_rotina (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            dia_semana INTEGER NOT NULL,
            hora_inicio TEXT NOT NULL,
            hora_fim TEXT NOT NULL,
            atividade TEXT NOT NULL,
            modo TEXT NOT NULL,
            pausa_intervalo_min INTEGER
        )
    """)
    conexao.commit()
    conexao.close()


def salvar_bloco(dia_semana, hora_inicio, hora_fim, atividade, modo, pausa_intervalo_min=None):
    conexao = conectar()
    conexao.execute(
        "INSERT INTO blocos_rotina "
        "(dia_semana, hora_inicio, hora_fim, atividade, modo, pausa_intervalo_min) "
        "VALUES (?, ?, ?, ?, ?, ?)",
        (dia_semana, hora_inicio, hora_fim, atividade, modo, pausa_intervalo_min),
    )
    conexao.commit()
    conexao.close()


def listar_blocos(dia_semana=None):
    conexao = conectar()
    conexao.row_factory = sqlite3.Row

    if dia_semana is None:
        cursor = conexao.execute(
            "SELECT id, dia_semana, hora_inicio, hora_fim, atividade, modo, pausa_intervalo_min "
            "FROM blocos_rotina ORDER BY dia_semana, hora_inicio"
        )
    else:
        cursor = conexao.execute(
            "SELECT id, dia_semana, hora_inicio, hora_fim, atividade, modo, pausa_intervalo_min "
            "FROM blocos_rotina WHERE dia_semana = ? ORDER BY hora_inicio",
            (dia_semana,),
        )

    linhas = cursor.fetchall()
    conexao.close()
    return [dict(linha) for linha in linhas]


def remover_bloco(id_bloco):
    conexao = conectar()
    conexao.execute("DELETE FROM blocos_rotina WHERE id = ?", (id_bloco,))
    conexao.commit()
    conexao.close()
