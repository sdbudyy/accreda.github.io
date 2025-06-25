import React, { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import teamImg from '../assets/team.png';
import overviewImg from '../assets/overview.png';
import eitSkillsImg from '../assets/eit-skills.png';
import notificationImg from '../assets/notification.png';
import 'swiper/css';
import { motion, useAnimation } from 'framer-motion';

const superFlowStyles = `
  .super-flow-swiper {
    width: 100%;
    height: 100%;
    padding: 20px 0;
  }
  .super-flow-slide {
    background: #f8fafc;
    border-radius: 22px;
    padding: 2.2rem 2.2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: left;
    position: relative;
    overflow: visible;
    box-shadow: 0 4px 24px rgba(20,184,166,0.09);
    min-height: 540px;
    max-width: 900px;
    width: 90vw;
    margin: 0 auto;
    border: 1.5px solid #e2e8f0;
    transition: transform 0.25s cubic-bezier(0.4,0,0.2,1), box-shadow 0.25s cubic-bezier(0.4,0,0.2,1);
  }
  .super-flow-slide:hover {
    transform: scale(1.025);
    box-shadow: 0 12px 48px rgba(20,184,166,0.13);
  }
  .super-flow-content {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 2.2rem;
    width: 100%;
    height: 100%;
  }
  @media (min-width: 900px) {
    .super-flow-content {
      flex-direction: row;
      align-items: center;
      justify-content: center;
      gap: 1.2rem;
      height: 100%;
    }
  }
  .super-flow-img {
    flex: 0 0 auto;
    width: 100%;
    max-width: 650px;
    min-width: 260px;
    max-height: 420px;
    height: auto;
    border-radius: 0;
    box-shadow: none;
    background: none;
    object-fit: contain;
    display: block;
    border: none;
    padding: 0;
  }
  @media (max-width: 900px) {
    .super-flow-content {
      flex-direction: column;
      gap: 1rem;
    }
    .super-flow-img {
      width: 95vw;
      max-width: 400px;
      min-width: 160px;
      max-height: 260px;
      padding: 0;
    }
    .super-flow-text {
      max-width: 100%;
      align-items: center;
      text-align: center;
    }
  }
  .super-flow-text {
    flex: 1 1 0%;
    min-width: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    text-align: left;
    height: 100%;
    max-width: 340px;
  }
  .super-flow-title {
    font-size: 1.45rem;
    font-weight: 800;
    color: #1e293b;
    margin-bottom: 1.1rem;
    line-height: 1.15;
    text-align: left;
    word-break: break-word;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: normal;
  }
  .super-flow-description {
    color: #64748b;
    line-height: 1.7;
    font-size: 1.01rem;
    max-width: 520px;
    margin: 0;
    text-align: left;
    word-break: break-word;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: normal;
  }
  .super-flow-pagination {
    position: absolute;
    bottom: 32px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 12px;
    z-index: 10;
  }
  .super-flow-pagination-bullet {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: #d1fae5;
    cursor: pointer;
    transition: background 0.2s;
  }
  .super-flow-pagination-bullet-active {
    background: #14b8a6;
  }
  .super-flow-navigation {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 48px;
    height: 48px;
    background: #fff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(20,184,166,0.10);
    z-index: 10;
    border: 1.5px solid #e2e8f0;
    transition: background 0.2s, box-shadow 0.2s;
  }
  .super-flow-navigation:hover {
    background: #f0fdfa;
    box-shadow: 0 4px 16px rgba(20,184,166,0.13);
  }
  .super-flow-navigation-prev { left: 16px; }
  .super-flow-navigation-next { right: 16px; }
  .super-flow-navigation svg {
    width: 22px;
    height: 22px;
    color: #14b8a6;
  }
  @media (max-width: 768px) {
    .super-flow-slide { padding: 1.2rem 0.4rem; min-height: 380px; max-width: 98vw; }
    .super-flow-title { font-size: 1.05rem; margin-bottom: 0.7rem; }
    .super-flow-description { font-size: 0.93rem; }
    .super-flow-img { max-width: 350px; min-width: 120px; max-height: 220px; padding: 0; border: none; box-shadow: none; border-radius: 0; }
    .super-flow-navigation { width: 34px; height: 34px; }
    .super-flow-navigation svg { width: 15px; height: 15px; }
    .super-flow-content { gap: 0.7rem; }
  }
`;

const SuperFlowSlider: React.FC = () => {
  const swiperRef = useRef<any>(null);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const controls = useAnimation();
  const [isPlaying, setIsPlaying] = React.useState(true);

  const slides = [
    {
      image: teamImg,
      alt: 'Team dashboard overview',
      title: 'Team Overview',
      description: "See your whole team's progress at a glance. The dashboard gives supervisors a real-time overview of all EITs, their status, and key metrics for easy management.",
    },
    {
      image: overviewImg,
      alt: 'Score comparison',
      title: 'Score Comparison',
      description: 'Compare your supervisor scoring to EIT self-scores for each skill. Instantly spot gaps and align expectations for more effective feedback and development.',
    },
    {
      image: eitSkillsImg,
      alt: 'Skill category averages',
      title: 'Skill Category Averages',
      description: 'View per-category averages for each EIT. Get automatic warnings if an EIT is under the required average, so you can intervene early and help them succeed.',
    },
    {
      image: notificationImg,
      alt: 'Smart notifications',
      title: 'Smart Notifications',
      description: 'Stay on top of deadlines and reviews with intelligent notifications. Get alerts for pending approvals, expiring items, and important milestones.',
    },
  ];

  const handleSlideChange = (swiper: any) => {
    setActiveIndex(swiper.realIndex);
  };

  const goToSlide = (index: number) => {
    if (swiperRef.current && swiperRef.current.swiper) {
      swiperRef.current.swiper.slideTo(index);
    }
  };

  const goNext = () => {
    if (swiperRef.current && swiperRef.current.swiper) {
      swiperRef.current.swiper.slideNext();
    }
  };

  const goPrev = () => {
    if (swiperRef.current && swiperRef.current.swiper) {
      swiperRef.current.swiper.slidePrev();
    }
  };

  // Autoscroll effect (mimics Landing page ReviewsCarousel)
  React.useEffect(() => {
    if (!isPlaying) return;
    let timeout: NodeJS.Timeout;
    const scroll = async () => {
      if (swiperRef.current && swiperRef.current.swiper) {
        swiperRef.current.swiper.slideNext();
      }
      timeout = setTimeout(scroll, 4000);
    };
    timeout = setTimeout(scroll, 4000);
    return () => clearTimeout(timeout);
  }, [isPlaying]);

  // Pause on hover
  const handleMouseEnter = () => setIsPlaying(false);
  const handleMouseLeave = () => setIsPlaying(true);

  return (
    <>
      <style>{superFlowStyles}</style>
      <div className="relative w-full h-[580px] md:h-[580px] lg:h-[580px]"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Swiper
          ref={swiperRef}
          className="super-flow-swiper"
          modules={[Autoplay]}
          slidesPerView={1}
          spaceBetween={30}
          loop={true}
          autoplay={false} // Disable Swiper's built-in autoplay
          onSlideChange={handleSlideChange}
          pagination={{
            clickable: true,
            el: '.super-flow-pagination',
            bulletClass: 'super-flow-pagination-bullet',
            bulletActiveClass: 'super-flow-pagination-bullet-active',
          }}
          speed={400}
          grabCursor={true}
        >
          {slides.map((slide, index) => (
            <SwiperSlide key={index}>
              <div className="super-flow-slide">
                <div className="super-flow-content">
                  <img src={slide.image} alt={slide.alt} className="super-flow-img" />
                  <div className="super-flow-text">
                    <h3 className="super-flow-title">{slide.title}</h3>
                    <p className="super-flow-description">{slide.description}</p>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        {/* Custom Navigation */}
        <div className="super-flow-navigation super-flow-navigation-prev" onClick={goPrev}>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </div>
        <div className="super-flow-navigation super-flow-navigation-next" onClick={goNext}>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
        {/* Custom Pagination */}
        <div className="super-flow-pagination">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`super-flow-pagination-bullet ${
                index === activeIndex ? 'super-flow-pagination-bullet-active' : ''
              }`}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default SuperFlowSlider; 