import React, { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import { BarChart3, FileText, BookOpen, AlertTriangle, CheckCircle2, Calendar, FileText as CSAWIcon, Send } from 'lucide-react';
import 'swiper/css';
import { motion, useAnimation } from 'framer-motion';

// Import the images
import warningImg from '../assets/warning.png';
import validationImg from '../assets/validation.png';
import timelineImg from '../assets/timeline.png';
import csawImg from '../assets/CSAW.png';
import skillOverviewImg from '../assets/skill-overview.png';
import magicImg from '../assets/magic.png';

const landingFeatureStyles = `
  .landing-feature-swiper {
    width: 100%;
    height: 100%;
    padding: 20px 0;
  }
  .landing-feature-slide {
    background: #f8fafc;
    border-radius: 22px;
    padding: 2.2rem 2.2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    position: relative;
    overflow: visible;
    box-shadow: 0 4px 24px rgba(20,184,166,0.09);
    min-height: 500px;
    max-width: 1000px;
    width: 90vw;
    margin: 0 auto;
    border: 1.5px solid #e2e8f0;
    transition: transform 0.25s cubic-bezier(0.4,0,0.2,1), box-shadow 0.25s cubic-bezier(0.4,0,0.2,1);
  }
  .landing-feature-slide:hover {
    transform: scale(1.025);
    box-shadow: 0 12px 48px rgba(20,184,166,0.13);
  }
  .landing-feature-content {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 2.5rem;
    width: 100%;
    height: 100%;
    text-align: left;
  }
  @media (max-width: 900px) {
    .landing-feature-content {
      flex-direction: column;
      gap: 1.5rem;
      text-align: center;
    }
  }
  .landing-feature-img {
    flex: 0 0 auto;
    width: 100%;
    max-width: 500px;
    min-width: 280px;
    max-height: 350px;
    height: auto;
    border-radius: 0;
    object-fit: contain;
    display: block;
  }
  @media (max-width: 900px) {
    .landing-feature-img {
      width: 95vw;
      max-width: 400px;
      min-width: 200px;
      max-height: 250px;
    }
  }
  .landing-feature-text {
    flex: 1 1 0%;
    min-width: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    text-align: left;
    height: 100%;
    max-width: 400px;
  }
  @media (max-width: 900px) {
    .landing-feature-text {
      max-width: 100%;
      align-items: center;
      text-align: center;
    }
  }
  .landing-feature-title {
    font-size: 1.8rem;
    font-weight: 800;
    color: #1e293b;
    margin-bottom: 1rem;
    line-height: 1.2;
    text-align: left;
  }
  @media (max-width: 900px) {
    .landing-feature-title {
      text-align: center;
    }
  }
  .landing-feature-description {
    color: #64748b;
    line-height: 1.7;
    font-size: 1.1rem;
    max-width: 480px;
    margin: 0;
    text-align: left;
  }
  @media (max-width: 900px) {
    .landing-feature-description {
      text-align: center;
    }
  }
  .landing-feature-pagination {
    position: absolute;
    bottom: 32px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 12px;
    z-index: 10;
  }
  .landing-feature-pagination-bullet {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: #d1fae5;
    cursor: pointer;
    transition: background 0.2s;
  }
  .landing-feature-pagination-bullet-active {
    background: #14b8a6;
  }
  .landing-feature-navigation {
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
  .landing-feature-navigation:hover {
    background: #f0fdfa;
    box-shadow: 0 4px 16px rgba(20,184,166,0.13);
  }
  .landing-feature-navigation-prev { left: 16px; }
  .landing-feature-navigation-next { right: 16px; }
  .landing-feature-navigation svg {
    width: 22px;
    height: 22px;
    color: #14b8a6;
  }
  @media (max-width: 768px) {
    .landing-feature-slide { 
      padding: 1.5rem 1rem; 
      min-height: 450px; 
      max-width: 98vw; 
    }
    .landing-feature-title { 
      font-size: 1.4rem; 
      margin-bottom: 0.8rem; 
    }
    .landing-feature-description { 
      font-size: 1rem; 
    }
    .landing-feature-navigation { 
      width: 34px; 
      height: 34px; 
    }
    .landing-feature-navigation svg { 
      width: 15px; 
      height: 15px; 
    }
    .landing-feature-content { 
      gap: 1.2rem; 
    }
  }
`;

const LandingFeatureSlider: React.FC = () => {
  const swiperRef = useRef<any>(null);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const controls = useAnimation();
  const [isPlaying, setIsPlaying] = React.useState(true);

  const slides = [
    {
      image: skillOverviewImg,
      alt: 'Skills overview dashboard',
      title: 'Instant Skills Overview',
      description: 'Get a quick glance at which categories have skills completed and which ones you are behind on, all from your dashboard. Instantly see your progress and where to focus next.',
      icon: <BarChart3 className="w-8 h-8 text-teal-600" />
    },
    {
      image: warningImg,
      alt: 'Category average warning system',
      title: 'Smart Category Monitoring',
      description: 'Accreda automatically tracks your progress against required category averages and flags warnings when you fall below thresholds. Never miss a requirement again with our intelligent monitoring system.',
      icon: <AlertTriangle className="w-8 h-8 text-orange-500" />
    },
    {
      image: validationImg,
      alt: 'Reference tracking dashboard',
      title: 'Reference and Validator Tracking',
      description: 'Easily track and manage all your references and validators in one place. See which ones need validation, which are pending, and which are complete. Stay on top of your progress with clear visual indicators.',
      icon: <CheckCircle2 className="w-8 h-8 text-green-600" />
    },
    {
      image: timelineImg,
      alt: 'Timeline and progress tracking',
      title: 'Timeline & Progress Tracking',
      description: 'Set your start and expected completion dates to stay on track. Our dynamic progress bar changes colors based on your timeline, ensuring you never fall behind on your P.Eng journey.',
      icon: <Calendar className="w-8 h-8 text-blue-600" />
    },
    {
      image: csawImg,
      alt: 'CSAW document generation',
      title: 'One-Click CSAW Generation',
      description: 'Securely input your APEGA ID and generate professional CSAW documents with all your current information automatically filled out. Perfect for supervisor review or direct submission to APEGA.',
      icon: <CSAWIcon className="w-8 h-8 text-purple-600" />
    },
    {
      image: magicImg,
      alt: 'Magic reference request',
      title: 'Magic Reference Requests',
      description: "Send secure reference requests to your supervisors—even if they don't have an Accreda account. EITs can maximize the platform's power and keep their progress moving, no matter where their supervisors are.",
      icon: <Send className="w-8 h-8 text-cyan-600" />
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

  // Autoscroll effect
  React.useEffect(() => {
    if (!isPlaying) return;
    let timeout: NodeJS.Timeout;
    const scroll = async () => {
      if (swiperRef.current && swiperRef.current.swiper) {
        swiperRef.current.swiper.slideNext();
      }
      timeout = setTimeout(scroll, 5000); // Increased to 5 seconds for better reading
    };
    timeout = setTimeout(scroll, 5000);
    return () => clearTimeout(timeout);
  }, [isPlaying]);

  // Pause on hover
  const handleMouseEnter = () => setIsPlaying(false);
  const handleMouseLeave = () => setIsPlaying(true);

  return (
    <>
      <style>{landingFeatureStyles}</style>
      <div className="relative w-full h-[600px] md:h-[600px] lg:h-[600px]"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Swiper
          ref={swiperRef}
          className="landing-feature-swiper"
          modules={[Autoplay]}
          slidesPerView={1}
          spaceBetween={30}
          loop={true}
          autoplay={false}
          onSlideChange={handleSlideChange}
          pagination={{
            clickable: true,
            el: '.landing-feature-pagination',
            bulletClass: 'landing-feature-pagination-bullet',
            bulletActiveClass: 'landing-feature-pagination-bullet-active',
          }}
          speed={400}
          grabCursor={true}
        >
          {slides.map((slide, index) => (
            <SwiperSlide key={index}>
              <div className="landing-feature-slide">
                <div className="landing-feature-content">
                  <img src={slide.image} alt={slide.alt} className="landing-feature-img" />
                  <div className="landing-feature-text">
                    <div className="flex items-center gap-3 mb-4">
                      {slide.icon}
                      <h3 className="landing-feature-title">{slide.title}</h3>
                    </div>
                    <p className="landing-feature-description">{slide.description}</p>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        {/* Custom Navigation */}
        <div className="landing-feature-navigation landing-feature-navigation-prev" onClick={goPrev}>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </div>
        <div className="landing-feature-navigation landing-feature-navigation-next" onClick={goNext}>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
        {/* Custom Pagination */}
        <div className="landing-feature-pagination">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`landing-feature-pagination-bullet ${
                index === activeIndex ? 'landing-feature-pagination-bullet-active' : ''
              }`}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default LandingFeatureSlider; 