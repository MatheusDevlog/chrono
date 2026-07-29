import datetime
import sqlite3
from banco import conectar


def criar_tabela():
    conexao = conectar()
    conexao.execute("""
        CREATE TABLE IF NOT EXISTS pontuacao (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            data TEXT NOT NULL,
            hora TEXT,
            motivo TEXT NOT NULL,
            pontos INTEGER NOT NULL,
            bloco_id INTEGER
        )
    """)
    conexao.execute("""
        CREATE TABLE IF NOT EXISTS config (
            chave TEXT PRIMARY KEY,
            valor TEXT NOT NULL
        )
    """)
    colunas = [r[1] for r in conexao.execute("PRAGMA table_info(pontuacao)").fetchall()]
    if 'hora' not in colunas:
        conexao.execute("ALTER TABLE pontuacao ADD COLUMN hora TEXT")
    conexao.commit()
    conexao.close()


def registrar(data, motivo, pontos, bloco_id=None, hora=None):
    conexao = conectar()
    conexao.execute(
        "INSERT INTO pontuacao (data, hora, motivo, pontos, bloco_id) VALUES (?, ?, ?, ?, ?)",
        (data, hora, motivo, pontos, bloco_id),
    )
    conexao.commit()
    conexao.close()


def salvar_config(chave, valor):
    conexao = conectar()
    conexao.execute(
        "INSERT OR REPLACE INTO config (chave, valor) VALUES (?, ?)",
        (chave, valor),
    )
    conexao.commit()
    conexao.close()


def obter_config(chave, padrao=None):
    conexao = conectar()
    conexao.row_factory = sqlite3.Row
    cursor = conexao.execute(
        "SELECT valor FROM config WHERE chave = ?", (chave,)
    )
    linha = cursor.fetchone()
    conexao.close()
    return linha['valor'] if linha else padrao


def hoje():
    return datetime.date.today().isoformat()


def pontos_dia(data_str=None):
    if data_str is None:
        data_str = hoje()
    conexao = conectar()
    conexao.row_factory = sqlite3.Row
    cursor = conexao.execute(
        "SELECT COALESCE(SUM(pontos), 0) as total FROM pontuacao WHERE data = ?",
        (data_str,),
    )
    total = cursor.fetchone()['total']
    conexao.close()
    return total


def pontos_periodo(inicio, fim):
    conexao = conectar()
    conexao.row_factory = sqlite3.Row
    cursor = conexao.execute(
        "SELECT COALESCE(SUM(pontos), 0) as total FROM pontuacao WHERE data >= ? AND data <= ?",
        (inicio, fim),
    )
    total = cursor.fetchone()['total']
    conexao.close()
    return total


def melhor_dia_periodo(inicio, fim):
    conexao = conectar()
    conexao.row_factory = sqlite3.Row
    cursor = conexao.execute(
        "SELECT data, SUM(pontos) as total FROM pontuacao "
        "WHERE data >= ? AND data <= ? AND pontos > 0 "
        "GROUP BY data ORDER BY total DESC LIMIT 1",
        (inicio, fim),
    )
    linha = cursor.fetchone()
    conexao.close()
    if linha:
        return {'data': linha['data'], 'pontos': linha['total']}
    return None


def dias_com_atividade(inicio, fim):
    conexao = conectar()
    cursor = conexao.execute(
        "SELECT DISTINCT data FROM pontuacao WHERE data >= ? AND data <= ? AND motivo = 'completou_foco'",
        (inicio, fim),
    )
    dias = [linha[0] for linha in cursor.fetchall()]
    conexao.close()
    return dias


def total_acumulado():
    conexao = conectar()
    conexao.row_factory = sqlite3.Row
    cursor = conexao.execute(
        "SELECT COALESCE(SUM(pontos), 0) as total FROM pontuacao"
    )
    total = cursor.fetchone()['total']
    conexao.close()
    return total


def calcular_streak():
    hoje_data = datetime.date.today()
    conexao = conectar()
    conexao.row_factory = sqlite3.Row
    cursor = conexao.execute("""
        SELECT data,
               COALESCE(SUM(CASE WHEN pontos > 0 THEN pontos ELSE 0 END), 0) as shield,
               COALESCE(SUM(CASE WHEN pontos < 0 THEN pontos ELSE 0 END), 0) as dano
        FROM pontuacao
        GROUP BY data ORDER BY data ASC
    """)
    linhas = cursor.fetchall()
    conexao.close()

    streak_max = 0
    temp = 0

    for linha in linhas:
        s = min(50, linha['shield'])
        d = abs(linha['dano'])
        dn_shield = min(d, s)
        dn_hp = d - dn_shield
        hp = max(0, 100 - dn_hp)
        if hp > 0:
            temp += 1
            streak_max = max(streak_max, temp)
        else:
            temp = 0

    streak_atual = 0
    dados_hp = []
    for linha in reversed(linhas):
        s = min(50, linha['shield'])
        d = abs(linha['dano'])
        dn_shield = min(d, s)
        dn_hp = d - dn_shield
        hp = max(0, 100 - dn_hp)
        if hp > 0:
            dados_hp.append(datetime.date.fromisoformat(linha['data']))
        else:
            dados_hp = []

    if dados_hp and dados_hp[0] == hoje_data:
        streak_atual = 1
        for i in range(1, len(dados_hp)):
            diff = (dados_hp[i-1] - dados_hp[i]).days
            if diff == 1:
                streak_atual += 1
            else:
                break

    return streak_atual, streak_max


def multiplicador_streak(streak):
    if streak >= 30:
        return 3.0
    if streak >= 14:
        return 2.5
    if streak >= 7:
        return 2.0
    if streak >= 3:
        return 1.5
    return 1.0


