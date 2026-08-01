import os
import re
import sys
import shutil
import subprocess

PASTA = os.path.dirname(os.path.abspath(__file__))
ARQ_VERSION = os.path.join(PASTA, 'version.py')
ARQ_ISS = os.path.join(PASTA, 'chrono.iss')
INSTALADOR = os.path.join(PASTA, 'Output', 'chrono-setup.exe')

CAMINHOS_ISCC = [
    r'C:\Program Files\Inno Setup 7\ISCC.exe',
    r'C:\Program Files (x86)\Inno Setup 7\ISCC.exe',
    r'C:\Program Files\Inno Setup 6\ISCC.exe',
    r'C:\Program Files (x86)\Inno Setup 6\ISCC.exe',
]


def abortar(mensagem):
    print(f'\n[ERRO] {mensagem}')
    sys.exit(1)


def achar_iscc():
    for caminho in CAMINHOS_ISCC:
        if os.path.exists(caminho):
            return caminho
    do_path = shutil.which('ISCC')
    if do_path:
        return do_path
    abortar('ISCC.exe (compilador do Inno Setup) nao encontrado. Instale o Inno Setup.')


def gravar_versao(versao):
    with open(ARQ_VERSION, 'w', encoding='utf-8') as arquivo:
        arquivo.write(f'__version__ = "{versao}"\n')

    with open(ARQ_ISS, 'r', encoding='utf-8') as arquivo:
        conteudo = arquivo.read()
    conteudo = re.sub(
        r'#define MyAppVersion ".*"',
        f'#define MyAppVersion "{versao}"',
        conteudo,
        count=1,
    )
    with open(ARQ_ISS, 'w', encoding='utf-8') as arquivo:
        arquivo.write(conteudo)
    print(f'[1/4] Versao {versao} gravada em version.py e chrono.iss.')


def rodar(comando, descricao):
    print(f'\n>>> {descricao}')
    resultado = subprocess.run(comando, cwd=PASTA)
    if resultado.returncode != 0:
        abortar(f'Falhou: {descricao}')


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    publicar = '--no-release' not in sys.argv[1:]

    if len(args) != 1 or not re.fullmatch(r'\d+\.\d+\.\d+', args[0]):
        abortar('Uso: python release.py <versao X.Y.Z> [--no-release]')

    versao = args[0]
    print(f'=== Release do Chrono {versao} ===')

    gravar_versao(versao)

    rodar(
        [sys.executable, '-m', 'PyInstaller', 'Chrono.spec', '--noconfirm'],
        '[2/4] Gerando o executavel (PyInstaller)',
    )

    iscc = achar_iscc()
    rodar([iscc, 'chrono.iss'], '[3/4] Compilando o instalador (Inno Setup)')

    if not os.path.exists(INSTALADOR):
        abortar(f'Instalador nao encontrado em {INSTALADOR}')

    if not publicar:
        print(f'\n[OK] Instalador gerado: {INSTALADOR}')
        print('     (--no-release: pulei a publicacao no GitHub)')
        return

    rodar(
        [
            'gh', 'release', 'create', f'v{versao}', INSTALADOR,
            '--title', f'Chrono {versao}',
            '--generate-notes',
        ],
        '[4/4] Publicando a release no GitHub (gh)',
    )

    print(f'\n[OK] Chrono {versao} publicado!')
    print(f'     Instalador: {INSTALADOR}')
    print(f'     Release: https://github.com/MatheusDevlog/chrono/releases/tag/v{versao}')


if __name__ == '__main__':
    main()
