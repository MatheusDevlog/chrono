import os
import sys
import winreg

NOME_APP = 'Chrono'

CHAVE_RUN = r'Software\Microsoft\Windows\CurrentVersion\Run'

def _comando():
    if getattr(sys, 'frozen', False):
        return f'"{sys.executable}"'

    pasta_python = os.path.dirname(sys.executable)
    pythonw = os.path.join(pasta_python, 'pythonw.exe')
    script = os.path.abspath(os.path.join(os.path.dirname(__file__), 'chrono.py'))
    return f'"{pythonw}" "{script}"'


def ativar():
    with winreg.OpenKey(winreg.HKEY_CURRENT_USER, CHAVE_RUN, 0, winreg.KEY_SET_VALUE) as chave:
        winreg.SetValueEx(chave, NOME_APP, 0, winreg.REG_SZ, _comando())


def desativar():
    try:
        with winreg.OpenKey(winreg.HKEY_CURRENT_USER, CHAVE_RUN, 0, winreg.KEY_SET_VALUE) as chave:
            winreg.DeleteValue(chave, NOME_APP)
    except FileNotFoundError:
        pass


def esta_ativo():
    try:
        with winreg.OpenKey(winreg.HKEY_CURRENT_USER, CHAVE_RUN, 0, winreg.KEY_READ) as chave:
            valor, _tipo = winreg.QueryValueEx(chave, NOME_APP)
            return bool(valor)
    except FileNotFoundError:
        return False


