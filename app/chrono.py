import os
import time
import threading
import datetime
import psutil
import webview

import banco

APP_ALVO = 'notepad.exe'
INTERVALO = 5

PASTA_APP = os.path.dirname(os.path.abspath(__file__))
ARQUIVO_UI = os.path.join(PASTA_APP, 'web', 'index.html')
ARQUIVO_COBRANCA = os.path.join(PASTA_APP,'web', 'cobranca.html')

tarefas_concluidas = False
janela_cobranca = None
foco_inicio = None

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


def tamanho_janela(proporcao=0.65):
    tela = webview.screens[0]
    largura = int(tela.width * proporcao)
    altura = int(tela.height * proporcao)
    return largura, altura


def main():
    banco.criar_tabela()

    largura, altura = tamanho_janela(0.65)

    webview.create_window(
        'Chrono',
        url=ARQUIVO_UI,
        js_api=api,
        width=largura,
        height=altura,
        resizable=True,
        min_size=(900, 600),
    )
    threading.Thread(target=vigiar, daemon=True).start()
    webview.start()


if __name__ == "__main__":
    main()
