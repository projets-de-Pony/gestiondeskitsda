import React from 'react';

interface ImageGridProps {
  images: string[];
}

const ImageGrid: React.FC<ImageGridProps> = ({ images }) => {
  return (
    <div className="relative mt-10">
      {/* Curved top overlay */}
      <div className="absolute inset-x-0 -top-20 h-40 bg-[#eeecec] rounded-b-[100%]" />
      
      {/* Main content with white background */}
      <div className="bg-white pt-20">
        {/* Scrollable container */}
        <div className="overflow-x-auto pb-10 hide-scrollbar">
          <div className="flex gap-5 px-5">
            {images.map((src, index) => (
              <div key={index} className="flex-none">
                <img
                  src={src}
                  alt={`Grid image ${index + 1}`}
                  className="h-[400px] w-auto object-cover rounded-lg"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageGrid;