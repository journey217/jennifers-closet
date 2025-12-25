import { useState } from 'react'
import {BrowserRouter, Routes, Route, useLocation} from 'react-router-dom'
import './App.css'
import "./Styles/Homepage.css"
import "./Styles/Navbar.css"
import "./Styles/Slideshow.css"
import "./Styles/Sidenav.css"
import "./Styles/BodyText.css"
import "./Styles/Calendar.css"
import "./Styles/Dashboard.css"
import Homepage from "./Page/Homepage.jsx";
import Dashboard from "./Page/Dashboard.jsx";
import { ThemeProvider } from "./Component/ThemeContext.jsx";

function App() {

    return (
        <ThemeProvider>
            <div className={"App"}>
                <BrowserRouter>
                    <Routes>
                        <Route element={<Homepage/>} path={"/"}/>
                        <Route element={<Dashboard/>} path={"/dashboard"}/>
                    </Routes>
                </BrowserRouter>
            </div>
        </ThemeProvider>
    )
}

export default App
