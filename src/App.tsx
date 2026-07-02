import { HashRouter, Route, Routes } from 'react-router-dom'
import { PreferenciasProvider } from './contexts/PreferenciasContext'
import { AuthProvider } from './contexts/AuthContext'
import { PerfilAtivoProvider } from './contexts/PerfilAtivoContext'
import { RequireAuth } from './routes/RequireAuth'
import { RequirePerfilAtivo } from './routes/RequirePerfilAtivo'
import { Home } from './routes/Home'
import { Login } from './routes/responsavel/Login'
import { Cadastro } from './routes/responsavel/Cadastro'
import { SelecaoPerfil } from './routes/responsavel/SelecaoPerfil'
import { GerenciarPerfis } from './routes/responsavel/GerenciarPerfis'
import { Configuracoes } from './routes/responsavel/Configuracoes'
import { Progresso } from './routes/responsavel/Progresso'
import { Trilha } from './routes/crianca/Trilha'
import { Atividade } from './routes/crianca/Atividade'

function App() {
  return (
    <PreferenciasProvider>
      <AuthProvider>
        <PerfilAtivoProvider>
          <HashRouter>
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
          </HashRouter>
        </PerfilAtivoProvider>
      </AuthProvider>
    </PreferenciasProvider>
  )
}

export default App
