import { Link } from 'react-router-dom'
import { classesBotao } from '../components/ui/estilosBotao'

const dadosGuardados = [
  'Apelido ou primeiro nome digitado para o perfil, avatar escolhido e interesse especial (opcional).',
  'Preferências sensoriais do aparelho: som, animação, contraste e tamanho de letra.',
  'Perfil funcional de apoio, quando personalizado: comunicação, forma de acesso, regulação e cartões.',
  'Tentativas das atividades, nível de ajuda usado e quais atividades já foram dominadas.',
]

const dadosNuncaColetados = [
  'Nenhuma conta, e-mail ou senha — não existe cadastro.',
  'Diagnóstico, laudo, CID, grau ou nível de suporte.',
  'Foto real, sobrenome, data de nascimento, escola, endereço ou geolocalização.',
  'Nenhum dado é enviado para um servidor, nuvem ou terceiro. Nada sai deste aparelho.',
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
            O TEA não tem conta, login ou servidor. Tudo o que o app guarda fica
            só no navegador deste aparelho, salvo com a tecnologia padrão de
            armazenamento local do navegador — nunca é enviado para nenhum
            lugar.
          </p>
        </div>
      </header>

      <Secao
        id="dados-guardados"
        titulo="O que fica salvo neste aparelho"
        itens={dadosGuardados}
      />

      <Secao
        id="dados-nunca-coletados"
        titulo="O que nunca é coletado ou enviado"
        itens={dadosNuncaColetados}
      />

      <section
        aria-labelledby="controle"
        className="border-t border-[var(--cor-borda)] pt-6"
      >
        <h2
          id="controle"
          className="text-xl font-semibold text-[var(--cor-texto)]"
        >
          Controle total no aparelho
        </h2>
        <p className="mt-4 text-base leading-7 text-[var(--cor-texto-suave)]">
          Cada perfil pode ser apagado individualmente na tela inicial, com
          confirmação pelo nome da criança. Também é possível apagar todos os
          dados deste aparelho de uma vez na tela de{' '}
          <Link
            to="/ajustes"
            className="font-medium text-[var(--cor-primaria)] underline underline-offset-2"
          >
            Ajustes
          </Link>
          . Limpar os dados de navegação do navegador (ou desinstalar o app, se
          instalado como PWA) também apaga tudo.
        </p>
      </section>

      <section
        aria-labelledby="por-que-nao-lgpd"
        className="border-t border-[var(--cor-borda)] pt-6"
      >
        <h2
          id="por-que-nao-lgpd"
          className="text-xl font-semibold text-[var(--cor-texto)]"
        >
          Por que não há uma base legal de LGPD aqui
        </h2>
        <p className="mt-4 text-base leading-7 text-[var(--cor-texto-suave)]">
          A Lei Geral de Proteção de Dados (Lei 13.709/2018) regula o tratamento
          de dados pessoais por um controlador. O TEA não coleta, não recebe,
          não processa e não armazena nenhum dado em servidor próprio ou de
          terceiros — o app roda inteiramente no navegador da pessoa que o usa,
          e os dados digitados ficam apenas no armazenamento local desse mesmo
          navegador. Sem transmissão de dado nenhum a um controlador, não há
          tratamento de dado pessoal por terceiro a regular, e por isso nenhum
          consentimento é solicitado ao usar o app.
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
          acompanhamento profissional. Por guardar dados só neste aparelho, não
          há como recuperar o progresso se o armazenamento do navegador for
          limpo, se o app for desinstalado, ou ao trocar de aparelho — não
          existe sincronização entre dispositivos.
        </p>
      </section>

      <div className="flex flex-wrap gap-3 border-t border-[var(--cor-borda)] pt-6">
        <Link to="/termos" className={classesBotao({ variante: 'secundario' })}>
          Termos de uso
        </Link>
        <Link to="/" className={classesBotao()}>
          Voltar para o início
        </Link>
      </div>
    </main>
  )
}
