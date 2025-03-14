export interface ResumeData {
  personalInfo: {
    name: string;
    title: string;
    contact: {
      email: string;
      phone: string;
      socialLinks: {
        linkedin: boolean;
        github: boolean;
      };
    };
  };
  
  summary: string;
  
  technicalSkills: {
    programming: string[];
    frontend: string[];
    backend: string[];
    devopsAndTools: string[];
    cloudAndTesting: string[];
  };
  
  education: Array<{
    institution: string;
    degree?: string;
    courses?: string[];
    year: string;
  }>;
  
  achievements: string[];
  
  experience: Array<{
    company: string;
    position: string;
    duration: string;
    technologies: string[];
    responsibilities?: string[];
  }>;
}

export const DEFAULT_RESUME_DATA: ResumeData = {
  personalInfo: {
    name: "Soumik Acharjee",
    title: "Frontend Developer",
    contact: {
      email: "soumik.acharjee.work@gmail.com",
      phone: "+91 8910373618",
      socialLinks: {
        linkedin: true,
        github: true
      }
    }
  },
  
  summary: "Senior Frontend Developer with 4+ years of experience. Led development for platforms serving 20+ million users. Helped achieve ₹3 crore daily fixed deposits within two months of release. Proficient in React, Next.js, and TypeScript with a focus on building scalable web applications with design principles and test-driven development.",
  
  technicalSkills: {
    programming: ["JavaScript", "TypeScript", "Python", "HTML", "CSS", "Data Structures"],
    frontend: [
      "React.js",
      "Next.js",
      "React Native",
      "Redux",
      "Context-API",
      "WebSockets",
      "Micro Frontend",
      "Framer Motion",
      "Tailwind",
      "Webpack",
      "Material UI"
    ],
    backend: ["Node.js", "Flask", "MongoDB", "MySql"],
    devopsAndTools: ["Docker", "CI/CD", "Git", "Design Systems", "AI tools"],
    cloudAndTesting: ["AWS", "Firebase", "Jest", "React-Testing-Library"]
  },
  
  education: [
    {
      institution: "ALGO UNIVERSITY EXTERNSHIP",
      courses: [
        "Advanced Data Structures and Algorithms",
        "System Design"
      ],
      year: "2024"
    },
    {
      institution: "MEGHNAD SAHA INSTITUTE OF TECHNOLOGY",
      degree: "BCA - Computer Application",
      year: "2016 - 2019"
    }
  ],
  
  achievements: [
    "Ranked 13th in Meta Hacker Cup 2024 (Open LLM Track)",
    "Led development serving 20M+ users at FamPay"
  ],
  
  experience: [
    {
      company: "TMRW - ADITYA BIRLA FASHION VENTURES",
      position: "SDE-2 | Frontend Engineer",
      duration: "April 2024 - September 2024",
      technologies: ["SSR", "Nextjs", "React Native", "TypeScript", "Redux", "Jest", "Figma"],
      responsibilities: [
        "Migrated legacy codebase for product listing and details screen resulting in successful deployment to 9M+ monthly active users (30% of user base)",
        "Configured react native app to handle web views, pointing to a new web-app",
        "Enhanced page performance, slashing bundle size by 91% (from 2.9MB to 250KB) and improving core web vitals by 30%",
        "Mentored junior developers, conducted code reviews, and facilitated project handover"
      ]
    },
    {
      company: "UPSWING FINANCIAL TECHNOLOGIES",
      position: "Sr Frontend Engineer | Contract",
      duration: "July 2023 - January 2024",
      technologies: ["React", "TypeScript", "Custom Design System", "MobX", "npm-module", "service-workers"],
      responsibilities: [
        "Built B2B app for Fixed Deposit (FD) bookings, attaining ₹3 crore daily transactions within 2 months",
        "Contributed to credit application with KYC and Payment for Flipkart SuperMoney",
        "Designed feature to postpone video KYC and book FD, cutting customer dropoff rate by 25%",
        "Architected complex design system powering clients like StableMoney, Money Control, and Aditya Birla",
        "Constructed customer support module, enhancing ticket resolution efficiency by 40%"
      ]
    },
    {
      company: "FAMPAY",
      position: "Frontend Engineer | Full-Time | LinkedIn Top 25",
      duration: "June 2021 - May 2023",
      technologies: ["React", "Web-Views", "JavaScript/TypeScript", "Redux", "WebSockets", "StoryBooks"],
      responsibilities: [
        "Core member: Joined as the second full-time engineer. Built payment screens for Android and iOS, serving from 5mn - 20M+ users. Overall scaling by 300%",
        "Developed custom Visa card ordering website with customized doodles support, boosting order completion rate by 15%",
        "Launched experimental affiliate program web app with ₹10 crore revenue potential"
      ]
    }
  ]
}; 