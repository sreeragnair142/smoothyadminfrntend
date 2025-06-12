import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import axios from 'axios';

const API_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:5000/api';
const IMAGE_BASE_URL = import.meta.env.VITE_REACT_APP_IMAGE_BASE_URL || 'http://localhost:5000';

interface Banner {
  id: string;
  title: string;
  description: string;
  image: string;
  fruitImage?: string;
  bannerImages: { url: string; type: 'home-slider' | 'inner-page'; alt?: string }[];
  ingredients: string[];
  linkUrl?: string;
}

const HomeSlider: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await axios.get(`${API_URL}/banners/home-sliders`, {
          headers: { 'Content-Type': 'application/json' },
        });

        if (response.data && Array.isArray(response.data)) {
          const formattedBanners = response.data.map((banner: any) => ({
            id: banner._id || banner.id || Date.now().toString(),
            title: banner.title || 'Healthy Smoothie',
            description: banner.description || 'Discover our delicious and nutritious smoothies made with fresh ingredients.',
            image: banner.image || '/images/fallback-banner.jpg',
            fruitImage: banner.fruitImage || '',
            bannerImages: Array.isArray(banner.bannerImages) ? banner.bannerImages.map((img: any) => ({
              url: img.url,
              type: img.type || 'home-slider',
              alt: img.alt || `Fruit ${img.type}`
            })) : [],
            ingredients: Array.isArray(banner.ingredients) ? banner.ingredients.map(String) : [],
            linkUrl: banner.linkUrl || 'menu.html',
          }));
          setBanners(formattedBanners);
        } else {
          setError('Invalid banner data received.');
        }
      } catch (err: any) {
        console.error('Error fetching banners:', err);
        setError(err.response?.data?.message || 'Failed to load banners. Please try again later.');
      }
    };
    fetchBanners();
  }, []);

  if (error) {
    return <div className="text-red-500 text-center py-10 bg-[#d4c7a7]">{error}</div>;
  }

  if (banners.length === 0) {
    return <div className="text-gray-500 text-center py-10 bg-[#d4c7a7]">No banners available.</div>;
  }

  return (
    <section className="relative bg-[#d4c7a7] py-16">
      <div className="pattern-layer absolute inset-0" style={{ backgroundImage: 'url(images/main-slider/pattern-1.png)' }}></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <Swiper
          modules={[Autoplay, Pagination, Navigation]}
          loop={banners.length > 1}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          navigation
          className="main-slider-carousel"
        >
          {banners.map((banner, index) => {
            // Determine icon numbers for decoration layers
            const iconNumber = index % 3 === 0 ? 2 : index % 3 === 1 ? 6 : 7;
            return (
              <SwiperSlide key={banner.id} className={`slide ${index % 2 === 1 ? 'style-two' : ''}`}>
                {/* Decorative Icon Layers */}
                <div className="icon-layer-one absolute inset-0" style={{ backgroundImage: 'url(images/main-slider/icon-1.png)' }}></div>
                <div className="icon-layer-two absolute inset-0" style={{ backgroundImage: `url(images/main-slider/icon-${iconNumber}.png)` }}></div>
                <div className="auto-container relative">
                  <div className="row clearfix relative">
                    {/* Fruit Image (Left Side) */}
                    {banner.fruitImage && (
                      <div className="absolute bottom-10 left-0 z-10">
                        <img
                          src={banner.fruitImage.startsWith('/uploads') ? `${IMAGE_BASE_URL}${banner.fruitImage}` : banner.fruitImage}
                          alt="Fruit"
                          className="h-40 w-40 object-contain drop-shadow-lg"
                          onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/150x150?text=Fruit+Image'; }}
                        />
                      </div>
                    )}
                    {/* Content Column */}
                    <div className="content-column col-lg-6 col-md-12 col-sm-12">
                      <div className="inner-column">
                        <h1 className="text-5xl md:text-6xl font-bold text-white" style={{ fontFamily: "'Tangerine', cursive" }}>
                          <span className="first-letter">{banner.title.charAt(0)}</span>
                          <span className="second-letter">{banner.title.slice(1)}</span>
                        </h1>
                        <div className="text text-gray-700 text-sm md:text-base mt-4">{banner.description}</div>
                        <div className="btns-box mt-6">
                          <a href={banner.linkUrl} className="theme-btn btn-style-one inline-flex items-center px-6 py-2 bg-[#f7c7c0] text-white rounded-full hover:bg-[#f5b5ac] transition">
                            Choose
                          </a>
                        </div>
                        <div className="icons-box mt-6 flex space-x-4">
                          {banner.bannerImages.length > 0 ? (
                            banner.bannerImages
                              .filter((img) => img.type === 'home-slider')
                              .slice(0, 3)
                              .map((img, idx) => (
                                <img
                                  key={idx}
                                  src={img.url.startsWith('/uploads') ? `${IMAGE_BASE_URL}${img.url}` : img.url}
                                  alt={img.alt || `Fruit ${idx + 1}`}
                                  className="h-20 w-20 object-contain"
                                  onError={(e) => { e.currentTarget.src = `https://via.placeholder.com/80x80?text=Fruit+${idx + 1}`; }}
                                />
                              ))
                          ) : (
                            <>
                              <img src="images/main-slider/watermelon.png" alt="Watermelon" className="h-20 w-20 object-contain" />
                              <img src="images/main-slider/cantaloupe.png" alt="Cantaloupe" className="h-20 w-20 object-contain" />
                              <img src="images/main-slider/mango.png" alt="Mango" className="h-20 w-20 object-contain" />
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    {/* Image Column */}
                    <div className="image-column col-lg-6 col-md-12 col-sm-12">
                      <div className="inner-column relative">
                        <div className="icon-layer-three absolute top-0 left-0" style={{ backgroundImage: 'url(images/main-slider/Natural.png)' }}></div>
                        <div className="image">
                          <img
                            src={banner.image.startsWith('/uploads') ? `${IMAGE_BASE_URL}${banner.image}` : banner.image}
                            alt={banner.title}
                            className="w-full max-h-96 object-contain"
                            onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/400x400?text=Banner+Image'; }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Ingredients Section */}
                  {banner.ingredients.length > 0 && (
                    <div className="ingredients-section flex justify-center mt-8">
                      <div className="ingredients-box inline-block px-4 py-2 text-white text-lg font-medium border-2 border-dotted border-[#4eeaac] rounded-xl bg-[rgba(0,0,0,0.5)]">
                        {banner.ingredients.join(' + ')}
                      </div>
                    </div>
                  )}
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </section>
  );
};

export default HomeSlider;