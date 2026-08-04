const DIAS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
const DIAS_LONGOS = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo']
const MODOS = {
  foco: { rotulo: 'Foco', classe: 'tag-foco' },
  pausa: { rotulo: 'Pausa', classe: 'tag-pausa' },
  livre: { rotulo: 'Livre', classe: 'tag-livre' },
}

const navItens = document.querySelectorAll('.nav-item')
const views = document.querySelectorAll('.view')

navItens.forEach((item) => {
  item.addEventListener('click', () => {
    const alvo = item.dataset.view
    navItens.forEach((n) => n.classList.toggle('ativo', n === item))
    views.forEach((v) => v.classList.toggle('ativa', v.id === `view-${alvo}`))
    if (alvo === 'inicio') carregarPlacar()
    if (alvo === 'agenda') carregarBlocos()
    if (alvo === 'apps') carregarApps()
    if (alvo === 'estatisticas') carregarEstatisticas('hoje')
  })
})

const conteudo = document.querySelector('.conteudo')
let rolarTimer
conteudo.addEventListener('scroll', () => {
  conteudo.classList.add('rolando')
  clearTimeout(rolarTimer)
  rolarTimer = setTimeout(() => conteudo.classList.remove('rolando'), 800)
})

const btnAtivar = document.getElementById('btn-ativar')
const ativarChamada = document.getElementById('ativar-chamada')

function aplicarEstado(ativo) {
  btnAtivar.classList.toggle('ativado', ativo)
  btnAtivar.classList.toggle('desativado', !ativo)
  btnAtivar.querySelector('.ativar-texto').textContent = ativo ? 'CHRONO ATIVO' : 'ATIVAR CHRONO'
  ativarChamada.classList.toggle('escondido', ativo)
}

btnAtivar.addEventListener('click', async () => {
  if (!window.pywebview) return
  const ativo = await window.pywebview.api.alternar_chrono()
  aplicarEstado(ativo)
})

async function sincronizarEstado() {
  if (!window.pywebview) return
  const ativo = await window.pywebview.api.esta_ativado()
  aplicarEstado(ativo)
}

const avisoUpdate = document.getElementById('aviso-update')
const btnUpdate = document.getElementById('btn-update')

async function checarAtualizacao() {
  if (!window.pywebview) return
  const u = await window.pywebview.api.verificar_atualizacao()
  if (!u || !u.tem) return
  document.getElementById('update-versao').textContent = u.versao
  avisoUpdate.classList.remove('escondido')
  btnUpdate.onclick = () => window.pywebview.api.abrir_pagina_atualizacao(u.url)
}

function formatarDuracao(segundos) {
  const min = Math.floor(segundos / 60)
  const seg = segundos % 60
  if (min === 0) return `${seg}s`
  return `${min}min ${seg}s`
}

function formatarQuando(iso) {
  const data = new Date(iso)
  return data.toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}

async function carregarPlacar() {
  if (!window.pywebview) return
  const r = await window.pywebview.api.obter_ranking()

  const hpW = Math.min(100, r.hp)
  const shW = Math.min(50, r.shield)

  document.getElementById('hp-fill').style.width = hpW + '%'
  document.getElementById('hp-fill').style.background =
    r.hp > 75 ? '#10B981' : r.hp > 40 ? '#EAB308' : '#C42E4C'
  document.getElementById('hp-shield').style.width = shW + '%'

  document.getElementById('hp-info').textContent = r.shield > 0
    ? r.hp + ' / 100  +' + r.shield + ' shield'
    : r.hp + ' / 100'

  document.getElementById('placar-tarefas').textContent = r.tarefas
  document.getElementById('placar-dano').textContent = r.dano
  document.getElementById('placar-streak').textContent = r.streak_atual
  document.getElementById('placar-mult').textContent = r.multiplicador.toFixed(1)
  document.getElementById('placar-recorde').textContent = r.recorde_hp
  document.getElementById('placar-mensagem').textContent = r.mensagem
}

let estatTipoAtual = 'hoje'

