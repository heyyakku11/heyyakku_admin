import './header.css'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faSun, faMoon} from "@fortawesome/free-solid-svg-icons";
import { useState } from 'react';


function Header(){
        const [theme, setTheme] = useState('light');

        function _changeTheme(){
            if(theme=='light'){
               setTheme('dark')
            }else{
                 setTheme('light')
            }
        }

    return(
       <header className="header">
        <div className="avatar-buttons">

    <button className="avatar-button" onClick={_changeTheme}>
        <FontAwesomeIcon icon={theme=='light'? faSun:faMoon}></FontAwesomeIcon>
    </button>

    <button className="avatar-button">
        <FontAwesomeIcon icon={faBell}></FontAwesomeIcon>
    </button>

    <button className="avatar-button profile-button">
        <img
            src="https://cdn.pixabay.com/photo/2018/04/13/21/24/lion-3317670_640.jpg"
            alt="Profile"
        />
    </button>

</div>
       </header>
    );
}

export default Header;