def calcular_hp_dia(data_str=None):
    if data_str is None:
        data_str = hoje()
    conexao = conectar()
    conexao.row_factory = sqlite3.Row

    cursor = conexao.execute(
        "SELECT COALESCE(SUM(pontos), 0) FROM pontuacao WHERE data = ? AND pontos > 0",
        (data_str,)
    )
    shield_bruto = cursor.fetchone()[0]

    cursor = conexao.execute(
        "SELECT COALESCE(SUM(pontos), 0) FROM pontuacao WHERE data = ? AND pontos < 0",
        (data_str,)
    )
    dano_bruto = abs(cursor.fetchone()[0])

    cursor = conexao.execute(
        "SELECT COUNT(*) FROM pontuacao WHERE data = ? AND pontos > 0",
        (data_str,)
    )
    tarefas = cursor.fetchone()[0]

    conexao.close()

    shield = min(50, shield_bruto)
    dn_shield = min(dano_bruto, shield)
    dn_hp = dano_bruto - dn_shield

    hp = max(0, 100 - dn_hp)
    shield_rest = shield - dn_shield

    return {
        'hp': hp,
        'shield': shield_rest,
        'max': 100,
        'tarefas': tarefas,
        'dano': dano_bruto,
    }


def melhor_hp_registro():
    conexao = conectar()
    cursor = conexao.execute("SELECT DISTINCT data FROM pontuacao ORDER BY data")
    datas = [linha[0] for linha in cursor.fetchall()]
    conexao.close()

    melhor = {'hp': 100, 'data': None}
    for data_str in datas:
        info = calcular_hp_dia(data_str)
        total = info['hp'] + info['shield']
        if total > melhor['hp']:
            melhor['hp'] = total
            melhor['data'] = data_str
    return melhor


def montar_ranking():
    hp_info = calcular_hp_dia()
    streak_atual, streak_max = calcular_streak()
    mult = multiplicador_streak(streak_atual)
    recorde = melhor_hp_registro()

    return {
        'hp': hp_info['hp'],
        'shield': hp_info['shield'],
        'max': 100,
        'tarefas': hp_info['tarefas'],
        'dano': hp_info['dano'],
        'streak_atual': streak_atual,
        'streak_max': streak_max,
        'multiplicador': mult,
        'recorde_hp': recorde['hp'],
        'mensagem': _escolher_mensagem(streak_atual, hp_info['hp'], hp_info['shield']),
    }


def _escolher_mensagem(streak, hp, shield):
    if streak >= 30:
        return "Trinta dias. O tempo já não passa sobre você — ele passa por você."
    if streak >= 14:
        return "Quatorze dias. O hábito já não é mais uma escolha — é parte de você."
    if streak >= 7:
        return "Uma semana se foi. O relógio agora te reconhece."
    if streak >= 3:
        return "O tempo começa a se curvar à sua disciplina."
    if hp <= 0:
        return 'O futuro se recusou a mudar.'
    if hp + shield > 100:
        return f"Seu poder excede os limites naturais. {hp + shield} de vida — o tempo se curva a você."
    if hp >= 90:
        return "Quase perfeito. O tempo reconhece seu esforço."
    return "O tempo está prestes a te mostrar quem você realmente é."


def pontos_por_dia_semana(inicio, fim):
    conexao = conectar()
    conexao.row_factory = sqlite3.Row
    cursor = conexao.execute(
        "SELECT data, SUM(pontos) as total FROM pontuacao "
        "WHERE data >= ? AND data <= ? "
        "GROUP BY data ORDER BY data",
        (inicio, fim),
    )
    linhas = cursor.fetchall()
    conexao.close()

    dias = {}
    for linha in linhas:
        d = datetime.date.fromisoformat(linha['data'])
        dia_sem = d.weekday()
        dias[dia_sem] = dias.get(dia_sem, 0) + linha['total']
    return [dias.get(i, 0) for i in range(7)]


def pontos_por_faixa_horario(inicio, fim):
    conexao = conectar()
    conexao.row_factory = sqlite3.Row
    cursor = conexao.execute(
        "SELECT hora, pontos FROM pontuacao "
        "WHERE data >= ? AND data <= ? AND hora IS NOT NULL",
        (inicio, fim),
    )
    linhas = cursor.fetchall()
    conexao.close()

    faixas = {'manha': 0, 'tarde': 0, 'noite': 0, 'madrugada': 0}
    for linha in linhas:
        h = int(linha['hora'].split(':')[0])
        pts = linha['pontos']
        if 6 <= h < 12:
            faixas['manha'] += pts
        elif 12 <= h < 18:
            faixas['tarde'] += pts
        elif 18 <= h < 24:
            faixas['noite'] += pts
        else:
            faixas['madrugada'] += pts
    return faixas


def pontos_por_semana_mes(inicio, fim):
    conexao = conectar()
    conexao.row_factory = sqlite3.Row
    cursor = conexao.execute(
        "SELECT data, SUM(pontos) as total FROM pontuacao "
        "WHERE data >= ? AND data <= ? "
        "GROUP BY data ORDER BY data",
        (inicio, fim),
    )
    linhas = cursor.fetchall()
    conexao.close()

    semanas = {}
    for linha in linhas:
        d = datetime.date.fromisoformat(linha['data'])
        dia_semana = d.weekday()
        diff = (d - datetime.date.fromisoformat(inicio)).days
        num_semana = diff // 7
        num_semana = min(num_semana, 3)
        semanas[num_semana] = semanas.get(num_semana, 0) + linha['total']

    return [semanas.get(i, 0) for i in range(4)]