const ESTAT_ESTRELA = '<svg width="14" height="14" viewBox="0 0 7 7" fill="#F3C24B"><rect x="3" y="0" width="1" height="7"/><rect x="0" y="3" width="7" height="1"/><rect x="2" y="1" width="3" height="5"/><rect x="1" y="2" width="5" height="3"/></svg>'
const ESTAT_ESCUDO = '<svg width="14" height="16" viewBox="0 0 7 8" fill="currentColor"><rect x="0" y="0" width="7" height="1"/><rect x="0" y="1" width="7" height="4"/><rect x="1" y="5" width="5" height="1"/><rect x="2" y="6" width="3" height="1"/><rect x="3" y="7" width="1" height="1"/></svg>'

function corHp(v) {
  if (v > 75) return '#10B981'
  if (v > 40) return '#F39A1F'
  if (v <= 0) return '#2C625B'
  return '#C42E4C'
}

async function carregarEstatisticas(tipo) {
  if (!window.pywebview) return
  estatTipoAtual = tipo || estatTipoAtual

  document.querySelectorAll('.estat-aba').forEach((a) =>
    a.classList.toggle('ativo', a.dataset.estat === estatTipoAtual)
  )

  const dados = await window.pywebview.api.obter_estatisticas_completas(estatTipoAtual)
  desenharHeroi(dados.hero)
  desenharRanking(dados.ranking)
  desenharPeriodo(dados.periodo)
}

function desenharHeroi(h) {
  document.getElementById('estat-hp').textContent = h.hp

  const fill = document.getElementById('estat-hpfill')
  fill.style.width = Math.min(100, h.hp) + '%'
  fill.style.background = corHp(h.hp)

  const shield = document.getElementById('estat-hpshield')
  shield.style.left = Math.min(100, h.hp) + '%'
  shield.style.width = Math.min(50, h.shield) + '%'

  document.getElementById('estat-escudo').innerHTML =
    h.shield > 0 ? `${ESTAT_ESCUDO} +${h.shield} escudo` : ''

  const selo = document.getElementById('estat-selo')
  selo.classList.remove('baixo', 'neutro')
  if (h.vs_ontem > 0) {
    selo.textContent = `▲ +${h.vs_ontem} vs ontem`
  } else if (h.vs_ontem < 0) {
    selo.textContent = `▼ ${h.vs_ontem} vs ontem`
    selo.classList.add('baixo')
  } else {
    selo.textContent = 'igual a ontem'
    selo.classList.add('neutro')
  }

  document.getElementById('estat-herostats').innerHTML =
    `<span>Tarefas: <b>${h.tarefas}</b></span>` +
    `<span class="dano">Dano: <b>${h.dano}</b></span>` +
    `<span>Sequência: <b>${h.streak} dias</b> &middot; &times;${h.multiplicador.toFixed(1)}</span>`

  document.getElementById('estat-msg').textContent = `"${h.mensagem}"`
}

function desenharRanking(ranking) {
  const ordenado = ranking
    .map((x, i) => ({ ...x, ordem: i }))
    .sort((a, b) => b.valor - a.valor || a.ordem - b.ordem)

  document.getElementById('estat-ranking').innerHTML = ordenado.map((x, i) => {
    const pos = i + 1
    const classeMedalha = pos <= 3 ? `m${pos}` : 'mn'
    return `
      <div class="rk-linha">
        <span class="rk-nome"><span class="medalha ${classeMedalha}">${pos}</span> ${x.nome}</span>
        <span class="rk-barra"><span class="rk-preench" style="width:${x.valor}%;background:${corHp(x.valor)}"></span></span>
        <span class="rk-valor">${x.valor}</span>
      </div>`
  }).join('')
}

