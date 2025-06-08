import React, { useRef } from "react";
import { Box, IconButton, Image } from "@chakra-ui/react";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const images = [
  "/assets/img/banner1.webp",
  "/assets/img/banner23.jpg",
];

const Carousel: React.FC = () => {
  const sliderRef = useRef<Slider>(null);

  const prevSlide = () => {
    sliderRef.current?.slickPrev();
  };

  const nextSlide = () => {
    sliderRef.current?.slickNext();
  };

  const settings = {
    dots: true,
    infinite: images.length > 1,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: false,
  };

  return (
<Box 
       position="relative" 
       width="100%" 
       height="50%"
       overflow="hidden"
     >
       <Slider  {...settings}>
         {images.map((src, index) => (
           <Box key={index} display="flex" justifyContent="center">
             <Image
               src={src}
               alt={`Banner ${index + 1}`}
               objectFit="cover"
               width="100%" 
               height="50%" 
             />
           </Box>
         ))}
       </Slider>
 
       <IconButton
         aria-label="Anterior"
         icon={<ChevronLeftIcon boxSize={6} />}
         position="absolute"
         left="10px"
         top="50%"
         transform="translateY(-50%)"
         bg="whiteAlpha.700"
         _hover={{ bg: "whiteAlpha.900" }}
         boxShadow="lg"
         onClick={prevSlide}
       />
 
       <IconButton
         aria-label="Próximo"
         icon={<ChevronRightIcon boxSize={6} />}
         position="absolute"
         right="10px"
         top="50%"
         transform="translateY(-50%)"
         bg="whiteAlpha.700"
         _hover={{ bg: "whiteAlpha.900" }}
         boxShadow="lg"
         onClick={nextSlide}
       />
     </Box>
  );
};

export default Carousel;
