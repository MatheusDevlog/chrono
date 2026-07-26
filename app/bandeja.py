import pystray
from PIL import Image, ImageDraw

import inicializacao

def _criar_icone():
    tamanho = 64
    imagem = Image.new('RGB', (tamanho, tamanho), '#12302D')
    desenho = ImageDraw.Draw(imagem)
    desenho.ellipse((16, 16, 48, 48), fill='#F39A1F')
    return imagem


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

    icone = pystray.Icon('chrono', _criar_icone(), 'Chrono', menu)
    icone.run()