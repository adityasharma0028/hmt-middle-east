import { useEffect, useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import ProductsPage from "./Pages/ProductsPage.jsx";
import AdminLogin from "./Pages/AdminLogin.jsx";
import ResetPassword from "./Pages/ResetPassword.jsx";
import AdminDashboard from "./Pages/AdminDashboard.jsx";
import { supabase } from "./lib/supabase.js";


import "./App.css";

const WHATSAPP_NUMBER = "971554383949";

const heroSlides = [
  "/hero-banner.png",
  "/herobanner1.png",
  "/herobanner2.png",
  "/herobanner3.png",
];

const categories = [
  {
    name: "Power Tools",
    icon: "🛠️",
    description: "Drills, impact drivers, rotary hammers and more.",
  },
  {
    name: "Accessories",
    icon: "⚙️",
    description: "Drill bits, cutting discs, blades and accessories.",
  },
  {
    name: "Spare Parts",
    icon: "🔧",
    description: "Switches, carbon brushes and replacement components.",
  },
  {
    name: "Fixing Systems",
    icon: "🔩",
    description: "Anchors, brackets, fasteners and installation systems.",
  },
];

function whatsappLink(message) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    message
  )}`;
}

function Logo({ footer = false }) {
  return (
    <a className={`brand ${footer ? "footer-brand" : ""}`} href="#home" aria-label="HMT MIDDLEEAST GENERAL TRADING LLC home">
      <img className="brand-logo-image" src="/hmt-logo.png" alt="HMT logo" />
      <span className="brand-text">
        <strong>HMT MIDDLE EAST</strong>
        <small>GENERAL TRADING LLC</small>
      </span>
    </a>
  );
}

function App() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSlide, setActiveSlide] = useState(0);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadPublishedProducts() {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, slug, description, brand, category, image_url, is_active")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (cancelled) return;

      if (error) {
        setProductsError("Products are temporarily unavailable. Please contact us on WhatsApp.");
      } else {
        setProducts(data || []);
      }
      setProductsLoading(false);
    }

    loadPublishedProducts();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length);
    }, 3000);
    return () => window.clearInterval(timer);
  }, []);

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      activeCategory === "All" ||
      product.category === activeCategory;

    const search = searchTerm.toLowerCase();

    const matchesSearch =
      product.name.toLowerCase().includes(search) ||
      (product.brand || "").toLowerCase().includes(search) ||
      (product.slug || "").toLowerCase().includes(search) ||
      product.category.toLowerCase().includes(search);

    return matchesCategory && matchesSearch;
  });

  const quoteMessage =
    "Hello HMT MIDDLE EAST GENERAL TRADING LLC, I would like to enquire about your Bosch power tools, accessories and spare parts. Please share availability and pricing.";

  return (
    <Routes>
      <Route path="/products" element={<ProductsPage />} />
      <Route path="/admin" element={<AdminLogin />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      
      <Route
        path="/*"
        element={(
    <div className="website" id="home">
      {/* HEADER */}

      <div className="top-strip">
        <div className="container top-strip-inner">
          <span>Industrial Tools & Fixing Systems Supplier</span>
          <span>Dubai, United Arab Emirates</span>
        </div>
      </div>

      <header className="site-header">
        <div className="container header-inner">
          <Logo />

          <nav className="main-nav">
            <a href="#home">Home</a>
            <Link to="/products">Products</Link>
            <a href="#ecosystem">Bosch Ecosystem</a>
            <a href="#about">About Us</a>
            <a href="#contact">Contact</a>
          </nav>

          <a
            className="header-cta"
            href={whatsappLink(quoteMessage)}
            target="_blank"
            rel="noreferrer"
          >
            Request a Quote <span>→</span>
          </a>
        </div>
      </header>

      {/* HERO */}

      <section className="hero">
  <div className="hero-slide-track" aria-hidden="true">
    {heroSlides.map((image, index) => (
      <div
        key={image}
        className={`hero-slide-background ${
          index === activeSlide ? "active" : ""
        }`}
        style={{ backgroundImage: `url("${image}")` }}
      />
    ))}
  </div>
        <div className="container hero-grid">
          <div className="hero-copy">
            <div className="eyebrow">
              <span></span>
              Industrial Tools & Fixing Systems Supplier
            </div>

            <h1>
              BOSCH POWER TOOLS.
              <br />
              <span>REAL SOLUTIONS.</span>
              <br />
              GLOBAL SUPPLY.
            </h1>

            <p>
              Your Dubai-based trading partner for Bosch power
              tools, accessories and spare parts. Contact HMT
              Middle East for product availability and pricing.
            </p>

            <div className="hero-actions">
              <a
                className="button button-red"
                href={whatsappLink(quoteMessage)}
                target="_blank"
                rel="noreferrer"
              >
                <span>☏</span> Enquire on WhatsApp <span>→</span>
              </a>

              <Link className="button button-outline" to="/products">
                Explore Products <span>→</span>
              </Link>
            </div>

            <div className="hero-note">
              <span className="note-dot"></span>
              Product enquiries for businesses and professionals
            </div>
          </div>

          <div className="hero-visual">
            <div className="visual-label">
              PROFESSIONAL POWER TOOLS
            </div>

            <div className="visual-red-block"></div>

            <div className="tool-art">
              <div className="tool-grip"></div>
              <div className="tool-body"></div>
              <div className="tool-neck"></div>
              <div className="tool-chuck"></div>
              <div className="tool-bit"></div>
              <div className="tool-handle"></div>
              <div className="tool-battery"></div>
              <div className="tool-badge">HMT</div>
            </div>

            <div className="visual-circle">
              POWER
              <br />
              TOOLS
            </div>

            <div className="visual-bottom">
              <span>POWER TOOLS</span>
              <span>ACCESSORIES</span>
              <span>SPARE PARTS</span>
            </div>
          </div>
        </div>

        <div className="hero-slideshow-controls" aria-label="Hero slideshow controls">
          <button className="hero-slide-arrow" type="button" aria-label="Previous slide"
            onClick={() => setActiveSlide((current) => (current - 1 + heroSlides.length) % heroSlides.length)}>‹</button>
          <div className="hero-slide-dots">
            {heroSlides.map((slide, index) => (
              <button key={slide} type="button"
                className={index === activeSlide ? "hero-slide-dot active" : "hero-slide-dot"}
                aria-label={`Go to slide ${index + 1}`}
                aria-current={index === activeSlide ? "true" : undefined}
                onClick={() => setActiveSlide(index)} />
            ))}
          </div>
          <button className="hero-slide-arrow" type="button" aria-label="Next slide"
            onClick={() => setActiveSlide((current) => (current + 1) % heroSlides.length)}>›</button>
        </div>
        <div className="hero-footer">
          <div className="container hero-footer-inner">
            <span>✓ Professional Product Enquiries</span>
            <span>✓ Wide Product Range</span>
            <span>✓ Dubai-Based Trading Company</span>
            <span>✓ International Enquiries Welcome</span>
          </div>
        </div>
      </section>

      {/* PRODUCT CATEGORIES */}

      <section className="products-section section-pad" id="products">
        <div className="container">
          <div className="section-heading">
            <div>
              <div className="eyebrow">
                <span></span>
                Explore Our Range
              </div>

              <h2>
                Products for
                <br />
                <span>Professionals.</span>
              </h2>

              <p>
                Explore our range of power tools, accessories,
                spare parts and fixing solutions.
              </p>
            </div>

            <div className="catalogue-count">
              <strong>04</strong>
              <span>PRODUCT<br />CATEGORIES</span>
            </div>
          </div>

          <div className="category-grid">
            {categories.map((category, index) => (
              <button
                className="category-card"
                key={category.name}
                onClick={() => {
                  setActiveCategory(category.name);
                  setSearchTerm("");
                  document
                    .getElementById("catalogue")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                <div className={`category-art category-art-${index + 1}`}>
                  <span className="category-art-icon">
                    {category.icon}
                  </span>

                  <span className="category-art-number">
                    0{index + 1}
                  </span>
                </div>

                <div className="category-info">
                  <h3>{category.name}</h3>
                  <p>{category.description}</p>
                  <span className="category-arrow">↗</span>
                </div>
              </button>
            ))}
          </div>

          {/* PRODUCT SEARCH AND FILTER */}

          <div className="catalogue" id="catalogue">
            <div className="catalogue-heading">
              <div>
                <div className="eyebrow">
                  <span></span>
                  Browse Our Catalogue
                </div>
                <h2>Find Your <span>Product.</span></h2>
              </div>
            </div>

            <div className="catalogue-tools">
              <div className="category-tabs">
                {[
                  "All",
                  "Power Tools",
                  "Accessories",
                  "Spare Parts",
                  "Fixing Systems",
                ].map((category) => (
                  <button
                    key={category}
                    className={
                      activeCategory === category
                        ? "category-tab active"
                        : "category-tab"
                    }
                    onClick={() => setActiveCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>

              <label className="search-box">
                <span>⌕</span>
                <input
                  type="search"
                  placeholder="Search products or models..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </label>
            </div>

            <div className="product-grid">
              {productsLoading && <p className="no-results">Loading products...</p>}
              {productsError && (
                <div className="no-results" role="status">
                  <h3>Products could not be loaded</h3>
                  <p>{productsError}</p>
                  <a href={whatsappLink(quoteMessage)} target="_blank" rel="noreferrer">Ask us on WhatsApp →</a>
                </div>
              )}
              {filteredProducts.map((product, index) => (
                <article className="product-card" key={product.id}>
                  <div className={`product-art product-art-${(index % 4) + 1}`}>
                    <span className="product-category">
                      {product.category}
                    </span>

                    {product.image_url ? (
                      <img
                        className="product-photo"
                        src={product.image_url}
                        alt={product.name}
                        loading="lazy"
                        style={{
                          position: "absolute",
                          inset: 0,
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                          padding: "18px",
                          boxSizing: "border-box",
                          background: "#fff",
                        }}
                      />
                    ) : (
                      <span className="product-icon">
                        {product.category === "Accessories" ? "⚙️" : product.category === "Spare Parts" ? "🔧" : product.category === "Fixing Systems" ? "🔩" : "🛠️"}
                      </span>
                    )}

                    <span className="product-art-caption">
                      PRODUCT ENQUIRY
                    </span>
                  </div>

                  <div className="product-info">
                    <span className="product-model">{product.brand || "Product enquiry"}</span>
                    <h3>{product.name}</h3>
                    <p>{product.description || "Contact us for product details and availability."}</p>

                    <a
                      className="product-enquire"
                      href={whatsappLink(
                        `Hello HMT MIDDLE EAST GENERAL TRADING LLC, I would like to enquire about ${product.name}${product.brand ? ` (${product.brand})` : ""}. Please share availability, pricing and specifications.`
                      )}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Enquire for Availability <span>→</span>
                    </a>
                  </div>
                </article>
              ))}

              {!productsLoading && !productsError && filteredProducts.length === 0 && (
                <div className="no-results">
                  <h3>No matching products found</h3>
                  <p>
                    Try another search or contact us for assistance
                    finding a product.
                  </p>

                  <a
                    href={whatsappLink(quoteMessage)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Ask us on WhatsApp →
                  </a>
                </div>
              )}
            </div>

            <p className="catalogue-disclaimer">
              Product names and categories are provided for enquiry
              purposes. Availability, specifications and pricing must
              be confirmed with HMT MIDDLEEAST.
            </p>
          </div>
        </div>
      </section>

      {/* BOSCH ECOSYSTEM */}

      <section className="ecosystem-section" id="ecosystem">
        <div className="container ecosystem-inner">
          <div className="ecosystem-title">
            <div className="eyebrow">
              <span></span>
              Product Categories
            </div>

            <h2>
              The <span>Bosch</span>
              <br />
              Ecosystem
            </h2>

            <p>
              A broad range of professional tools and related products.
            </p>
          </div>

          <div className="ecosystem-items">
            <div className="ecosystem-item">
              <span>⚙</span>
              <strong>Power Tools</strong>
              <small>Drilling & cutting</small>
            </div>

            <div className="ecosystem-item">
              <span>◈</span>
              <strong>Accessories</strong>
              <small>Bits & blades</small>
            </div>

            <div className="ecosystem-item">
              <span>⌘</span>
              <strong>Spare Parts</strong>
              <small>Replacement parts</small>
            </div>

            <div className="ecosystem-item">
              <span>⬡</span>
              <strong>Fixing Systems</strong>
              <small>Anchors & fasteners</small>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT */}

      <section className="about-section section-pad" id="about">
        <div className="container about-grid">
          <div className="about-graphic">
            <div className="about-graphic-top">
              HMT MIDDLEEAST · DUBAI, UAE
            </div>

            <div className="about-big-type">
              HMT
              <br />
              <span>SUPPLY.</span>
            </div>

            <div className="about-graphic-bottom">
              <span>GENERAL TRADING LLC</span>
              <span>ESTABLISHED BUSINESS</span>
            </div>
          </div>

          <div className="about-copy">
            <div className="eyebrow">
              <span></span>
              About HMT MIDDLEEAST
            </div>

            <h2>
              Your Trading
              <br />
              <span>Partner in Dubai.</span>
            </h2>

            <p>
              HMT MIDDLEEAST GENERAL TRADING LLC is based in Deira,
              Dubai, United Arab Emirates. We handle enquiries for
              Bosch power tools, accessories and spare parts.
            </p>

            <p>
              We work with business customers seeking product
              information, availability and pricing. Contact our team
              with your requirements to discuss suitable solutions.
            </p>

            <a
              className="button button-red"
              href={whatsappLink(quoteMessage)}
              target="_blank"
              rel="noreferrer"
            >
              Talk to Our Team <span>→</span>
            </a>
          </div>
        </div>
      </section>

      {/* CONTACT */}

      <section className="contact-section section-pad" id="contact">
        <div className="container">
          <div className="contact-heading">
            <div className="eyebrow">
              <span></span>
              Get in Touch
            </div>

            <h2>
              Let's Discuss Your <span>Requirements.</span>
            </h2>

            <p>
              Contact HMT MIDDLEEAST for product enquiries and quotations.
            </p>
          </div>

          <div className="contact-grid">
            <div className="contact-card contact-main">
              <span className="contact-number">01 / WHATSAPP</span>
              <h3>Request Product Information</h3>

              <p>
                Send us the product name, model and quantity you need.
                Our team can discuss availability and pricing.
              </p>

              <a
                className="button button-red"
                href={whatsappLink(quoteMessage)}
                target="_blank"
                rel="noreferrer"
              >
                Message on WhatsApp →
              </a>
            </div>

            <div className="contact-card">
              <span className="contact-number">02 / TELEPHONE</span>
              <h3>Call Our Office</h3>

              <a href="tel:+97142385829">+971 4 238 5829</a>
              <a href="tel:+97142866931">+971 4 286 6931</a>
            </div>

            <div className="contact-card">
              <span className="contact-number">03 / EMAIL</span>
              <h3>Email Us</h3>

              <a href="mailto:hmtme@eim.ae">hmtme@eim.ae</a>
            </div>

            <div className="contact-card">
              <span className="contact-number">04 / WHATSAPP</span>
              <h3>Direct Enquiries</h3>

              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noreferrer"
              >
                +971 55 438 3949
              </a>

              <p>WhatsApp product enquiries</p>
            </div>

            <div className="contact-card">
              <span className="contact-number">05 / LOCATION</span>
              <h3>Visit Our Office</h3>

              <p>
                HMT MIDDLEEAST GENERAL TRADING LLC
                <br />
                P.O. Box 379441
                <br />
                Near Souq Al Wasal, behind Mount Royal Hotel,
                Al Musalla Road, Naif, Deira, Dubai, UAE.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}

      <footer className="site-footer">
        <div className="container footer-main">
          <Logo footer />

          <p>
            Professional power tools, accessories
            <br />
            and spare parts enquiries from Dubai, UAE.
          </p>

          <a className="back-top" href="#home">
            BACK TO TOP ↑
          </a>
        </div>

        <div className="container footer-bottom">
          <span>
            © {new Date().getFullYear()} HMT MIDDLEEAST GENERAL TRADING LLC
          </span>

          <span>Dubai, United Arab Emirates</span>
        </div>
      </footer>
    </div>
        )}
      />
    </Routes>
  );
}

export default App;