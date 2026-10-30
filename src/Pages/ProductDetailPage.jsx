import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import '../App.css'

const WHATSAPP_NUMBER = '971554383949'

function displayValue(value) {
  if (value === null || value === undefined || value === '') return '—'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

function formatPrice(price) {
  if (price === null || price === undefined || price === '') return 'Price on request'
  const amount = Number(price)
  return Number.isFinite(amount)
    ? `AED ${new Intl.NumberFormat('en-AE', { maximumFractionDigits: 2 }).format(amount)}`
    : String(price)
}

export default function ProductDetailPage() {
  const { slug } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadProduct() {
      setLoading(true)
      setError('')
      setProduct(null)

      const { data, error: queryError } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .maybeSingle()

      if (cancelled) return
      if (queryError) setError('This product could not be loaded right now. Please try again later.')
      else setProduct(data)
      setLoading(false)
    }

    loadProduct()
    return () => { cancelled = true }
  }, [slug])

  const specifications = product?.specifications &&
    typeof product.specifications === 'object' &&
    !Array.isArray(product.specifications)
    ? Object.entries(product.specifications)
    : []
  const enquiryMessage = product
    ? `Hello HMT MIDDLE EAST GENERAL TRADING LLC, I would like to enquire about ${product.name}${product.brand ? ` (${product.brand})` : ''}. Please share availability and any further details.`
    : ''
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(enquiryMessage)}`

  return (
    <main className="products-page product-detail-page">
      <header className="products-page-header product-detail-header">
        <Link to="/products" className="catalogue-back-link">← Back to Products</Link>
        <p className="section-eyebrow">HMT MIDDLE EAST</p>
        <h1>{product?.name || 'Product Details'}</h1>
      </header>

      <section className="product-detail-content" aria-live="polite">
        {loading ? (
          <p className="product-detail-message" role="status">Loading product...</p>
        ) : error ? (
          <div className="product-detail-message" role="alert">
            <h2>Product unavailable</h2>
            <p>{error}</p>
            <Link to="/products" className="product-detail-back-button">Back to Products</Link>
          </div>
        ) : !product ? (
          <div className="product-detail-message" role="status">
            <h2>Product not found</h2>
            <p>This product may have been removed or is no longer published.</p>
            <Link to="/products" className="product-detail-back-button">Back to Products</Link>
          </div>
        ) : (
          <div className="product-detail-card">
            <div className="product-detail-image">
              {product.image_url ? (
                <img src={product.image_url} alt={product.name} />
              ) : (
                <span className="catalogue-image-placeholder">Product image unavailable</span>
              )}
            </div>

            <div className="product-detail-info">
              <p className="catalogue-card-category">{product.category || 'Product'}</p>
              {product.brand && <p className="product-detail-brand">{product.brand}</p>}
              <h2>{product.name}</h2>
              <p className="product-detail-price">{formatPrice(product.price)}</p>
              <div className="product-detail-description">
                <h3>Description</h3>
                <p>{product.description || 'Contact us for more information about this product.'}</p>
              </div>
              <a className="product-detail-whatsapp" href={whatsappUrl} target="_blank" rel="noreferrer">
                Enquire on WhatsApp <span>→</span>
              </a>
            </div>

            {specifications.length > 0 && (
              <section className="product-detail-specifications">
                <h3>Specifications</h3>
                <dl>
                  {specifications.map(([name, value]) => (
                    <div className="product-specification" key={name}>
                      <dt>{name.replace(/[_-]+/g, ' ')}</dt>
                      <dd>{displayValue(value)}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}

            <Link to="/products" className="product-detail-back-link">← Back to Products</Link>
          </div>
        )}
      </section>
    </main>
  )
}
