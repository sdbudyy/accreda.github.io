import React, { useEffect, useState, forwardRef, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, useAnimation } from 'framer-motion';
import { 
  Award, 
  BookOpen, 
  FileText, 
  CheckCircle2,
  ArrowRight,
  Users,
  Clock,
  BarChart3,
  ChevronRight,
  Menu,
  ChevronDown,
  Star,
  Zap,
  TrendingUp,
  Shield,
  MessageSquare,
  Mail,
  Send,
  AlertCircle
} from 'lucide-react';
import { AnimatedList } from "../components/magicui/animated-list";
import { cn } from "../lib/utils";
import { AnimatedBeam } from "../components/magicui/animated-beam";
import { Marquee } from "../components/magicui/marquee";
import { Globe } from "../components/magicui/globe";
import { WordRotate } from "../components/magicui/word-rotate";
import accredaSmall from '../assets/accreda-small.webp';
import WaitlistForm from '../components/WaitlistForm.tsx';
import {
  BellIcon,
  CalendarIcon,
  FileTextIcon,
  GlobeIcon,
  InputIcon,
} from "@radix-ui/react-icons";
import { BentoCard, BentoGrid } from "../components/magicui/bento-grid";
import accredaLogo from '../assets/accreda-logo.png';
import dashboardImage from '../assets/eit-dashboard.png';
import MobileLandingMenu from '../components/MobileLandingMenu';
import LandingFeatureSlider from '../components/LandingFeatureSlider';
// Removed useUserProfile import to prevent automatic login security issue

const provinces = [
  'Alberta (APEGA)',
  'British Columbia',
  'Manitoba',
  'New Brunswick',
  'Newfoundland and Labrador',
  'Northwest Territories and Nunavut',
  'Nova Scotia',
  'Ontario',
  'Prince Edward Island',
  'Quebec',
  'Saskatchewan',
  'Yukon',
];

interface Item {
  name: string;
  description: string;
  icon: string;
  color: string;
  time: string;
}

let notifications = [
  {
    name: "Validation Request",
    description: "You have a new validation request for your SAO.",
    time: "2m ago",
    icon: "🔍",
    color: "#00C9A7",
  },
  {
    name: "Score Updated",
    description: "Your skill score was updated.",
    time: "5m ago",
    icon: "⭐",
    color: "#FFD700",
  },
  {
    name: "Approval Granted",
    description: "Your supervisor approved your submission.",
    time: "10m ago",
    icon: "✅",
    color: "#4ADE80",
  },
  {
    name: "SAO Feedback",
    description: "You received new feedback on your SAO.",
    time: "15m ago",
    icon: "📝",
    color: "#6366F1",
  },
  {
    name: "Nudge",
    description: "Reminder: Please complete your profile.",
    time: "20m ago",
    icon: "📣",
    color: "#F59E42",
  },
  {
    name: "Request Received",
    description: "A new connection request was sent to you.",
    time: "30m ago",
    icon: "📝",
    color: "#F472B6",
  },
];

notifications = Array.from({ length: 10 }, () => notifications).flat();

const Notification = ({ name, description, icon, color, time }: Item) => {
  return (
    <figure
      className={cn(
        "relative mx-auto min-h-fit w-full max-w-[400px] cursor-pointer overflow-hidden rounded-2xl p-4",
        // animation styles
        "transition-all duration-200 ease-in-out hover:scale-[103%]",
        // light styles
        "bg-white [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)]",
        // dark styles
        "transform-gpu dark:bg-transparent dark:backdrop-blur-md dark:[border:1px_solid_rgba(255,255,255,.1)] dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset]",
      )}
    >
      <div className="flex flex-row items-center gap-3">
        <div
          className="flex size-10 items-center justify-center rounded-2xl"
          style={{
            backgroundColor: color,
          }}
        >
          <span className="text-lg">{icon}</span>
        </div>
        <div className="flex flex-col overflow-hidden">
          <figcaption className="flex flex-row items-center whitespace-pre text-lg font-medium dark:text-white ">
            <span className="text-sm sm:text-lg">{name}</span>
            <span className="mx-1">·</span>
            <span className="text-xs text-gray-500">{time}</span>
          </figcaption>
          <p className="text-sm font-normal dark:text-white/60">
            {description}
          </p>
        </div>
      </div>
    </figure>
  );
};

function AnimatedListDemo({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative flex h-[20rem] w-full flex-col overflow-hidden p-2 bg-white",
        className,
      )}
    >
      <AnimatedList>
        {notifications.map((item, idx) => (
          <Notification {...item} key={idx} />
        ))}
      </AnimatedList>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-white"></div>
    </div>
  );
}

