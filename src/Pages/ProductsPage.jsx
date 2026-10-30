import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { Link } from 'react-router-dom'
import '../App.css'

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeCategory, setActiveCategory] = useState('All Products')
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadPublishedProducts() {
      const { data, error: queryError } = await supabase
        .from('products')
        .select('id, name, slug, description, brand, category, image_url, is_active')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (cancelled) return
      if (queryError) setError('Products are temporarily unavailable. Please try again later.')
      else setProducts(data || [])
      setLoading(false)
    }

    loadPublishedProducts()
    return () => { cancelled = true }
  }, [])

  const categories = useMemo(() => [
    'All Products',
    ...new Set(products.map((product) => product.category).filter(Boolean)),
  ], [products])

  const filteredProducts = products.filter((product) => {
    const search = searchTerm.toLowerCase()
    const matchesSearch =
      product.name.toLowerCase().includes(search) ||
      (product.brand || '').toLowerCase().includes(search) ||
      (product.slug || '').toLowerCase().includes(search) ||
      (product.description || '').toLowerCase().includes(search) ||
      (product.category || '').toLowerCase().includes(search)

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

          {loading ? (
            <p className="catalogue-empty" role="status">Loading products...</p>
          ) : error ? (
            <p className="catalogue-empty" role="alert">{error}</p>
          ) : filteredProducts.length > 0 ? (
            <div className="catalogue-grid">
              {filteredProducts.map((product) => (
                <article className="catalogue-card" key={product.id}>
                  <div className="catalogue-card-image">
                    <img
                      src={product.image_url || ''}
                      alt={product.name}
                      loading="lazy"
                      onError={(event) => {
                        event.currentTarget.style.display = 'none'
                      }}
                    />
                    {!product.image_url && (
                      <span className="catalogue-image-placeholder">Product Image</span>
                    )}
                  </div>

                  <div className="catalogue-card-content">
                    <p className="catalogue-card-category">
                      {product.category}
                    </p>

                    <h3>{product.name}</h3>

                    <p>{product.description || 'Contact us for product details and availability.'}</p>

                    <a
                      href={`https://wa.me/971554383949?text=${encodeURIComponent(`Hello HMT MIDDLE EAST GENERAL TRADING LLC, I would like to enquire about ${product.name}${product.brand ? ` (${product.brand})` : ''}. Please share availability, pricing and specifications.`)}`}
                      className="catalogue-view-link"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Enquire on WhatsApp →
                    </a>
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