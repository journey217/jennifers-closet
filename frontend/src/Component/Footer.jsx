import React from 'react';
import StopSign from './StopSign.jsx';
import { FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import '../Styles/Footer.css';

const Footer = () => {
    return (
        <footer id="contact-us" className="footer">
            <div className="footer-content">
                {/* Stop Sign Section */}
                <div className="footer-section footer-notice">
                    <StopSign 
                        message="Please do not disturb the church office"
                        subtext="Thank You"
                    />
                </div>

                {/* Contact Information */}
                <div className="footer-section footer-contact">
                    <h3 className="footer-heading">Contact Us</h3>
                    
                    <div className="footer-contact-item">
                        <FaMapMarkerAlt className="footer-icon" />
                        <div className="footer-contact-text">
                            <strong>Location</strong>
                            <p>3000 Dewey Ave<br/>Rochester, NY 14616</p>
                        </div>
                    </div>

                    <div className="footer-contact-item">
                        <FaEnvelope className="footer-icon" />
                        <div className="footer-contact-text">
                            <strong>Email</strong>
                            <a href="mailto:lwclement68@gmail.com" className="footer-email-link">
                                lwclement68@gmail.com
                            </a>
                        </div>
                    </div>

                    <a href="mailto:lwclement68@gmail.com" className="footer-button-link">
                        <button className="footer-button">
                            <FaEnvelope style={{display: 'inline', marginRight: '0.5rem'}} />
                            Email Us
                        </button>
                    </a>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} Jennifer's Closet. All rights reserved.</p>
                <p className="footer-tagline">Serving families in need with dignity and compassion</p>
            </div>
        </footer>
    );
};

export default Footer;