function desenharPeriodo(p) {
  document.getElementById('estat-periodo').textContent = p.label

  const m = p.metricas
  const cards = [
    { r: 'Média de HP', v: m.media_hp, e: 'no período', cls: 'destaque' },
    m.melhor_dia
      ? { r: 'Melhor dia', v: m.melhor_dia.valor, e: m.melhor_dia.quando }
      : { r: 'Melhor dia', v: '—', e: 'sem dados' },
  ]
  if (estatTipoAtual !== 'hoje') {
    cards.push({ r: 'Dias perfeitos', v: m.dias_perfeitos, e: 'sem sofrer dano', star: true, cls: 'ouro' })
  }
  cards.push(
    { r: 'Sessões de foco', v: m.sessoes_foco, e: 'blocos concluídos' },
    { r: 'Dano total', v: m.dano_total, e: 'no período', cls: 'perigo' },
  )
  document.getElementById('estat-metricas').innerHTML = cards.map((c) => `
    <div class="metrica ${c.cls || ''}">
      <span class="metrica-rotulo">${c.r}</span>
      <span class="metrica-valor">${c.v}${c.star ? ESTAT_ESTRELA : ''}</span>
      <span class="metrica-extra">${c.e}</span>
    </div>`).join('')

  const g = p.grafico
  document.getElementById('estat-grafico-titulo').textContent = g.titulo
  document.getElementById('estat-legenda').textContent = g.legenda

  const escala = g.modo === 'hp' ? 100 : Math.max(...g.valores.map((v) => Math.abs(v)), 1)
  document.getElementById('estat-eixoy').innerHTML = g.modo === 'hp'
    ? '<span>100</span><span>50</span><span>0</span>'
    : `<span>${escala}</span><span>${Math.round(escala / 2)}</span><span>0</span>`

  document.getElementById('estat-barras').innerHTML = g.valores.map((v, i) => {
    const altura = Math.round((Math.abs(v) / escala) * 100)
    const cor = g.modo === 'hp' ? corHp(v) : (v > 0 ? '#10B981' : v < 0 ? '#C42E4C' : '#2C625B')
    return `
      <div class="col">
        <div class="col-barra" style="height:${Math.max(altura, 2)}%;background:${cor}"></div>
        <span class="col-label">${g.labels[i]}</span>
      </div>`
  }).join('')
}

const diasAbas = document.getElementById('dias-abas')
const listaBlocos = document.getElementById('lista-blocos')
const btnNovoBloco = document.getElementById('btn-novo-bloco')

let diaSelecionado = (new Date().getDay() + 6) % 7
let editandoBlocoId = null

montarAbas()

if (window.pywebview) {
  carregarPlacar()
  sincronizarEstado()
  checarAtualizacao()
} else {
  window.addEventListener('pywebviewready', () => {
    carregarPlacar()
    sincronizarEstado()
    checarAtualizacao()
  })
}

document.addEventListener('click', (e) => {
  const aba = e.target.closest('.estat-aba')
  if (aba) carregarEstatisticas(aba.dataset.estat)
})
const formBloco = document.getElementById('form-bloco')
const btnCancelarBloco = document.getElementById('btn-cancelar-bloco')
const seletorModo = document.getElementById('bloco-modo')
const campoPausa = document.getElementById('campo-pausa')
const blocoErro = document.getElementById('bloco-erro')

function montarAbas() {
  diasAbas.innerHTML = DIAS.map((nome, i) =>
    `<button class="btn-pixel dia-aba ${i === diaSelecionado ? 'ativo' : ''}" data-dia="${i}">${nome}</button>`
  ).join('')

  diasAbas.querySelectorAll('.dia-aba').forEach((aba) => {
    aba.addEventListener('click', () => {
      diaSelecionado = Number(aba.dataset.dia)
      montarAbas()
      carregarBlocos()
    })
  })
}

const modalOverlay = document.getElementById('modal-overlay')
const modalTitulo = document.getElementById('modal-titulo')
const modalTexto = document.getElementById('modal-texto')
const modalDias = document.getElementById('modal-dias')
const modalConfirmar = document.getElementById('modal-confirmar')
const modalCancelar = document.getElementById('modal-cancelar')
const btnCopiarDia = document.getElementById('btn-copiar-dia')
const btnDiaLivre = document.getElementById('btn-dia-livre')
const btnLimparDia = document.getElementById('btn-limpar-dia')

