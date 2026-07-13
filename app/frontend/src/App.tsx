import { useState } from 'react'
import './App.css'

function IconeOlho() {
  return (
    <svg
      width="44" height="44" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.6"
      strokeLinecap="round" strokeLinejoin="round"
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function App() {
  const [concluido, setConcluido] = useState(false)

  async function concluir() {
    if (window.pywebview?.api) {
      await window.pywebview.api.concluir_tarefas()
    }
    setConcluido(true)
  }

  return (
    <main className="tela">
      <h1 className="logo">CHRONO</h1>

      <div className="olho">
        <IconeOlho />
      </div>

      {concluido ? (
        <p className="status">Tarefas concluídas — o Chrono relaxou.</p>
      ) : (
        <>
          <p className="status">Vigiando seus apps em segundo plano...</p>
          <button className="botao-primario" onClick={concluir}>
            Já concluí minhas tarefas
          </button>
        </>
      )}
    </main>
  )
}

export default App