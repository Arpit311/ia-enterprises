import { useState, useEffect, useRef, useCallback } from "react";
import "./App.css";

// ─── Magnifying Carousel Component ───────────────────────────────────────────
const SLIDE_W      = 260;
const SLIDE_GAP    = 16;
const ITEM_STEP    = SLIDE_W + SLIDE_GAP;
const CENTER_SCALE = 1.22;
const SIDE1_SCALE  = 0.72;
const SIDE2_SCALE  = 0.58;
const SIDE1_FADE   = 0.80;
const SIDE2_FADE   = 0.50;
const AUTO_SPEED   = 3800;
const DRAG_THRESH  = 40;

function MagnifyCarousel({ slides }) {
  const N = slides.length;
  const allItems = [...slides, ...slides, ...slides];

  const [currentIndex, setCurrentIndex] = useState(N);
  const [animated, setAnimated]         = useState(false);
  const trackRef    = useRef(null);
  const viewportRef = useRef(null);
  const autoTimer   = useRef(null);
  const isAnimating = useRef(false);
  const dragStart   = useRef(null);
  const dragging    = useRef(false);

  // ── compute per-slide style ──
  const styleForIndex = (i) => {
    const absDist = Math.abs(i - currentIndex);
    if (absDist === 0)  return { scale: CENTER_SCALE, opacity: 1,          zIndex: 5, isCenter: true  };
    if (absDist === 1)  return { scale: SIDE1_SCALE,  opacity: SIDE1_FADE, zIndex: 3, isCenter: false };
    if (absDist === 2)  return { scale: SIDE2_SCALE,  opacity: SIDE2_FADE, zIndex: 1, isCenter: false };
    return                     { scale: 0.6,          opacity: 0.15,       zIndex: 0, isCenter: false };
  };

  // ── track offset ──
  const trackOffset = () => {
    const vpW = viewportRef.current ? viewportRef.current.clientWidth : window.innerWidth;
    return vpW / 2 - ITEM_STEP / 2 - currentIndex * ITEM_STEP;
  };

  // ── auto-advance ──
  const startAuto = useCallback(() => {
    clearInterval(autoTimer.current);
    autoTimer.current = setInterval(() => {
      if (!isAnimating.current) {
        isAnimating.current = true;
        setAnimated(true);
        setCurrentIndex(prev => prev + 1);
      }
    }, AUTO_SPEED);
  }, []);

  useEffect(() => {
    startAuto();
    return () => clearInterval(autoTimer.current);
  }, [startAuto]);

  // ── seamless infinite jump after transition ──
  const handleTransitionEnd = useCallback((e) => {
    if (e.propertyName !== "transform") return;
    isAnimating.current = false;
    setCurrentIndex(prev => {
      if (prev < N)       return prev + N;
      if (prev >= N * 2)  return prev - N;
      return prev;
    });
    setAnimated(false);
  }, [N]);

  // ── navigate ──
  const goTo = useCallback((dir) => {
    if (isAnimating.current) return;
    isAnimating.current = true;
    setAnimated(true);
    setCurrentIndex(prev => prev + dir);
    clearInterval(autoTimer.current);
    startAuto();
  }, [startAuto]);

  // ── drag / swipe ──
  const onPointerDown = (e) => {
    dragStart.current = e.type.startsWith("touch") ? e.touches[0].clientX : e.clientX;
    dragging.current  = false;
  };
  const onPointerMove = (e) => {
    if (dragStart.current === null) return;
    const x  = e.type.startsWith("touch") ? e.touches[0].clientX : e.clientX;
    if (Math.abs(x - dragStart.current) > DRAG_THRESH) dragging.current = true;
  };
  const onPointerUp = (e) => {
    if (dragStart.current === null) return;
    const x  = e.type.startsWith("touch") ? e.changedTouches[0].clientX : e.clientX;
    const dx = x - dragStart.current;
    dragStart.current = null;
    if (!dragging.current) return;
    dragging.current = false;
    goTo(dx < 0 ? 1 : -1);
  };

  // ── keyboard ──
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowLeft")  goTo(-1);
      if (e.key === "ArrowRight") goTo(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goTo]);

  const realIdx = ((currentIndex % N) + N) % N;
  const offset  = viewportRef.current
    ? viewportRef.current.clientWidth / 2 - ITEM_STEP / 2 - currentIndex * ITEM_STEP
    : 0;

  // Recalc offset on resize
  const [, forceUpdate] = useState(0);
  useEffect(() => {
    const onResize = () => forceUpdate(n => n + 1);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const vpW = viewportRef.current ? viewportRef.current.clientWidth : window.innerWidth;
  const computedOffset = vpW / 2 - ITEM_STEP / 2 - currentIndex * ITEM_STEP;

  return (
    <div className="carousel-wrapper">
      <div
        className="carousel-viewport"
        ref={viewportRef}
        onMouseDown={onPointerDown}
        onMouseMove={onPointerMove}
        onMouseUp={onPointerUp}
        onTouchStart={onPointerDown}
        onTouchMove={onPointerMove}
        onTouchEnd={onPointerUp}
        onMouseEnter={() => clearInterval(autoTimer.current)}
        onMouseLeave={startAuto}
      >
        <div
          className="carousel-track"
          ref={trackRef}
          onTransitionEnd={handleTransitionEnd}
          style={{
            transform: `translateX(${computedOffset}px)`,
            transition: animated
              ? "transform 0.85s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
              : "none",
          }}
        >
          {allItems.map((slide, i) => {
            const { scale, opacity, zIndex, isCenter } = styleForIndex(i);
            return (
              <div
                key={i}
                className={`carousel-slide${isCenter ? " is-center" : ""}`}
                data-i={i}
                style={{ transform: `scale(${scale})`, opacity, zIndex }}
                onClick={() => {
                  const diff = i - currentIndex;
                  if (diff !== 0 && Math.abs(diff) <= 2) goTo(diff);
                }}
              >
                <img src={slide.src} alt={slide.label} loading="lazy" draggable="false" />
                <div className="carousel-slide-overlay" />
                <div className="carousel-slide-label-container">
                  <span className="carousel-slide-label">{slide.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="carousel-dots">
        {slides.map((_, i) => (
          <div key={i} className={`carousel-dot${i === realIdx ? " active" : ""}`} />
        ))}
      </div>
    </div>
  );
}


// ─── Partner brand images for the carousel ───────────────────────────────────
const partnerSlides = [
  { src: "/patanjali.png",  label: "Patanjali"  },
  { src: "/anchor.jpg",     label: "Anchor"     },
  { src: "/havells.png",    label: "Havells"    },
  { src: "/borosil.png",    label: "Borosil"    },
  { src: "/dabur.png",      label: "Dabur"      },
  { src: "/reliance.png",   label: "Reliance"   },
  { src: "/tata.png",       label: "Tata"       },
  { src: "/godrej.png",     label: "Godrej"     },
  { src: "/bosch.svg",      label: "Bosch"      },
  { src: "/shreecement.png",label: "Shree Cement"},
  { src: "/nfl.png",        label: "NFL"        },
  { src: "/ultratech.png",  label: "UltraTech"  },
  { src: "/kent.svg",       label: "Kent"       },
  { src: "/usha.png",       label: "Usha"       },
  { src: "/orient.avif",    label: "Orient"     },
];


const facilities = [
  { title: "Precision Extrusion",        description: "State-of-the-art nylon polymer analog extrusion for consistent thickness and finish." },
  { title: "Print-Ready Analogs",         description: "Analogs formulated for premium print adhesion on cardboard, woven sacks, and non-woven packaging." },
  { title: "Quality Assurance",          description: "In-house testing for strength, durability, and color consistency." },
  { title: "Eco-Conscious Support",      description: "Optimized processes to reduce waste and improve resource efficiency." },
  { title: "On-Time Delivery",           description: "Reliable logistics and scheduled shipments to meet your production deadlines." },
];

// ─── Main App ─────────────────────────────────────────────────────────────────
function App() {
  const [form, setForm] = useState({
    name: "", email: "", phone: "", firmName: "", city: "", message: "",
  });
  const [submitted,     setSubmitted]     = useState(false);
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState(null);
  const [mobileMenuOpen,setMobileMenuOpen]= useState(false);

  useEffect(() => {
    const handleClickOutside = (e) => {
      const toggler = document.querySelector(".navbar-toggler");
      const collapse = document.getElementById("navbarNav");
      if (mobileMenuOpen && collapse && !collapse.contains(e.target)
          && e.target !== toggler && !toggler?.contains(e.target)) {
        setMobileMenuOpen(false);
      }
    };
    if (mobileMenuOpen) document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [mobileMenuOpen]);

  const handleNavClick = (e, sectionId) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    if (sectionId === "home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const element = document.querySelector(`#${sectionId} h2`);
    if (element) {
      setTimeout(() => {
        const navbar = document.querySelector(".navbar");
        const navbarHeight = navbar ? navbar.offsetHeight : 0;
        const elementPosition = element.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top: elementPosition - navbarHeight - 10, behavior: "smooth" });
      }, 400);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const name  = form.name.trim();
    const email = form.email.trim();
    const phone = form.phone.trim();

    let errorMsg = "";
    if (!/^[a-zA-Z\s.]+$/.test(name)) {
      errorMsg = "Name should contain only letters, spaces, and periods.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errorMsg = "Please enter a valid email address.";
    } else {
      const digits = phone.replace(/\D/g, "");
      if (!/^\+?[\d\s]+$/.test(phone) || (digits.length !== 10 && !(digits.length === 12 && digits.startsWith("91")))) {
        errorMsg = "Phone number should be 10 digits, or +91 followed by 10 digits.";
      }
    }

    if (errorMsg) { setError(errorMsg); setLoading(false); return; }

    try {
      const response = await fetch(`${window.location.origin}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, email, phone,
          firmName: form.firmName.trim(),
          city:     form.city.trim(),
          message:  form.message.trim(),
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setSubmitted(true);
        setForm({ name: "", email: "", phone: "", firmName: "", city: "", message: "" });
        setTimeout(() => setSubmitted(false), 5000);
      } else {
        setError(data.message || "Failed to send your query. Please try again.");
      }
    } catch (err) {
      setError("Error sending your query. Please ensure the server is running and try again.");
      console.error("Form submission error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-container">
      <header className="hero-section">
        <div className="hero-content">
          <div className="logo-space">
            <img src="/Logo.png" alt="IA Enterprises Logo" className="company-logo" />
          </div>
          <div className="header-navigation">
            <span className="eyebrow">IA Enterprises</span>
            <h1>Nylon polymer stereos and analogs for paper and carton printing</h1>
            <p>
              Manufacturing print-ready polymer analogs for packaging, carton
              box, and folding board applications with trusted
              quality and brand-grade support.
            </p>
            <div className="header-actions">
              <a href="#send-query" className="hero-button" onClick={(e) => handleNavClick(e, "send-query")}>
                Send Your Query
              </a>
            </div>
          </div>
        </div>

        <nav className="navbar fixed-top">
          <div className="container-fluid">
            <button
              className="navbar-toggler"
              type="button"
              onClick={() => setMobileMenuOpen(prev => !prev)}
              aria-expanded={mobileMenuOpen}
              aria-controls="navbarNav"
            >
              <span className={`navbar-toggler-icon ${mobileMenuOpen ? "close" : ""}`}></span>
            </button>
            <div className={`mobile-menu${mobileMenuOpen ? " show" : ""}`} id="navbarNav">
              <div className="menu-content">
                <ul className="navbar-nav">
                   {[["home","Home"],["about","About IA"],["partners","Trusted Partner Brands"],["facilities","Our Facilities"],["locations","Our Delivery Coverage"],["contact","Contact Us"],["send-query","Send Query"]].map(([id, label]) => (
                    <li key={id} className="nav-item">
                      <a className="nav-link" href={`#${id}`} onClick={(e) => handleNavClick(e, id)}>{label}</a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </nav>
        <div className="menu-backdrop"></div>
      </header>

      <main>
        <section id="about" className="intro-section">
          <div>
            <h2>About Our Manufacturing</h2>
            <p>
              We are a well-established manufacturer of nylon polymer analogs
              designed specifically for printing on paper and cardboard, carton box surfaces,
              woven and non-woven sacks, packaging labels and polyethylene films. Our analogs help
              brands achieve sharp graphics, strong print adhesion, and premium
              shelf presence.
            </p>
          </div>
          <div className="stats-grid">
            <article>
              <img src="/Block.png" alt="Block Process" className="card-image" />
              <h3>Regional Coverage</h3>
              <p>Operations across Haridwar, Roorkee, Dehradun and nearby regions for faster delivery.</p>
            </article>
            <article>
              <img src="/UV.png" alt="UV Process" className="card-image" />
              <h3>High Quality</h3>
              <p>Strict process control for repeatable polymer analog performance.</p>
            </article>
            <article>
              <img src="/Washer.png" alt="Washing Process" className="card-image" />
              <h3>Customer Focus</h3>
              <p>Dedicated service for packaging converters, packaging printers, and FMCG brands.</p>
            </article>
          </div>
        </section>

        <section id="partners" className="partners-section">
          <h2>Trusted Partner Brands</h2>
          <p>Our Analogs deliver superior print clarity and durability for cardboard, carton, and flexible packaging applications.</p>
          <MagnifyCarousel slides={partnerSlides} />
          <p className="partners-count">We have partnered with 25+ trusted brands so far.</p>
        </section>

        <section id="facilities" className="facilities-section">
          <h2>Our Facilities</h2>
          <div className="facility-grid first-row">
            {facilities.slice(0, 3).map(item => (
              <article key={item.title} className="facility-card">
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
          <div className="facility-grid second-row">
            {facilities.slice(3, 5).map(item => (
              <article key={item.title} className="facility-card">
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="locations" className="locations-section">
          <h2>Our Delivery Coverage</h2>
          <p>Based in Haridwar, Uttarakhand, we deliver polymer analogs across the country through a combination of local logistics and nationwide courier partners.</p>
          <div className="delivery-grid">
            <div className="delivery-map">
              <img src="/india.svg" alt="India" />
            </div>
            <div className="delivery-cards">
              <div className="delivery-card">
                <div className="delivery-card-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18" r="2.5"/><circle cx="18.5" cy="18" r="2.5"/></svg>
                </div>
                <h3>Near Haridwar</h3>
                <p>We deliver within <strong>24 hours</strong> to Haridwar, Roorkee, Dehradun and nearby locations in Uttarakhand and UP through our own fleet.</p>
              </div>
              <div className="delivery-card">
                <div className="delivery-card-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v4"/><polyline points="3 10 12 15 21 10"/><path d="M7 16v2a3 3 0 0 0 3 3h4a3 3 0 0 0 3-3v-2"/><line x1="3" y1="22" x2="11" y2="22"/><line x1="13" y1="22" x2="21" y2="22"/><line x1="7" y1="22" x2="7" y2="17"/><line x1="17" y1="22" x2="17" y2="17"/></svg>
                </div>
                <h3>Across India</h3>
                <p>For all other cities across the country, we ship through trusted courier partners. Transport charges* may apply, and delivery is typically completed within <strong>2-3 business days</strong>.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="contact-section">
          <div className="contact-grid" id="contact">
            <div className="contact-card">
              <h2>Contact Information</h2>
              <p>For inquiries about nylon polymer blocks for cardboard, carton boxes, woven and non-woven sacks, custom orders, or supply partnerships, reach out to our team.</p>
              <div className="contact-details">
                <div><strong>Phone:</strong><p>+91 9456550662</p></div>
                <div><strong>Email:</strong><p>kuldeepbhatnagar311@gmail.com</p></div>
                <div><strong>Address:</strong><p>Haridwar, Uttarakhand, India</p></div>
                <div>
                  <strong>Location:</strong>
                  <iframe
                    src="https://maps.google.com/maps?q=29.969684,78.044939&z=15&output=embed&iwloc=near"
                    width="300"
                    height="200"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                  <address style={{ marginTop: "0.5rem", fontStyle: "normal" }}>
                    Vijay Nagar colony,<br />
                    Plot no -11, khasra no -516<br />
                    Behind Atrish Public School,<br />
                    Roshanabad,<br />
                    District - Haridwar<br />
                    Uttarakhand<br />
                    Pin -249404
                  </address>
                </div>
                <div><strong>GST Number:</strong><p>05AGYPB839F1ZW</p></div>
              </div>
            </div>

              <div className="form-wrapper" id="send-query">
               <form className="query-form" onSubmit={handleSubmit}>
                 <h2>Send Your Query</h2>
                 <div className="query-fields">
                   <p className="required-note">Fields marked with <span className="required">*</span> are required.</p>
                   <label>Name <span className="required">*</span>
                     <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Your name" required />
                   </label>
                   <label>Email <span className="required">*</span>
                     <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required />
                   </label>
                   <label>Phone <span className="required">*</span>
                     <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="+91 9XXXXXXXXX" required />
                   </label>
                   <label>Firm Name
                     <input type="text" name="firmName" value={form.firmName} onChange={handleChange} placeholder="Your company or firm name" />
                   </label>
                   <label>City
                     <input type="text" name="city" value={form.city} onChange={handleChange} placeholder="City where you need supply" />
                   </label>
                   <label>Message
                     <textarea name="message" value={form.message} onChange={handleChange} placeholder="Tell us about your requirements" rows="5" />
                   </label>
                 </div>
                 <button type="submit" disabled={loading || !form.name.trim() || !form.email.trim() || !form.phone.trim()}>
                   {loading ? "Sending..." : "Submit Query"}
                 </button>
                 {submitted && <p className="success-message">Thanks! Your query has been sent. We'll get back to you soon!</p>}
                 {error    && <p className="error-message">{error}</p>}
               </form>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer-section">
        <p>© {new Date().getFullYear()} IA Enterprises. Nylon polymer analog manufacturing firm.</p>
      </footer>
    </div>
  );
}

export default App;