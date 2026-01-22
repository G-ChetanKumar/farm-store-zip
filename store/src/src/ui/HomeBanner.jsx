// // import React, { useState, useEffect } from "react";
// // import { homeBanner, homeBanner2, homeBanner3, homeBanner4, homeBanner5, homeBanner6 } from "../assets";
// // import Navbar from "./Header";

// // const images = [homeBanner, homeBanner2, homeBanner3, homeBanner4, homeBanner5, homeBanner6];

// // const HomeBanner = () => {
// //   const [currentImageIndex, setCurrentImageIndex] = useState(0);

// //   useEffect(() => {
// //     const interval = setInterval(() => {
// //       setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
// //     }, 3000);
// //     return () => clearInterval(interval);
// //   }, []);

// //   const goToNextImage = () => {
// //     setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
// //   };

// //   const goToPreviousImage = () => {
// //     setCurrentImageIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
// //   };

// //   return (
// //     <>
// //       <Navbar/>
// //       <div className="relative w-screen h-auto overflow-hidden">
// //         {/* Carousel Image */}
// //         <div className="relative w-full">
// //           <img
// //             src={images[currentImageIndex]}
// //             alt={`Banner ${currentImageIndex + 1}`}
// //             className="w-full h-auto max-h-screen object-cover object-center transition-opacity duration-700 ease-in-out"
// //           />
// //           <div className="absolute top-0 left-0 w-full h-full bg-black/10" />
// //         </div>

// //         {/* Navigation Buttons */}
// //         <button
// //           className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition z-10"
// //           onClick={goToPreviousImage}
// //         >
// //           &#10094;
// //         </button>
// //         <button
// //           className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition z-10"
// //           onClick={goToNextImage}
// //         >
// //           &#10095;
// //         </button>

// //         {/* Dots for Navigation */}
// //         <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
// //           {images.map((_, index) => (
// //             <button
// //               key={index}
// //               onClick={() => setCurrentImageIndex(index)}
// //               className={`w-2 h-2 rounded-full ${
// //                 index === currentImageIndex ? "bg-white" : "bg-gray-400"
// //               } hover:bg-white transition`}
// //             ></button>
// //           ))}
// //         </div>
// //       </div>
// //     </>
// //   );
// // };

// // export default HomeBanner;

// import React, { useState, useEffect } from "react";
// import { homeBanner, homeBanner2, homeBanner3, homeBanner4, homeBanner5, homeBanner6 } from "../assets";
// import Container from "./Container";
// import Navbar from "./Header";

// const images = [homeBanner, homeBanner2, homeBanner3, homeBanner4, homeBanner5, homeBanner6];

// const HomeBanner = () => {
//   const [currentImageIndex, setCurrentImageIndex] = useState(0);

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
//     }, 3000);
//     return () => clearInterval(interval);
//   }, []);

//   const goToNextImage = () => {
//     setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
//   };

//   const goToPreviousImage = () => {
//     setCurrentImageIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
//   };

//   return (
//     <>
//     <Navbar/>
//     <Container className="relative py-0 overflow-hidden">
//       {/* Carousel Image */}
//       <div className="relative w-full">
//         {/* Mobile view (16:9 aspect ratio) */}
//         <div className="md:hidden relative pb-[56.25%]">
//           <img
//             src={images[currentImageIndex]}
//             alt={`Banner ${currentImageIndex + 1}`}
//             className="absolute top-0 left-0 w-full h-full object-cover rounded-md transition-opacity duration-700 ease-in-out"
//           />
//         </div>
//         {/* Desktop view (fixed height) */}
//         <div className="hidden md:block">
//           <img
//             src={images[currentImageIndex]}
//             alt={`Banner ${currentImageIndex + 1}`}
//             className="w-full max-h-[500px] object-cover rounded-md transition-opacity duration-700 ease-in-out"
//           />
//         </div>
//         <div className="absolute top-0 left-0 w-full h-full bg-black/10" />
//       </div>

//       {/* Navigation Buttons */}
//       <button
//         className="absolute left-2 md:left-5 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition"
//         onClick={goToPreviousImage}
//       >
//         &#10094;
//       </button>
//       <button
//         className="absolute right-2 md:right-5 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition"
//         onClick={goToNextImage}
//       >
//         &#10095;
//       </button>

//       {/* Dots for Navigation */}
//       <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
//         {images.map((_, index) => (
//           <button
//             key={index}
//             onClick={() => setCurrentImageIndex(index)}
//             className={`w-2 h-2 rounded-full ${
//               index === currentImageIndex ? "bg-white" : "bg-gray-400"
//             } hover:bg-white transition`}
//           ></button>
//         ))}
//       </div>
//     </Container>
//     </>
//   );
// };

// export default HomeBanner;