let modalAoConfirmar = null

function fecharModal() {
  modalOverlay.classList.add('escondido')
  modalAoConfirmar = null
}

function abrirModal({ titulo, texto, comDias, confirmarTexto, aoConfirmar }) {
  modalTitulo.textContent = titulo
  modalTexto.innerHTML = texto
  modalConfirmar.textContent = confirmarTexto || 'Confirmar'

  if (comDias) {
    modalDias.classList.remove('escondido')
    modalDias.innerHTML = DIAS
      .map((nome, i) => (i === diaSelecionado ? '' : `<button type="button" class="modal-dia" data-dia="${i}">${nome}</button>`))
      .join('')
    modalDias.querySelectorAll('.modal-dia').forEach((chip) => {
      chip.addEventListener('click', () => chip.classList.toggle('escolhido'))
    })
  } else {
    modalDias.classList.add('escondido')
    modalDias.innerHTML = ''
  }

  modalAoConfirmar = aoConfirmar
  modalOverlay.classList.remove('escondido')
}

modalConfirmar.addEventListener('click', () => {
  if (modalAoConfirmar) modalAoConfirmar()
})
modalCancelar.addEventListener('click', fecharModal)
modalOverlay.addEventListener('click', (evento) => {
  if (evento.target === modalOverlay) fecharModal()
})

btnCopiarDia.addEventListener('click', () => {
  abrirModal({
    titulo: 'Copiar agenda',
    texto: `Você está em <strong>${DIAS_LONGOS[diaSelecionado]}</strong>. Para quais dias quer copiar esta agenda? Os blocos dos dias escolhidos serão <strong>substituídos</strong>.`,
    comDias: true,
    confirmarTexto: 'Copiar',
    aoConfirmar: async () => {
      const escolhidos = [...modalDias.querySelectorAll('.modal-dia.escolhido')].map((chip) => Number(chip.dataset.dia))
      if (escolhidos.length === 0 || !window.pywebview) return
      for (const destino of escolhidos) {
        await window.pywebview.api.copiar_dia(diaSelecionado, destino)
      }
      fecharModal()
      diaSelecionado = escolhidos[0]
      montarAbas()
      carregarBlocos()
    },
  })
})

btnDiaLivre.addEventListener('click', () => {
  abrirModal({
    titulo: 'Marcar dia livre',
    texto: `Marcar <strong>${DIAS_LONGOS[diaSelecionado]}</strong> como dia livre? Isso remove todos os blocos deste dia.`,
    comDias: false,
    confirmarTexto: 'Marcar livre',
    aoConfirmar: async () => {
      if (!window.pywebview) return
      await window.pywebview.api.marcar_dia_livre(diaSelecionado)
      fecharModal()
      carregarBlocos()
    },
  })
})

btnLimparDia.addEventListener('click', () => {
  abrirModal({
    titulo: 'Limpar dia',
    texto: `Remover todos os blocos de <strong>${DIAS_LONGOS[diaSelecionado]}</strong>? O dia ficará vazio.`,
    comDias: false,
    confirmarTexto: 'Limpar',
    aoConfirmar: async () => {
      if (!window.pywebview) return
      await window.pywebview.api.limpar_dia(diaSelecionado)
      fecharModal()
      carregarBlocos()
    },
  })
})

function formatarBloco(bloco) {
  const modo = MODOS[bloco.modo] || MODOS.livre
  const detalhe = bloco.modo === 'foco' && bloco.pausa_intervalo_min
    ? `<span class="bloco-detalhe">Esticar a cada ${bloco.pausa_intervalo_min} min</span>`
    : ''

  return `
    <li class="item-bloco">
      <span class="bloco-horario">${bloco.hora_inicio}–${bloco.hora_fim}</span>
      <span class="bloco-info">
        <span class="bloco-atividade">${bloco.atividade}</span>
        ${detalhe}
      </span>
      <span class="bloco-tag ${modo.classe}">${modo.rotulo}</span>
      <div class="acoes">
        <button class="btn-editar" data-id="${bloco.id}" title="Editar">✎</button>
        <button class="btn-remover" data-id="${bloco.id}" title="Remover">×</button>
      </div>
    </li>`
}

