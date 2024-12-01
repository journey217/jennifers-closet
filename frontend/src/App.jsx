import { useState } from 'react'
import {BrowserRouter, Routes, Route, useLocation} from 'react-router-dom'
import './App.css'
import "./Styles/Homepage.css"
import "./Styles/Navbar.css"
import "./Styles/Slideshow.css"
import "./Styles/Sidenav.css"
import "./Styles/BodyText.css"
import "./Styles/Calendar.css"
import Homepage from "./Page/Homepage.jsx";

function App() {

    return (
        <div className={"App"}>
            <BrowserRouter>
                <Routes>
                    <Route element={<Homepage/>} path={"/"}/>
                </Routes>
            </BrowserRouter>
        </div>
    )
}

export default App
