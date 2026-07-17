import { lazy, Suspense, useEffect, useState } from 'react'
import { HashRouter, Route, Routes, useLocation } from 'react-router-dom'
import { PreferenciasProvider } from './contexts/PreferenciasContext'
import { PerfilAtivoProvider } from './contexts/PerfilAtivoContext'
import { RequirePerfilAtivo } from './routes/RequirePerfilAtivo'
import { Entrada } from './routes/Entrada'
import { LimiteErro } from './components/ui/LimiteErro'
import { AvisoConexao } from './components/ui/AvisoConexao'

const Ajustes = lazy(() =>
  import('./routes/Ajustes').then((m) => ({ default: m.Ajustes })),
)
const Privacidade = lazy(() =>
  import('./routes/Privacidade').then((m) => ({
    default: m.Privacidade,
  })),
)
const Termos = lazy(() =>
  import('./routes/Termos').then((m) => ({
    default: m.Termos,
  })),
)
const NaoEncontrada = lazy(() =>
  import('./routes/NaoEncontrada').then((m) => ({
    default: m.NaoEncontrada,
  })),
)
const Trilha = lazy(() =>
  import('./routes/crianca/Trilha').then((m) => ({ default: m.Trilha })),
)
const Jardim = lazy(() =>
  import('./routes/crianca/Jardim').then((m) => ({ default: m.Jardim })),
)
const Atividade = lazy(() =>
  import('./routes/crianca/Atividade').then((m) => ({
    default: m.Atividade,
  })),
)

function CarregandoPagina() {
  return (
    <main className="flex min-h-svh items-center justify-center">
      <p className="text-[var(--cor-texto-suave)]">Carregando…</p>
    </main>
  )
}

function tituloDaRota(pathname: string): string {
  if (pathname === '/') return 'TEA — Alfabetização para crianças autistas'
  if (pathname === '/ajustes') return 'Ajustes — TEA'
  if (pathname === '/privacidade') return 'Privacidade — TEA'
  if (pathname === '/termos') return 'Termos de uso — TEA'
  if (pathname === '/crianca/trilha') return 'Trilha — TEA'
  if (pathname === '/crianca/jardim') return 'Meu jardim — TEA'
  if (pathname.startsWith('/crianca/atividade/')) return 'Atividade — TEA'
  return 'Página não encontrada — TEA'
}

function RotasApp() {
  const location = useLocation()
  const chaveReset = `${location.pathname}${location.search}${location.hash}`
  const [anuncioRota, setAnuncioRota] = useState(() =>
    tituloDaRota(location.pathname).replace(' — TEA', ''),
  )

  useEffect(() => {
    const titulo = tituloDaRota(location.pathname)
    document.title = titulo
    setAnuncioRota(titulo.replace(' — TEA', ''))
  }, [location.pathname])

  return (
    <>
      <a className="skip-link" href="#conteudo-principal">
        Pular para o conteúdo
      </a>
      <output aria-atomic="true" aria-live="polite" className="sr-only">
        {anuncioRota}
      </output>
      <div id="conteudo-principal" tabIndex={-1}>
        <LimiteErro chaveReset={chaveReset}>
          <Suspense fallback={<CarregandoPagina />}>
            <Routes>
              <Route path="/" element={<Entrada />} />
              <Route path="/ajustes" element={<Ajustes />} />
              <Route path="/privacidade" element={<Privacidade />} />
              <Route path="/termos" element={<Termos />} />

              <Route
                path="/crianca/trilha"
                element={
                  <RequirePerfilAtivo>
                    <Trilha />
                  </RequirePerfilAtivo>
                }
              />
              <Route
                path="/crianca/atividade/:atividadeId"
                element={
                  <RequirePerfilAtivo>
                    <Atividade />
                  </RequirePerfilAtivo>
                }
              />
              <Route
                path="/crianca/jardim"
                element={
                  <RequirePerfilAtivo>
                    <Jardim />
                  </RequirePerfilAtivo>
                }
              />
              <Route path="*" element={<NaoEncontrada />} />
            </Routes>
          </Suspense>
        </LimiteErro>
      </div>
      <AvisoConexao />
    </>
  )
}

function App() {
  return (
    <PreferenciasProvider>
      <PerfilAtivoProvider>
        <HashRouter>
          <RotasApp />
        </HashRouter>
      </PerfilAtivoProvider>
    </PreferenciasProvider>
  )
}

export default App