function AnimatedBeamMultipleOutputDemo({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const div1Ref = useRef<HTMLDivElement>(null);
  const div2Ref = useRef<HTMLDivElement>(null);
  const div3Ref = useRef<HTMLDivElement>(null);
  const div4Ref = useRef<HTMLDivElement>(null);
  const div5Ref = useRef<HTMLDivElement>(null);
  const div6Ref = useRef<HTMLDivElement>(null);
  const div7Ref = useRef<HTMLDivElement>(null);

  return (
    <div
      className={cn(
        "relative flex h-[20rem] w-full items-center justify-center overflow-hidden p-2",
        className,
      )}
      ref={containerRef}
    >
      <div className="flex size-full max-w-lg flex-row items-stretch justify-between gap-4">
        <div className="flex flex-col justify-center gap-1">
          <Circle ref={div1Ref}>
            <Icons.googleDrive />
          </Circle>
          <Circle ref={div2Ref}>
            <Icons.googleDocs />
          </Circle>
          <Circle ref={div3Ref}>
            <Icons.microsoftOneDrive />
          </Circle>
          <Circle ref={div4Ref}>
            <Icons.microsoftWord />
          </Circle>
          <Circle ref={div5Ref}>
            <Icons.microsoftTeams />
          </Circle>
        </div>
        <div className="flex flex-col justify-center">
          <Circle ref={div6Ref} className="size-14">
            <img
              src={accredaSmall}
              alt="Accreda Logo"
              className="w-full h-full object-contain"
              style={{ maxWidth: '100%', maxHeight: '100%' }}
            />
          </Circle>
        </div>
        <div className="flex flex-col justify-center">
          <Circle ref={div7Ref}>
            <Icons.user />
          </Circle>
        </div>
      </div>
      <AnimatedBeam containerRef={containerRef} fromRef={div1Ref} toRef={div6Ref} />
      <AnimatedBeam containerRef={containerRef} fromRef={div2Ref} toRef={div6Ref} />
      <AnimatedBeam containerRef={containerRef} fromRef={div3Ref} toRef={div6Ref} />
      <AnimatedBeam containerRef={containerRef} fromRef={div4Ref} toRef={div6Ref} />
      <AnimatedBeam containerRef={containerRef} fromRef={div5Ref} toRef={div6Ref} />
      <AnimatedBeam containerRef={containerRef} fromRef={div6Ref} toRef={div7Ref} />
    </div>
  );
}

const Circle = forwardRef<
  HTMLDivElement,
  { className?: string; children?: React.ReactNode }
>(({ className, children }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "z-10 flex size-12 items-center justify-center rounded-full border-2 border-border bg-white p-3 shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)]",
        className,
      )}
    >
      {children}
    </div>
  );
});

Circle.displayName = "Circle";

