import { lazy, Suspense } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import { PreferenciasProvider } from './contexts/PreferenciasContext'
import { AuthProvider } from './contexts/AuthContext'
import { PerfilAtivoProvider } from './contexts/PerfilAtivoContext'
import { RequireAuth } from './routes/RequireAuth'
import { RequirePerfilAtivo } from './routes/RequirePerfilAtivo'
import { Home } from './routes/Home'

const Login = lazy(() =>
  import('./routes/responsavel/Login').then((m) => ({ default: m.Login })),
)
const Cadastro = lazy(() =>
  import('./routes/responsavel/Cadastro').then((m) => ({
    default: m.Cadastro,
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

function App() {
  return (
    <PreferenciasProvider>
      <AuthProvider>
        <PerfilAtivoProvider>
          <HashRouter>
            <Suspense fallback={<CarregandoPagina />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/entrar" element={<Login />} />
                <Route path="/cadastro" element={<Cadastro />} />

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
              </Routes>
            </Suspense>
          </HashRouter>
        </PerfilAtivoProvider>
      </AuthProvider>
    </PreferenciasProvider>
  )
}

export default App
