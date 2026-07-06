import { lazy, Suspense, useEffect, useState } from 'react'
import { HashRouter, Route, Routes, useLocation } from 'react-router-dom'
import { PreferenciasProvider } from './contexts/PreferenciasContext'
import { AuthProvider } from './contexts/AuthContext'
import { PerfilAtivoProvider } from './contexts/PerfilAtivoContext'
import { RequireAuth } from './routes/RequireAuth'
import { RequirePerfilAtivo } from './routes/RequirePerfilAtivo'
import { Home } from './routes/Home'
import { LimiteErro } from './components/ui/LimiteErro'
import { AvisoConexao } from './components/ui/AvisoConexao'

const Login = lazy(() =>
  import('./routes/responsavel/Login').then((m) => ({ default: m.Login })),
)
const Cadastro = lazy(() =>
  import('./routes/responsavel/Cadastro').then((m) => ({
    default: m.Cadastro,
  })),
)
const Demo = lazy(() =>
  import('./routes/Demo').then((m) => ({
    default: m.Demo,
  })),
)
const Privacidade = lazy(() =>
  import('./routes/Privacidade').then((m) => ({
    default: m.Privacidade,
  })),
)
const NaoEncontrada = lazy(() =>
  import('./routes/NaoEncontrada').then((m) => ({
    default: m.NaoEncontrada,
  })),
)
const SelecaoPerfil = lazy(() =>
  import('./routes/responsavel/SelecaoPerfil').then((m) => ({
    default: m.SelecaoPerfil,
  })),
)
const GerenciarPerfis = lazy(() =>
  import('./routes/responsavel/GerenciarPerfis').then((m) => ({
    default: m.GerenciarPerfis,
  })),
)
const Configuracoes = lazy(() =>
  import('./routes/responsavel/Configuracoes').then((m) => ({
    default: m.Configuracoes,
  })),
)
const Progresso = lazy(() =>
  import('./routes/responsavel/Progresso').then((m) => ({
    default: m.Progresso,
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
  if (pathname === '/entrar') return 'Entrar — TEA'
  if (pathname === '/cadastro') return 'Cadastro — TEA'
  if (pathname === '/demo') return 'Demonstração — TEA'
  if (pathname === '/privacidade') return 'Privacidade — TEA'
  if (pathname === '/responsavel/perfis') return 'Perfis — TEA'
  if (pathname === '/responsavel/perfis/gerenciar') {
    return 'Gerenciar perfis — TEA'
  }
  if (pathname === '/responsavel/configuracoes') return 'Configurações — TEA'
  if (pathname.startsWith('/responsavel/progresso/')) return 'Progresso — TEA'
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
              <Route path="/" element={<Home />} />
              <Route path="/entrar" element={<Login />} />
              <Route path="/cadastro" element={<Cadastro />} />
              <Route path="/demo" element={<Demo />} />
              <Route path="/privacidade" element={<Privacidade />} />

              <Route
                path="/responsavel/perfis"
                element={
                  <RequireAuth>
                    <SelecaoPerfil />
                  </RequireAuth>
                }
              />
              <Route
                path="/responsavel/perfis/gerenciar"
                element={
                  <RequireAuth>
                    <GerenciarPerfis />
                  </RequireAuth>
                }
              />
              <Route
                path="/responsavel/configuracoes"
                element={
                  <RequireAuth>
                    <Configuracoes />
                  </RequireAuth>
                }
              />
              <Route
                path="/responsavel/progresso/:perfilId"
                element={
                  <RequireAuth>
                    <Progresso />
                  </RequireAuth>
                }
              />

              <Route
                path="/crianca/trilha"
                element={
                  <RequireAuth>
                    <RequirePerfilAtivo>
                      <Trilha />
                    </RequirePerfilAtivo>
                  </RequireAuth>
                }
              />
              <Route
                path="/crianca/atividade/:atividadeId"
                element={
                  <RequireAuth>
                    <RequirePerfilAtivo>
                      <Atividade />
                    </RequirePerfilAtivo>
                  </RequireAuth>
                }
              />
              <Route
                path="/crianca/jardim"
                element={
                  <RequireAuth>
                    <RequirePerfilAtivo>
                      <Jardim />
                    </RequirePerfilAtivo>
                  </RequireAuth>
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
      <AuthProvider>
        <PerfilAtivoProvider>
          <HashRouter>
            <RotasApp />
          </HashRouter>
        </PerfilAtivoProvider>
      </AuthProvider>
    </PreferenciasProvider>
  )
}

export default App
