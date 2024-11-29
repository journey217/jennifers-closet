import React, { useState } from "react";
import { IoMenu } from "react-icons/io5";
import { IoCloseOutline } from "react-icons/io5";
import {useNavigate} from "react-router-dom";

const DropdownMenu = () => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const handleClick = (page) => {
        setIsOpen(false)
        navigate(page)
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
                    <ul className={"dropdown-menu delius-regular"}>
                        <li onClick={e => handleClick("#about-us-title")}>ABOUT</li>
                        <li onClick={e => handleClick("#events-title")}>EVENTS</li>
                        <li onClick={e => handleClick("#donations-title")}>DONATE</li>
                        <li onClick={e => handleClick("#volunteering-title")}>VOLUNTEER</li>
                        <li onClick={e => handleClick("#contact-us")}>CONTACT</li>
                    </ul>
                )}
            </div>
        </div>

    );
};

export default DropdownMenu;
