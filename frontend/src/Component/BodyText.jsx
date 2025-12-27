const BodyText = ( { bodyID, bodyHeader, bodyData, children, hoursData, hasSlideshow = false } ) => {
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
                        {/* Hours Section */}
                        {hoursData && (
                            <div className="hours-container">
                                <div className="hours-content" dangerouslySetInnerHTML={{__html: hoursData}} />
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        <h2 className={"body_text_header"}>{bodyHeader}</h2>
                        <div className={"body_text_content"} dangerouslySetInnerHTML={{__html: bodyData}} />
                        {children}
                        {/* Hours Section */}
                        {hoursData && (
                            <div className="hours-container">
                                <div className="hours-content" dangerouslySetInnerHTML={{__html: hoursData}} />
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}

export default BodyText
