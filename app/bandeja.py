import os
import pystray
from PIL import Image

import inicializacao


def _icone():
    caminho = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'web', 'LogoC.ico')
    return Image.open(caminho)


def iniciar(ao_abrir, ao_sair):

    def alterar_inicio(icon, item):
        if inicializacao.esta_ativo():
            inicializacao.desativar()
        else:
            inicializacao.ativar()

    menu = pystray.Menu(
        pystray.MenuItem('Abrir Chrono', ao_abrir, default=True),
        pystray.MenuItem(
            'Iniciar com o Windows',
            alterar_inicio,
            checked=lambda item: inicializacao.esta_ativo(),
        ),
        pystray.MenuItem('Sair', ao_sair),
    )

    icone = pystray.Icon('chrono', _icone(), 'Chrono', menu)
    icone.run()