async function carregarBlocos() {
  if (!window.pywebview) {
    listaBlocos.innerHTML = '<li class="lista-vazia">Abra dentro do Chrono para ver a agenda.</li>'
    return
  }

  const blocos = await window.pywebview.api.listar_blocos(diaSelecionado)

  if (blocos.length === 0) {
    listaBlocos.innerHTML = '<li class="lista-vazia">Nenhum bloco neste dia. Adicione o primeiro!</li>'
    return
  }

  listaBlocos.innerHTML = blocos.map(formatarBloco).join('')

  listaBlocos.querySelectorAll('.btn-remover').forEach((btn) => {
    btn.addEventListener('click', async () => {
      await window.pywebview.api.remover_bloco(Number(btn.dataset.id))
      carregarBlocos()
    })
  })

  listaBlocos.querySelectorAll('.btn-editar').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = Number(btn.dataset.id)
      const bloco = blocos.find((b) => b.id === id)
      if (bloco) {
        editandoBlocoId = id
        document.getElementById('bloco-inicio').value = bloco.hora_inicio
        document.getElementById('bloco-fim').value = bloco.hora_fim
        document.getElementById('bloco-atividade').value = bloco.atividade
        seletorModo.value = bloco.modo
        document.getElementById('bloco-pausa').value = bloco.pausa_intervalo_min || ''
        campoPausa.classList.toggle('escondido', bloco.modo !== 'foco')
        formBloco.querySelector('button[type="submit"]').textContent = 'Salvar edição'
        abrirForm()
      }
    })
  })
}

function abrirForm() {
  formBloco.classList.remove('escondido')
  btnNovoBloco.classList.add('escondido')
  formBloco.scrollIntoView({ behavior: 'smooth', block: 'end' })
}

function fecharForm() {
  editandoBlocoId = null
  formBloco.querySelector('button[type="submit"]').textContent = 'Salvar bloco'
  formBloco.reset()
  blocoErro.classList.add('escondido')
  campoPausa.classList.remove('escondido')
  formBloco.classList.add('escondido')
  btnNovoBloco.classList.remove('escondido')
}

seletorModo.addEventListener('change', () => {
  campoPausa.classList.toggle('escondido', seletorModo.value !== 'foco')
})

btnNovoBloco.addEventListener('click', abrirForm)
btnCancelarBloco.addEventListener('click', fecharForm)

formBloco.addEventListener('submit', async (evento) => {
  evento.preventDefault()
  if (!window.pywebview) return

  const inicio = document.getElementById('bloco-inicio').value
  const fim = document.getElementById('bloco-fim').value
  const atividade = document.getElementById('bloco-atividade').value.trim()
  const modo = seletorModo.value
  const pausaTexto = document.getElementById('bloco-pausa').value
  const pausa = modo === 'foco' && pausaTexto ? Number(pausaTexto) : null

  if (fim <= inicio) {
    blocoErro.textContent = 'O horário de fim precisa ser depois do início.'
    blocoErro.classList.remove('escondido')
    return
  }

  const resultado = editandoBlocoId
    ? await window.pywebview.api.editar_bloco(editandoBlocoId, diaSelecionado, inicio, fim, atividade, modo, pausa)
    : await window.pywebview.api.salvar_bloco(diaSelecionado, inicio, fim, atividade, modo, pausa)

  if (resultado && resultado.ok === false) {
    const c = resultado.conflito
    blocoErro.textContent = `Conflito de horário: já existe "${c.atividade}" das ${c.hora_inicio} às ${c.hora_fim} nesse dia. Ajuste para não sobrepor.`
    blocoErro.classList.remove('escondido')
    return
  }

  fecharForm()
  carregarBlocos()
})

