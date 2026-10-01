
import './dashboard.css'
import SidePanel from '../components/sidepanel'
import Header from '../components/header'

import Home from './sections/home'
import Users from './sections/users'
import Polls from './sections/polls'
import Categories from './sections/category'
import Guests from './sections/guests'
import Settings from './sections/settings'
import { useState } from 'react'

interface DashboardProps{
    setLogin: React.Dispatch<React.SetStateAction<boolean>>
}

function Dashboard({setLogin}:DashboardProps){
    const [activeSection, setActiveSection] = useState("home");
    
    return (
        <main className="dashboard">
            {/*sidebar */}
            <SidePanel setLogin={setLogin} activeSection={activeSection} setActiveSection={setActiveSection}/>

            {/*main area */}
            <div className="mainDiv">

               {/*main area */}
               <Header></Header>

               <section className="content">
                   {activeSection =="home" && <Home/>}
                   {activeSection =="users" && <Users/>}
                   {activeSection =="guests" && <Guests/>}
                   {activeSection =="polls" && <Polls/>}
                   {activeSection =="categories" && <Categories/>}
                   {activeSection =="settings" && <Settings/>}
               </section>

            </div>

        </main>
    );
}

export default Dashboard;