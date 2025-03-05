import type { Config } from "tailwindcss";

/* ============================= */
/* Tailwind 設定 */
/* ============================= */
const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: ["class", '[data-theme="dark"]'], // クラス & カスタムデータ属性で制御
  theme: {
    extend: {
      /* ============================= */
      /* カラー設定 (基本は globals.css で管理) */
      /* ============================= */
      colors: {
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
        primary: {
          50: 'hsl(210, 100%, 98%)',
          100: 'hsl(210, 100%, 96%)',
          200: 'hsl(210, 95%, 90%)',
          300: 'hsl(210, 90%, 80%)',
          400: 'hsl(210, 85%, 67%)',
          500: 'hsl(210, 80%, 55%)',
          600: 'hsl(210, 75%, 45%)',
          700: 'hsl(210, 80%, 35%)',
          800: 'hsl(210, 85%, 25%)',
          900: 'hsl(210, 90%, 18%)',
        },
        gray: {
          50: 'hsl(210, 20%, 98%)',
          100: 'hsl(210, 15%, 95%)',
          200: 'hsl(210, 15%, 90%)',
          300: 'hsl(210, 10%, 80%)',
          400: 'hsl(210, 10%, 65%)',
          500: 'hsl(210, 8%, 50%)',
          600: 'hsl(210, 10%, 35%)',
          700: 'hsl(210, 15%, 25%)',
          800: 'hsl(210, 20%, 18%)',
          900: 'hsl(210, 25%, 12%)',
          950: 'hsl(210, 30%, 8%)',
        },
        success: {
          50: 'hsl(145, 80%, 96%)',
          100: 'hsl(145, 75%, 90%)',
          200: 'hsl(145, 65%, 80%)',
          300: 'hsl(145, 60%, 65%)',
          400: 'hsl(145, 55%, 50%)',
          500: 'hsl(145, 60%, 40%)',
          600: 'hsl(145, 65%, 30%)',
          700: 'hsl(145, 70%, 25%)',
        },
        warning: {
          50: 'hsl(45, 100%, 96%)',
          100: 'hsl(45, 95%, 90%)',
          200: 'hsl(45, 90%, 80%)',
          300: 'hsl(45, 85%, 65%)',
          400: 'hsl(45, 80%, 55%)',
          500: 'hsl(45, 90%, 45%)',
          600: 'hsl(45, 95%, 35%)',
          700: 'hsl(45, 100%, 27%)',
        },
        danger: {
          50: 'hsl(0, 85%, 97%)',
          100: 'hsl(0, 80%, 92%)',
          200: 'hsl(0, 75%, 85%)',
          300: 'hsl(0, 70%, 75%)',
          400: 'hsl(0, 65%, 65%)',
          500: 'hsl(0, 70%, 55%)',
          600: 'hsl(0, 75%, 45%)',
          700: 'hsl(0, 80%, 35%)',
        },
        background: {
          alt: 'var(--color-background-alt)',
          'alt-dark': 'var(--color-background-alt-dark)',
          hover: 'var(--color-background-hover)',
          'hover-dark': 'var(--color-background-hover-dark)',
        },
        overlay: 'var(--color-overlay)',
        border: {
          DEFAULT: 'var(--color-border)',
          dark: 'var(--color-border-dark)',
        }
      },
      spacing: {
        '1': '0.25rem',
        '2': '0.5rem',
        '3': '0.75rem',
        '4': '1rem',
        '5': '1.25rem',
        '6': '1.5rem',
        '8': '2rem',
        '10': '2.5rem',
        '12': '3rem',
        '16': '4rem',
        '20': '5rem',
        '24': '6rem',
        '32': '8rem',
        '40': '10rem',
        '48': '12rem',
        '56': '14rem',
        '64': '16rem',
      },
      fontSize: {
        'xs': '0.75rem',
        'sm': '0.875rem',
        'base': '1rem',
        'lg': '1.125rem',
        'xl': '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem',
        '6xl': '3.75rem',
      },
      lineHeight: {
        'none': '1',
        'tight': '1.25',
        'snug': '1.375',
        'normal': '1.5',
        'relaxed': '1.625',
        'loose': '2',
      },
      maxWidth: {
        'content-sm': '640px',
        'content-md': '768px',
        'content-lg': '1024px',
        'content-xl': '1280px',
        'content-2xl': '1536px',
      },
      transitionDuration: {
        'fast': '150ms',
        'base': '200ms',
        'slow': '300ms',
        'slower': '500ms',
      },
      transitionTimingFunction: {
        'default': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'in': 'cubic-bezier(0.4, 0, 1, 1)',
        'out': 'cubic-bezier(0, 0, 0.2, 1)',
        'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'DEFAULT': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        'none': 'none',
        'dark-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.4)',
        'dark': '0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px 0 rgba(0, 0, 0, 0.24)',
        'dark-md': '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.24)',
        'dark-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
        'dark-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.16)',
        'dark-2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        'dark-inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.24)',
      },
      borderRadius: {
        'none': '0',
        'sm': '0.125rem',
        'DEFAULT': '0.25rem',
        'md': '0.375rem',
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        'full': '9999px',
      },
      zIndex: {
        'auto': 'auto',
        '0': '0',
        '10': '10',
        '20': '20',
        '30': '30',
        '40': '40',
        '50': '50',
        'dropdown': '1000',
        'sticky': '1020',
        'fixed': '1030',
        'modal-backdrop': '1040',
        'modal': '1050',
        'popover': '1060',
        'tooltip': '1070',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-in': 'slideIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'bounce-light': 'bounce 1.5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },

  /* ============================= */
  /* プラグイン */
  /* ============================= */
  plugins: [
    require("tailwindcss-animate"), // shadcn/ui で利用
  ],
};

export default config;
