import "../Styles/WishlistCard.css";

const WishlistCard = ({ item, priority = "normal" }) => {
    return (
        <div className={`wishlist-card ${priority === "urgent" ? "urgent" : ""}`}>
            {priority === "urgent" && (
                <div className="priority-badge">
                    Urgent Need
                </div>
            )}
            <div className="wishlist-card-content">
                <p className="wishlist-card-text">{item}</p>
            </div>
        </div>
    );
};

export default WishlistCard;
