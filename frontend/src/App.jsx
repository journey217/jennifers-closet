import { useState } from 'react'
import {BrowserRouter, Routes, Route, useLocation} from 'react-router-dom'
import './App.css'
import "./Styles/Homepage.css"
import "./Styles/Navbar.css"
import "./Styles/Slideshow.css"
import "./Styles/Sidenav.css"
import Homepage from "./Page/Homepage.jsx";
import Navbar from "./Component/Navbar.jsx";

function App() {
    const [count, setCount] = useState(0)

    return (
        <div className={"App"}>
            <BrowserRouter>
                 {/*<Navbar />*/}
                <Routes>
                    <Route element={<Homepage/>} path={"/"}/>
                </Routes>
            </BrowserRouter>
        </div>
    )
}

export default App
