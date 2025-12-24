import React, { useState } from "react";
import { IoMenu } from "react-icons/io5";
import { IoCloseOutline } from "react-icons/io5";
import { FiSun, FiMoon } from "react-icons/fi";
import { useTheme } from "./ThemeContext.jsx";

const DropdownMenu = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { isDark, toggleTheme } = useTheme();
    
    const scrollToSection = (sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) {
            const offset = 100; // Offset for sticky navbar
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    }

    const handleClick = (sectionId) => {
        setIsOpen(false)
        scrollToSection(sectionId)
    }

    const handleThemeToggle = () => {
        toggleTheme();
    }

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className={"sidenav_container"}>
            <div className="dropdown-container">
                <button onClick={toggleMenu} className="dropdown-toggle">
                    {isOpen ? <IoCloseOutline /> : <IoMenu />}
                </button>
                {isOpen && (
                    <ul className={"dropdown-menu"}>
                        <li onClick={e => handleClick("about-us-title")}>ABOUT</li>
                        <li onClick={e => handleClick("events-title")}>EVENTS</li>
                        <li onClick={e => handleClick("donations-title")}>DONATE</li>
                        <li onClick={e => handleClick("volunteering-title")}>VOLUNTEER</li>
                        <li onClick={e => handleClick("contact-us")}>CONTACT</li>
                        <li className="sidenav_theme_toggle" onClick={handleThemeToggle}>
                            {isDark ? (
                                <>
                                    <FiSun size={18} /> Light Mode
                                </>
                            ) : (
                                <>
                                    <FiMoon size={18} /> Dark Mode
                                </>
                            )}
                        </li>
                    </ul>
                )}
            </div>
        </div>

    );
};

export default DropdownMenu;
