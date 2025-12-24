import Navbar from "../Component/Navbar.jsx";
import Slideshow from "../Component/Slideshow.jsx";
import Modal from "../Component/Modal.jsx";
import Footer from "../Component/Footer.jsx";
import slide1 from "../assets/Website Slideshow.png"
import slide2 from "../assets/Website Slideshow (1).png"
import {useEffect, useState, useRef} from "react";
import { FaHandHoldingHeart } from 'react-icons/fa';

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
    const [isModalOpen, setIsModalOpen] = useState(false)

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

    const openModal = () => {
        setIsModalOpen(true)
    }

    const closeModal = () => {
        setIsModalOpen(false)
    }

    return (
        <>
            <Navbar/>

            {/* Hero Section with Slideshow */}
            <div className="hero-section">
                <div className="hero-slideshow">
                    <Slideshow images={images} interval={5000}/>
                    <div className="hero-overlay">
                        <h1 className="hero-title">Welcome to Jennifer's Closet</h1>
                        <p className="hero-subtitle">Supporting our community with dignity and compassion</p>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="content-container">

                {/* Two Column: About & Calendar */}
                <div className="grid-two-col">
                    <div ref={aboutRef} className="content-card fade-section" style={{opacity: 0}}>
                        <div className="card-header">
                            <h2 className="section-title">About Us</h2>
                        </div>
                        <div className="card-body" dangerouslySetInnerHTML={{__html: aboutData}} />
                    </div>

                    <div ref={calendarRef} className="content-card calendar-card fade-section" style={{opacity: 0}}>
                        <div className="card-header">
                            <h2 className="section-title">Upcoming Events</h2>
                        </div>
                        <div className="card-body calendar-wrapper">
                            <iframe
                                src="https://calendar.google.com/calendar/embed?src=jennifersclosetny%40gmail.com&ctz=America%2FNew_York&amp;mode=AGENDA&amp;showTitle=0&amp;showNav=0&amp;showPrint=0&amp;showCalendars=0"
                                className="calendar-iframe"
                            ></iframe>
                        </div>
                    </div>
                </div>

                {/* Two Column: Donate & Volunteer Cards */}
                <div className="grid-two-col">
                    <div ref={donateRef} className="action-card donate-card fade-section" style={{opacity: 0}}>
                        <div className="action-card-header">
                            <FaHandHoldingHeart className="action-icon" />
                            <h2 className="action-title">Donate</h2>
                        </div>
                        <div className="action-card-body" dangerouslySetInnerHTML={{__html: donateData}} />
                        <div className="action-card-footer">
                            <button onClick={openModal} className="action-button">
                                View Donation Wishlist
                            </button>
                        </div>
                    </div>

                    <div ref={volunteerRef} className="action-card volunteer-card fade-section" style={{opacity: 0}}>
                        <div className="action-card-header">
                            <svg className="action-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                            <h2 className="action-title">Volunteer</h2>
                        </div>
                        <div className="action-card-body" dangerouslySetInnerHTML={{__html: volunteerData}} />
                        <div className="action-card-footer">
                            <a href="mailto:jennifersclosetny@gmail.com" className="action-button">
                                Get Involved
                            </a>
                        </div>
                    </div>
                </div>

            </div>

            {/* Footer */}
            <Footer />

            {/* Wishlist Modal */}
            <Modal isOpen={isModalOpen} onClose={closeModal} title="Donation Wishlist">
                <div className="wishlist-container">
                    {wishlist.length > 0 ? (
                        wishlist.map((item) => (
                            <div key={item.id} className="wishlist-item">
                                {item.item}
                            </div>
                        ))
                    ) : (
                        <div className="wishlist-empty">
                            No items on the wishlist at this time.
                        </div>
                    )}
                </div>
            </Modal>
        </>
    )
}

export default Homepage