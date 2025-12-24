import React from 'react';
import '../Styles/StopSign.css';

const StopSign = ({ message = "Please do not disturb the church office", subtext = "Thank You" }) => {
    return (
        <div className="stop-sign-container">
            <div className="stop-sign">
                <div className="stop-sign-inner">
                    <div className="stop-sign-text">
                        {message}
                    </div>
                    {subtext && <div className="stop-sign-subtext">{subtext}</div>}
                </div>
            </div>
        </div>
    );
};

export default StopSign;
