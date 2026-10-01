import './App.css';
import { useState } from 'react';
import Dashboard from './pages/dashboard';
import Login from './pages/login';

function App() {

    const [isAdminLogin, setLogin] = useState(() => {
        const accessToken = localStorage.getItem("accessToken");

        return !!accessToken;
    });

    return (
        <>
            {isAdminLogin
                ? <Dashboard setLogin={setLogin} />
                : <Login setLogin={setLogin} />
            }
        </>
    );
}

export default App;