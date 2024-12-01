import {useState} from "react";

const BodyText = ( { bodyID, bodyHeader, bodyData } ) => {

    return (
        <div id={bodyID}>
            <div className={"body_text_container"}>
                <h2 className={"body_text_header cookie-regular"}>{bodyHeader}</h2>
                <div className={"body_text_content delius-regular"} dangerouslySetInnerHTML={{__html: bodyData}} />
                {bodyHeader === "Donate" &&
                    <div className={"body_text_button_container"}>
                        <button className={"body_text_button delius-regular"}>View Donation List</button>
                    </div>
                }
            </div>
        </div>
    )
}

export default BodyText