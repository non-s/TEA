import { HashRouter, Route, Routes } from 'react-router-dom'
import { Home } from './routes/Home'
import { Trilha } from './routes/crianca/Trilha'
import { Atividade } from './routes/crianca/Atividade'

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/crianca/trilha" element={<Trilha />} />
        <Route path="/crianca/atividade/:atividadeId" element={<Atividade />} />
      </Routes>
    </HashRouter>
  )
}

export default App
