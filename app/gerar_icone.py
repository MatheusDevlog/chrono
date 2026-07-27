from PIL import Image, ImageDraw

tamanho = 256
imagem = Image.new('RGB', (tamanho, tamanho), '#12302D')
desenho = ImageDraw.Draw(imagem)
desenho.ellipse((64, 64, 192, 192), fill='#F39A1F')

imagem.save('chrono.ico', sizes=[(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)])
print('chrono.ico gerado.')