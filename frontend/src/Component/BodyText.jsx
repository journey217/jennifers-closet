import {useState} from "react";

const BodyText = ( { bodyID, bodyHeader, bodyData, children } ) => {
    // Check if children contains a Slideshow component
    const hasSlideshow = children && children.type && children.type.name === 'Slideshow';

    return (
        <div id={bodyID}>
            <div className={"body_text_container"}>
                {hasSlideshow ? (
                    <>
                        <h2 className={"body_text_header"}>{bodyHeader}</h2>
                        <div className="body_text_with_slideshow">
                            <div className={"body_text_content"} dangerouslySetInnerHTML={{__html: bodyData}} />
                            <div className="body_text_slideshow">
                                {children}
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <h2 className={"body_text_header"}>{bodyHeader}</h2>
                        <div className={"body_text_content"} dangerouslySetInnerHTML={{__html: bodyData}} />
                        {children}
                    </>
                )}
            </div>
        </div>
    )
}

export default BodyText