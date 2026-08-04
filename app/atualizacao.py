import json
import logging
import webbrowser
import urllib.request

import version

API_RELEASE = 'https://api.github.com/repos/MatheusDevlog/chrono/releases/latest'


def versao_atual():
    return version.__version__


def _partes(texto):
    """Quebra 'v1.3.0' ou '1.3.0' em (1, 3, 0). Partes faltando viram 0."""
    numeros = texto.lstrip('vV').split('.')
    partes = []
    for i in range(3):
        try:
            partes.append(int(numeros[i]))
        except (IndexError, ValueError):
            partes.append(0)
    return tuple(partes)


def _maior(remota, local):
    return _partes(remota) > _partes(local)


def verificar(timeout=6):
    """Consulta a última release no GitHub. Falha silenciosa se offline/erro."""
    try:
        requisicao = urllib.request.Request(
            API_RELEASE,
            headers={
                'Accept': 'application/vnd.github+json',
                'User-Agent': 'Chrono',
            },
        )
        with urllib.request.urlopen(requisicao, timeout=timeout) as resposta:
            dados = json.loads(resposta.read().decode('utf-8'))

        tag = dados.get('tag_name', '')
        url = dados.get('html_url', '')
        versao_remota = tag.lstrip('vV')

        if tag and _maior(tag, versao_atual()):
            return {'tem': True, 'versao': versao_remota, 'url': url}
        return {'tem': False}
    except Exception:
        logging.info('Falha ao verificar atualizacao (offline ou indisponivel).')
        return {'tem': False}


def abrir_download(url):
    if url:
        webbrowser.open(url)
