# Chrono

> Um app de desktop para Windows que ajuda você a **dividir bem o seu dia** —
> estudo, trabalho, descanso, exercício e lazer — com lembretes que
> *incomodam de propósito* e liberam seu tempo livre (jogos, vídeos, etc.) só
> depois que você cumpre suas metas.

O nome é uma homenagem ao **Chrono Trigger** e à ideia de **tempo** bem usado.

> **Status:** funcional — projeto pessoal e de aprendizado.

---

## Instalação (Windows)

1. Acesse a página de **[Releases](https://github.com/MatheusDevlog/chrono/releases)**.
2. Baixe o `chrono-setup.exe` da versão mais recente.
3. Execute o instalador (não precisa de admin) e siga o assistente.
4. Pronto: o Chrono fica na bandeja, perto do relógio.

---

## A ideia

Sou do tipo que passa o dia todo no computador. O Chrono nasce pra ajudar a
manter o foco e o equilíbrio:

- Sobe junto com o Windows e fica num ícone perto do relógio (bandeja).
- Dispara **pop-ups "chatos"** nos momentos certos ("Você já estudou hoje?").
- Percebe quando você abre um **app vigiado** (jogo, YouTube, Steam) e, se as
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
| Laranja Crono | `#F39A1F` | Ação / destaque |
| Carmesim | `#C42E4C` | Bloqueado / erro |
| Ciano | `#57C4E6` | Foco / info |

**Fontes:** Press Start 2P (títulos e logo) · Rubik (interface).

---

## Funcionalidades

- [x] Painel inicial com botão **Ativar/Desativar** e tutorial interativo
- [x] **Agenda semanal** (Seg–Dom) com blocos de Foco / Pausa / Livre
- [x] **Apps vigiados** com seletor de processos visíveis do Windows
- [x] **Estatísticas gamificadas** num painel único: HP do dia (herói + selo "vs ontem"), ranking **Você vs Você** dos últimos 6 dias, métricas do período e gráfico com abas **Hoje / Semana / Mês**
- [x] Sistema de **HP / Shield / Streak** com multiplicador progressivo
- [x] Pop-up de cobrança "por cima de tudo" (Concluir / Ignorar / Soneca)
- [x] Histórico de sessões de foco salvo em SQLite
- [x] Ícone na bandeja do sistema + auto-início com Windows
- [x] Instalador `.exe` de dois cliques (PyInstaller + Inno Setup)

---

## Como rodar (ambiente de desenvolvimento)

```powershell
cd app
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python chrono.py
```

---

## Como lançar uma versão (para desenvolvedores)

### Fluxo automatizado (um comando)
Com o **Inno Setup** instalado e o **GitHub CLI** (`gh`) autenticado:

```powershell
cd app
.\.venv\Scripts\python.exe release.py 1.1.0
```

O `release.py` faz tudo de ponta a ponta:
1. Grava a versão em `version.py` e `chrono.iss`.
2. Gera o executável com o **PyInstaller** (`Chrono.spec`).
3. Compila o instalador com o **Inno Setup** (`ISCC.exe`, sem abrir a GUI).
4. Cria a release `vX.Y.Z` no GitHub e sobe o `chrono-setup.exe`.

> Use `python release.py 1.1.0 --no-release` para apenas gerar o
> `app/Output/chrono-setup.exe` localmente, sem publicar.

### Passos manuais (fallback)
1. `cd app && pyinstaller Chrono.spec` → cria `dist/Chrono/Chrono.exe`.
2. Abra o **Inno Setup Compiler**, `File → Open` → `app/chrono.iss` → **Compile** (`Ctrl+F9`).
3. O instalador sai em `app/Output/chrono-setup.exe`.

> O `chrono.iss` já instala na pasta do usuário (sem admin), cria atalhos e usa o ícone `LogoC.ico`.

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
│   └── web/
│       ├── index.html     # Dashboard principal
│       ├── cobranca.html  # Pop-up de cobrança
│       ├── app.js         # Lógica front-end
│       ├── style.css      # Estilos (tema dark teal)
│       ├── LogoC.ico      # Ícone oficial (tray + favicon)
│       └── fonts/         # PressStart2P, Rubik
└── README.md
```

---

## Licença

Projeto pessoal de código aberto.