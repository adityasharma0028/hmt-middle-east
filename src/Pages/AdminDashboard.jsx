
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

const BUCKET = "product-images";

const emptyProduct = {
  name: "",
  slug: "",
  description: "",
  brand: "Bosch",
  category: "Power Tools",
  price: "",
  image_url: "",
  specifications: "{}",
  is_active: true,
};

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f3f4f6",
    color: "#171717",
    fontFamily: "Arial, sans-serif",
  },
  sidebar: {
    width: 230,
    background: "#151515",
    color: "white",
    padding: 24,
    minHeight: "100vh",
    boxSizing: "border-box",
    flexShrink: 0,
  },
  button: {
    padding: "10px 15px",
    border: 0,
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: 600,
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: 11,
    border: "1px solid #ddd",
    borderRadius: 6,
    marginTop: 6,
    marginBottom: 15,
  },
  card: {
    background: "white",
    padding: 20,
    borderRadius: 10,
    border: "1px solid #e5e5e5",
  },
};

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const [editing, setEditing] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(emptyProduct);
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    let alive = true;

    async function initialise() {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        navigate("/admin", { replace: true });
        return;
      }

      const { data: admin, error: adminError } = await supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();
        
if (adminError || !admin) {
  setMessage(
    adminError
      ? `Admin check failed: ${adminError.message}`
      : "Your account is not registered as an admin."
  );
  setLoading(false);
  return;
}

      if (!alive) return;

      setUser(user);
      await loadProducts();

      if (alive) setLoading(false);
    }

    initialise();

    return () => {
      alive = false;
    };
  }, [navigate]);

  async function loadProducts() {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setMessage(error.message);
      return;
    }

    setProducts(data || []);
  }

  async function logout() {
    await supabase.auth.signOut();
    navigate("/admin", { replace: true });
  }

  function startNew() {
    setEditing(null);
    setForm(emptyProduct);
    setImageFile(null);
    setMessage("");
    setFormOpen(true);
  }

  function startEdit(product) {
    setEditing(product.id);

    setForm({
      ...product,
      price: product.price ?? "",
      specifications: JSON.stringify(
        product.specifications || {},
        null,
        2
      ),
    });

    setImageFile(null);
    setMessage("");
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditing(null);
    setForm(emptyProduct);
    setImageFile(null);
  }

  function updateField(key, value) {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
  }

  async function saveProduct(event) {
    event.preventDefault();

    setSaving(true);
    setMessage("");

    let uploadedPath = null;

    try {
      let imageUrl = form.image_url || null;

      if (imageFile) {
        if (!imageFile.type.startsWith("image/")) {
          throw new Error("Please select an image file.");
        }

        const extension = imageFile.name.split(".").pop();
        const path = `${crypto.randomUUID()}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from(BUCKET)
          .upload(path, imageFile, {
            upsert: false,
            contentType: imageFile.type,
          });

        if (uploadError) throw uploadError;

        uploadedPath = path;

        const { data } = supabase.storage
          .from(BUCKET)
          .getPublicUrl(path);

        imageUrl = data.publicUrl;
      }

      const specifications = JSON.parse(
        form.specifications || "{}"
      );

      const payload = {
        name: form.name.trim(),
        slug: (form.slug || form.name)
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, ""),
        description: form.description,
        brand: form.brand,
        category: form.category,
        price: form.price === "" ? null : Number(form.price),
        image_url: imageUrl,
        specifications,
        is_active: form.is_active,
        updated_at: new Date().toISOString(),
      };

      if (!payload.name) {
        throw new Error("Product name is required.");
      }

      if (
        payload.price !== null &&
        (!Number.isFinite(payload.price) || payload.price < 0)
      ) {
        throw new Error("Enter a valid price.");
      }

      if (
        !specifications ||
        typeof specifications !== "object" ||
        Array.isArray(specifications)
      ) {
        throw new Error("Specifications must be a JSON object.");
      }

      const result = editing
        ? await supabase
            .from("products")
            .update(payload)
            .eq("id", editing)
        : await supabase
            .from("products")
            .insert(payload);

      if (result.error) throw result.error;

      setMessage(
        editing ? "Product updated successfully." : "Product created successfully."
      );

      closeForm();
      await loadProducts();
    } catch (error) {
      if (uploadedPath) {
        await supabase.storage.from(BUCKET).remove([uploadedPath]);
      }

      setMessage(error.message || "Could not save product.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteProduct(product) {
    if (!window.confirm(`Delete "${product.name}" permanently?`)) {
      return;
    }

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", product.id);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Product deleted.");
    await loadProducts();
  }

  async function toggleActive(product) {
    const { error } = await supabase
      .from("products")
      .update({
        is_active: !product.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", product.id);

    if (error) {
      setMessage(error.message);
      return;
    }

    await loadProducts();
  }

  const visibleProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = [
        product.name,
        product.brand,
        product.category,
        product.slug,
      ]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesFilter =
        filter === "all" ||
        (filter === "active" && product.is_active) ||
        (filter === "draft" && !product.is_active);

      return matchesSearch && matchesFilter;
    });
  }, [products, search, filter]);

  const activeCount = products.filter(
    (product) => product.is_active
  ).length;

  if (loading) {
    return <div style={{ padding: 40 }}>Loading HMT Admin...</div>;
  }

  return (
    <div style={{ ...styles.page, display: "flex" }}>
      <aside style={styles.sidebar}>
        <h2>
          HMT <span style={{ color: "#ef3333" }}>ADMIN</span>
        </h2>

        <p style={{ color: "#aaa", fontSize: 13 }}>
          GENERAL TRADING LLC
        </p>

        <hr style={{ borderColor: "#444", margin: "25px 0" }} />

        <p style={{ color: "#bbb" }}>OVERVIEW</p>
        <p>▦ Dashboard</p>
        <p>▤ Products</p>

        <div style={{ marginTop: 35, color: "#aaa", fontSize: 12 }}>
          SIGNED IN AS
          <p style={{ color: "white", overflowWrap: "anywhere" }}>
            {user?.email}
          </p>
        </div>

        <button
          onClick={logout}
          style={{ ...styles.button, marginTop: 20, width: "100%" }}
        >
          Log out
        </button>
      </aside>

      <main style={{ flex: 1, padding: "35px 4%", minWidth: 0 }}>
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 15,
          }}
        >
          <div>
            <h1 style={{ margin: 0 }}>Dashboard</h1>
            <p style={{ color: "#777" }}>
              Manage your HMT product catalogue.
            </p>
          </div>

          <button
            onClick={startNew}
            style={{
              ...styles.button,
              background: "#e5252a",
              color: "white",
            }}
          >
            + Add Product
          </button>
        </header>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))",
            gap: 15,
            margin: "25px 0",
          }}
        >
          {[
            ["Total Products", products.length],
            ["Published", activeCount],
            ["Drafts", products.length - activeCount],
          ].map(([label, value]) => (
            <div key={label} style={styles.card}>
              <p style={{ color: "#777", margin: 0 }}>{label}</p>
              <h2 style={{ fontSize: 32, marginBottom: 0 }}>
                {value}
              </h2>
            </div>
          ))}
        </section>

        {message && (
          <div
            role="status"
            style={{ ...styles.card, marginBottom: 20 }}
          >
            {message}
            <button
              onClick={() => setMessage("")}
              style={{ float: "right" }}
            >
              ×
            </button>
          </div>
        )}

        {formOpen && (
          <form
            onSubmit={saveProduct}
            style={{ ...styles.card, marginBottom: 25 }}
          >
            <h2>{editing ? "Edit Product" : "Add Product"}</h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
                gap: 15,
              }}
            >
              <label>
                Product name
                <input
                  required
                  style={styles.input}
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                />
              </label>

              <label>
                Slug
                <input
                  style={styles.input}
                  value={form.slug || ""}
                  onChange={(e) => updateField("slug", e.target.value)}
                  placeholder="Auto-generated if blank"
                />
              </label>

              <label>
                Brand
                <input
                  style={styles.input}
                  value={form.brand || ""}
                  onChange={(e) => updateField("brand", e.target.value)}
                />
              </label>

              <label>
                Category
                <select
                  style={styles.input}
                  value={form.category || "Power Tools"}
                  onChange={(e) => updateField("category", e.target.value)}
                >
                  {[
                    "Power Tools",
                    "Accessories",
                    "Spare Parts",
                    "Fixing Systems",
                  ].map((category) => (
                    <option key={category}>{category}</option>
                  ))}
                </select>
              </label>

              <label>
                Price
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  style={styles.input}
                  value={form.price}
                  onChange={(e) => updateField("price", e.target.value)}
                />
              </label>

              <label>
                Product image
                <input
                  type="file"
                  accept="image/*"
                  style={styles.input}
                  onChange={(e) =>
                    setImageFile(e.target.files?.[0] || null)
                  }
                />
              </label>
            </div>

            <label>
              Description
              <textarea
                rows="3"
                style={styles.input}
                value={form.description || ""}
                onChange={(e) =>
                  updateField("description", e.target.value)
                }
              />
            </label>

            <label>
              Specifications (JSON)
              <textarea
                rows="5"
                style={{ ...styles.input, fontFamily: "monospace" }}
                value={form.specifications}
                onChange={(e) =>
                  updateField("specifications", e.target.value)
                }
              />
            </label>

            {form.image_url && !imageFile && (
              <img
                src={form.image_url}
                alt="Current product"
                style={{
                  width: 100,
                  height: 100,
                  objectFit: "contain",
                }}
              />
            )}

            {imageFile && <p>Selected image: {imageFile.name}</p>}

            <label style={{ display: "block", marginBottom: 18 }}>
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) =>
                  updateField("is_active", e.target.checked)
                }
              />{" "}
              Published on website
            </label>

            <button
              disabled={saving}
              style={{
                ...styles.button,
                background: "#e5252a",
                color: "white",
              }}
            >
              {saving ? "Saving..." : "Save Product"}
            </button>

            <button
              type="button"
              onClick={closeForm}
              style={{ ...styles.button, marginLeft: 10 }}
            >
              Cancel
            </button>
          </form>
        )}

        <section style={styles.card}>
          <h2>Products</h2>

          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              marginBottom: 20,
            }}
          >
            <input
              placeholder="Search name, brand or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                ...styles.input,
                flex: 1,
                minWidth: 200,
                margin: 0,
              }}
            />

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={{ padding: 10, borderRadius: 6 }}
            >
              <option value="all">All products</option>
              <option value="active">Published</option>
              <option value="draft">Drafts</option>
            </select>

            <button onClick={loadProducts} style={styles.button}>
              Refresh
            </button>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                textAlign: "left",
                minWidth: 650,
              }}
            >
              <thead>
                <tr style={{ background: "#f5f5f5" }}>
                  {[
                    "Product",
                    "Brand",
                    "Category",
                    "Price",
                    "Status",
                    "Actions",
                  ].map((heading) => (
                    <th key={heading} style={{ padding: 12 }}>
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {visibleProducts.map((product) => (
                  <tr
                    key={product.id}
                    style={{ borderTop: "1px solid #eee" }}
                  >
                    <td style={{ padding: 12 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        {product.image_url && (
                          <img
                            src={product.image_url}
                            alt=""
                            style={{
                              width: 45,
                              height: 45,
                              objectFit: "contain",
                            }}
                          />
                        )}
                        <strong>{product.name}</strong>
                      </div>
                    </td>

                    <td style={{ padding: 12 }}>{product.brand}</td>
                    <td style={{ padding: 12 }}>{product.category}</td>
                    <td style={{ padding: 12 }}>
                      {product.price ?? "—"}
                    </td>
                    <td style={{ padding: 12 }}>
                      {product.is_active ? "Published" : "Draft"}
                    </td>

                    <td style={{ padding: 12, whiteSpace: "nowrap" }}>
                      <button
                        onClick={() => startEdit(product)}
                        style={styles.button}
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => toggleActive(product)}
                        style={{ ...styles.button, marginLeft: 5 }}
                      >
                        {product.is_active ? "Hide" : "Publish"}
                      </button>

                      <button
                        onClick={() => deleteProduct(product)}
                        style={{
                          ...styles.button,
                          marginLeft: 5,
                          color: "#c22",
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}

                {visibleProducts.length === 0 && (
                  <tr>
                    <td
                      colSpan="6"
                      style={{
                        padding: 25,
                        textAlign: "center",
                        color: "#777",
                      }}
                    >
                      No products found. Add your first product.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
