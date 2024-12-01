import Navbar from "../Component/Navbar.jsx";
import Slideshow from "../Component/Slideshow.jsx";
import slide1 from "../assets/Website Slideshow.png"
import slide2 from "../assets/Website Slideshow (1).png"
import stop from "../assets/stop.png"
import BodyText from "../Component/BodyText.jsx";
import {useEffect, useState} from "react";
import Calendar from "../Component/Calendar.jsx";

const images = [
    slide1,
    slide2
]

const Homepage = () => {
    const [isLoaded, setIsLoaded] = useState(false)
    const [aboutData, setAboutData]= useState("")
    const [donateData, setDonateData] = useState("")
    const [volunteerData, setVolunteerData] = useState("")

    useEffect(() => {

        if (!isLoaded) {
            fetchData().then(r => setIsLoaded(true))
        }

    }, [isLoaded]);

    const fetchData = async () => {
         try {
            const response = await fetch(`${import.meta.env.VITE_API_PATH}/data`); // Update to the correct endpoint
            const data = await response.json();

            if (data.success) {
                setAboutData(data.aboutData);
                setDonateData(data.donateData)
                setVolunteerData(data.volunteerData)
            } else {
                console.error("Error fetching data:", data.message);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }


    return (
        <div className={"homepage_container"}>
            <Navbar/>
            <Slideshow images={images} interval={5000}/>
            <BodyText bodyID={"about-us-title"} bodyHeader={"About Us"} bodyData={aboutData}/>
            <Calendar/>
            <BodyText bodyID={"donations-title"} bodyHeader={"Donate"} bodyData={donateData}/>
            <BodyText bodyID={"volunteering-title"} bodyHeader={"Volunteer"} bodyData={volunteerData}/>
            <div className={"homepage_button_container"}>
                <a href={"mailto:jennifersclosetny@gmail.com"} className={"homepage_button delius-regular"}>Email Us:
                    JennifersClosetNY@gmail.com</a>
            </div>
            <div id="disclaimer">
                <img src={stop} alt="Please do not disturb the church office." width="150" height="151"/>
            </div>
        </div>
    )
}

export default Homepage