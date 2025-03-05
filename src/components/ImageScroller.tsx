import React, { useEffect, useRef } from 'react';

interface ImageScrollerProps {
  images: string[];
}

const ImageScroller: React.FC<ImageScrollerProps> = ({ images }) => {
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollContainer = scrollerRef.current;
    if (!scrollContainer) return;

    let animationFrameId: number;
    let startTime: number | null = null;
    const duration = 30000; // 30 seconds for one complete scroll
    
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = ((timestamp - startTime) % duration) / duration;
      
      if (scrollContainer) {
        const totalWidth = scrollContainer.scrollWidth - scrollContainer.clientWidth;
        scrollContainer.scrollLeft = totalWidth * progress;
      }
      
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  return (
    <div 
      ref={scrollerRef}
      className="flex overflow-x-hidden"
      style={{ scrollBehavior: 'smooth' }}
    >
      {[...images, ...images].map((src, index) => (
        <div
          key={index}
          className="flex-none w-full h-screen"
          style={{
            backgroundImage: `url(${src})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      ))}
    </div>
  );
};

export default ImageScroller;