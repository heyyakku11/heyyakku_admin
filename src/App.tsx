import './App.css'
import { useState } from 'react'
import Dashboard from './pages/dashboard'
import Login from './pages/login'

function App() {
  const [isAdminLogin, setLogin] = useState(false);


  return (
    <>
      {isAdminLogin? <Dashboard setLogin={setLogin}/> : <Login setLogin={setLogin} />}
    </>
  )
}

export default App
