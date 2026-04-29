import GamePage from './pages/GamePage'
import StartMenu from './pages/StartMenu'
import { useGameStore } from './store/gameStore'


function App() {
  const started = useGameStore((state) => state.started)

  return(
    <div className='app-shell'>
      {!started && <StartMenu />}
      {started && <GamePage />}
    </div>

  )
}

export default App
