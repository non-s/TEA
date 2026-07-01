import { usePreferencias } from '../../contexts/PreferenciasContext'
import type { TamanhoFonte } from '../../contexts/PreferenciasContext'

export function AjustesSensoriais() {
  const { preferencias, atualizarPreferencias } = usePreferencias()

  return (
    <fieldset className="flex w-full max-w-md flex-col gap-4 rounded-2xl border-2 border-[var(--cor-borda)] bg-[var(--cor-fundo-alt)] p-6 text-left">
      <legend className="px-2 text-sm font-medium text-[var(--cor-texto)]">
        Ajustes sensoriais
      </legend>

      <label className="flex items-center justify-between gap-3">
        <span className="text-[var(--cor-texto)]">Som</span>
        <input
          type="checkbox"
          checked={preferencias.som}
          onChange={(evento) =>
            atualizarPreferencias({ som: evento.target.checked })
          }
        />
      </label>

      <label className="flex items-center justify-between gap-3">
        <span className="text-[var(--cor-texto)]">Animações</span>
        <input
          type="checkbox"
          checked={preferencias.animacoes}
          onChange={(evento) =>
            atualizarPreferencias({ animacoes: evento.target.checked })
          }
        />
      </label>

      <label className="flex items-center justify-between gap-3">
        <span className="text-[var(--cor-texto)]">Alto contraste</span>
        <input
          type="checkbox"
          checked={preferencias.altoContraste}
          onChange={(evento) =>
            atualizarPreferencias({ altoContraste: evento.target.checked })
          }
        />
      </label>

      <label className="flex items-center justify-between gap-3">
        <span className="text-[var(--cor-texto)]">Tamanho da letra</span>
        <select
          value={preferencias.tamanhoFonte}
          onChange={(evento) =>
            atualizarPreferencias({
              tamanhoFonte: evento.target.value as TamanhoFonte,
            })
          }
          className="rounded-lg border border-[var(--cor-borda)] bg-[var(--cor-fundo-alt)] px-2 py-1 text-[var(--cor-texto)]"
        >
          <option value="normal">Normal</option>
          <option value="grande">Grande</option>
          <option value="extra-grande">Extra grande</option>
        </select>
      </label>
    </fieldset>
  )
}
