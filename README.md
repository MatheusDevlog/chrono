# 🕰️ Chrono

> Um app de desktop para Windows que ajuda você a **dividir bem o seu dia** —
> estudo, trabalho, descanso, exercício e lazer — com lembretes que
> *incomodam de propósito* e liberam suas recompensas (jogos, vídeos, etc...) só depois
> que você cumpre suas metas.

O nome é uma homenagem ao **Chrono Trigger** e à ideia de **tempo** bem usado.

> ⚠️ **Status:** em desenvolvimento — projeto pessoal e de aprendizado.

---

## ✨ A ideia

Sou do tipo que passa o dia todo no computador. O Chrono nasce pra ajudar a
manter o foco e o equilíbrio:

- Sobe junto com o Windows e fica num ícone perto do relógio.
- Dispara **pop-ups "chatos"** nos momentos certos ("Você já estudou hoje?").
- Percebe quando você abre um app "recompensa" (jogo, YouTube, Steam) e, se as
  tarefas do dia não foram cumpridas, fica **te cutucando** até você fazer o
  combinado.
- **Não bloqueia nada no nível do sistema** — só incomoda. É psicológico, e é o
  suficiente.
- Tudo **configurável** num painel: quais atividades, quanto tempo cada uma, e o
  que cada etapa libera.

---

## 🧱 Tecnologias

| Camada | Tecnologia |
|--------|-----------|
| Lógica / regras / vigia do sistema | **Python** (`psutil`, `pywin32`) |
| Interface (dashboard e pop-ups) | **React + TypeScript** |
| Ponte desktop entre front e back | **pywebview** |
| Dados (config e histórico) | **SQLite** |
| Distribuição | **PyInstaller + Inno Setup** |

---

## 🎨 Identidade visual

Tema **dark teal** inspirado na paleta do **Chrono Trigger**.

| Cor | Hex | Uso |
|-----|-----|-----|
| 🟦 Teal profundo | `#12302D` | Fundo |
| 🟧 Laranja Crono | `#F39A1F` | Ação / recompensa |
| 🟥 Carmesim | `#C42E4C` | Bloqueado |
| 🟦 Ciano | `#57C4E6` | Foco / info |

**Fontes:** Press Start 2P (logo) · Pixelify Sans (títulos) · Rubik (interface) ·
VT323 (cronômetro).

## 🗺️ Roadmap

- [ ] **Fase 0** — Base do projeto + primeiro pop-up "por cima de tudo"
- [ ] **Fase 1** — Núcleo: timers + máquina de estados + detecção de apps
- [ ] **Fase 2** — Dashboard em React (configurar atividades e tempos)
- [ ] **Fase 3** — Bandeja do sistema, iniciar com o Windows, histórico do dia
- [ ] **Fase 4** — Instalador de dois cliques

---

## 🚀 Como rodar (ambiente de desenvolvimento)

> Instruções detalhadas e mastigadas estão na pasta [`GUIA/`](./GUIA).

```powershell
cd app
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python chrono.py
```

---

## 📄 Licença

Projeto pessoal de código aberto.
