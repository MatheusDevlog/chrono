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

if (window.pywebview) {
  carregarHistorico()
} else {
  window.addEventListener('pywebviewready', carregarHistorico)
}