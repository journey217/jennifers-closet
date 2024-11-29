import Navbar from "../Component/Navbar.jsx";
import Slideshow from "../Component/Slideshow.jsx";
import slide1 from "../assets/Website Slideshow.png"
import slide2 from "../assets/Website Slideshow (1).png"
import Sidenav from "../Component/Sidenav.jsx";

const images = [
    slide1,
    slide2
]

const Homepage = () => {



    return (
        <div className={"homepage_container"}>
            <Navbar/>
            <Slideshow images={images} interval={5000} />
        </div>
    )
}

export default Homepage