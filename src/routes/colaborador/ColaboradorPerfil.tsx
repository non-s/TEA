import { useEffect, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { calcularJardim, contarFlorescidas } from '../../curriculo/jardim'
import { trilhaV1 } from '../../curriculo/trilha-v1'
import { acentoDoModulo } from '../../curriculo/coresModulo'
import { PlantaJardim } from '../../curriculo/ativos/PlantaJardim'
import { ouvirPerfil, type PerfilCrianca } from '../../firebase/perfis'
import {
  LIMITE_TEXTO_OBSERVACAO_SESSAO,
  ouvirObservacoesSessao,
  registrarObservacaoSessao,
  textoTipoObservacaoSessao,
  type ObservacaoSessao,
} from '../../firebase/progresso'
import { Botao } from '../../components/ui/Botao'

const textoPorEstagio = {
  semente: 'Ainda uma semente',
  brotando: 'Crescendo',
  floresceu: 'Floresceu!',
} as const

// Tela só de leitura para um segundo responsável/terapeuta autorizado (ver
// docs/SEGURANCA.md#acesso-de-um-segundo-responsável-colaborador). Nunca
// edita perfil, preferências ou plano — as Firestore Rules já bloqueiam
// essas escritas para quem não é o dono, mas a tela nem oferece a opção.
export function ColaboradorPerfil() {
  const { uidResponsavel, perfilId } = useParams<{
    uidResponsavel: string
    perfilId: string
  }>()
  const [perfil, setPerfil] = useState<PerfilCrianca | null>(null)
  const [observacoes, setObservacoes] = useState<ObservacaoSessao[]>([])
  const [erro, setErro] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [textoObservacao, setTextoObservacao] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erroEnvio, setErroEnvio] = useState<string | null>(null)

  useEffect(() => {
    if (!uidResponsavel || !perfilId) return
    setCarregando(true)
    const pararPerfil = ouvirPerfil(
      uidResponsavel,
      perfilId,
      (perfilAtual) => {
        setPerfil(perfilAtual)
        setErro(perfilAtual ? null : 'Este perfil não existe mais.')
        setCarregando(false)
      },
      () => {
        setErro(
          'Não foi possível abrir este perfil. Confirme se você entrou com o e-mail correto e se já verificou seu e-mail nas configurações da conta.',
        )
        setCarregando(false)
      },
    )
    const pararObservacoes = ouvirObservacoesSessao(
      uidResponsavel,
      perfilId,
      setObservacoes,
    )
    return () => {
      pararPerfil()
      pararObservacoes()
    }
  }, [uidResponsavel, perfilId])

  async function aoRegistrarObservacao(evento: FormEvent) {
    evento.preventDefault()
    if (!uidResponsavel || !perfilId) return
    setErroEnvio(null)
    setEnviando(true)
    try {
      await registrarObservacaoSessao(uidResponsavel, perfilId, textoObservacao)
      setTextoObservacao('')
    } catch {
      setErroEnvio('Não foi possível salvar a observação. Tente de novo.')
    } finally {
      setEnviando(false)
    }
  }

  if (carregando) {
    return (
      <p className="p-10 text-center text-[var(--cor-texto-suave)]">
        Carregando…
      </p>
    )
  }

  if (erro || !perfil) {
    return (
      <main className="mx-auto flex max-w-xl flex-col gap-4 px-6 py-10">
        <p role="alert" className="text-sm text-[var(--cor-erro)]">
          {erro ?? 'Não foi possível abrir este perfil.'}
        </p>
        <Link
          to="/"
          className="w-fit text-sm font-medium text-[var(--cor-primaria)] underline underline-offset-2"
        >
          Voltar para a home
        </Link>
      </main>
    )
  }

  const canteiros = calcularJardim(
    trilhaV1,
    new Set(perfil.atividadesDominadas),
  )
  const florescidas = contarFlorescidas(canteiros)

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-[var(--cor-texto)]">
          Progresso de {perfil.nome}
        </h1>
        <p className="text-sm text-[var(--cor-texto-suave)]">
          Você está vendo este perfil como colaborador (leitura + observações de
          sessão). Só o responsável dono da conta pode editar o perfil.
        </p>
      </div>

      <section
        aria-labelledby="jardim-colaborador"
        className="flex flex-col gap-4"
      >
        <h2
          id="jardim-colaborador"
          className="text-lg font-medium text-[var(--cor-texto)]"
        >
          {florescidas} de {canteiros.length} módulos concluídos
        </h2>
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {canteiros.map((canteiro) => {
            const acento = acentoDoModulo(canteiro.moduloId)
            return (
              <li
                key={canteiro.moduloId}
                aria-label={`${canteiro.titulo}: ${textoPorEstagio[canteiro.estagio]}`}
                className="flex flex-col items-center gap-2 rounded-2xl border-2 border-[var(--cor-borda)] bg-[var(--cor-fundo-alt)] p-4 text-center shadow-[var(--sombra-cartao)]"
              >
                <PlantaJardim
                  estagio={canteiro.estagio}
                  className="h-16 w-14"
                  style={{ color: acento.texto }}
                />
                <span className="text-sm font-medium text-[var(--cor-texto)]">
                  {canteiro.titulo}
                </span>
                <span className="text-xs text-[var(--cor-texto-suave)]">
                  {textoPorEstagio[canteiro.estagio]}
                </span>
              </li>
            )
          })}
        </ul>
      </section>

      <section
        aria-labelledby="observacoes-colaborador"
        className="flex flex-col gap-4"
      >
        <h2
          id="observacoes-colaborador"
          className="text-lg font-medium text-[var(--cor-texto)]"
        >
          Observações de sessão
        </h2>

        <form onSubmit={aoRegistrarObservacao} className="flex flex-col gap-2">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-[var(--cor-texto)]">
              Registrar uma observação
            </span>
            <textarea
              value={textoObservacao}
              onChange={(evento) => setTextoObservacao(evento.target.value)}
              maxLength={LIMITE_TEXTO_OBSERVACAO_SESSAO}
              rows={3}
              className="min-h-[var(--min-alvo-controle)] resize-none rounded-xl border-2 border-[var(--cor-borda)] bg-[var(--cor-fundo-alt)] px-4 py-2.5 text-[var(--cor-texto)]"
            />
          </label>
          {erroEnvio && (
            <p role="alert" className="text-sm text-[var(--cor-erro)]">
              {erroEnvio}
            </p>
          )}
          <Botao
            type="submit"
            variante="secundario"
            disabled={enviando || !textoObservacao.trim()}
            className="w-fit"
          >
            {enviando ? 'Salvando…' : 'Salvar observação'}
          </Botao>
        </form>

        {observacoes.length > 0 && (
          <ul className="flex flex-col gap-2">
            {observacoes.map((observacao) => (
              <li
                key={observacao.id}
                className="rounded-xl border border-[var(--cor-borda)] bg-[var(--cor-fundo-alt)] p-3 text-sm text-[var(--cor-texto)]"
              >
                <span className="text-xs font-medium text-[var(--cor-texto-suave)]">
                  {textoTipoObservacaoSessao[observacao.tipo ?? 'outro']}
                </span>
                <p>{observacao.texto}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}
