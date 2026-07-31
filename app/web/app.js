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
    if (alvo === 'estatisticas') carregarEstatisticas('semana')
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

let estatTipoAtual = 'semana'

async function carregarEstatisticas(tipo) {
  if (!window.pywebview) return
  estatTipoAtual = tipo || estatTipoAtual

  document.querySelectorAll('.estat-aba').forEach((a) =>
    a.classList.toggle('ativo', a.dataset.estat === estatTipoAtual)
  )

  const data = await window.pywebview.api.obter_estatisticas(estatTipoAtual)
  desenharGrafico(data)
}

function desenharGrafico(data) {
  const totalEl = document.getElementById('grafico-total')
  const { rotulos, dados } = data

  const hpValores = dados.map(v => Math.max(0, Math.min(150, 100 + v)))
  const max = Math.max(...hpValores, 1)

  const passos = 4
  const passoValor = Math.ceil(max / passos)
  const eixoY = Array.from({ length: passos + 1 }, (_, i) => i * passoValor)

  document.getElementById('grafico-eixo-y').innerHTML = eixoY.map((v) =>
    `<span>${v}</span>`
  ).join('')

  const barrasHtml = hpValores.map((valor, i) => {
    const altura = max > 0 ? Math.round((valor / max) * 120) : 0
    const cor = valor > 75 ? '#10B981' : valor > 40 ? '#EAB308' : '#C42E4C'
    return `
      <div class="barra-coluna">
        <span class="barra-valor">${valor}</span>
        <div class="barra-preenchimento" style="height:${Math.max(altura, 4)}px;background:${cor}"></div>
      </div>`
  }).join('')

  document.getElementById('grafico-barras').innerHTML = barrasHtml

  document.getElementById('grafico-eixo-x').innerHTML = rotulos.map((r) =>
    `<span>${r}</span>`
  ).join('')

  const media = Math.round(hpValores.reduce((a, b) => a + b, 0) / hpValores.length)
  totalEl.innerHTML = `Média: <strong>${media}</strong> HP`
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
} else {
  window.addEventListener('pywebviewready', () => {
    carregarPlacar()
    sincronizarEstado()
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
    blocoErro.classList.remove('escondido')
    return
  }

  if (editandoBlocoId) {
    await window.pywebview.api.editar_bloco(editandoBlocoId, diaSelecionado, inicio, fim, atividade, modo, pausa)
  } else {
    await window.pywebview.api.salvar_bloco(diaSelecionado, inicio, fim, atividade, modo, pausa)
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

async function abrirFormApp() {
  formApp.classList.remove('escondido')
  btnNovoApp.classList.add('escondido')

  if (window.pywebview) {
    const processos = await window.pywebview.api.listar_processos_abertos()
    const datalist = document.getElementById('lista-processos')
    datalist.innerHTML = processos.map(p => `<option value="${p}">`).join('')
  }
}

function fecharFormApp() {
  editandoAppId = null
  formApp.querySelector('button[type="submit"]').textContent = 'Salvar app'
  formApp.reset()
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


