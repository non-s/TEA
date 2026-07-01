import { HashRouter, Route, Routes } from 'react-router-dom'
import { PreferenciasProvider } from './contexts/PreferenciasContext'
import { Home } from './routes/Home'
import { Trilha } from './routes/crianca/Trilha'
import { Atividade } from './routes/crianca/Atividade'

function App() {
  return (
    <PreferenciasProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/crianca/trilha" element={<Trilha />} />
          <Route
            path="/crianca/atividade/:atividadeId"
            element={<Atividade />}
          />
        </Routes>
      </HashRouter>
    </PreferenciasProvider>
  )
}

export default App