const listaApps = document.getElementById('lista-apps')
const btnNovoApp = document.getElementById('btn-novo-app')
const formApp = document.getElementById('form-app')
const btnCancelarApp = document.getElementById('btn-cancelar-app')

let editandoAppId = null

function formatarApp(app) {
  return `
    <li class="item-app">
      <span class="app-info">
        <span class="app-nome">${app.nome}</span>
        <span class="app-processo">${app.processo}</span>
      </span>
      <div class="acoes">
        <button class="btn-editar" data-id="${app.id}" title="Editar">✎</button>
        <button class="btn-remover" data-id="${app.id}" title="Remover">×</button>
      </div>
    </li>`
}

async function carregarApps() {
  if (!window.pywebview) {
    listaApps.innerHTML = '<li class="lista-vazia">Abra dentro do Chrono para ver os apps vigiados.</li>'
    return
  }

  const apps = await window.pywebview.api.listar_apps()

  if (apps.length === 0) {
    listaApps.innerHTML = '<li class="lista-vazia">Nenhum app cadastrado. Adicione o primeiro!</li>'
    return
  }

  listaApps.innerHTML = apps.map(formatarApp).join('')

  listaApps.querySelectorAll('.btn-remover').forEach((btn) => {
    btn.addEventListener('click', async () => {
      await window.pywebview.api.remover_app(Number(btn.dataset.id))
      carregarApps()
    })
  })

  listaApps.querySelectorAll('.btn-editar').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = Number(btn.dataset.id)
      const app = apps.find((a) => a.id === id)
      if (app) {
        editandoAppId = id
        document.getElementById('app-nome').value = app.nome
        document.getElementById('app-processo').value = app.processo
        formApp.querySelector('button[type="submit"]').textContent = 'Salvar edição'
        abrirFormApp()
      }
    })
  })
}

let processosDisponiveis = []
const inputProcesso = document.getElementById('app-processo')
const listaProcessos = document.getElementById('lista-processos')

function mostrarProcessos(filtro = '') {
  const termo = filtro.trim().toLowerCase()
  const itens = processosDisponiveis.filter((p) => p.toLowerCase().includes(termo))
  if (itens.length === 0) {
    listaProcessos.classList.add('escondido')
    return
  }
  listaProcessos.innerHTML = itens.map((p) => `<li class="combo-item">${p}</li>`).join('')
  listaProcessos.classList.remove('escondido')
}

inputProcesso.addEventListener('focus', () => mostrarProcessos(inputProcesso.value))
inputProcesso.addEventListener('input', () => mostrarProcessos(inputProcesso.value))

listaProcessos.addEventListener('mousedown', (evento) => {
  const item = evento.target.closest('.combo-item')
  if (!item) return
  evento.preventDefault()
  inputProcesso.value = item.textContent
  listaProcessos.classList.add('escondido')
})

document.addEventListener('click', (evento) => {
  if (!evento.target.closest('.combo')) listaProcessos.classList.add('escondido')
})

async function abrirFormApp() {
  formApp.classList.remove('escondido')
  btnNovoApp.classList.add('escondido')

  if (window.pywebview) {
    processosDisponiveis = await window.pywebview.api.listar_processos_abertos()
  }
}

function fecharFormApp() {
  editandoAppId = null
  formApp.querySelector('button[type="submit"]').textContent = 'Salvar app'
  formApp.reset()
  listaProcessos.classList.add('escondido')
  formApp.classList.add('escondido')
  btnNovoApp.classList.remove('escondido')
}

btnNovoApp.addEventListener('click', abrirFormApp)
btnCancelarApp.addEventListener('click', fecharFormApp)

formApp.addEventListener('submit', async (evento) => {
  evento.preventDefault()
  if (!window.pywebview) return

  const nome = document.getElementById('app-nome').value.trim()
  const processo = document.getElementById('app-processo').value.trim()

  if (editandoAppId) {
    await window.pywebview.api.editar_app(editandoAppId, nome, processo)
  } else {
    await window.pywebview.api.salvar_app(nome, processo)
  }
  
  fecharFormApp()
  carregarApps()
})


