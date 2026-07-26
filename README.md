# Chrono

> Um app de desktop para Windows que ajuda você a **dividir bem o seu dia** —
> estudo, trabalho, descanso, exercício e lazer — com lembretes que
> *incomodam de propósito* e liberam suas recompensas (jogos, vídeos, etc.) só
> depois que você cumpre suas metas.

O nome é uma homenagem ao **Chrono Trigger** e à ideia de **tempo** bem usado.

> **Status:** em desenvolvimento — projeto pessoal e de aprendizado.

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

- [x] Pop-up de cobrança "por cima de tudo" com botões Sim/Não
- [x] Vigia de processos: detecta apps "recompensa" e dispara a cobrança
- [x] Dashboard em HTML/CSS/JS puro, servido pelo pywebview
- [x] Histórico de sessões de foco salvo em banco (SQLite)
- [x] Ícone na bandeja do sistema e iniciar junto com o Windows
- [ ] Instalador de dois cliques

---

## Como rodar (ambiente de desenvolvimento)

> Instruções detalhadas e mastigadas estão na pasta [`GUIA/`](./GUIA).

```powershell
cd app
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python chrono.py
```

---

## Licença

Projeto pessoal de código aberto.
