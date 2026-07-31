import os
import sys
import time
import threading
import datetime
import psutil
import webview

import agenda
import apps
import banco
import bandeja
import pontuacao

INTERVALO = 5


def caminho_recurso(relativo):
    base = getattr(sys, '_MEIPASS', os.path.dirname(os.path.abspath(__file__)))
    return os.path.join(base, relativo)


ARQUIVO_UI = caminho_recurso(os.path.join('web', 'index.html'))
ARQUIVO_COBRANCA = caminho_recurso(os.path.join('web', 'cobranca.html'))

tarefas_concluidas = False
janela_cobranca = None
foco_inicio = None

janela_principal = None
saindo = False

ignorado_ate = None
sonecas_por_bloco = {}
bloco_atual_vigia_id = None
app_ativado = False

class API:
    def iniciar_foco(self):
        global foco_inicio, tarefas_concluidas
        foco_inicio = datetime.datetime.now()
        tarefas_concluidas = False
        print(f'[Chrono] Foco iniciado às {foco_inicio.strftime("%H:%M:%S")}.')

    def concluir_tarefas(self):
        global tarefas_concluidas, foco_inicio, ignorado_ate
        tarefas_concluidas = True
        ignorado_ate = float('inf')

        if foco_inicio is not None:
            fim = datetime.datetime.now()
            duracao = int((fim - foco_inicio).total_seconds())
            banco.salvar_sessao(foco_inicio.isoformat(), fim.isoformat(), duracao)

            horas = duracao / 3600
            base = int(horas * 10)
            streak_atual, _ = pontuacao.calcular_streak()
            mult = pontuacao.multiplicador_streak(streak_atual)
            pontos = int(base * mult)
            agora = datetime.datetime.now()
            data = agora.date().isoformat()
            hora_str = agora.strftime("%H:%M")
            if pontos > 0:
                pontuacao.registrar(data, 'completou_foco', pontos, bloco_atual_vigia_id, hora_str)

            if bloco_atual_vigia_id is not None:
                sonecas = sonecas_por_bloco.get(bloco_atual_vigia_id, 0)
                if sonecas > 1:
                    extras = sonecas - 1
                    penalidade = extras * -5
                    pontuacao.registrar(data, 'soneca_extra', penalidade, bloco_atual_vigia_id, hora_str)

            print(f'[Chrono] Sessão de foco salva: {duracao}s (+{pontos} shield).')
            foco_inicio = None

        print('[Chrono] Tarefas concluídas! Parei de cobrar.')
        fechar_cobranca()

    def ignorar(self):
        global ignorado_ate
        ignorado_ate = float('inf')
        agora = datetime.datetime.now()
        data = agora.date().isoformat()
        hora_str = agora.strftime("%H:%M")
        pontuacao.registrar(data, 'ignorou', -25, bloco_atual_vigia_id, hora_str)
        print('[Chrono] Bloco ignorado. -25 HP.')
        fechar_cobranca()

    def soneca(self):
        global ignorado_ate, bloco_atual_vigia_id
        if bloco_atual_vigia_id is not None:
            sonecas_por_bloco[bloco_atual_vigia_id] = sonecas_por_bloco.get(bloco_atual_vigia_id, 0) + 1
            if sonecas_por_bloco[bloco_atual_vigia_id] > 1:
                agora = datetime.datetime.now()
                data = agora.date().isoformat()
                hora_str = agora.strftime("%H:%M")
                pontuacao.registrar(data, 'soneca_extra', -5, bloco_atual_vigia_id, hora_str)
                print(f'[Chrono] Soneca extra! -5 HP.')
        ignorado_ate = time.time() + 120
        print(f'[Chrono] Soneca de 2 min. Já usou {sonecas_por_bloco.get(bloco_atual_vigia_id, 0)} soneca(s) neste bloco.')
        fechar_cobranca()

    def soneca_count(self):
        if bloco_atual_vigia_id is None:
            return 0
        return sonecas_por_bloco.get(bloco_atual_vigia_id, 0)

    def alternar_chrono(self):
        global app_ativado
        app_ativado = not app_ativado
        estado = 'ativado' if app_ativado else 'desativado'
        print(f'[Chrono] App {estado}.')
        return app_ativado

    def esta_ativado(self):
        return app_ativado

    def obter_ranking(self):
        return pontuacao.montar_ranking()

    def obter_estatisticas(self, tipo):
        hoje = datetime.date.today()
        if tipo == 'semana':
            inicio = hoje - datetime.timedelta(days=hoje.weekday())
            fim = inicio + datetime.timedelta(days=6)
            dados = pontuacao.pontos_por_dia_semana(inicio.isoformat(), fim.isoformat())
            rotulos = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
            return {'rotulos': rotulos, 'dados': dados}
        if tipo == 'horarios':
            inicio = hoje.replace(day=1)
            fim = (inicio + datetime.timedelta(days=32)).replace(day=1) - datetime.timedelta(days=1)
            faixas = pontuacao.pontos_por_faixa_horario(inicio.isoformat(), fim.isoformat())
            return {
                'rotulos': ['Manhã', 'Tarde', 'Noite', 'Madrugada'],
                'dados': [faixas['manha'], faixas['tarde'], faixas['noite'], faixas['madrugada']],
            }
        if tipo == 'mes':
            inicio = hoje.replace(day=1)
            fim = (inicio + datetime.timedelta(days=32)).replace(day=1) - datetime.timedelta(days=1)
            dados = pontuacao.pontos_por_semana_mes(inicio.isoformat(), fim.isoformat())
            return {'rotulos': ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'], 'dados': dados}
        return {'rotulos': [], 'dados': []}

    def listar_sessoes(self):
        return banco.listar_sessoes(10)

    def listar_blocos(self, dia_semana):
        return agenda.listar_blocos(dia_semana)

    def obter_bloco_atual(self):
        return agenda.obter_bloco_atual()

    def salvar_bloco(self, dia_semana, hora_inicio, hora_fim, atividade, modo, pausa_intervalo_min):
        agenda.salvar_bloco(dia_semana, hora_inicio, hora_fim, atividade, modo, pausa_intervalo_min)

    def remover_bloco(self, id_bloco):
        agenda.remover_bloco(id_bloco)

    def editar_bloco(self, id_bloco, dia_semana, hora_inicio, hora_fim, atividade, modo, pausa_intervalo_min):
        agenda.editar_bloco(id_bloco, dia_semana, hora_inicio, hora_fim, atividade, modo, pausa_intervalo_min)

    def copiar_dia(self, origem, destino):
        agenda.copiar_dia(origem, destino)

    def marcar_dia_livre(self, dia_semana):
        agenda.marcar_dia_livre(dia_semana)

    def limpar_dia(self, dia_semana):
        agenda.limpar_dia(dia_semana)

    def listar_apps(self):
        return apps.listar_apps()

    def salvar_app(self, nome, processo):
        apps.salvar_app(nome, processo)

    def remover_app(self, id_app):
        apps.remover_app(id_app)

    def editar_app(self, id_app, nome, processo):
        apps.editar_app(id_app, nome, processo)

    def listar_processos_abertos(self):
        import win32gui
        import win32process
        
        processos_com_janela = set()
        
        def callback_janela(hwnd, _):
            if win32gui.IsWindowVisible(hwnd) and win32gui.GetWindowText(hwnd):
                _, pid = win32process.GetWindowThreadProcessId(hwnd)
                try:
                    p = psutil.Process(pid)
                    nome = p.name()
                    ignorados = {
                        'explorer.exe', 'applicationframehost.exe', 
                        'systemsettings.exe', 'textinputhost.exe',
                        'searchapp.exe', 'searchindexer.exe'
                    }
                    if nome and nome.lower() not in ignorados:
                        processos_com_janela.add(nome)
                except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
                    pass
        
        win32gui.EnumWindows(callback_janela, None)
        
        return sorted(list(processos_com_janela), key=lambda s: s.lower())

api = API()

def app_aberto(nome_processo):
    for processo in psutil.process_iter(['name']):
        nome = processo.info['name']
        if nome and nome.lower() == nome_processo.lower():
            return True
    return False


def cobranca_aberta():
    return janela_cobranca is not None and janela_cobranca in webview.windows


def mostrar_cobranca():
    global janela_cobranca
    janela_cobranca = webview.create_window(
        'Chrono - Cobrança',
        url=ARQUIVO_COBRANCA,
        js_api=api,
        on_top=True,
        width=460,
        height=260,
    )


def fechar_cobranca():
    global janela_cobranca
    if cobranca_aberta():
        janela_cobranca.destroy()
    janela_cobranca = None


def vigiar():
    global bloco_atual_vigia_id
    print(f'[Chrono] Vigia ligado. Verificando agenda e apps a cada {INTERVALO}s.')
    while True:
        time.sleep(INTERVALO)

        if not app_ativado:
            if cobranca_aberta():
                fechar_cobranca()
            continue

        bloco = agenda.obter_bloco_atual()

        if bloco and bloco['id'] != bloco_atual_vigia_id:
            bloco_atual_vigia_id = bloco['id']
            if bloco_atual_vigia_id not in sonecas_por_bloco:
                sonecas_por_bloco[bloco_atual_vigia_id] = 0

        if bloco is None or bloco['modo'] != 'foco':
            bloco_atual_vigia_id = None
            if cobranca_aberta():
                fechar_cobranca()
            continue

        if ignorado_ate and time.time() < ignorado_ate:
            continue

        apps_bloqueados = apps.listar_apps()
        if not apps_bloqueados:
            continue

        for app_vigiado in apps_bloqueados:
            if app_aberto(app_vigiado['processo']):
                if not cobranca_aberta():
                    print(f'[Chrono] App proibido "{app_vigiado["nome"]}" aberto durante foco -> cobrando!')
                    mostrar_cobranca()
                break


def ao_fechar_janela():
    if saindo:
        return True
    janela_principal.hide()
    print('[Chrono] Minimizando para a bandeja. Continuo vigiando.')
    return False


def abrir_janela(icon, item):
    janela_principal.show()


def sair(icon, item):
    global saindo
    saindo = True
    icon.stop()
    janela_principal.destroy()


def iniciar_bandeja():
    bandeja.iniciar(abrir_janela, sair)


def tamanho_janela(proporcao_largura=0.52, proporcao_altura=0.65):
    tela = webview.screens[0]
    largura = int(tela.width * proporcao_largura)
    altura = int(tela.height * proporcao_altura)
    return largura, altura


def main():
    global janela_principal
    banco.criar_tabela()
    agenda.criar_tabela()
    apps.criar_tabela()
    pontuacao.criar_tabela()

    largura, altura = tamanho_janela()

    janela_principal = webview.create_window(
        'Chrono',
        url=ARQUIVO_UI,
        js_api=api,
        width=largura,
        height=altura,
        resizable=True,
        min_size=(900, 600),
    )
    janela_principal.events.closing += ao_fechar_janela

    threading.Thread(target=vigiar, daemon=True).start()
    threading.Thread(target=iniciar_bandeja, daemon=True).start()

    webview.start()


if __name__ == "__main__":
    main()
