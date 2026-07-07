import { Link } from 'react-router-dom'
import { classesBotao } from '../components/ui/estilosBotao'

function Secao({
  id,
  titulo,
  children,
}: {
  id: string
  titulo: string
  children: React.ReactNode
}) {
  return (
    <section
      aria-labelledby={id}
      className="border-t border-[var(--cor-borda)] pt-6"
    >
      <h2 id={id} className="text-xl font-semibold text-[var(--cor-texto)]">
        {titulo}
      </h2>
      <div className="mt-4 flex flex-col gap-3 text-base leading-7 text-[var(--cor-texto-suave)]">
        {children}
      </div>
    </section>
  )
}

export function Termos() {
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
            Termos de uso
          </h1>
          <p className="text-lg leading-8 text-[var(--cor-texto-suave)]">
            Estes termos regem o uso do TEA pelo responsável que cria a conta.
            Leia também o{' '}
            <Link
              to="/privacidade"
              className="font-medium text-[var(--cor-primaria)] underline underline-offset-2"
            >
              resumo de privacidade
            </Link>
            , que trata especificamente dos dados coletados.
          </p>
        </div>
      </header>

      <Secao id="quem-pode-usar" titulo="Quem pode criar uma conta">
        <p>
          A conta deve ser criada por um adulto responsável legal pela criança
          (pai, mãe ou responsável legal), maior de 18 anos. A criança nunca
          cria conta própria, nunca digita senha e usa a plataforma somente
          dentro da sessão já autenticada do responsável.
        </p>
      </Secao>

      <Secao id="finalidade" titulo="Finalidade da plataforma">
        <p>
          O TEA é uma ferramenta de apoio à alfabetização, pensada para crianças
          autistas. Ela{' '}
          <strong className="text-[var(--cor-texto)]">não substitui</strong>{' '}
          avaliação clínica, diagnóstico, terapia (fonoaudiologia, terapia
          ocupacional, ABA ou qualquer outra), nem acompanhamento educacional
          profissional. Use como material de apoio entre sessões com os
          profissionais que acompanham a criança, não como substituto deles.
        </p>
      </Secao>

      <Secao id="isencao" titulo="Isenção de responsabilidade">
        <p>
          A plataforma é oferecida "como está", sem garantia de resultado
          pedagógico específico para qualquer criança. O critério de "domínio"
          de uma atividade é heurístico (acertos consecutivos no nível
          independente) e não constitui avaliação clínica ou educacional formal.
          O mantenedor não se responsabiliza por decisões tomadas com base
          apenas nos dados exibidos pelo app, sem acompanhamento de um
          profissional.
        </p>
      </Secao>

      <Secao id="conta-e-conduta" titulo="Conta e conduta esperada">
        <p>
          Cada responsável deve manter sua senha em sigilo e é responsável pelo
          uso feito através da própria conta. Não é permitido usar a plataforma
          para coletar dados de crianças que não estejam sob sua
          responsabilidade legal, nem tentar acessar dados de outras famílias ou
          contornar as regras de segurança do Firestore.
        </p>
      </Secao>

      <Secao id="disponibilidade" titulo="Disponibilidade e mudanças">
        <p>
          O TEA é mantido em infraestrutura gratuita (plano Firebase Spark), sem
          garantia contratual de disponibilidade (SLA). Funcionalidades podem
          mudar, e o serviço pode ser descontinuado; quando isso acontecer, o
          mantenedor buscará avisar com antecedência razoável pelos canais do
          projeto e recomenda exportar os dados da família antes de qualquer
          encerramento.
        </p>
      </Secao>

      <Secao id="encerramento" titulo="Encerramento de conta">
        <p>
          O responsável pode apagar um perfil ou a conta inteira a qualquer
          momento nas telas do app, com confirmação. O mantenedor pode suspender
          contas usadas para violar estes termos (por exemplo, tentativa de
          acesso indevido a dados de outra família).
        </p>
      </Secao>

      <Secao id="alteracoes" titulo="Alterações destes termos">
        <p>
          Estes termos podem mudar conforme a plataforma evolui. Mudanças
          relevantes serão refletidas nesta página, que fica sempre acessível a
          partir da home, do cadastro e da tela de privacidade.
        </p>
      </Secao>

      <Secao id="lei-aplicavel" titulo="Lei aplicável e contato">
        <p>
          Estes termos são regidos pela legislação brasileira, incluindo a Lei
          Geral de Proteção de Dados (Lei 13.709/2018) e o Código de Defesa do
          Consumidor, no que for aplicável a um serviço gratuito mantido sem
          fins comerciais. Dúvidas podem ser enviadas pelo perfil do GitHub do
          mantenedor (
          <a
            href="https://github.com/non-s"
            className="font-medium text-[var(--cor-primaria)] underline underline-offset-2"
          >
            @non-s
          </a>
          ).
        </p>
        <p className="text-sm">
          Este documento busca ser claro e de boa-fé, mas não é um parecer
          jurídico formal. Para uso institucional (escolas, clínicas), busque
          revisão por advogado antes de adotar a plataforma.
        </p>
      </Secao>

      <div className="flex flex-wrap gap-3 border-t border-[var(--cor-borda)] pt-6">
        <Link
          to="/privacidade"
          className={classesBotao({ variante: 'secundario' })}
        >
          Ver privacidade
        </Link>
        <Link to="/cadastro" className={classesBotao()}>
          Criar conta
        </Link>
      </div>
    </main>
  )
}
