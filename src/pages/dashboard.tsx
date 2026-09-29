
import './dashboard.css'
import SidePanel from '../components/sidepanel'
import Header from '../components/header'

import Home from './sections/home'
import Users from './sections/users'
import Polls from './sections/polls'
import Settings from './sections/settings'
import { useState } from 'react'

function Dashboard(){
    const [activeSection, setActiveSection] = useState("home");
    
    return (
        <main className="dashboard">
            {/*sidebar */}
            <SidePanel activeSection={activeSection} setActiveSection={setActiveSection}/>

            {/*main area */}
            <div className="mainDiv">

               {/*main area */}
               <Header></Header>

               <section className="content">
                   {activeSection =="home" && <Home/>}
                   {activeSection =="users" && <Users/>}
                   {activeSection =="polls" && <Polls/>}
                   {activeSection =="settings" && <Settings/>}
               </section>

            </div>

        </main>
    );
}

export default Dashboard;