import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Scrolls to top of the page or the main content container
 * Works with both window scrolling and fixed sidebar layouts
 */
export const scrollToTop = (behavior: ScrollBehavior = 'smooth') => {
  // Check if we're inside a drawer's ScrollArea
  const scrollAreaViewport = document.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement;
  
  if (scrollAreaViewport) {
    scrollAreaViewport.scrollTo({
      top: 0,
      left: 0,
      behavior,
    });
  } else {
    // Fallback to main container
    const mainContent = document.getElementById('main-scroll-container');
    
    if (mainContent) {
      mainContent.scrollTo({
        top: 0,
        left: 0,
        behavior,
      });
    } else {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior,
      });
    }
  }
};

/**
 * Formats a date into a relative time string (e.g., "2 hours ago", "3 days ago")
 */
export function formatRelativeDate(date: Date | string): string {
  const now = new Date();
  const then = typeof date === 'string' ? new Date(date) : date;
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  } else if (diffInSeconds < 31536000) {
    const months = Math.floor(diffInSeconds / 2592000);
    return `${months} ${months === 1 ? 'month' : 'months'} ago`;
  } else {
    const years = Math.floor(diffInSeconds / 31536000);
    return `${years} ${years === 1 ? 'year' : 'years'} ago`;
  }
}

/**
 * Format currency amount
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
