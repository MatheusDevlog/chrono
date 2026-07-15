import os
import time
import psutil
import webview

APP_ALVO = 'notepad.exe'
INTERVALO = 5

# Caminho absoluto até app/web/index.html (funciona rodando de qualquer pasta).
PASTA_APP = os.path.dirname(os.path.abspath(__file__))
ARQUIVO_UI = os.path.join(PASTA_APP, 'web', 'index.html')

tarefas_concluidas = False
janela_cobranca = None

class API:
    def concluir_tarefas(self):
        global tarefas_concluidas
        tarefas_concluidas = True
        print('[Chrono] Tarefas concluídas! Parei de cobrar.')
        fechar_cobranca()

    def ignorar(self):
        print('[Chrono] Ignorado. Cobro de novo se o app continuar aberto.')
        fechar_cobranca()


api = API()


HTML_COBRANCA = """
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: Segoe UI, sans-serif;
      background: #12302D;
      color: #F2EEE6;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      height: 100vh; margin: 0; text-align: center;
    }
    h1 { font-size: 20px; margin: 0 0 8px; color: #F39A1F; }
    p  { color: #A6BAB5; margin: 0 24px 24px; font-size: 14px; }
    .botoes { display: flex; gap: 16px; }
    button {
      font-size: 15px; padding: 10px 24px;
      border: none; border-radius: 8px; cursor: pointer;
    }
    .concluir { background: #F39A1F; color: #12302D; }
    .ignorar  { background: #C42E4C; color: #F2EEE6; }
  </style>
</head>
<body>
  <h1>Ei! Suas tarefas ainda não terminaram!</h1>
  <p>Feche o app de recompensa ou conclua o que combinou primeiro.</p>
  <div class="botoes">
    <button class="concluir" onclick="concluir()">Já concluí!</button>
    <button class="ignorar" onclick="ignorar()">Agora não</button>
  </div>

  <script>
    function concluir() { window.pywebview.api.concluir_tarefas(); }
    function ignorar()  { window.pywebview.api.ignorar(); }
  </script>
</body>
</html>
"""

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
        html=HTML_COBRANCA,
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
    webview.start(vigiar)


if __name__ == "__main__":
    main()
