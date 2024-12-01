import {useNavigate} from "react-router-dom";
import Sidenav from "./Sidenav.jsx";



const Navbar = () => {
    const navigate = useNavigate()
    const goToHash = (location) => window.location.assign(location)

    return (
        <div className={"navbar_container"}>
            <div className={"navbar_content"}>
                <div className={"navbar_site_title_container"}>
                    <h1 onClick={e => navigate("/")} className={"site_title cookie-regular"}>
                        Jennifer's Closet
                    </h1>
                </div>
                <Sidenav/>
                <div className={"navbar_menu_list delius-regular"}>
                    <div onClick={e => goToHash('#about-us-title')} className={"navbar_menu_list_item"}>ABOUT</div>
                    <div onClick={e => goToHash("#events-title")} className={"navbar_menu_list_item"}>EVENTS</div>
                    <div onClick={e => goToHash("#donations-title")} className={"navbar_menu_list_item"}>DONATE</div>
                    <div onClick={e => goToHash("#volunteering-title")} className={"navbar_menu_list_item"}>VOLUNTEER</div>
                    <div onClick={e => goToHash("#contact-us")} className={"navbar_menu_list_item"}>CONTACT</div>
                </div>
            </div>
        </div>
    )
};

export default Navbar;