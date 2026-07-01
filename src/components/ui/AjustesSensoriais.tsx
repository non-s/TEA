import { usePreferencias } from '../../contexts/PreferenciasContext'
import type { TamanhoFonte } from '../../contexts/PreferenciasContext'
import { Interruptor } from './Interruptor'

export function AjustesSensoriais() {
  const { preferencias, atualizarPreferencias } = usePreferencias()

  return (
    <fieldset className="flex w-full flex-col gap-3 border-0 p-0 text-left">
      <legend className="sr-only">Ajustes sensoriais</legend>

      <Interruptor
        rotulo="Som"
        marcado={preferencias.som}
        aoAlterar={(som) => atualizarPreferencias({ som })}
      />
      <Interruptor
        rotulo="Animações"
        marcado={preferencias.animacoes}
        aoAlterar={(animacoes) => atualizarPreferencias({ animacoes })}
      />
      <Interruptor
        rotulo="Alto contraste"
        marcado={preferencias.altoContraste}
        aoAlterar={(altoContraste) => atualizarPreferencias({ altoContraste })}
      />

      <label className="flex items-center justify-between gap-3 py-1">
        <span className="text-[var(--cor-texto)]">Tamanho da letra</span>
        <select
          value={preferencias.tamanhoFonte}
          onChange={(evento) =>
            atualizarPreferencias({
              tamanhoFonte: evento.target.value as TamanhoFonte,
            })
          }
          className="rounded-lg border-2 border-[var(--cor-borda)] bg-[var(--cor-fundo-alt)] px-3 py-2 text-[var(--cor-texto)]"
        >
          <option value="normal">Normal</option>
          <option value="grande">Grande</option>
          <option value="extra-grande">Extra grande</option>
        </select>
      </label>
    </fieldset>
  )
}