const Icons = {
  microsoftOneDrive: () => (
    <svg width="100" height="100" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.83 1.66 3.2 3.5 3.2.47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 1.84 0 3.5-1.37 3.5-3.2zm-6.5-1.5c0 .552-.448 1-1 1s-1-.448-1-1 .448-1 1-1 1 .448 1 1zm-6 0c0 .552-.448 1-1 1s-1-.448-1-1 .448-1 1-1 1 .448 1 1z" fill="#0078d4"/>
    </svg>
  ),
  microsoftWord: () => (
    <svg width="100" height="100" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <g>
        <rect width="48" height="48" rx="8" fill="#185ABD"/>
        <path d="M14.5 14.5h19v19h-19z" fill="#fff"/>
        <path d="M19.5 19.5h9v9h-9z" fill="#185ABD"/>
        <path d="M17.5 17.5h13v13h-13z" fill="#103F91"/>
        <path d="M21.5 21.5h5v5h-5z" fill="#fff"/>
        <path d="M24 24h0.01" stroke="#185ABD" strokeWidth="2"/>
      </g>
    </svg>
  ),
  microsoftTeams: () => (
    <svg width="100" height="100" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <g>
        <rect width="48" height="48" rx="8" fill="#6264A7"/>
        <circle cx="34" cy="18" r="4" fill="#B3B8F8"/>
        <rect x="14" y="14" width="16" height="20" rx="4" fill="#B3B8F8"/>
        <rect x="18" y="18" width="8" height="12" rx="2" fill="#6264A7"/>
        <circle cx="34" cy="30" r="4" fill="#B3B8F8"/>
      </g>
    </svg>
  ),
  openai: () => (
    <svg width="100" height="100" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z" />
    </svg>
  ),
  googleDrive: () => (
    <svg width="100" height="100" viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg">
      <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da" />
      <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z" fill="#00ac47" />
      <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335" />
      <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d" />
      <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc" />
      <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00" />
    </svg>
  ),
  googleDocs: () => (
    <svg width="47px" height="65px" viewBox="0 0 47 65" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <path d="M29.375,0 L4.40625,0 C1.9828125,0 0,1.99431818 0,4.43181818 L0,60.5681818 C0,63.0056818 1.9828125,65 4.40625,65 L42.59375,65 C45.0171875,65 47,63.0056818 47,60.5681818 L47,17.7272727 L29.375,0 Z" id="path-1" />
        <path d="M29.375,0 L4.40625,0 C1.9828125,0 0,1.99431818 0,4.43181818 L0,60.5681818 C0,63.0056818 1.9828125,65 4.40625,65 L42.59375,65 C45.0171875,65 47,63.0056818 47,60.5681818 L47,17.7272727 L29.375,0 Z" id="path-3" />
        <linearGradient x1="50.0053945%" y1="8.58610612%" x2="50.0053945%" y2="100.013939%" id="linearGradient-5">
          <stop stopColor="#1A237E" stopOpacity="0.2" offset="0%" />
          <stop stopColor="#1A237E" stopOpacity="0.02" offset="100%" />
        </linearGradient>
        <path d="M29.375,0 L4.40625,0 C1.9828125,0 0,1.99431818 0,4.43181818 L0,60.5681818 C0,63.0056818 1.9828125,65 4.40625,65 L42.59375,65 C45.0171875,65 47,63.0056818 47,60.5681818 L47,17.7272727 L29.375,0 Z" id="path-6" />
        <path d="M29.375,0 L4.40625,0 C1.9828125,0 0,1.99431818 0,4.43181818 L0,60.5681818 C0,63.0056818 1.9828125,65 4.40625,65 L42.59375,65 C45.0171875,65 47,63.0056818 47,60.5681818 L47,17.7272727 L29.375,0 Z" id="path-8" />
        <path d="M29.375,0 L4.40625,0 C1.9828125,0 0,1.99431818 0,4.43181818 L0,60.5681818 C0,63.0056818 1.9828125,65 4.40625,65 L42.59375,65 C45.0171875,65 47,63.0056818 47,60.5681818 L47,17.7272727 L29.375,0 Z" id="path-10" />
        <path d="M29.375,0 L4.40625,0 C1.9828125,0 0,1.99431818 0,4.43181818 L0,60.5681818 C0,63.0056818 1.9828125,65 4.40625,65 L42.59375,65 C45.0171875,65 47,63.0056818 47,60.5681818 L47,17.7272727 L29.375,0 Z" id="path-12" />
        <path d="M29.375,0 L4.40625,0 C1.9828125,0 0,1.99431818 0,4.43181818 L0,60.5681818 C0,63.0056818 1.9828125,65 4.40625,65 L42.59375,65 C45.0171875,65 47,63.0056818 47,60.5681818 L47,17.7272727 L29.375,0 Z" id="path-14" />
        <radialGradient cx="3.16804688%" cy="2.71744318%" fx="3.16804688%" fy="2.71744318%" r="161.248516%" gradientTransform="translate(0.031680,0.027174),scale(1.000000,0.723077),translate(-0.031680,-0.027174)" id="radialGradient-16">
          <stop stopColor="#FFFFFF" stopOpacity="0.1" offset="0%" />
          <stop stopColor="#FFFFFF" stopOpacity="0" offset="100%" />
        </radialGradient>
      </defs>
      <g id="Page-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
        <g transform="translate(-451.000000, -463.000000)">
          <g id="Hero" transform="translate(0.000000, 63.000000)">
            <g id="Personal" transform="translate(277.000000, 309.000000)">
              <g id="Docs-icon" transform="translate(174.000000, 91.000000)">
                <g id="Group">
                  <g id="Clipped">
                    <mask id="mask-2" fill="white">
                      <use xlinkHref="#path-1" />
                    </mask>
                    <g id="SVGID_1_" />
                    <path d="M29.375,0 L4.40625,0 C1.9828125,0 0,1.99431818 0,4.43181818 L0,60.5681818 C0,63.0056818 1.9828125,65 4.40625,65 L42.59375,65 C45.0171875,65 47,63.0056818 47,60.5681818 L47,17.7272727 L36.71875,10.3409091 L29.375,0 Z" id="Path" fill="#4285F4" fillRule="nonzero" mask="url(#mask-2)" />
                  </g>
                  <g id="Clipped">
                    <mask id="mask-4" fill="white">
                      <use xlinkHref="#path-3" />
                    </mask>
                    <g id="SVGID_1_" />
                    <polygon id="Path" fill="url(#linearGradient-5)" fillRule="nonzero" mask="url(#mask-4)" points="30.6638281 16.4309659 47 32.8582386 47 17.7272727" ></polygon>
                  </g>
                  <g id="Clipped">
                    <mask id="mask-7" fill="white">
                      <use xlinkHref="#path-6" />
                    </mask>
                    <g id="SVGID_1_" />
                    <path d="M11.75,47.2727273 L35.25,47.2727273 L35.25,44.3181818 L11.75,44.3181818 L11.75,47.2727273 Z M11.75,53.1818182 L29.375,53.1818182 L29.375,50.2272727 L11.75,50.2272727 L11.75,53.1818182 Z M11.75,32.5 L11.75,35.4545455 L35.25,35.4545455 L35.25,32.5 L11.75,32.5 Z M11.75,41.3636364 L35.25,41.3636364 L35.25,38.4090909 L11.75,38.4090909 L11.75,41.3636364 Z" id="Shape" fill="#F1F1F1" fillRule="nonzero" mask="url(#mask-7)" />
                  </g>
                  <g id="Clipped">
                    <mask id="mask-9" fill="white">
                      <use xlinkHref="#path-8" />
                    </mask>
                    <g id="SVGID_1_" />
                    <g id="Group" mask="url(#mask-9)">
                      <g transform="translate(26.437500, -2.954545)">
                        <path d="M2.9375,2.95454545 L2.9375,16.25 C2.9375,18.6985795 4.90929688,20.6818182 7.34375,20.6818182 L20.5625,20.6818182 L2.9375,2.95454545 Z" id="Path" fill="#A1C2FA" fillRule="nonzero" />
                      </g>
                    </g>
                  </g>
                  <g id="Clipped">
                    <mask id="mask-11" fill="white">
                      <use xlinkHref="#path-10" />
                    </mask>
                    <g id="SVGID_1_" />
                    <path d="M4.40625,0 C1.9828125,0 0,1.99431818 0,4.43181818 L0,4.80113636 C0,2.36363636 1.9828125,0.369318182 4.40625,0.369318182 L29.375,0.369318182 L29.375,0 L4.40625,0 Z" id="Path" fillOpacity="0.2" fill="#FFFFFF" fillRule="nonzero" mask="url(#mask-11)" />
                  </g>
                  <g id="Clipped">
                    <mask id="mask-13" fill="white">
                      <use xlinkHref="#path-12" />
                    </mask>
                    <g id="SVGID_1_" />
                    <path d="M42.59375,64.6306818 L4.40625,64.6306818 C1.9828125,64.6306818 0,62.6363636 0,60.1988636 L0,60.5681818 C0,63.0056818 1.9828125,65 4.40625,65 L42.59375,65 C45.0171875,65 47,63.0056818 47,60.5681818 L47,60.1988636 C47,62.6363636 45.0171875,64.6306818 42.59375,64.6306818 Z" id="Path" fillOpacity="0.2" fill="#1A237E" fillRule="nonzero" mask="url(#mask-13)" />
                  </g>
                  <g id="Clipped">
                    <mask id="mask-15" fill="white">
                      <use xlinkHref="#path-14" />
                    </mask>
                    <g id="SVGID_1_" />
                    <path d="M33.78125,17.7272727 C31.3467969,17.7272727 29.375,15.7440341 29.375,13.2954545 L29.375,13.6647727 C29.375,16.1133523 31.3467969,18.0965909 33.78125,18.0965909 L47,18.0965909 L47,17.7272727 L33.78125,17.7272727 Z" fillOpacity="0.1" fill="#1A237E" fillRule="nonzero" mask="url(#mask-15)" />
                  </g>
                </g>
                <path d="M29.375,0 L4.40625,0 C1.9828125,0 0,1.99431818 0,4.43181818 L0,60.5681818 C0,63.0056818 1.9828125,65 4.40625,65 L42.59375,65 C45.0171875,65 47,63.0056818 47,60.5681818 L47,17.7272727 L29.375,0 Z" id="Path" fill="url(#radialGradient-16)" fillRule="nonzero" />
              </g>
            </g>
          </g>
        </g>
      </g>
    </svg>
  ),
  user: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2" xmlns="http://www.w3.org/2000/svg">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
};