// import React, { useState, useEffect } from "react";
// import { homeBanner, homeBanner2, homeBanner3, homeBanner4, homeBanner5, homeBanner6 } from "../assets";
// import Container from "./Container";
// import Navbar from "./Header";

// const slides = [
//   { image: homeBanner, link: "/products" },
//   { image: homeBanner2, link: "/products" },
//   { image: homeBanner3, link: "/products" },
//   { image: homeBanner4, link: "/products" },
//   { image: homeBanner5, link: "/products" },
//   { image: homeBanner6, link: "/products" },
// ];

// const HomeBanner = () => {
//   const [currentImageIndex, setCurrentImageIndex] = useState(0);

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setCurrentImageIndex(prevIndex => (prevIndex + 1) % slides.length);
//     }, 3000);
//     return () => clearInterval(interval);
//   }, []);

//   const goToNextImage = () => {
//     setCurrentImageIndex(prevIndex => (prevIndex + 1) % slides.length);
//   };

//   const goToPreviousImage = () => {
//     setCurrentImageIndex(prevIndex => (prevIndex - 1 + slides.length) % slides.length);
//   };

//   return (
//     <>
//       <Navbar />
//       <Container className="relative py-0 overflow-hidden">
//         {/* Carousel Image */}
//         <div className="relative w-full">
//           {/* Mobile view */}
//           <div className="md:hidden relative pb-[56.25%]">
//             <a href={slides[currentImageIndex].link}>
//               <img
//                 src={slides[currentImageIndex].image}
//                 alt={`Banner ${currentImageIndex + 1}`}
//                 className="absolute top-0 left-0 w-full h-full object-cover rounded-md transition-opacity duration-700 ease-in-out"
//               />
//             </a>
//           </div>
//           {/* Desktop view */}
//           <div className="hidden md:block">
//             <a href={slides[currentImageIndex].link}>
//               <img
//                 src={slides[currentImageIndex].image}
//                 alt={`Banner ${currentImageIndex + 1}`}
//                 className="w-full max-h-[500px] object-cover rounded-md transition-opacity duration-700 ease-in-out"
//               />
//             </a>
//           </div>
//           {/* Modified overlay with pointer-events-none */}
//           <div className="absolute top-0 left-0 w-full h-full bg-black/10 pointer-events-none" />
//         </div>

//         {/* Navigation Buttons */}
//         <button
//           className="absolute left-2 md:left-5 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition"
//           onClick={goToPreviousImage}
//         >
//           &#10094;
//         </button>
//         <button
//           className="absolute right-2 md:right-5 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition"
//           onClick={goToNextImage}
//         >
//           &#10095;
//         </button>

//         {/* Dots for Navigation */}
//         <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
//           {slides.map((_, index) => (
//             <button
//               key={index}
//               onClick={() => setCurrentImageIndex(index)}
//               className={`w-2 h-2 rounded-full ${
//                 index === currentImageIndex ? "bg-white" : "bg-gray-400"
//               } hover:bg-white transition`}
//             ></button>
//           ))}
//         </div>
//       </Container>
//     </>
//   );
// };

// export default HomeBanner;

// import React, { useState, useEffect } from "react";
// import { homeBanner, homeBanner2, homeBanner3, homeBanner4, homeBanner5, homeBanner6 } from "../assets";
// import Container from "./Container";
// import Navbar from "./Header";

// const slides = [
//   { image: homeBanner, link: "/products" },
//   { image: homeBanner2, link: "/products" },
//   { image: homeBanner3, link: "/products" },
//   { image: homeBanner4, link: "/products" },
//   { image: homeBanner5, link: "/products" },
//   { image: homeBanner6, link: "/products" },
// ];

// const HomeBanner = () => {
//   const [currentImageIndex, setCurrentImageIndex] = useState(0);

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setCurrentImageIndex(prevIndex => (prevIndex + 1) % slides.length);
//     }, 3000);
//     return () => clearInterval(interval);
//   }, []);

//   const goToNextImage = () => {
//     setCurrentImageIndex(prevIndex => (prevIndex + 1) % slides.length);
//   };

//   const goToPreviousImage = () => {
//     setCurrentImageIndex(prevIndex => (prevIndex - 1 + slides.length) % slides.length);
//   };

