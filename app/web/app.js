const DIAS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
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
    if (alvo === 'agenda') carregarBlocos()
    if (alvo === 'apps') carregarApps()
  })
})

const btnIniciar = document.getElementById('btn-iniciar')
const btnConcluir = document.getElementById('btn-concluir')
const status = document.getElementById('status')
const lista = document.getElementById('lista-sessoes')

btnIniciar.addEventListener('click', async () => {
  if (!window.pywebview) {
    status.textContent = 'Fora do Chrono: a ponte com o Python não existe aqui.'
    return
  }
  await window.pywebview.api.iniciar_foco()

  btnIniciar.disabled = true
  btnConcluir.disabled = false
  status.textContent = 'Foco em andamento. Bom trabalho!'
})

btnConcluir.addEventListener('click', async () => {
  if (!window.pywebview) return
  await window.pywebview.api.concluir_tarefas()

  btnConcluir.disabled = true
  btnIniciar.disabled = false
  status.textContent = 'Sessão concluída e salva no histórico.'

  carregarHistorico()
})

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

async function carregarHistorico() {
  if (!window.pywebview) {
    lista.innerHTML = '<li class="lista-vazia">Abra dentro do Chrono para ver o histórico.</li>'
    return
  }

  const sessoes = await window.pywebview.api.listar_sessoes()

  if (sessoes.length === 0) {
    lista.innerHTML = '<li class="lista-vazia">Nenhuma sessão ainda. Inicie o foco!</li>'
    return
  }

  lista.innerHTML = sessoes.map((s) => `
    <li class="item-sessao">
      <span class="quando">${formatarQuando(s.inicio)}</span>
      <span class="duracao">${formatarDuracao(s.duracao_segundos)}</span>
    </li>
  `).join('')
}

const diasAbas = document.getElementById('dias-abas')
const listaBlocos = document.getElementById('lista-blocos')
const btnNovoBloco = document.getElementById('btn-novo-bloco')
const formBloco = document.getElementById('form-bloco')
const btnCancelarBloco = document.getElementById('btn-cancelar-bloco')
const seletorModo = document.getElementById('bloco-modo')
const campoPausa = document.getElementById('campo-pausa')
const blocoErro = document.getElementById('bloco-erro')

let diaSelecionado = (new Date().getDay() + 6) % 7
let editandoBlocoId = null

function montarAbas() {
  diasAbas.innerHTML = DIAS.map((nome, i) =>
    `<button class="dia-aba ${i === diaSelecionado ? 'ativo' : ''}" data-dia="${i}">${nome}</button>`
  ).join('')

  diasAbas.querySelectorAll('.dia-aba').forEach((aba) => {
    aba.addEventListener('click', () => {
      diaSelecionado = Number(aba.dataset.dia)
      montarAbas()
      carregarBlocos()
    })
  })
}

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

montarAbas()

if (window.pywebview) {
  carregarHistorico()
} else {
  window.addEventListener('pywebviewready', carregarHistorico)
}