const reviews = [
  {
    id: 1,
    name: "Sarah Chen",
    role: "Civil Engineer",
    company: "",
    rating: 5,
    review: "Accreda eliminated all my confusion about how many SAOs I needed or what skills to focus on. The platform clearly shows exactly what's required and tracks my progress. No more guessing or uncertainty about my P.Eng journey.",
    avatar: "SC"
  },
  {
    id: 2,
    name: "Michael Rodriguez",
    role: "Mechanical Engineer",
    company: "",
    rating: 5,
    review: "As someone who was struggling to organize my P.Eng journey, Accreda has been a game-changer. The dashboard gives me a clear view of where I stand and what I need to focus on next.",
    avatar: "MR"
  },
  {
    id: 3,
    name: "Emily Thompson",
    role: "Electrical Engineer",
    company: "",
    rating: 5,
    review: "The layout for skills is incredible. It helped me perfectly visualize my skills and experiences, and made sure I met any average requirements along the way. This platform is exactly what every EIT needs.",
    avatar: "ET"
  },
  {
    id: 4,
    name: "David Kim",
    role: "Chemical Engineer",
    company: "",
    rating: 5,
    review: "I was spending so much time on organizing my SAOs and staying up to date with my certification before finding Accreda. Now I can quickly update my progress every week to ensure I never fall behind. The time savings and mental clarity alone makes this worth every penny.",
    avatar: "DK"
  },
  {
    id: 5,
    name: "Lisa Wang",
    role: "Structural Engineer",
    company: "",
    rating: 5,
    review: "The automatic PDF generation is amazing! It fills in the CSAW form by itself with the most recent information, easily allowing for it to be sent to supervisors or even submitted to APEGA. What used to take hours of manual work now happens with one click.",
    avatar: "LW"
  },
  {
    id: 6,
    name: "James Wilson",
    role: "Environmental Engineer",
    company: "",
    rating: 5,
    review: "Accreda's structured approach to competency tracking has given me confidence in my P.Eng application. I can see exactly what I've accomplished and what's still needed.",
    avatar: "JW"
  }
];

const ReviewCard = ({ review }: { review: typeof reviews[0] }) => {
  return (
    <div className="review-card flex-shrink-0">
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-100 h-full mx-3">
        <div className="flex items-center mb-6">
          <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mr-4">
            <span className="text-teal-700 font-semibold text-lg">{review.avatar}</span>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900">{review.name}</h4>
            <p className="text-sm text-slate-600">{review.role}</p>
          </div>
        </div>
        <div className="flex items-center mb-4">
          {[...Array(review.rating)].map((_, i) => (
            <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
          ))}
        </div>
        <p className="text-slate-700 leading-relaxed">"{review.review}"</p>
      </div>
    </div>
  );
};

