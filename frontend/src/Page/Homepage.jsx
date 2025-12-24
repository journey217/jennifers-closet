import Navbar from "../Component/Navbar.jsx";
import Slideshow from "../Component/Slideshow.jsx";
import Footer from "../Component/Footer.jsx";
import WishlistGrid from "../Component/WishlistGrid.jsx";
import slide1 from "../assets/Website Slideshow.png"
import slide2 from "../assets/Website Slideshow (1).png"
import BodyText from "../Component/BodyText.jsx";
import {useEffect, useState, useRef} from "react";
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
    const [wishlist, setWishlist] = useState([])

    const aboutRef = useRef(null);
    const calendarRef = useRef(null);
    const donateRef = useRef(null);
    const volunteerRef = useRef(null);

    useEffect(() => {
        if (!isLoaded) {
            fetchData().then(r => setIsLoaded(true))
        }
    }, [isLoaded]);

    // Intersection Observer for scroll animations
    useEffect(() => {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        const elements = [aboutRef, calendarRef, donateRef, volunteerRef];
        elements.forEach(ref => {
            if (ref.current) {
                observer.observe(ref.current);
            }
        });

        return () => observer.disconnect();
    }, [isLoaded]);

    const fetchData = async () => {
         try {
            const response = await fetch(`${import.meta.env.VITE_API_PATH}/data`);
            const data = await response.json();

            if (data.success) {
                setAboutData(data.aboutData);
                setDonateData(data.donateData)
                setVolunteerData(data.volunteerData)
                setWishlist(data.wishlist || [])
            } else {
                console.error("Error fetching data:", data.message);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }



    return (
        <>
            <Navbar/>

            <div className={"homepage_container"}>
                {/* Slideshow */}
                <div className="fade-in">
                    <Slideshow images={images} interval={5000}/>
                </div>
            </div>

            {/* About Section - with background */}
            <div className="section-wrapper alternate">
                <div className="section-content">
                    <div ref={aboutRef} style={{opacity: 0}}>
                        <BodyText
                            bodyID={"about-us-title"}
                            bodyHeader={"About Us"}
                            bodyData={aboutData}
                        />
                    </div>
                </div>
            </div>

            {/* Calendar Section - no background */}
            <div className="section-wrapper">
                <div className="section-content">
                    <div ref={calendarRef} style={{opacity: 0}}>
                        <Calendar/>
                    </div>
                </div>
            </div>

            {/* Donate Section - with background */}
            <div className="section-wrapper alternate">
                <div className="section-content">
                    <div ref={donateRef} style={{opacity: 0}}>
                        <BodyText
                            bodyID={"donations-title"}
                            bodyHeader={"Donate"}
                            bodyData={donateData}
                        >
                            {/* Wishlist Grid - Directly visible */}
                            <WishlistGrid wishlist={wishlist} />
                        </BodyText>
                    </div>
                </div>
            </div>

            {/* Volunteer Section - no background */}
            <div className="section-wrapper">
                <div className="section-content">
                    <div ref={volunteerRef} style={{opacity: 0}}>
                        <BodyText
                            bodyID={"volunteering-title"}
                            bodyHeader={"Volunteer"}
                            bodyData={volunteerData}
                        />
                    </div>
                </div>
            </div>

            {/* Footer with Stop Sign, Contact Info, and Address */}
            <Footer />
        </>
    )
}

export default Homepage