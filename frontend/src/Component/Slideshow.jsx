import React, { useState, useEffect } from "react";

const Slideshow = ({ images, interval = 3000 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, interval);

    return () => clearInterval(timer); // Cleanup on unmount
  }, [images.length, interval]);

  return (
    <div className={"slideshow_container"}>
      {images.map((image, index) => (
        <img
            className={"slideshow_image"}
          key={index}
          src={image}
          alt={`Slide ${index + 1}`}
          style={{
            display: index === currentIndex ? "block" : "none",
          }}
        />
      ))}
    </div>
  );
};

export default Slideshow;