const ReviewsCarousel = () => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [carouselReviews, setCarouselReviews] = useState(reviews);
  const [visibleCount, setVisibleCount] = useState(3);
  const [currentIndex, setCurrentIndex] = useState(0);
  const controls = useAnimation();
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  // Responsive visible count
  useEffect(() => {
    const updateVisible = () => {
      if (window.innerWidth >= 1024) setVisibleCount(3);
      else if (window.innerWidth >= 768) setVisibleCount(2);
      else setVisibleCount(1);
    };
    updateVisible();
    window.addEventListener('resize', updateVisible);
    return () => window.removeEventListener('resize', updateVisible);
  }, []);

  // Track container width for drag calculations
  useEffect(() => {
    if (!containerRef.current) return;
    const handleResize = () => setContainerWidth(containerRef.current!.offsetWidth);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [visibleCount]);

  // Animation loop (slower)
  useEffect(() => {
    if (!isPlaying) return;
    let timeout: NodeJS.Timeout;
    const scroll = async () => {
      await controls.start({ x: `-${100 / visibleCount}%` }, { duration: 1.2, ease: 'easeInOut' });
      setCarouselReviews((prev) => {
        const moved = prev.slice(0, 1);
        return [...prev.slice(1), ...moved];
      });
      controls.set({ x: '0%' });
      timeout = setTimeout(scroll, 4000); // Slower pause
    };
    timeout = setTimeout(scroll, 4000);
    return () => clearTimeout(timeout);
  }, [isPlaying, controls, visibleCount]);

  // Drag logic
  const cardWidth = containerWidth / visibleCount;
  const totalCards = carouselReviews.length;

  const handleDragEnd = (event: any, info: any) => {
    const offset = info.offset.x;
    const threshold = cardWidth / 3; // Snap threshold
    let newIndex = 0;
    if (offset < -threshold) {
      newIndex = 1;
    } else if (offset > threshold) {
      newIndex = -1;
    }
    if (newIndex !== 0) {
      // Animate to next/prev card
      controls.start({ x: `-${newIndex * (100 / visibleCount)}%` }, { duration: 0.3, ease: 'easeInOut' }).then(() => {
        setCarouselReviews((prev) => {
          if (newIndex === 1) {
            // Next: move first card to end
            const moved = prev.slice(0, 1);
            return [...prev.slice(1), ...moved];
          } else if (newIndex === -1) {
            // Prev: move last card to front
            const moved = prev.slice(-1);
            return [...moved, ...prev.slice(0, -1)];
          }
          return prev;
        });
        controls.set({ x: '0%' });
      });
    } else {
      // Snap back to center
      controls.start({ x: '0%' }, { duration: 0.3, ease: 'easeInOut' });
    }
  };

  return (
    <div className="overflow-hidden">
      <div
        className="relative w-full"
        ref={containerRef}
        style={{ minHeight: 260 }}
      >
        <motion.div
          className="flex"
          animate={controls}
          initial={{ x: 0 }}
          transition={{ x: { type: 'tween' } }}
          drag="x"
          dragConstraints={{ left: -cardWidth, right: cardWidth }}
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
          style={{ width: `${visibleCount * 100}%`, cursor: 'grab' }}
        >
          {carouselReviews.map((review, idx) => (
            <div
              key={review.id + '-' + idx}
              className="flex-shrink-0 px-2"
              style={{ width: `${100 / visibleCount}%` }}
            >
              <ReviewCard review={review} />
            </div>
          ))}
        </motion.div>
      </div>
      {/* Scroll Toggle */}
      <div className="flex justify-center mt-6">
        <button
          onClick={() => setIsPlaying((p) => !p)}
          className="px-6 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold shadow-sm transition-colors"
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>
      </div>
    </div>
  );
};

function MarqueeDemo() {
  return (
    <div className="relative flex w-full flex-col items-center justify-center overflow-hidden">
      <Marquee pauseOnHover className="[--duration:20s]">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </Marquee>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-white"></div>
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-white"></div>
    </div>
  );
}

function GlobeDemo({ label = "Globe" }: { label?: string }) {
  return (
    <div className="relative flex size-full max-w-lg items-center justify-center overflow-hidden rounded-lg border bg-white px-8 py-4 h-[20rem]">
      <Globe className="top-28" />
      <span className="pointer-events-none absolute inset-0 flex items-center justify-center z-10 whitespace-pre-wrap bg-gradient-to-b from-black to-gray-300/80 bg-clip-text text-center text-4xl font-semibold leading-none text-transparent dark:from-white dark:to-slate-900/10">
        {label}
      </span>
      <div className="pointer-events-none absolute inset-0 h-full bg-[radial-gradient(circle_at_50%_200%,rgba(0,0,0,0.2),rgba(255,255,255,0))]" />
    </div>
  );
}

