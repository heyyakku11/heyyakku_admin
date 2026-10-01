import { useState } from 'react';
import './login.css'

import { adminLogin } from '../services/authService';
import type { LoginRequest } from '../types/auth';

interface LoginProps {
    setLogin: React.Dispatch<React.SetStateAction<boolean>>;
}


function Login({setLogin}:LoginProps){

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    
    async function _loginAdmin() {

    if (!email) {
        alert("Enter email");
        return;
    }

    if (!password) {
        alert("Enter password");
        return;
    }

    const request: LoginRequest = {
        email,
        password
    };

   try {
    setLoading(true);

    const response = await adminLogin(request);

    if (response.success) {

        if (!response.data) {
            throw new Error("Login succeeded but no login data was returned.");
        }

        localStorage.setItem("accessToken", response.data.accessToken);
        localStorage.setItem("refreshToken", response.data.refreshToken);

        setLogin(true);

    } else {
        alert(response.message);
    }

} catch (ex) {
    if (ex instanceof Error) {
        alert(ex.message);
    } else {
        alert("Something went wrong");
    }
} finally {
    setEmail("");
    setPassword("");
    setLoading(false);
}
}

    return(
       <div className="login-container">
    <div className="login-form">

        <h2>Sign in to Yakku</h2>
        <p className="login-subtitle">
            Enter your registered email and password
        </p>

        <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
            />
        </div>

        <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
            />
        </div>

        <button className="login-button" onClick={_loginAdmin} disabled={loading}>
            {loading? "Logging in" : "Login"}
        </button>

    </div>
</div>
    );
}

export default Login;