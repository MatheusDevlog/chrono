const btn = document.getElementById('btn-concluir')
const status = document.getElementById('status')

btn.addEventListener('click', async () => {
  if (!window.pywebview) {
    status.textContent = 'Fora do Chrono: a ponte com o Python não existe aqui.'
    return
  }
  await window.pywebview.api.concluir_tarefas()

  btn.disabled = true
  btn.textContent = 'Tarefas concluídas'
  status.textContent = 'Pronto! O Chrono parou de cobrar.'
})
