import { useState, useEffect } from 'react';
import './ScrollToTop.css';

export default function ScrollToTop() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const container = document.querySelector('.bubble-background-scroll');
        if (!container) return;
        function onScroll() {
            setVisible(container!.scrollTop > 400);
        }
        container.addEventListener('scroll', onScroll, { passive: true });
        return () => container.removeEventListener('scroll', onScroll);
    }, []);

    function scrollToTop() {
        document.querySelector('.bubble-background-scroll')?.scrollTo({ top: 0, behavior: 'smooth' });
    }

    if (!visible) return null;

    return (
        <button
            className="scroll-to-top"
            onClick={scrollToTop}
            aria-label="Scroll to top"
        >
            <img src="/elle-pointing-up.png" alt="" />
        </button>
    )
}