import { Link } from 'react-router-dom'
import { classesBotao } from '../components/ui/estilosBotao'

const dadosColetados = [
  'Nome e e-mail do responsável, usados para login e recuperação da conta.',
  'Apelido ou primeiro nome da criança, avatar, preferências sensoriais e forma de acesso à tela.',
  'Perfil funcional de apoio: comunicação, regulação, plano curto de pausa e cartões personalizados.',
  'Tentativas das atividades, nível de ajuda usado, tempo de resposta e observações curtas de sessão.',
]

const dadosNaoColetados = [
  'Diagnóstico, laudo, CID, grau ou nível de suporte.',
  'Foto real, sobrenome obrigatório, data de nascimento, escola, endereço ou geolocalização.',
  'Contato de terapeutas, convites para equipe externa, propaganda ou rastreamento de marketing.',
]

const usos = [
  'Manter a conta da família e abrir a trilha certa para cada criança.',
  'Retomar atividades, ajustar apoios, preservar preferências sensoriais e registrar progresso.',
  'Gerar relatórios e arquivos locais quando o responsável escolhe baixar esses materiais.',
]

const controles = [
  'O responsável pode exportar os dados de um perfil na tela de progresso.',
  'Um perfil pode ser apagado com confirmação pelo nome da criança.',
  'A conta inteira pode ser apagada nas configurações, com senha e confirmação textual.',
  'O cache offline persistente fica desligado por padrão e só deve ser ativado em dispositivo confiável.',
]

function Secao({
  id,
  titulo,
  itens,
}: {
  id: string
  titulo: string
  itens: string[]
}) {
  return (
    <section
      aria-labelledby={id}
      className="border-t border-[var(--cor-borda)] pt-6"
    >
      <h2 id={id} className="text-xl font-semibold text-[var(--cor-texto)]">
        {titulo}
      </h2>
      <ul className="mt-4 flex flex-col gap-3 text-base leading-7 text-[var(--cor-texto-suave)]">
        {itens.map((item) => (
          <li key={item} className="flex gap-3">
            <span
              aria-hidden="true"
              className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[var(--cor-primaria)]"
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

export function Privacidade() {
  return (
    <main className="mx-auto flex min-h-svh max-w-3xl flex-col gap-8 px-6 py-10">
      <header className="flex flex-col gap-5">
        <Link
          to="/"
          className="w-fit text-sm font-medium text-[var(--cor-primaria)] underline underline-offset-2"
        >
          Voltar
        </Link>

        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-semibold text-[var(--cor-texto)]">
            Privacidade e dados
          </h1>
          <p className="text-lg leading-8 text-[var(--cor-texto-suave)]">
            O TEA guarda somente dados necessários para alfabetização,
            continuidade da sessão e acompanhamento pela família. A criança não
            precisa de conta própria e nunca digita senha.
          </p>
        </div>
      </header>

      <Secao
        id="dados-coletados"
        titulo="O que guardamos"
        itens={dadosColetados}
      />

      <Secao
        id="dados-nao-coletados"
        titulo="O que não pedimos"
        itens={dadosNaoColetados}
      />

      <Secao id="uso-dados" titulo="Como usamos" itens={usos} />

      <Secao
        id="controle-familia"
        titulo="Controle da família"
        itens={controles}
      />

      <section
        aria-labelledby="dados-dispositivo"
        className="border-t border-[var(--cor-borda)] pt-6"
      >
        <h2
          id="dados-dispositivo"
          className="text-xl font-semibold text-[var(--cor-texto)]"
        >
          Dados no dispositivo
        </h2>
        <p className="mt-4 text-base leading-7 text-[var(--cor-texto-suave)]">
          A sessão infantil ativa fica no armazenamento de sessão do navegador e
          termina ao sair da conta ou fechar a sessão. O cache offline
          persistente, quando ativado, pode manter cópias locais do Firebase no
          navegador; em computador compartilhado, mantenha desligado e limpe os
          dados do site depois do uso.
        </p>
      </section>

      <section
        aria-labelledby="limites"
        className="border-t border-[var(--cor-borda)] pt-6"
      >
        <h2
          id="limites"
          className="text-xl font-semibold text-[var(--cor-texto)]"
        >
          Limites importantes
        </h2>
        <p className="mt-4 text-base leading-7 text-[var(--cor-texto-suave)]">
          A plataforma não substitui avaliação clínica, plano educacional ou
          acompanhamento profissional. A chave pública do Firebase aparece no
          código por design; a proteção real vem das regras do Firestore, do
          login do responsável e das ações explícitas de exportar ou apagar
          dados.
        </p>
      </section>

      <div className="flex flex-wrap gap-3 border-t border-[var(--cor-borda)] pt-6">
        <Link to="/demo" className={classesBotao({ variante: 'secundario' })}>
          Experimentar sem conta
        </Link>
        <Link to="/cadastro" className={classesBotao()}>
          Criar conta
        </Link>
        <Link to="/entrar" className={classesBotao({ variante: 'secundario' })}>
          Entrar
        </Link>
      </div>
    </main>
  )
}
