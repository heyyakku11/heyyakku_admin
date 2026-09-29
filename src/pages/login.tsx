import { useState } from 'react';
import './login.css'

interface LoginProps {
    setLogin: React.Dispatch<React.SetStateAction<boolean>>;
}


function Login({setLogin}:LoginProps){

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    
    function _loginAdmin(){
        
        //check if email is empty
        if(!email){
            alert('enter email')
            return
        }

        //check if password is empty
        if(!password){
            alert('enter password')
            return
        }


        setLogin(true);
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

        <button className="login-button" onClick={_loginAdmin}>
            Login
        </button>

    </div>
</div>
    );
}

export default Login;