const Landing: React.FC = () => {
  const { scrollY } = useScroll();
  const navBackground = useTransform(
    scrollY,
    [0, 100],
    ['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0.9)']
  );

  // Animate gradient position based on scroll
  const gradientPosition = useTransform(scrollY, [0, 600], ['0% 0%', '100% 100%']);
  // Fade white overlay as you scroll
  const fadeWhite = useTransform(scrollY, [0, 400], [0, 0.7]);

  const location = useLocation();
  const navigate = useNavigate();

  // Add mobile menu state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const hasScrolledToPricing = useRef(false);

  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 40; // 40 * 50ms = 2s
    function tryScrollToPricing() {
      if (
        (window.location.hash === '#pricing' || window.location.search.includes('scroll=pricing')) &&
        !hasScrolledToPricing.current
      ) {
        const pricingSection = document.getElementById('pricing');
        if (pricingSection) {
          const nav = document.querySelector('nav');
          const navHeight = nav ? nav.offsetHeight : 0;
          const rect = pricingSection.getBoundingClientRect();
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          const top = rect.top + scrollTop - navHeight - 16;
          // Only scroll if not already at the right place
          if (Math.abs(window.scrollY - top) > 5) {
            window.scrollTo({ top, behavior: 'smooth' });
            setTimeout(() => {
              hasScrolledToPricing.current = true;
              // Remove scroll=pricing from the URL after scrolling
              if (window.location.search.includes('scroll=pricing')) {
                const url = new URL(window.location.href);
                url.searchParams.delete('scroll');
                window.history.replaceState({}, '', url.pathname + url.search + url.hash);
              }
            }, 400); // allow smooth scroll to finish
          } else {
            hasScrolledToPricing.current = true;
            if (window.location.search.includes('scroll=pricing')) {
              const url = new URL(window.location.href);
              url.searchParams.delete('scroll');
              window.history.replaceState({}, '', url.pathname + url.search + url.hash);
            }
          }
        } else if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(tryScrollToPricing, 50);
        }
      }
    }
    tryScrollToPricing();
    window.addEventListener('hashchange', tryScrollToPricing);
    return () => {
      window.removeEventListener('hashchange', tryScrollToPricing);
      hasScrolledToPricing.current = false;
    };
  }, [location]);

  const [province, setProvince] = useState('Alberta (APEGA)');
  const [userType, setUserType] = useState('eit');

  const bentoFeatures = [
    {
      Icon: FileTextIcon,
      name: "Save your files",
      description: "We automatically save your files as you type.",
      href: "",
      cta: "",
      background: <GlobeDemo label="Access from anywhere" />,
      className: "",
    },
    {
      Icon: GlobeIcon,
      name: "Integrations",
      description: "Connects between multiple apps.",
      href: "",
      cta: "",
      background: <AnimatedBeamMultipleOutputDemo />,
      className: "",
    },
    {
      Icon: BellIcon,
      name: "Notifications",
      description:
        "Get notified when something happens.",
      href: "",
      cta: "",
      background: <AnimatedListDemo />,
      className: "",
    },
  ];

  function BentoDemo() {
    return (
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 my-8 md:my-16">
        {/* Background accent */}
        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-slate-50 via-white to-slate-100 opacity-80 pointer-events-none rounded-3xl z-0" style={{filter: 'blur(2px)'}} />
        <div className="relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2 text-center">Why Accreda?</h2>
          <p className="text-lg text-slate-600 mb-8 text-center">Everything you need to accelerate your engineering journey, all in one place.</p>
          <BentoGrid className="grid grid-cols-1 md:grid-cols-3 grid-rows-1 auto-rows-[20rem] gap-6">
            {bentoFeatures.map((feature, i) => (
              <div key={feature.name} className="animate-fade-in-up" style={{animationDelay: `${i * 0.1 + 0.2}s`, animationFillMode: 'both'}}>
                <BentoCard {...feature} />
              </div>
            ))}
          </BentoGrid>
        </div>
      </section>
    );
  }

  // Add state for contact modal
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactCorporation, setContactCorporation] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactEitCount, setContactEitCount] = useState('');
  const [contactLoading, setContactLoading] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);
  const [contactSuccess, setContactSuccess] = useState(false);

  useEffect(() => {
    if (
      window.location.pathname === '/' &&
      !window.location.search.includes('scroll=pricing') &&
      !window.location.hash
    ) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location]);

  // Removed useUserProfile to prevent automatic login security issue
  // Users must explicitly click Sign In to authenticate

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <motion.nav 
        className="fixed w-full z-50 border-b border-slate-200 bg-white"
        style={{ backgroundColor: navBackground }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {window.location.pathname === '/' ? (
              <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                <img src={accredaSmall} alt="Accreda" className="h-16 w-auto" />
              </button>
            ) : (
              <Link to="/">
                <img src={accredaSmall} alt="Accreda" className="h-16 w-auto" />
              </Link>
            )}
            <div className="hidden md:flex items-center space-x-8">
              <button
                className="text-slate-600 hover:text-slate-900 transition-colors"
                onClick={() => {
                  // Always navigate to login page for security
                  // Don't auto-redirect based on existing session
                  navigate('/login');
                }}
              >
                Sign In
              </button>
              <a 
                href="#"
                className="text-slate-600 hover:text-slate-900 transition-colors"
                onClick={e => {
                  e.preventDefault();
                  if (window.location.pathname === '/') {
                    const pricingSection = document.getElementById('pricing');
                    if (pricingSection) {
                      pricingSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  } else {
                    navigate('/?scroll=pricing');
                  }
                }}
              >
                Pricing
              </a>
              <Link to="/enterprise" className="text-slate-600 hover:text-slate-900 transition-colors">Enterprise</Link>
              <Link 
                to="/signup"
                className="bg-black text-white px-6 py-2 rounded-lg hover:bg-slate-800 transition-colors"
              >
                Join Today
              </Link>
            </div>
            <button 
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <MobileLandingMenu 
        isOpen={mobileMenuOpen} 
        onClose={() => setMobileMenuOpen(false)} 
      />

      {/* Hero Section + Gradient */}
      <div className="relative pt-36 pb-4 overflow-hidden bg-white" style={{ zIndex: 0 }}>
        {/* Extended colored gradient background (covers hero + problem) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 w-full h-[1600px] md:h-[1700px] z-0"
          style={{
            background: 'linear-gradient(120deg, #f6fbff 0%, #e3f0fa 40%, #eaf6fb 80%, #fff 100%)',
            backgroundSize: '100% 100%',
            opacity: 1,
          }}
        />
        {/* White overlay that fades in with scroll, but only at the end of the problem section */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 w-full h-[110vh] md:h-[120vh] z-10"
          style={{ background: '#fff', opacity: fadeWhite }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center relative z-20">
          <motion.div 
            className="mb-12 w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-6xl md:text-7xl font-bold text-slate-900 leading-tight mb-6">
              Save time &<br />
              <WordRotate
                className="text-6xl md:text-7xl font-bold text-teal-600 inline-block"
                words={["Money", "Frustration", "Confusion", "Guesswork"]}
              />
            </h1>
            <p className="text-2xl text-slate-600 mb-8 max-w-2xl mx-auto">
              Track, document, and manage your professional development journey towards becoming a Professional Engineer (P.Eng).
            </p>
            <div className="flex justify-center">
              <a
                href="https://cal.com/accreda"
                target="_blank"
                rel="noopener"
                className="relative group bg-black text-white text-lg px-8 py-4 rounded-lg inline-flex items-center justify-center overflow-hidden"
                style={{ minWidth: 180 }}
              >
                <span className="relative z-10 flex items-center">
                  Book a Demo
                  <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
                {/* Sliding highlight animation */}
                <motion.span
                  className="absolute left-0 top-0 h-full w-0 bg-lime-400 opacity-80 group-hover:w-full transition-all duration-300 z-0"
                  initial={{ width: 0 }}
                  whileHover={{ width: '100%' }}
                  transition={{ duration: 0.3 }}
                  style={{ borderRadius: '0.5rem' }}
                />
                <span className="absolute left-0 top-0 h-full w-full group-hover:bg-lime-400/80 transition-all duration-300 z-0 rounded-lg" style={{ pointerEvents: 'none', opacity: 0 }} />
              </a>
            </div>
          </motion.div>
          <motion.div 
            className="relative w-full flex justify-center mt-4 mb-16"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="w-full flex justify-center">
              <img 
                src={dashboardImage} 
                alt="Accreda Dashboard" 
                className="rounded-2xl shadow-2xl object-contain"
                style={{ width: '100%', maxWidth: '1200px', maxHeight: '700px', margin: '0 auto', objectFit: 'contain', objectPosition: 'top', boxShadow: '0 8px 40px 0 rgba(16, 30, 54, 0.10)' }}
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Problem Section */}
      <div
        className="py-20"
        style={{
          background: '#fff',
          position: 'relative',
          zIndex: 20,
          marginTop: '-4rem',
          paddingTop: '8rem'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              The EIT journey is<br />
              <span className="text-teal-600">complicated</span>
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              "How do I track my progress effectively?",
              "What documentation do I need?",
              "How do I get supervisor approval?",
              "What are the requirements for my province?",
              "How do I manage my SAOs?",
              "What skills do I need to develop?"
            ].map((question, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <p className="text-xl font-medium text-slate-900">{question}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Solution Section */}
      <div className="py-20 bg-white" style={{ position: 'relative', zIndex: 30 }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Accreda is your complete<br />
              <span className="text-teal-600">EIT management system</span>
            </h2>
          </motion.div>
          <LandingFeatureSlider />
        </div>
      </div>

      {/* MagicUI Bento Grid Demo Section */}
      <BentoDemo />

      {/* Reviews Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              What engineers are saying
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto mt-4">
              Join engineers who have transformed their P.Eng journey with Accreda
            </p>
          </motion.div>
          <div className="max-w-4xl mx-auto">
            <ReviewsCarousel />
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div id="pricing" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              The only platform that<br />
              <span className="text-teal-600">pays for itself</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto mt-4">
              No additional fees or hidden costs. Get started today.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {[
              {
                title: "Start",
                subtitle: "Try with limited access now",
                price: "Free",
                period: "forever",
                features: [
                  "Up to 5 documents",
                  "Up to 5 SAOs",
                  "Connect with 1 supervisor",
                  "Standard support",
                  "One-click CSAW generation"
                ],
                buttonText: "Join Today",
                buttonLink: "/signup",
                highlighted: false
              },
              {
                title: "Pro",
                subtitle: "Complete P.Eng platform",
                price: "$9.99",
                period: "per month",
                subtext: "or $104.99/year",
                features: [
                  "Unlimited documents",
                  "Unlimited SAOs",
                  "Unlimited supervisors",
                  "Priority support",
                  "One-click CSAW generation"
                ],
                buttonText: "Join Today",
                buttonLink: "/signup",
                highlighted: true
              },
              {
                title: "Enterprise",
                subtitle: "For large organizations",
                price: "Custom",
                period: "tailored to your needs",
                features: [
                  "Everything in Pro",
                  "Priority support",
                  "Dedicated account manager",
                  "Access to Supervisor Dashboard"
                ],
                buttonText: "Contact Sales",
                buttonLink: "#",
                highlighted: false,
                demoButton: true,
                onContactClick: () => setShowContactModal(true)
              }
            ].map((plan, index) => (
              <motion.div
                key={index}
                className={`relative border rounded-2xl p-8 flex flex-col ${
                  plan.highlighted 
                    ? 'border-teal-500 bg-white shadow-xl' 
                    : 'border-slate-200 bg-white'
                }`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-teal-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-slate-900">{plan.title}</h3>
                  <p className="text-slate-600 mt-2">{plan.subtitle}</p>
                </div>
                <div className="mb-6">
                  <p className="text-5xl font-extrabold text-slate-900">{plan.price}</p>
                  <p className="text-slate-600">{plan.period}</p>
                  {plan.subtext && (
                    <p className="text-teal-600 font-medium mt-2">{plan.subtext}</p>
                  )}
                </div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center text-slate-700">
                      <CheckCircle2 className="w-5 h-5 text-teal-600 mr-3" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className="flex flex-col gap-4">
                  {plan.demoButton && (
                    <a 
                      href="https://cal.com/accreda"
                      target="_blank"
                      rel="noopener"
                      className="text-center text-lg px-8 py-4 rounded-lg bg-black text-white hover:bg-slate-800 transition-colors"
                    >
                      Book a Demo
                    </a>
                  )}
                  {plan.buttonLink && !plan.onContactClick ? (
                    <Link
                      to={plan.buttonLink}
                      className={`mt-auto text-center text-lg px-8 py-4 rounded-lg transition-colors ${
                        plan.highlighted
                          ? 'bg-black text-white hover:bg-slate-800'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {plan.buttonText}
                    </Link>
                  ) : (
                    <button 
                      onClick={plan.onContactClick}
                      className={`mt-auto text-center text-lg px-8 py-4 rounded-lg transition-colors ${
                        plan.highlighted
                          ? 'bg-black text-white hover:bg-slate-800'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {plan.buttonText}
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Waitlist Section - moved above CTA and color adjusted */}
      <div className="py-20 bg-white border-t border-slate-100">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-10">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Not in Alberta?
            </h2>
            <p className="text-xl text-slate-600 max-w-xl mx-auto">
              Join our waitlist and be the first to know when Accreda launches in your province. Select your province and role below!
            </p>
          </div>
          <WaitlistForm />
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-slate-50 text-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Start Saving Time Today
            </h2>
            <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
              Join thousands of engineers who are using Accreda to streamline their path to becoming an Engineer in Training.
            </p>
            <a 
              href="https://cal.com/accreda" 
              target="_blank" 
              rel="noopener" 
              className="bg-black text-white text-lg px-8 py-4 rounded-lg inline-flex items-center group hover:bg-slate-800 transition-colors"
            >
              Book a Demo
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <img src={accredaLogo} alt="Accreda" className="h-12 w-auto mb-4" />
              <p className="text-slate-400 max-w-md">
                Helping engineers achieve their professional goals through structured development and documentation.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">Product</h3>
              <ul className="space-y-2">
                <li><a href="#" onClick={e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-slate-400 hover:text-white transition-colors">Features</a></li>
                <li><a href="#" onClick={e => { e.preventDefault(); const pricingSection = document.getElementById('pricing'); if (pricingSection) { pricingSection.scrollIntoView({ behavior: 'smooth' }); }}} className="text-slate-400 hover:text-white transition-colors">Pricing</a></li>
                <li><Link to="/enterprise" className="text-slate-400 hover:text-white transition-colors">Enterprise</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">Company</h3>
              <ul className="space-y-2">
                <li><a href="mailto:info@accreda.ca" className="text-slate-400 hover:text-white transition-colors">info@accreda.ca</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-400">&copy; {new Date().getFullYear()} Accreda. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link to="/privacy" className="text-slate-400 hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="text-slate-400 hover:text-white transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full relative">
            <button
              className="absolute top-2 right-2 text-slate-400 hover:text-slate-600"
              onClick={() => {
                setShowContactModal(false);
                setContactSuccess(false);
                setContactError(null);
              }}
              aria-label="Close"
            >
              ×
            </button>
            <h2 className="text-xl font-bold mb-4 text-purple-800">Enterprise Plan Inquiry</h2>
            {contactSuccess ? (
              <div className="p-3 bg-green-50 text-green-700 rounded-md text-sm mb-4">
                Your inquiry has been sent successfully. We'll get back to you soon!
              </div>
            ) : (
              <form
                onSubmit={async e => {
                  e.preventDefault();
                  setContactLoading(true);
                  setContactError(null);
                  setContactSuccess(false);
                  try {
                    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-support-email`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                      },
                      body: JSON.stringify({
                        email: contactEmail,
                        subject: 'Enterprise Plan Inquiry',
                        message: `Name: ${contactName}\nCorporation: ${contactCorporation}\nCurrent EIT Count: ${contactEitCount}\n\n${contactMessage}`,
                        issueType: 'enterprise',
                        mode: 'help',
                      }),
                    });
                    const data = await response.json();
                    if (!response.ok) {
                      throw new Error(data.error || 'Failed to send message');
                    }
                    setContactSuccess(true);
                    setContactName('');
                    setContactEmail('');
                    setContactCorporation('');
                    setContactMessage('');
                    setContactEitCount('');
                  } catch (err) {
                    setContactError(err instanceof Error ? err.message : 'Failed to send message. Please try again later.');
                  } finally {
                    setContactLoading(false);
                  }
                }}
                className="space-y-4"
              >
                <div>
                  <label htmlFor="contactName" className="label">Full Name</label>
                  <input
                    type="text"
                    id="contactName"
                    value={contactName}
                    onChange={e => setContactName(e.target.value)}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="contactEmail" className="label">Email Address</label>
                  <input
                    type="email"
                    id="contactEmail"
                    value={contactEmail}
                    onChange={e => setContactEmail(e.target.value)}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="contactCorporation" className="label">Organization</label>
                  <input
                    type="text"
                    id="contactCorporation"
                    value={contactCorporation}
                    onChange={e => setContactCorporation(e.target.value)}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="contactEitCount" className="label">Current EIT Count</label>
                  <input
                    type="number"
                    id="contactEitCount"
                    value={contactEitCount}
                    onChange={e => setContactEitCount(e.target.value)}
                    className="input"
                    min="0"
                    placeholder="Enter number of EITs"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="contactMessage" className="label">Message</label>
                  <textarea
                    id="contactMessage"
                    value={contactMessage}
                    onChange={e => setContactMessage(e.target.value)}
                    className="input h-32"
                    required
                    placeholder="Tell us about your needs and how we can help..."
                  />
                </div>
                {contactError && (
                  <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">
                    {contactError}
                  </div>
                )}
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowContactModal(false);
                      setContactSuccess(false);
                      setContactError(null);
                    }}
                    disabled={contactLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={contactLoading}
                  >
                    {contactLoading ? 'Sending...' : 'Send Message'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Landing; 