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
            Estes termos regem o uso do TEA. Leia também o{' '}
            <Link
              to="/privacidade"
              className="font-medium text-[var(--cor-primaria)] underline underline-offset-2"
            >
              resumo de privacidade
            </Link>
            , que trata especificamente dos dados guardados.
          </p>
        </div>
      </header>

      <Secao id="sem-conta" titulo="Sem conta, sem login">
        <p>
          O TEA não tem cadastro, senha ou conta. Qualquer pessoa pode abrir o
          app, digitar um nome e começar a usar. Como não há conta, também não
          há verificação de idade, de responsabilidade legal ou de quem está
          usando o aparelho — quem instala e supervisiona o aparelho é
          responsável por escolher se e como a criança usa a plataforma.
        </p>
      </Secao>

      <Secao id="finalidade" titulo="Finalidade da plataforma">
        <p>
          O TEA é uma ferramenta de apoio à alfabetização, pensada para crianças
          autistas mas aberta para qualquer criança. Ela{' '}
          <strong className="text-[var(--cor-texto)]">não substitui</strong>{' '}
          avaliação clínica, diagnóstico, terapia (fonoaudiologia, terapia
          ocupacional, ABA ou qualquer outra), nem acompanhamento educacional
          profissional. Use como material de apoio, não como substituto de
          profissionais que acompanham a criança.
        </p>
      </Secao>

      <Secao id="isencao" titulo="Isenção de responsabilidade">
        <p>
          A plataforma é oferecida "como está", sem garantia de resultado
          pedagógico específico para qualquer criança. O critério de "domínio"
          de uma atividade é heurístico (resposta correta no nível independente,
          sem dica) e não constitui avaliação clínica ou educacional formal. O
          mantenedor não se responsabiliza por decisões tomadas com base apenas
          nos dados exibidos pelo app, sem acompanhamento de um profissional.
        </p>
      </Secao>

      <Secao id="dados-no-aparelho" titulo="Dados ficam só no aparelho">
        <p>
          Todo o progresso é salvo apenas no navegador do aparelho usado. Limpar
          os dados do navegador, desinstalar o app ou trocar de aparelho apaga
          (ou torna inacessível) esse progresso — não existe conta para
          recuperá-lo em outro lugar. É responsabilidade de quem usa o app fazer
          essa gestão, incluindo apagar os dados de um aparelho compartilhado ou
          público depois do uso.
        </p>
      </Secao>

      <Secao id="disponibilidade" titulo="Disponibilidade e mudanças">
        <p>
          O TEA é um projeto de código aberto mantido em infraestrutura
          gratuita, sem garantia contratual de disponibilidade (SLA).
          Funcionalidades podem mudar, e o serviço pode ser descontinuado a
          qualquer momento.
        </p>
      </Secao>

      <Secao id="lei-aplicavel" titulo="Lei aplicável e contato">
        <p>
          Estes termos são regidos pela legislação brasileira, no que for
          aplicável a um serviço gratuito, de código aberto, mantido sem fins
          comerciais. Dúvidas podem ser enviadas pelo perfil do GitHub do
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
        <Link to="/" className={classesBotao()}>
          Voltar para o início
        </Link>
      </div>
    </main>
  )
}
