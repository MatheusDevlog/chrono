import sqlite3
import datetime

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

def editar_bloco(id_bloco, dia_semana, hora_inicio, hora_fim, atividade, modo, pausa_intervalo_min=None):
    conexao = conectar()
    conexao.execute(
        "UPDATE blocos_rotina "
        "SET dia_semana=?, hora_inicio=?, hora_fim=?, atividade=?, modo=?, pausa_intervalo_min=? "
        "WHERE id=?",
        (dia_semana, hora_inicio, hora_fim, atividade, modo, pausa_intervalo_min, id_bloco),
    )
    conexao.commit()
    conexao.close()


def copiar_dia(origem, destino):
    blocos = listar_blocos(origem)
    conexao = conectar()
    conexao.execute("DELETE FROM blocos_rotina WHERE dia_semana = ?", (destino,))
    for bloco in blocos:
        conexao.execute(
            "INSERT INTO blocos_rotina "
            "(dia_semana, hora_inicio, hora_fim, atividade, modo, pausa_intervalo_min) "
            "VALUES (?, ?, ?, ?, ?, ?)",
            (destino, bloco["hora_inicio"], bloco["hora_fim"], bloco["atividade"],
             bloco["modo"], bloco["pausa_intervalo_min"]),
        )
    conexao.commit()
    conexao.close()


def limpar_dia(dia_semana):
    conexao = conectar()
    conexao.execute("DELETE FROM blocos_rotina WHERE dia_semana = ?", (dia_semana,))
    conexao.commit()
    conexao.close()


def marcar_dia_livre(dia_semana):
    conexao = conectar()
    conexao.execute("DELETE FROM blocos_rotina WHERE dia_semana = ?", (dia_semana,))
    conexao.execute(
        "INSERT INTO blocos_rotina "
        "(dia_semana, hora_inicio, hora_fim, atividade, modo, pausa_intervalo_min) "
        "VALUES (?, ?, ?, ?, ?, ?)",
        (dia_semana, "00:00", "23:59", "Dia livre", "livre", None),
    )
    conexao.commit()
    conexao.close()


def obter_bloco_atual(dia_semana=None, hora_str=None):
    if dia_semana is None or hora_str is None:
        agora = datetime.datetime.now()
        dia_semana = agora.weekday()
        hora_str = agora.strftime("%H:%M")

    blocos = listar_blocos(dia_semana)
    for bloco in blocos:
        inicio = bloco["hora_inicio"]
        fim = bloco["hora_fim"]
        if inicio <= fim:
            if inicio <= hora_str < fim:
                return bloco
        else:
            if hora_str >= inicio or hora_str < fim:
                return bloco
    return None
