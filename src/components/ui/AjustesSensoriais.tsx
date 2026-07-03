import { usePreferencias } from '../../contexts/PreferenciasContext'
import type {
  Preferencias,
  TamanhoFonte,
} from '../../contexts/PreferenciasContext'
import { Interruptor } from './Interruptor'

interface AjustesSensoriaisProps {
  aoAlterar?: (preferencias: Preferencias) => void
}

export function AjustesSensoriais({ aoAlterar }: AjustesSensoriaisProps) {
  const { preferencias, atualizarPreferencias } = usePreferencias()

  function alterar(alteracoes: Partial<Preferencias>) {
    const proximas = { ...preferencias, ...alteracoes }
    atualizarPreferencias(alteracoes)
    aoAlterar?.(proximas)
  }

  return (
    <fieldset className="flex w-full flex-col gap-3 border-0 p-0 text-left">
      <legend className="sr-only">Ajustes sensoriais</legend>

      <Interruptor
        rotulo="Som"
        marcado={preferencias.som}
        aoAlterar={(som) => alterar({ som })}
      />
      <Interruptor
        rotulo="Animações"
        marcado={preferencias.animacoes}
        aoAlterar={(animacoes) => alterar({ animacoes })}
      />
      <Interruptor
        rotulo="Alto contraste"
        marcado={preferencias.altoContraste}
        aoAlterar={(altoContraste) => alterar({ altoContraste })}
      />
      <Interruptor
        rotulo="Alvos maiores"
        marcado={preferencias.alvosMaiores}
        aoAlterar={(alvosMaiores) => alterar({ alvosMaiores })}
      />

      <label className="flex items-center justify-between gap-3 py-1">
        <span className="text-[var(--cor-texto)]">Tamanho da letra</span>
        <select
          value={preferencias.tamanhoFonte}
          onChange={(evento) =>
            alterar({
              tamanhoFonte: evento.target.value as TamanhoFonte,
            })
          }
          className="min-h-[var(--min-alvo-controle)] rounded-lg border-2 border-[var(--cor-borda)] bg-[var(--cor-fundo-alt)] px-3 py-2 text-[var(--cor-texto)]"
        >
          <option value="normal">Normal</option>
          <option value="grande">Grande</option>
          <option value="extra-grande">Extra grande</option>
        </select>
      </label>
    </fieldset>
  )
}
