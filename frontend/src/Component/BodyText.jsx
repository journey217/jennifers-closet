import {useState} from "react";

const BodyText = ( { bodyID, bodyHeader, bodyData } ) => {

    return (
        <div id={bodyID}>
            <div className={"body_text_container"}>
                <h2 className={"body_text_header"}>{bodyHeader}</h2>
                <div className={"body_text_content"} dangerouslySetInnerHTML={{__html: bodyData}} />
            </div>
        </div>
    )
}

export default BodyText