//   return (
//     <>
//       <Navbar />
//       <Container className="relative py-0 overflow-hidden">
//         {/* Carousel Image */}
//         <div className="relative w-full">
//           {/* Mobile view */}
//           <div className="md:hidden relative pb-[56.25%]">
//             <a href={slides[currentImageIndex].link}>
//               <img
//                 src={slides[currentImageIndex].image}
//                 alt={`Banner ${currentImageIndex + 1}`}
//                 className="absolute top-0 left-0 w-full h-full object-cover rounded-md transition-opacity duration-700 ease-in-out"
//               />
//             </a>
//           </div>
//           {/* Desktop view - optimized for all screen sizes */}
//           <div className="hidden md:block relative">
//             <a href={slides[currentImageIndex].link}>
//               <div className="w-full aspect-[21/9] max-w-screen-2xl mx-auto">
//                 <img
//                   src={slides[currentImageIndex].image}
//                   alt={`Banner ${currentImageIndex + 1}`}
//                   className="w-full h-full object-cover rounded-md transition-opacity duration-700 ease-in-out"
//                 />
//               </div>
//             </a>
//           </div>
//           {/* Modified overlay with pointer-events-none */}
//           <div className="absolute top-0 left-0 w-full h-full bg-black/10 pointer-events-none" />
//         </div>

//         {/* Navigation Buttons - Enhanced for better visibility on larger screens */}
//         <button
//           className="absolute left-2 md:left-5 lg:left-10 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 md:p-3 rounded-full hover:bg-black/70 transition"
//           onClick={goToPreviousImage}
//           aria-label="Previous slide"
//         >
//           &#10094;
//         </button>
//         <button
//           className="absolute right-2 md:right-5 lg:right-10 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 md:p-3 rounded-full hover:bg-black/70 transition"
//           onClick={goToNextImage}
//           aria-label="Next slide"
//         >
//           &#10095;
//         </button>

//         {/* Dots for Navigation - Enhanced for better visibility */}
//         <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-3">
//           {slides.map((_, index) => (
//             <button
//               key={index}
//               onClick={() => setCurrentImageIndex(index)}
//               className={`w-2 h-2 md:w-3 md:h-3 rounded-full ${
//                 index === currentImageIndex ? "bg-white" : "bg-gray-400"
//               } hover:bg-white transition`}
//               aria-label={`Go to slide ${index + 1}`}
//             ></button>
//           ))}
//         </div>
//       </Container>
//     </>
//   );
// };

// export default HomeBanner;

import React, { useState, useEffect } from "react";
import { homeBanner, homeBanner2, homeBanner3, homeBanner4, homeBanner5, homeBanner6 } from "../assets";
import Container from "./Container";
import Navbar from "./Header";

const slides = [
  { image: homeBanner, link: "/products" },
  { image: homeBanner2, link: "/products" },
  { image: homeBanner3, link: "/products" },
  { image: homeBanner4, link: "/products" },
  { image: homeBanner5, link: "/products" },
  { image: homeBanner6, link: "/products" },
];

const HomeBanner = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex(prevIndex => (prevIndex + 1) % slides.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const goToNextImage = () => {
    setCurrentImageIndex(prevIndex => (prevIndex + 1) % slides.length);
  };

  const goToPreviousImage = () => {
    setCurrentImageIndex(prevIndex => (prevIndex - 1 + slides.length) % slides.length);
  };

  return (
    <>
      <Navbar />
      <div className="relative w-full overflow-hidden">
        {/* Mobile view */}
        <div className="md:hidden relative pb-[56.25%]">
          <a href={slides[currentImageIndex].link}>
            <img
              src={slides[currentImageIndex].image}
              alt={`Banner ${currentImageIndex + 1}`}
              className="absolute top-0 left-0 w-full h-full object-cover rounded-md transition-opacity duration-700 ease-in-out"
            />
          </a>
        </div>
        
        {/* Desktop view - Optimized for all screen sizes */}
        <div className="hidden md:block relative h-[40vh] lg:h-[50vh] xl:h-[60vh] 2xl:h-[70vh]">
          <a href={slides[currentImageIndex].link}>
            <img
              src={slides[currentImageIndex].image}
              alt={`Banner ${currentImageIndex + 1}`}
              className="w-full h-full object-cover object-center rounded-md transition-opacity duration-700 ease-in-out"
            />
          </a>
        </div>
        
        {/* Overlay */}
        <div className="absolute top-0 left-0 w-full h-full bg-black/10 pointer-events-none" />

        {/* Navigation Buttons */}
        <button
          className="absolute left-2 md:left-5 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition z-10"
          onClick={goToPreviousImage}
          aria-label="Previous slide"
        >
          &#10094;
        </button>
        <button
          className="absolute right-2 md:right-5 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition z-10"
          onClick={goToNextImage}
          aria-label="Next slide"
        >
          &#10095;
        </button>

        {/* Dots for Navigation */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-2 h-2 rounded-full ${
                index === currentImageIndex ? "bg-white" : "bg-gray-400"
              } hover:bg-white transition`}
              aria-label={`Go to slide ${index + 1}`}
            ></button>
          ))}
        </div>
      </div>
    </>
  );
};

export default HomeBanner;