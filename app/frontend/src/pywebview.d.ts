export interface ChronoApi {
    concluir_tarefas: () => Promisse<void>
    ignorar: () => Promise<void>
}

declare global {
    interface Window {
        pywebview?: {
            api: ChronoApi
        }
    }
}