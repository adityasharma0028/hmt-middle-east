import { useState } from 'react'
import { Link } from 'react-router-dom'
import '../App.css'

const products = [
  {
    id: 1,
    name: 'Bosch Drill Bits',
    category: 'Drilling Accessories',
    description: 'Drill bits for drilling applications across suitable materials.',
    image: '/products/drill-bits.png',
  },
  {
    id: 2,
    name: 'Bosch Screwdriver Bits',
    category: 'Screwdriving Accessories',
    description: 'Screwdriver bits for a range of fastening applications.',
    image: '/products/screwdriver-bits.png',
  },
  {
    id: 3,
    name: 'Bosch Chisels',
    category: 'Chiselling Accessories',
    description: 'Chisels for compatible demolition and chiselling applications.',
    image: '/products/chisels.png',
  },
  {
    id: 4,
    name: 'Bosch Cutting Discs',
    category: 'Cutting and Grinding',
    description: 'Cutting accessories for compatible power tools.',
    image: '/products/cutting-discs.png',
  },
  {
    id: 5,
    name: 'Bosch Circular Saw Blades',
    category: 'Sawing Accessories',
    description: 'Circular saw blades for compatible saws and applications.',
    image: '/products/circular-saw-blades.png',
  },
  {
    id: 6,
    name: 'Bosch Hole Saws',
    category: 'Hole Saw Accessories',
    description: 'Hole saw accessories for suitable drilling applications.',
    image: '/products/hole-saws.png',
  },
]

const categories = [
  'All Products',
  ...new Set(products.map((product) => product.category)),
]

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeCategory, setActiveCategory] = useState('All Products')

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory =
      activeCategory === 'All Products' ||
      product.category === activeCategory

    return matchesSearch && matchesCategory
  })

  return (
    <main className="products-page">
      <section className="products-page-header">
        <Link to="/" className="catalogue-back-link">
          ← Back to Home
        </Link>

        <p className="section-eyebrow">HMT MIDDLE EAST</p>

        <h1>Product Catalogue</h1>

        <p>
          Explore our catalogue and contact our team to enquire about product
          availability.
        </p>

        <input
          type="search"
          className="catalogue-search"
          placeholder="Search products or categories..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          aria-label="Search products"
        />
      </section>

      <section className="catalogue-layout">
        <aside className="catalogue-sidebar">
          <h2>Categories</h2>

          {categories.map((category) => (
            <button
              key={category}
              type="button"
              className={`catalogue-category ${
                activeCategory === category ? 'active' : ''
              }`}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </aside>

        <div className="catalogue-results">
          <div className="catalogue-results-heading">
            <h2>Browse Products</h2>
            <span>{filteredProducts.length} products</span>
          </div>

          {filteredProducts.length > 0 ? (
            <div className="catalogue-grid">
              {filteredProducts.map((product) => (
                <article className="catalogue-card" key={product.id}>
                  <div className="catalogue-card-image">
                    <img
                      src={product.image}
                      alt={product.name}
                      loading="lazy"
                      onError={(event) => {
                        event.currentTarget.style.display = 'none'
                      }}
                    />
                    <span className="catalogue-image-placeholder">
                      Product Image
                    </span>
                  </div>

                  <div className="catalogue-card-content">
                    <p className="catalogue-card-category">
                      {product.category}
                    </p>

                    <h3>{product.name}</h3>

                    <p>{product.description}</p>

                    <Link
                      to={`/products/${product.id}`}
                      className="catalogue-view-link"
                    >
                      View Product →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="catalogue-empty">
              No products found. Try another search or category.
            </p>
          )}
        </div>
      </section>
    </main>
  )
}