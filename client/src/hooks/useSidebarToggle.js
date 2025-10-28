import { useEffect, useState, useCallback } from 'react';

// Default top nav height (matches Navbar h-16)
export const TOP_NAV_HEIGHT = 64;

export default function useSidebarToggle() {
  const getIsMobile = () => typeof window !== 'undefined' ? window.innerWidth < 768 : false;

  const [isMobile, setIsMobile] = useState(getIsMobile());
  const [isOpen, setIsOpen] = useState(!getIsMobile());

  useEffect(() => {
    const handleResize = () => {
      const mobile = getIsMobile();
      setIsMobile(mobile);
      // When crossing breakpoint, ensure default open state
      setIsOpen(!mobile);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggle = useCallback(() => setIsOpen(v => !v), []);

  const setOpen = useCallback((v) => setIsOpen(Boolean(v)), []);

  return { isOpen, isMobile, toggle, setOpen, TOP_NAV_HEIGHT };
}
