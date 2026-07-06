import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AjustesSensoriais } from '../../components/ui/AjustesSensoriais'
import { Cartao } from '../../components/ui/Cartao'
import { Interruptor } from '../../components/ui/Interruptor'
import { Botao } from '../../components/ui/Botao'
import { useAuth } from '../../contexts/AuthContext'
import { usePerfilAtivo } from '../../contexts/PerfilAtivoContext'
import type { Preferencias } from '../../contexts/PreferenciasContext'
import { excluirContaResponsavel } from '../../firebase/conta'
import {
  cacheOfflineFirestoreAtivo,
  definirCacheOfflineFirestore,
} from '../../firebase/db'
import { atualizarPreferenciasPerfil } from '../../firebase/perfis'
import { reconhecimentoFalaDisponivel } from '../../hooks/useReconhecimentoFala'
import {
  definirRespostaPorVoz,
  respostaPorVozAtiva,
} from '../../preferenciasDispositivo'

const TEXTO_CONFIRMACAO_EXCLUIR_CONTA = 'APAGAR CONTA'

export function Configuracoes() {
  const navigate = useNavigate()
  const { usuario } = useAuth()
  const { encerrarPerfil, perfilAtivo, selecionarPerfil } = usePerfilAtivo()
  const [erro, setErro] = useState<string | null>(null)
  const [cacheOfflineAtivo, setCacheOfflineAtivo] = useState(
    cacheOfflineFirestoreAtivo,
  )
  const [mensagemCacheOffline, setMensagemCacheOffline] = useState<
    string | null
  >(null)
  const [respostaPorVoz, setRespostaPorVoz] = useState(respostaPorVozAtiva)
  const [mensagemRespostaPorVoz, setMensagemRespostaPorVoz] = useState<
    string | null
  >(null)
  const [senhaExclusao, setSenhaExclusao] = useState('')
  const [confirmacaoExclusao, setConfirmacaoExclusao] = useState('')
  const [mensagemExclusao, setMensagemExclusao] = useState<string | null>(null)
  const [excluindoConta, setExcluindoConta] = useState(false)
  const podeExcluirConta =
    senhaExclusao.trim().length > 0 &&
    confirmacaoExclusao.trim() === TEXTO_CONFIRMACAO_EXCLUIR_CONTA

  async function aoAlterarPreferencias(preferencias: Preferencias) {
    if (!usuario || !perfilAtivo) return
    setErro(null)
    try {
      await atualizarPreferenciasPerfil(
        usuario.uid,
        perfilAtivo.id,
        preferencias,
      )
      selecionarPerfil({
        ...perfilAtivo,
        preferenciasSensoriais: preferencias,
      })
    } catch {
      setErro(
        'Não foi possível salvar no perfil. O ajuste ficou neste navegador.',
      )
    }
  }

  async function aoExcluirConta() {
    if (!usuario || !podeExcluirConta) return
    setMensagemExclusao(null)
    setExcluindoConta(true)

    try {
      await excluirContaResponsavel(usuario, senhaExclusao)
      definirCacheOfflineFirestore(false)
      encerrarPerfil()
      navigate('/')
    } catch {
      setMensagemExclusao(
        'Não foi possível apagar a conta agora. Confira a senha e tente novamente.',
      )
    } finally {
      setExcluindoConta(false)
    }
  }

  return (
    <main className="mx-auto flex max-w-md flex-col gap-8 px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[var(--cor-texto)]">
          Configurações
        </h1>
        <Link
          to="/responsavel/perfis"
          className="text-sm text-[var(--cor-primaria)] underline underline-offset-2"
        >
          Voltar
        </Link>
      </div>

      <Cartao className="flex flex-col gap-4">
        <div>
          <h2 className="font-medium text-[var(--cor-texto)]">
            Ajustes sensoriais
          </h2>
          <p className="mt-1 text-sm text-[var(--cor-texto-suave)]">
            Com uma criança selecionada, estas preferências ficam salvas no
            perfil dela. Sem perfil ativo, valem para este navegador.
          </p>
        </div>
        <AjustesSensoriais aoAlterar={aoAlterarPreferencias} />
        {erro && (
          <p role="alert" className="text-sm text-[var(--cor-erro)]">
            {erro}
          </p>
        )}
      </Cartao>

      <Cartao className="flex flex-col gap-4">
        <div>
          <h2 className="font-medium text-[var(--cor-texto)]">
            Continuidade neste dispositivo
          </h2>
          <p className="mt-1 text-sm leading-6 text-[var(--cor-texto-suave)]">
            Em um dispositivo confiável, o app pode manter uma cópia local
            protegida pelo navegador para carregar dados e sincronizar
            tentativas quando a conexão voltar.
          </p>
        </div>

        <Interruptor
          rotulo="Permitir cache offline neste dispositivo"
          marcado={cacheOfflineAtivo}
          aoAlterar={(ativo) => {
            const salvo = definirCacheOfflineFirestore(ativo)
            if (salvo) {
              setCacheOfflineAtivo(ativo)
              setMensagemCacheOffline(
                ativo
                  ? 'Cache offline ativado. Recarregue o app para aplicar.'
                  : 'Cache offline desativado para o proximo carregamento. Para apagar copia ja salva, limpe os dados do site no navegador.',
              )
            } else {
              setMensagemCacheOffline(
                'Não foi possível alterar o cache neste navegador.',
              )
            }
          }}
        />

        <p className="text-sm leading-6 text-[var(--cor-texto-suave)]">
          Evite ativar em computador compartilhado: dados de perfil e progresso
          podem ficar guardados no navegador. Desativar impede novo cache apos
          recarregar; para apagar copia ja criada, limpe os dados do site no
          navegador.
        </p>

        <Link
          to="/privacidade"
          className="w-fit text-sm font-medium text-[var(--cor-primaria)] underline underline-offset-2"
        >
          Ver resumo de privacidade e dados
        </Link>

        {mensagemCacheOffline && (
          <output className="text-sm text-[var(--cor-texto-suave)]">
            {mensagemCacheOffline}
          </output>
        )}
      </Cartao>

      <Cartao className="flex flex-col gap-4">
        <div>
          <h2 className="font-medium text-[var(--cor-texto)]">
            Resposta por voz
          </h2>
          <p className="mt-1 text-sm leading-6 text-[var(--cor-texto-suave)]">
            Nas atividades de nomeação expressiva, a criança pode falar a
            resposta em vez de tocar numa opção. Fica sempre disponível a opção
            de tocar — a fala é um jeito extra, nunca obrigatório. Exige
            microfone e, no navegador, o áudio é enviado a um serviço de
            reconhecimento de fala para ser transcrito.
          </p>
        </div>

        {reconhecimentoFalaDisponivel() ? (
          <Interruptor
            rotulo="Permitir resposta por voz neste dispositivo"
            marcado={respostaPorVoz}
            aoAlterar={(ativo) => {
              const salvo = definirRespostaPorVoz(ativo)
              if (salvo) {
                setRespostaPorVoz(ativo)
                setMensagemRespostaPorVoz(
                  ativo
                    ? 'Resposta por voz ativada. O navegador vai pedir permissão de microfone na primeira vez.'
                    : 'Resposta por voz desativada neste dispositivo.',
                )
              } else {
                setMensagemRespostaPorVoz(
                  'Não foi possível alterar essa opção neste navegador.',
                )
              }
            }}
          />
        ) : (
          <p className="text-sm leading-6 text-[var(--cor-texto-suave)]">
            Este navegador não oferece reconhecimento de fala. A resposta por
            toque continua disponível normalmente.
          </p>
        )}

        {mensagemRespostaPorVoz && (
          <output className="text-sm text-[var(--cor-texto-suave)]">
            {mensagemRespostaPorVoz}
          </output>
        )}
      </Cartao>

      <Cartao className="flex flex-col gap-4 border-2 border-[var(--cor-erro)]/40">
        <div>
          <h2 className="font-medium text-[var(--cor-texto)]">
            Apagar conta e dados
          </h2>
          <p className="mt-1 text-sm leading-6 text-[var(--cor-texto-suave)]">
            Remove os perfis, tentativas, observações, documento do responsável
            e acesso por e-mail/senha. Baixe uma cópia local antes se precisar
            guardar histórico.
          </p>
        </div>

        {perfilAtivo ? (
          <Link
            to={`/responsavel/progresso/${perfilAtivo.id}`}
            className="w-fit text-sm font-medium text-[var(--cor-primaria)] underline underline-offset-2"
          >
            Baixar copia do perfil antes de apagar
          </Link>
        ) : (
          <p className="text-sm leading-6 text-[var(--cor-texto-suave)]">
            Selecione um perfil de criança para baixar uma cópia local antes de
            apagar a conta.
          </p>
        )}

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-[var(--cor-texto)]">
            Senha da conta
          </span>
          <input
            type="password"
            value={senhaExclusao}
            onChange={(evento) => setSenhaExclusao(evento.target.value)}
            autoComplete="current-password"
            className="rounded-xl border-2 border-[var(--cor-borda)] bg-[var(--cor-fundo-alt)] px-4 py-2.5 text-[var(--cor-texto)]"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-[var(--cor-texto)]">
            Digite APAGAR CONTA para confirmar
          </span>
          <input
            type="text"
            value={confirmacaoExclusao}
            onChange={(evento) => setConfirmacaoExclusao(evento.target.value)}
            className="rounded-xl border-2 border-[var(--cor-borda)] bg-[var(--cor-fundo-alt)] px-4 py-2.5 text-[var(--cor-texto)]"
          />
        </label>

        <Botao
          type="button"
          variante="acento"
          disabled={!podeExcluirConta || excluindoConta}
          onClick={aoExcluirConta}
        >
          {excluindoConta ? 'Apagando conta...' : 'Apagar conta e dados'}
        </Botao>

        {mensagemExclusao && (
          <p role="alert" className="text-sm text-[var(--cor-erro)]">
            {mensagemExclusao}
          </p>
        )}
      </Cartao>
    </main>
  )
}
