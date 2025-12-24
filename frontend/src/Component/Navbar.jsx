import {useNavigate} from "react-router-dom";
import Sidenav from "./Sidenav.jsx";
import { useTheme } from "./ThemeContext.jsx";
import { FiSun, FiMoon } from "react-icons/fi";

const Navbar = () => {
    const navigate = useNavigate()
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

    return (
        <div className={"navbar_container"}>
            <div className={"navbar_content"}>
                <div className={"navbar_site_title_container"}>
                    <h1 onClick={e => navigate("/")} className={"site_title"}>
                        Jennifer's Closet
                    </h1>
                </div>
                <Sidenav/>
                <div className={"navbar_menu_list"}>
                    <div onClick={e => scrollToSection('about-us-title')} className={"navbar_menu_list_item"}>
                        ABOUT
                    </div>
                    <div onClick={e => scrollToSection("events-title")} className={"navbar_menu_list_item"}>
                        EVENTS
                    </div>
                    <div onClick={e => scrollToSection("donations-title")} className={"navbar_menu_list_item"}>
                        DONATE
                    </div>
                    <div onClick={e => scrollToSection("volunteering-title")} className={"navbar_menu_list_item"}>
                        VOLUNTEER
                    </div>
                    <div onClick={e => scrollToSection("contact-us")} className={"navbar_menu_list_item"}>
                        CONTACT
                    </div>
                    <button 
                        onClick={toggleTheme} 
                        className={"navbar_theme_toggle"}
                        aria-label="Toggle dark mode"
                    >
                        {isDark ? <FiSun size={20} /> : <FiMoon size={20} />}
                    </button>
                </div>
            </div>
        </div>
    )
};

export default Navbar;
