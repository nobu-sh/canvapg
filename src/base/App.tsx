import { Main } from '@/pages/Main'
import { RecoilRoot } from 'recoil'
import './App.scss'

function App() {
  return (
    <div className="App">
      <RecoilRoot>
        <Main />
      </RecoilRoot>
    </div>
  )
}

export default App

