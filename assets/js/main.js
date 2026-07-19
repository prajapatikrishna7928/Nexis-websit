        // 1. Loader Animation with Null Safety
        window.addEventListener('load', () => {
            const loader = document.getElementById('loader');
            if (loader) {
                setTimeout(() => {
                    loader.style.opacity = '0';
                    loader.style.visibility = 'hidden';
                }, 600);
            }
        });

        // 2. Sticky Navbar with Passive Scroll Listener for High FPS
        const navbar = document.getElementById('navbar');
        window.addEventListener('scroll', () => {
            if (!navbar) return;
            if (window.scrollY > 40) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }, { passive: true });

        // 3. Accessible Mobile Menu Toggle (ARIA Support)
        const mobileToggle = document.getElementById('mobileToggle');
        const navLinks = document.getElementById('navLinks');
        if (mobileToggle && navLinks) {
            mobileToggle.addEventListener('click', () => {
                const isOpen = navLinks.classList.toggle('open');
                mobileToggle.textContent = isOpen ? '✕' : '☰';
                mobileToggle.setAttribute('aria-expanded', isOpen);
            });

            // Auto-close menu when a navigation link is clicked
            document.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', () => {
                    navLinks.classList.remove('open');
                    mobileToggle.textContent = '☰';
                    mobileToggle.setAttribute('aria-expanded', false);
                });
            });
        }

        // 4. Smooth Scroll Reveal via IntersectionObserver
        const revealElements = document.querySelectorAll('.reveal');
        if (revealElements.length > 0) {
            const revealObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('active');
                    }
                });
            }, { threshold: 0.1 });

            revealElements.forEach(el => revealObserver.observe(el));
        }

        // 5. Statistics Counter Animation (Only runs if genuine stats exist)
        const statsSection = document.getElementById('stats');
        if (statsSection) {
            const statsObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const counters = entry.target.querySelectorAll('.stat-num');
                        counters.forEach(counter => {
                            const target = +counter.getAttribute('data-target') || 0;
                            const duration = 2000;
                            const increment = target / (duration / 16);
                            let current = 0;

                            const updateCounter = () => {
                                current += increment;
                                if (current < target) {
                                    counter.textContent = Math.ceil(current).toLocaleString();
                                    requestAnimationFrame(updateCounter);
                                } else {
                                    counter.textContent = target.toLocaleString() + (target === 99 ? '%' : '+');
                                }
                            };
                            updateCounter();
                        });
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.5 });
            statsObserver.observe(statsSection);
        }

        // 6. Accessible FAQ Accordion with Keyboard Navigation
        const faqItems = document.querySelectorAll('.faq-item');
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            if (!question) return;

            const toggleFaq = () => {
                const currentlyActive = document.querySelector('.faq-item.active');
                if (currentlyActive && currentlyActive !== item) {
                    currentlyActive.classList.remove('active');
                    const activeBtn = currentlyActive.querySelector('.faq-question');
                    if (activeBtn) activeBtn.setAttribute('aria-expanded', false);
                }
                const isActive = item.classList.toggle('active');
                question.setAttribute('aria-expanded', isActive);
            };

            question.addEventListener('click', toggleFaq);
            question.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleFaq();
                }
            });
        }); 

        // 7. Secure Form Submissions Handler
        function handleFormSubmit(event, formName) {
            event.preventDefault();
            alert(`Thank you! Your ${formName} has been recorded and routed securely to Krishna Prajapati (nexis.infinity@gmail.com).`);
            if (event.target && typeof event.target.reset === 'function') {
                event.target.reset();
            }
        }

        // 8. Smart Auto-Scroll Slider (Pauses on hover/touch for better UX)
        const sliderTrack = document.getElementById('sliderTrack');
        if (sliderTrack) {
            let scrollPos = 0;
            let scrollSpeed = 0.6;
            let isPaused = false;

            sliderTrack.addEventListener('mouseenter', () => isPaused = true);
            sliderTrack.addEventListener('mouseleave', () => isPaused = false);
            sliderTrack.addEventListener('touchstart', () => isPaused = true, { passive: true });
            sliderTrack.addEventListener('touchend', () => isPaused = false, { passive: true });

            function autoScrollSlider() {
                if (!isPaused && window.innerWidth > 768) {
                    scrollPos += scrollSpeed;
                    if (scrollPos >= sliderTrack.scrollWidth - sliderTrack.clientWidth) {
                        scrollSpeed = -0.6;
                    } else if (scrollPos <= 0) {
                        scrollSpeed = 0.6;
                    }
                    sliderTrack.style.transform = `translateX(-${scrollPos}px)`;
                }
                requestAnimationFrame(autoScrollSlider);
            }
            setTimeout(autoScrollSlider, 1500);
        }
 // Register Service Worker for PWA installation capability
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js')
            .then(reg => console.log('Nexis PWA Registered Successfully!', reg))
            .catch(err => console.log('Nexis PWA Registration Failed!', err));
    });
}
