// utils/toast.js
import toast from 'react-hot-toast';



// Success Toast (White with green accent)
export const showSuccessToast = (message) => {
  toast.success(message, {
   duration : 2000,
    iconTheme: {
      primary: '#10B981', // Green icon
      secondary: '#fff'
    }
  });
};

// Error Toast (White with red accent)
export const showErrorToast = (message) => {
  toast.error(message, {
    duration: 2000,
    iconTheme: {
      primary: '#EF4444', // Red icon
      secondary: '#fff'
    }
  });
};

// Loading Toast (White with blue accent)
export const showLoadingToast = (message) => {
  toast.loading(message, {
    iconTheme: {
      primary: '#3B82F6', // Blue icon
      secondary: '#fff'
    }
  });
};

// Custom Toast (White with customizable accent)
export const showCustomToast = (message, options = {}) => {
  toast(message, {
    ...whiteToastBase,
    duration: 4000,
    style: {
      ...whiteToastBase.style,
      borderLeftColor: '#64748B', // Default slate accent
      ...options.style
    },
    ...options
  });
};

// White Minimalist Toast (No icons)
export const showMinimalToast = (message) => {
  toast(message, {
    ...whiteToastBase,
    icon: null,
    style: {
      ...whiteToastBase.style,
      borderLeft: 'none',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
    }
  });
};