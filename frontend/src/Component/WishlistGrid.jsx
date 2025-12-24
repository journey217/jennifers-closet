import "../Styles/WishlistGrid.css";
import WishlistCard from "./WishlistCard";
import { FaGift } from 'react-icons/fa';

const WishlistGrid = ({ wishlist = [] }) => {
    if (wishlist.length === 0) {
        return (
            <div className="wishlist-empty-state">
                <div className="empty-state-icon">❤️</div>
                <h3 className="empty-state-title">Our Wishlist is Full!</h3>
                <p className="empty-state-text">
                    Thank you for your generosity. We currently have everything we need.
                    Please check back later or contact us for other ways to help.
                </p>
            </div>
        );
    }

    return (
        <div className="wishlist-section">
            <h3 className="wishlist-section-title">
                <FaGift className="wishlist-title-icon" />
                Current Needs
            </h3>
            <p className="wishlist-section-subtitle">
                These items are currently in high demand and would make a significant impact
            </p>
            <div className="wishlist-grid">
                {wishlist.map((item) => (
                    <WishlistCard 
                        key={item.id} 
                        item={item.item}
                        priority={item.priority || "normal"}
                    />
                ))}
            </div>
        </div>
    );
};

export default WishlistGrid;
