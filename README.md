# Chrono

> Um app de desktop para Windows que ajuda você a **dividir bem o seu dia** —
> estudo, trabalho, descanso, exercício e lazer — com lembretes que
> *incomodam de propósito* e liberam suas recompensas (jogos, vídeos, etc.) só
> depois que você cumpre suas metas.

O nome é uma homenagem ao **Chrono Trigger** e à ideia de **tempo** bem usado.

> **Status:** funcional — projeto pessoal e de aprendizado.

---

## A ideia

Sou do tipo que passa o dia todo no computador. O Chrono nasce pra ajudar a
manter o foco e o equilíbrio:

- Sobe junto com o Windows e fica num ícone perto do relógio (bandeja).
- Dispara **pop-ups "chatos"** nos momentos certos ("Você já estudou hoje?").
- Percebe quando você abre um app "recompensa" (jogo, YouTube, Steam) e, se as
  tarefas do dia não foram cumpridas, fica **te cutucando** até você fazer o
  combinado.
- **Não bloqueia nada no nível do sistema** — só incomoda. É psicológico, e é o
  suficiente.
- Guarda o **histórico das suas sessões de foco** para você acompanhar o dia.
- Tudo **configurável** num painel: quais atividades, quanto tempo cada uma, e o
  que cada etapa libera.

---

## Tecnologias

| Camada | Tecnologia |
|--------|-----------|
| Lógica / regras / vigia do sistema | **Python** (`psutil`, `pywin32`) |
| Interface (dashboard e pop-ups) | **HTML + CSS + JavaScript puro** |
| Ponte desktop entre front e back | **pywebview** |
| Bandeja e integração com o Windows | **pystray**, **Pillow**, **winreg** |
| Dados (config e histórico) | **SQLite** |
| Distribuição | **PyInstaller + Inno Setup** |

---

## Identidade visual

Tema **dark teal** inspirado na paleta do **Chrono Trigger**.

| Cor | Hex | Uso |
|-----|-----|-----|
| Teal profundo | `#12302D` | Fundo |
| Laranja Crono | `#F39A1F` | Ação / recompensa |
| Carmesim | `#C42E4C` | Bloqueado |
| Ciano | `#57C4E6` | Foco / info |

**Fontes:** Press Start 2P (logo) · Pixelify Sans (títulos) · Rubik (interface) ·
VT323 (cronômetro).

---

## Funcionalidades

- [x] Painel inicial com botão **Ativar/Desativar** e tutorial interativo
- [x] **Agenda semanal** (Seg–Dom) com blocos de Foco / Pausa / Livre
- [x] **Apps vigiados** com seletor de processos visíveis do Windows
- [x] **Estatísticas** em 3 abas: Semana, Horários (Manhã/Tarde/Noite/Madrugada), Mês
- [x] Sistema de **HP / Shield / Streak** com multiplicador progressivo
- [x] Pop-up de cobrança "por cima de tudo" (Concluir / Ignorar / Soneca)
- [x] Histórico de sessões de foco salvo em SQLite
- [x] Ícone na bandeja do sistema + auto-início com Windows
- [x] Instalador `.exe` de dois cliques (PyInstaller + Inno Setup)

---

## Como rodar (ambiente de desenvolvimento)

> Instruções detalhadas estão na pasta [`GUIA/`](./GUIA).

```powershell
cd app
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python chrono.py
```

---

## Como gerar o instalador (para desenvolvedores)

### 1. Gerar o executável com PyInstaller
```powershell
cd app
pyinstaller Chrono.spec
```
Isso cria `dist/Chrono/Chrono.exe` com todos os arquivos da `web/` e `fonts/` embarcados.

### 2. Criar o instalador `.exe` com Inno Setup
1. Instale o **Inno Setup Compiler** (jrsoftware.org/isdl.php)
2. Abra o programa → `File → Open` → selecione `app/chrono.iss`
3. Clique em **Compile** (ou `Ctrl+F9`)
4. O instalador final sai em `app/Output/chrono-setup.exe`

> O script `chrono.iss` já está configurado para:
> - Instalar na pasta do usuário (sem pedir admin)
> - Criar atalhos no Menu Iniciar e Desktop (opcional)
> - Usar o ícone oficial `LogoC.ico`

---

## Distribuição (para usuários finais)

**Não commite binários no repositório.** O Git é para código-fonte.

Opções recomendadas:
1. **GitHub Releases** — anexe o `chrono-setup.exe` gerado em cada tag/release
2. **GitHub Actions** — automatize o build e publique o artefato no Release
3. **Site próprio / itch.io / Microsoft Store** — para distribuição pública

---

## Estrutura do projeto

```
chrono/
├── app/
│   ├── chrono.py          # Entry point + API Python
│   ├── chrono.spec        # Config PyInstaller
│   ├── chrono.iss         # Script Inno Setup
│   ├── bandeja.py         # System tray (pystray)
│   ├── inicializacao.py   # Auto-start Windows
│   ├── banco.py           # SQLite helpers
│   ├── agenda.py          # CRUD blocos da semana
│   ├── apps.py            # CRUD apps vigiados
│   ├── pontuacao.py       # HP, Shield, Streak, Stats
│   ├── web/
│   │   ├── index.html     # Dashboard principal
│   │   ├── cobranca.html  # Pop-up de cobrança
│   │   ├── app.js         # Lógica front-end
│   │   ├── style.css      # Estilos (tema dark teal)
│   │   └── LogoC.ico      # Ícone oficial (tray + favicon)
│   └── fonts/             # PressStart2P, Rubik, Pixelify, VT323
├── GUIA/                  # Docs internas (ignorado pelo git)
└── README.md
```

---

## Licença

Projeto pessoal de código aberto.