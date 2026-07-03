import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Botao } from './Botao'
import { classesBotao } from './estilosBotao'

interface LimiteErroProps {
  children: ReactNode
  chaveReset?: string
}

interface LimiteErroState {
  temErro: boolean
  chaveReset?: string
}

export class LimiteErro extends Component<LimiteErroProps, LimiteErroState> {
  state: LimiteErroState = {
    temErro: false,
    chaveReset: this.props.chaveReset,
  }

  static getDerivedStateFromProps(
    props: LimiteErroProps,
    state: LimiteErroState,
  ): Partial<LimiteErroState> | null {
    if (props.chaveReset !== state.chaveReset) {
      return {
        temErro: false,
        chaveReset: props.chaveReset,
      }
    }

    return null
  }

  static getDerivedStateFromError(): Partial<LimiteErroState> {
    return { temErro: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error(error, info)
    }
  }

  resetar = () => {
    this.setState({ temErro: false, chaveReset: this.props.chaveReset })
  }

  render() {
    if (!this.state.temErro) {
      return this.props.children
    }

    return (
      <main className="flex min-h-svh items-center justify-center bg-[var(--cor-fundo)] px-4 py-8">
        <section
          aria-labelledby="erro-app-titulo"
          className="w-full max-w-xl rounded-[8px] border-2 border-[var(--cor-borda)] bg-[var(--cor-fundo-alt)] p-6 shadow-sm"
          role="alert"
        >
          <p className="text-sm font-semibold text-[var(--cor-primaria)]">
            Pausa segura
          </p>
          <h1
            className="mt-2 text-2xl font-bold text-[var(--cor-texto)]"
            id="erro-app-titulo"
          >
            Algo saiu do esperado.
          </h1>
          <p className="mt-3 text-base leading-relaxed text-[var(--cor-texto-suave)]">
            Nada foi apagado por essa tela. Chame um adulto para tentar de novo
            ou voltar ao início com calma.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Botao onClick={this.resetar}>Tentar de novo</Botao>
            <Link
              className={classesBotao({
                variante: 'secundario',
                tamanho: 'grande',
              })}
              to="/"
            >
              Voltar ao início
            </Link>
          </div>
        </section>
      </main>
    )
  }
}
