import webview

class API:
    def responder(self, resposta):
        print(f'[Chrono] O usuário respondeu: {resposta}')

        for janela in webview.windows:
            janela.destroy()


HTML = """
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: Segoe UI, sans-serif;
      background: #1e1e2e;
      color: #eaeaea;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      margin: 0;
    }
    h1 { font-size: 22px; margin-bottom: 24px; }
    .botoes { display: flex; gap: 16px; }
    button {
      font-size: 16px;
      padding: 10px 28px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
    }
    .sim  { background: #89b4fa; color: #1e1e2e; }
    .nao  { background: #f38ba8; color: #1e1e2e; }
  </style>
</head>
<body>
  <h1>☕ Você já tomou café?</h1>
  <div class="botoes">
    <button class="sim" onclick="responder('sim')">Sim</button>
    <button class="nao" onclick="responder('nao')">Não</button>
  </div>

  <script>
    function responder(escolha) {
      window.pywebview.api.responder(escolha);
    }
  </script>
</body>
</html>
"""

def main():
    api = API()

    webview.create_window(
        'Chrono',
        html=HTML,
        js_api=api,
        on_top=True,
        width=420,
        height=240,
    )

    webview.start()


if __name__ == "__main__":
    main()
