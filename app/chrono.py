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

APP_ALVO = 'notepad.exe'
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

class API:
    def iniciar_foco(self):
        global foco_inicio, tarefas_concluidas
        foco_inicio = datetime.datetime.now()
        tarefas_concluidas = False
        print(f'[Chrono] Foco iniciado às {foco_inicio.strftime("%H:%M:%S")}.')

    def concluir_tarefas(self):
        global tarefas_concluidas, foco_inicio
        tarefas_concluidas = True

        if foco_inicio is not None:
            fim = datetime.datetime.now()
            duracao = int((fim - foco_inicio).total_seconds())
            banco.salvar_sessao(foco_inicio.isoformat(), fim.isoformat(), duracao)
            print(f'[Chrono] Sessão de foco salva: {duracao}s.')
            foco_inicio = None

        print('[Chrono] Tarefas concluídas! Parei de cobrar.')
        fechar_cobranca()

    def ignorar(self):
        print('[Chrono] Ignorado. Cobro de novo se o app continuar aberto.')
        fechar_cobranca()

    def listar_sessoes(self):
        return banco.listar_sessoes(10)

    def listar_blocos(self, dia_semana):
        return agenda.listar_blocos(dia_semana)

    def salvar_bloco(self, dia_semana, hora_inicio, hora_fim, atividade, modo, pausa_intervalo_min):
        agenda.salvar_bloco(dia_semana, hora_inicio, hora_fim, atividade, modo, pausa_intervalo_min)

    def remover_bloco(self, id_bloco):
        agenda.remover_bloco(id_bloco)

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
    print(f'[Chrono] Vigia ligado. De olho em "{APP_ALVO}" a cada {INTERVALO}s.')
    while True:
        time.sleep(INTERVALO)

        if tarefas_concluidas:
            continue
        
        if app_aberto(APP_ALVO) and not cobranca_aberta():
            print(f'[Chrono] "{APP_ALVO}" aberto e tarefas pendentes -> cobrando!')
            mostrar_cobranca()


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


def tamanho_janela(proporcao=0.65):
    tela = webview.screens[0]
    largura = int(tela.width * proporcao)
    altura = int(tela.height * proporcao)
    return largura, altura


def main():
    global janela_principal
    banco.criar_tabela()
    agenda.criar_tabela()
    apps.criar_tabela()

    largura, altura = tamanho_janela(0.65)

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
