

const Calendar = () => {
    return (
        <div id={"events-title"} className={"calendar_container"}>
            <iframe
                src="https://calendar.google.com/calendar/embed?src=jennifersclosetny%40gmail.com&ctz=America%2FNew_York&amp;mode=MONTH"
                width="100%" height="600"></iframe>
        </div>
    )
};

export default Calendar;