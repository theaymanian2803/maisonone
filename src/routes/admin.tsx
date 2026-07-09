import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  Pencil,
  Plus,
  Trash2,
  LogOut,
  RefreshCw,
  Star,
  MessageSquare,
  CheckCircle,
  Link2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { R2ImageUpload } from "@/components/admin/R2ImageUpload";
import { R2MultiImageUpload } from "@/components/admin/R2MultiImageUpload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  adminListProducts,
  adminListBlogPosts,
  adminListCategories,
  adminListReviews,
  adminApproveReview,
  adminDeleteReview,
  createProduct,
  updateProduct,
  deleteProduct,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  createCategory,
  updateCategory,
  deleteCategory,
  verifyAdmin,
} from "@/lib/admin.functions";
import { getCategories } from "@/lib/catalog.functions";
import { OrdersPanel } from "@/components/admin/OrdersPanel";
import {
  CATEGORY_LABEL,
  type BlogPost,
  type Category,
  type Product,
  type ProductCategory,
  type Review,
} from "@/lib/catalog.types";

const TOKEN_KEY = "maison_admin_token";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Admin · Maison" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: AdminPage,
});

function AdminPage() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem(TOKEN_KEY);
    if (saved) setToken(saved);
  }, []);

  if (!token) return <AdminLogin onAuthed={(t) => setToken(t)} />;
  return (
    <AdminDashboard
      token={token}
      onLogout={() => {
        sessionStorage.removeItem(TOKEN_KEY);
        setToken(null);
      }}
    />
  );
}

function AdminLogin({ onAuthed }: { onAuthed: (token: string) => void }) {
  const [value, setValue] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!value.trim()) return;
    setPending(true);
    setError(null);
    try {
      await verifyAdmin({ data: { token: value.trim() } });
      sessionStorage.setItem(TOKEN_KEY, value.trim());
      onAuthed(value.trim());
    } catch {
      setError("Mot de passe invalide.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--brand-muted)] px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-lg border border-[var(--brand-hairline)] bg-background p-8 shadow-sm"
      >
        <h1 className="text-lg font-semibold tracking-[0.2em] uppercase">Maison Admin</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Saisissez le mot de passe administrateur pour gérer les produits et les articles.
        </p>
        <div className="mt-6 space-y-2">
          <Label htmlFor="token">Mot de passe</Label>
          <Input
            id="token"
            type="password"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            autoComplete="off"
            required
          />
        </div>
        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
        <Button type="submit" className="mt-6 w-full" disabled={pending || !value.trim()}>
          {pending ? "Vérification…" : "Connexion"}
        </Button>
      </form>
    </div>
  );
}

function AdminDashboard({ token, onLogout }: { token: string; onLogout: () => void }) {
  const pendingCountQuery = useQuery({
    queryKey: ["admin", "reviews", "pending-count"],
    queryFn: async () => {
      const reviews = await adminListReviews({ data: { token } });
      return reviews.filter((r) => !r.approved).length;
    },
    refetchInterval: 15_000,
  });
  const pendingCount = pendingCountQuery.data ?? 0;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-[var(--brand-hairline)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-lg font-semibold tracking-[0.2em] uppercase">Maison Admin</h1>
            <p className="text-xs text-muted-foreground">Gérer le catalogue et le contenu du journal.</p>
          </div>
          <Button variant="outline" size="sm" onClick={onLogout}>
            <LogOut className="mr-2 h-4 w-4" /> Déconnexion
          </Button>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">
        <Tabs defaultValue="products">
          <TabsList>
            <TabsTrigger value="orders">Commandes</TabsTrigger>
            <TabsTrigger value="products">Produits</TabsTrigger>
            <TabsTrigger value="categories">Catégories</TabsTrigger>
            <TabsTrigger value="reviews" className="relative">
              Avis
              {pendingCount > 0 && (
                <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1.5 text-[10px] font-bold text-white">
                  {pendingCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="blog">Blog</TabsTrigger>
          </TabsList>
          <TabsContent value="orders" className="mt-8">
            <OrdersPanel token={token} />
          </TabsContent>
          <TabsContent value="products" className="mt-8">
            <ProductsPanel token={token} />
          </TabsContent>
          <TabsContent value="categories" className="mt-8">
            <CategoriesPanel token={token} />
          </TabsContent>
          <TabsContent value="reviews" className="mt-8">
            <ReviewsPanel token={token} />
          </TabsContent>
          <TabsContent value="blog" className="mt-8">
            <BlogPanel token={token} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

/* ---------------- Products ---------------- */

type ProductForm = {
  title: string;
  category: ProductCategory;
  image_url: string;
  gallery: string[];
  current_price: string;
  original_price: string;
  discount_badge: string;
  rating: string;
};

const emptyProductForm: ProductForm = {
  title: "",
  category: "sofas",
  image_url: "",
  gallery: [],
  current_price: "",
  original_price: "",
  discount_badge: "-20%",
  rating: "5",
};

type ProductInput = {
  title: string;
  category: ProductCategory;
  image_url: string;
  gallery: string[];
  current_price: number;
  original_price: number;
  discount_badge: string;
  rating: number;
};

function toProductForm(p: Product, slugs: string[]): ProductForm {
  const validCategory = slugs.includes(p.category)
    ? p.category
    : "sofas";
  return {
    title: p.title,
    category: validCategory as ProductCategory,
    image_url: p.image_url,
    gallery: p.gallery ?? [],
    current_price: String(p.current_price),
    original_price: String(p.original_price),
    discount_badge: p.discount_badge,
    rating: String(p.rating),
  };
}

function parseProductForm(
  form: ProductForm,
): { ok: true; value: ProductInput } | { ok: false; error: string } {
  const title = form.title.trim();
  const image_url = form.image_url.trim();
  const discount_badge = form.discount_badge.trim();
  if (!title) return { ok: false, error: "Le titre est requis." };
  if (title.length > 200) return { ok: false, error: "Titre trop long." };
  try {
    new URL(image_url);
  } catch {
    return { ok: false, error: "L'URL de l'image doit être une URL valide." };
  }
  const current_price = Number(form.current_price);
  const original_price = Number(form.original_price);
  const rating = Number(form.rating);
  if (!Number.isFinite(current_price) || current_price < 0)
    return { ok: false, error: "Le prix actuel doit être un nombre positif." };
  if (!Number.isFinite(original_price) || original_price < 0)
    return { ok: false, error: "Le prix d'origine doit être un nombre positif." };
  if (!Number.isFinite(rating) || rating < 0 || rating > 5)
    return { ok: false, error: "La note doit être comprise entre 0 et 5." };
  if (!discount_badge) return { ok: false, error: "Le badge de réduction est requis." };
  return {
    ok: true,
    value: {
      title,
      category: form.category,
      image_url,
      gallery: form.gallery,
      current_price,
      original_price,
      discount_badge,
      rating,
    },
  };
}

function ProductsPanel({ token }: { token: string }) {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyProductForm);
  const [error, setError] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);

  const productsQuery = useQuery({
    queryKey: ["admin", "products"],
    queryFn: () => adminListProducts({ data: { token } }),
  });

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: () => getCategories(),
  });
  const categoriesList = categoriesQuery.data ?? [];
  const categoriesSlugs = useMemo(() => categoriesList.map((c) => c.slug), [categoriesList]);

  useEffect(() => {
    if (editing) setForm(toProductForm(editing, categoriesSlugs));
  }, [editing, categoriesSlugs]);

  const createMut = useMutation({
    mutationFn: (payload: ProductInput) => createProduct({ data: { token, ...payload } }),
    onSuccess: () => {
      toast.success("Produit créé");
      setForm(emptyProductForm);
      qc.invalidateQueries({ queryKey: ["admin", "products"] });
    },
    onError: (e: Error) => toast.error(e.message || "Échec de la création"),
  });

  const updateMut = useMutation({
    mutationFn: (payload: { id: string } & ProductInput) =>
      updateProduct({ data: { token, ...payload } }),
    onSuccess: () => {
      toast.success("Produit mis à jour");
      setEditing(null);
      setForm(emptyProductForm);
      qc.invalidateQueries({ queryKey: ["admin", "products"] });
    },
    onError: (e: Error) => toast.error(e.message || "Échec de la mise à jour"),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteProduct({ data: { token, id } }),
    onSuccess: () => {
      toast.success("Produit supprimé");
      qc.invalidateQueries({ queryKey: ["admin", "products"] });
    },
    onError: (e: Error) => toast.error(e.message || "Échec de la suppression"),
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const parsed = parseProductForm(form);
    if (!parsed.ok) {
      setError(parsed.error);
      return;
    }
    if (editing) {
      updateMut.mutate({ id: editing.id, ...parsed.value });
    } else {
      createMut.mutate(parsed.value);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold">Catalogue</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => productsQuery.refetch()}
            disabled={productsQuery.isFetching}
          >
            <RefreshCw className="mr-2 h-4 w-4" /> Actualiser
          </Button>
        </div>
        <div className="overflow-hidden rounded-lg border border-[var(--brand-hairline)]">
          <table className="w-full text-sm">
            <thead className="bg-[var(--brand-muted)] text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Produit</th>
                <th className="px-4 py-3">Catégorie</th>
                <th className="px-4 py-3">Prix</th>
                <th className="px-4 py-3 w-24"></th>
              </tr>
            </thead>
            <tbody>
              {productsQuery.isLoading && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                    Chargement…
                  </td>
                </tr>
              )}
              {productsQuery.isError && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-destructive">
                    Échec du chargement. Vérifiez les identifiants TURSO.
                  </td>
                </tr>
              )}
              {productsQuery.data?.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                    Aucun produit pour le moment — créez-en un à droite.
                  </td>
                </tr>
              )}
              {productsQuery.data?.map((p) => (
                <tr key={p.id} className="border-t border-[var(--brand-hairline)]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={p.image_url} alt="" className="h-10 w-10 rounded object-cover" />
                      <div>
                        <Link
                          to="/products/$productId"
                          params={{ productId: p.id }}
                          className="font-medium hover:underline"
                        >
                          {p.title}
                        </Link>
                        <div className="text-xs text-muted-foreground">
                          {p.discount_badge} · ★ {p.rating.toFixed(1)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">{CATEGORY_LABEL[p.category]}</td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-[var(--brand-accent)]">
                      ${p.current_price}
                    </span>{" "}
                    <span className="text-xs text-muted-foreground line-through">
                      ${p.original_price}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setEditing(p)}
                        aria-label="Modifier"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          if (confirm(`Supprimer "${p.title}" ?`)) deleteMut.mutate(p.id);
                        }}
                        aria-label="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <aside className="rounded-lg border border-[var(--brand-hairline)] bg-[var(--brand-muted)]/40 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wider">
            {editing ? "Modifier le produit" : "Nouveau produit"}
          </h3>
          {editing && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setEditing(null);
                setForm(emptyProductForm);
              }}
            >
              Annuler
            </Button>
          )}
        </div>
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <Label htmlFor="p-title">Titre</Label>
            <Input
              id="p-title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              maxLength={200}
              required
            />
          </div>
          <div>
            <Label htmlFor="p-cat">Catégorie</Label>
            <Select
              value={form.category}
              onValueChange={(v) => setForm({ ...form, category: v as ProductCategory })}
            >
              <SelectTrigger id="p-cat">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categoriesList.map((c) => (
                  <SelectItem key={c.slug} value={c.slug}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Image</Label>
            <R2ImageUpload
              value={form.image_url}
              onChange={(url) => setForm({ ...form, image_url: url })}
            />
            <div className="mt-2">
              <button
                type="button"
                onClick={() => setShowUrlInput(!showUrlInput)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <Link2 size={12} />
                {showUrlInput ? "Masquer le champ URL" : "Coller l'URL de l'image à la place"}
              </button>
              {showUrlInput && (
                <div className="mt-2">
                  <Input
                    id="p-img"
                    value={form.image_url}
                    onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                    placeholder="https://…"
                  />
                </div>
              )}
            </div>
          </div>
          <div>
            <Label>Images de la galerie (max 4)</Label>
            <R2MultiImageUpload
              value={form.gallery}
              onChange={(urls) => setForm({ ...form, gallery: urls })}
              max={4}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="p-cur">Prix actuel</Label>
              <Input
                id="p-cur"
                type="number"
                step="0.01"
                min="0"
                value={form.current_price}
                onChange={(e) => setForm({ ...form, current_price: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="p-orig">Prix d'origine</Label>
              <Input
                id="p-orig"
                type="number"
                step="0.01"
                min="0"
                value={form.original_price}
                onChange={(e) => setForm({ ...form, original_price: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="p-badge">Badge de réduction</Label>
              <Input
                id="p-badge"
                value={form.discount_badge}
                onChange={(e) => setForm({ ...form, discount_badge: e.target.value })}
                maxLength={16}
                required
              />
            </div>
            <div>
              <Label htmlFor="p-rate">Note (0–5)</Label>
              <Input
                id="p-rate"
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={form.rating}
                onChange={(e) => setForm({ ...form, rating: e.target.value })}
                required
              />
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button
            type="submit"
            className="w-full"
            disabled={createMut.isPending || updateMut.isPending}
          >
            {editing ? (
              updateMut.isPending ? (
                "Enregistrement…"
              ) : (
                "Enregistrer les modifications"
              )
            ) : createMut.isPending ? (
              "Création…"
            ) : (
              <>
                <Plus className="mr-1 h-4 w-4" /> Ajouter un produit
              </>
            )}
          </Button>
        </form>
      </aside>
    </div>
  );
}

/* ---------------- Categories ---------------- */

function CategoriesPanel({ token }: { token: string }) {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Category | null>(null);
  const [slug, setSlug] = useState("");
  const [label, setLabel] = useState("");
  const [error, setError] = useState<string | null>(null);

  const categoriesQuery = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: () => adminListCategories({ data: { token } }),
  });

  useEffect(() => {
    if (editing) {
      setSlug(editing.slug);
      setLabel(editing.label);
    } else {
      setSlug("");
      setLabel("");
    }
  }, [editing]);

  const createMut = useMutation({
    mutationFn: (payload: { slug: string; label: string }) =>
      createCategory({ data: { token, ...payload } }),
    onSuccess: () => {
      toast.success("Catégorie créée");
      setSlug("");
      setLabel("");
      qc.invalidateQueries({ queryKey: ["admin", "categories"] });
    },
    onError: (e: Error) => toast.error(e.message || "Échec de la création"),
  });

  const updateMut = useMutation({
    mutationFn: (payload: { slug: string; label: string }) =>
      updateCategory({ data: { token, ...payload } }),
    onSuccess: () => {
      toast.success("Catégorie mise à jour");
      setEditing(null);
      setSlug("");
      setLabel("");
      qc.invalidateQueries({ queryKey: ["admin", "categories"] });
    },
    onError: (e: Error) => toast.error(e.message || "Échec de la mise à jour"),
  });

  const deleteMut = useMutation({
    mutationFn: (slug: string) => deleteCategory({ data: { token, slug } }),
    onSuccess: () => {
      toast.success("Catégorie supprimée");
      qc.invalidateQueries({ queryKey: ["admin", "categories"] });
    },
    onError: (e: Error) => toast.error(e.message || "Échec de la suppression"),
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const slugTrimmed = slug
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    const labelTrimmed = label.trim();
    if (!slugTrimmed) {
      setError("Le slug est requis.");
      return;
    }
    if (!labelTrimmed) {
      setError("Le libellé est requis.");
      return;
    }
    if (editing) {
      updateMut.mutate({ slug: editing.slug, label: labelTrimmed });
    } else {
      createMut.mutate({ slug: slugTrimmed, label: labelTrimmed });
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold">Catégories</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => categoriesQuery.refetch()}
            disabled={categoriesQuery.isFetching}
          >
            <RefreshCw className="mr-2 h-4 w-4" /> Actualiser
          </Button>
        </div>
        <div className="overflow-hidden rounded-lg border border-[var(--brand-hairline)]">
          <table className="w-full text-sm">
            <thead className="bg-[var(--brand-muted)] text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Libellé</th>
                <th className="px-4 py-3 w-24"></th>
              </tr>
            </thead>
            <tbody>
              {categoriesQuery.isLoading && (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                    Chargement…
                  </td>
                </tr>
              )}
              {categoriesQuery.data?.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                    Aucune catégorie pour le moment — créez-en une à droite.
                  </td>
                </tr>
              )}
              {categoriesQuery.data?.map((c) => (
                <tr key={c.slug} className="border-t border-[var(--brand-hairline)]">
                  <td className="px-4 py-3 font-mono text-xs">{c.slug}</td>
                  <td className="px-4 py-3 font-medium">{c.label}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setEditing(c)}
                        aria-label="Modifier"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          if (confirm(`Supprimer "${c.label}" ?`)) deleteMut.mutate(c.slug);
                        }}
                        aria-label="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <aside className="rounded-lg border border-[var(--brand-hairline)] bg-[var(--brand-muted)]/40 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wider">
            {editing ? "Modifier la catégorie" : "Nouvelle catégorie"}
          </h3>
          {editing && (
            <Button variant="ghost" size="sm" onClick={() => setEditing(null)}>
              Annuler
            </Button>
          )}
        </div>
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <Label htmlFor="c-slug">Slug</Label>
            <Input
              id="c-slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              maxLength={64}
              placeholder="ex. bureaux"
              disabled={!!editing}
              required
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Lettres minuscules, chiffres et tirets uniquement.
            </p>
          </div>
          <div>
            <Label htmlFor="c-label">Libellé</Label>
            <Input
              id="c-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              maxLength={64}
              placeholder="ex. Bureaux"
              required
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button
            type="submit"
            className="w-full"
            disabled={createMut.isPending || updateMut.isPending}
          >
            {editing ? (
              updateMut.isPending ? (
                "Enregistrement…"
              ) : (
                "Enregistrer les modifications"
              )
            ) : createMut.isPending ? (
              "Création…"
            ) : (
              <>
                <Plus className="mr-1 h-4 w-4" /> Ajouter une catégorie
              </>
            )}
          </Button>
        </form>
      </aside>
    </div>
  );
}

/* ---------------- Blog ---------------- */

type BlogForm = {
  title: string;
  excerpt: string;
  image_url: string;
  content: string;
};

const emptyBlogForm: BlogForm = { title: "", excerpt: "", image_url: "", content: "" };

function parseBlogForm(f: BlogForm): { ok: true; value: BlogForm } | { ok: false; error: string } {
  const title = f.title.trim();
  const excerpt = f.excerpt.trim();
  const image_url = f.image_url.trim();
  if (!title || title.length > 200) return { ok: false, error: "Titre 1–200 caractères." };
  if (!excerpt || excerpt.length > 500) return { ok: false, error: "Extrait 1–500 caractères." };
  try {
    new URL(image_url);
  } catch {
    return { ok: false, error: "L'URL de l'image doit être une URL valide." };
  }
  return { ok: true, value: { title, excerpt, image_url, content: f.content } };
}

function BlogPanel({ token }: { token: string }) {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [form, setForm] = useState<BlogForm>(emptyBlogForm);
  const [error, setError] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);

  const postsQuery = useQuery({
    queryKey: ["admin", "blog"],
    queryFn: () => adminListBlogPosts({ data: { token } }),
  });

  useEffect(() => {
    if (editing) {
      setForm({
        title: editing.title,
        excerpt: editing.excerpt,
        image_url: editing.image_url,
        content: editing.content,
      });
    }
  }, [editing]);

  const createMut = useMutation({
    mutationFn: (payload: BlogForm) => createBlogPost({ data: { token, ...payload } }),
    onSuccess: () => {
      toast.success("Article créé");
      setForm(emptyBlogForm);
      qc.invalidateQueries({ queryKey: ["admin", "blog"] });
    },
    onError: (e: Error) => toast.error(e.message || "Échec de la création"),
  });

  const updateMut = useMutation({
    mutationFn: (payload: { id: string } & BlogForm) =>
      updateBlogPost({ data: { token, ...payload } }),
    onSuccess: () => {
      toast.success("Article mis à jour");
      setEditing(null);
      setForm(emptyBlogForm);
      qc.invalidateQueries({ queryKey: ["admin", "blog"] });
    },
    onError: (e: Error) => toast.error(e.message || "Échec de la mise à jour"),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteBlogPost({ data: { token, id } }),
    onSuccess: () => {
      toast.success("Article supprimé");
      qc.invalidateQueries({ queryKey: ["admin", "blog"] });
    },
    onError: (e: Error) => toast.error(e.message || "Échec de la suppression"),
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const parsed = parseBlogForm(form);
    if (!parsed.ok) {
      setError(parsed.error);
      return;
    }
    if (editing) updateMut.mutate({ id: editing.id, ...parsed.value });
    else createMut.mutate(parsed.value);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold">Journal</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => postsQuery.refetch()}
            disabled={postsQuery.isFetching}
          >
            <RefreshCw className="mr-2 h-4 w-4" /> Actualiser
          </Button>
        </div>
        <div className="overflow-hidden rounded-lg border border-[var(--brand-hairline)]">
          <table className="w-full text-sm">
            <thead className="bg-[var(--brand-muted)] text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Article</th>
                <th className="px-4 py-3 w-24"></th>
              </tr>
            </thead>
            <tbody>
              {postsQuery.isLoading && (
                <tr>
                  <td colSpan={2} className="px-4 py-8 text-center text-muted-foreground">
                    Chargement…
                  </td>
                </tr>
              )}
              {postsQuery.data?.length === 0 && (
                <tr>
                  <td colSpan={2} className="px-4 py-8 text-center text-muted-foreground">
                    Aucun article pour le moment.
                  </td>
                </tr>
              )}
              {postsQuery.data?.map((a) => (
                <tr key={a.id} className="border-t border-[var(--brand-hairline)]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={a.image_url} alt="" className="h-10 w-16 rounded object-cover" />
                      <div>
                        <div className="font-medium">{a.title}</div>
                        <div className="line-clamp-1 text-xs text-muted-foreground">
                          {a.excerpt}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setEditing(a)}
                        aria-label="Modifier"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          if (confirm(`Supprimer "${a.title}" ?`)) deleteMut.mutate(a.id);
                        }}
                        aria-label="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <aside className="rounded-lg border border-[var(--brand-hairline)] bg-[var(--brand-muted)]/40 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wider">
            {editing ? "Modifier l'article" : "Nouvel article"}
          </h3>
          {editing && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setEditing(null);
                setForm(emptyBlogForm);
              }}
            >
              Annuler
            </Button>
          )}
        </div>
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <Label htmlFor="a-title">Titre</Label>
            <Input
              id="a-title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              maxLength={200}
              required
            />
          </div>
          <div>
            <Label htmlFor="a-excerpt">Extrait</Label>
            <Textarea
              id="a-excerpt"
              value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              maxLength={500}
              rows={2}
              required
            />
          </div>
          <div>
            <Label>Image</Label>
            <R2ImageUpload
              value={form.image_url}
              onChange={(url) => setForm({ ...form, image_url: url })}
            />
            <div className="mt-2">
              <button
                type="button"
                onClick={() => setShowUrlInput(!showUrlInput)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <Link2 size={12} />
                {showUrlInput ? "Masquer le champ URL" : "Coller l'URL de l'image à la place"}
              </button>
              {showUrlInput && (
                <div className="mt-2">
                  <Input
                    id="a-img"
                    value={form.image_url}
                    onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                    placeholder="https://…"
                  />
                </div>
              )}
            </div>
          </div>
          <div>
            <Label htmlFor="a-content">Contenu (optionnel)</Label>
            <Textarea
              id="a-content"
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              rows={5}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button
            type="submit"
            className="w-full"
            disabled={createMut.isPending || updateMut.isPending}
          >
            {editing ? (
              updateMut.isPending ? (
                "Enregistrement…"
              ) : (
                "Enregistrer les modifications"
              )
            ) : createMut.isPending ? (
              "Création…"
            ) : (
              <>
                <Plus className="mr-1 h-4 w-4" /> Ajouter un article
              </>
            )}
          </Button>
        </form>
      </aside>
    </div>
  );
}

/* ---------------- Reviews ---------------- */

function formatDate(unix: number): string {
  return new Date(unix * 1000).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function ReviewsPanel({ token }: { token: string }) {
  const qc = useQueryClient();

  const reviewsQuery = useQuery({
    queryKey: ["admin", "reviews"],
    queryFn: () => adminListReviews({ data: { token } }),
  });

  const approveMut = useMutation({
    mutationFn: (id: string) => adminApproveReview({ data: { token, id } }),
    onSuccess: () => {
      toast.success("Avis approuvé");
      qc.invalidateQueries({ queryKey: ["admin", "reviews"] });
    },
    onError: (e: Error) => toast.error(e.message || "Échec de l'approbation"),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => adminDeleteReview({ data: { token, id } }),
    onSuccess: () => {
      toast.success("Avis supprimé");
      qc.invalidateQueries({ queryKey: ["admin", "reviews"] });
    },
    onError: (e: Error) => toast.error(e.message || "Échec de la suppression"),
  });

  const sorted = reviewsQuery.data
    ? [...reviewsQuery.data].sort((a, b) => (a.approved === b.approved ? 0 : a.approved ? 1 : -1))
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Avis</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => reviewsQuery.refetch()}
          disabled={reviewsQuery.isFetching}
        >
          <RefreshCw className="mr-2 h-4 w-4" /> Actualiser
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg border border-[var(--brand-hairline)]">
        <table className="w-full text-sm">
          <thead className="bg-[var(--brand-muted)] text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Produit</th>
              <th className="px-4 py-3">Client</th>
              <th className="px-4 py-3">Note</th>
              <th className="px-4 py-3">Avis</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3 w-24"></th>
            </tr>
          </thead>
          <tbody>
              {reviewsQuery.isLoading && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    Chargement…
                  </td>
                </tr>
              )}
              {reviewsQuery.isError && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-destructive">
                    Échec du chargement des avis.
                  </td>
                </tr>
              )}
              {reviewsQuery.data?.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    Aucun avis pour le moment.
                </td>
              </tr>
            )}
            {sorted.map((r) => (
              <tr key={r.id} className="border-t border-[var(--brand-hairline)]">
                <td className="px-4 py-3 max-w-[200px] truncate font-medium">{r.product_title}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <span>{r.customer_name}</span>
                    {r.verified_purchase && <CheckCircle size={12} className="text-green-600" />}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <Star
                      size={14}
                      className="fill-[var(--brand-accent)] text-[var(--brand-accent)]"
                    />
                    <span className="font-semibold">{r.rating}/5</span>
                  </div>
                </td>
                <td className="px-4 py-3 max-w-xs">
                  <div className="line-clamp-2 text-muted-foreground">{r.body}</div>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {formatDate(r.created_at)}
                </td>
                <td className="px-4 py-3">
                  {r.approved ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700">
                      <CheckCircle size={12} /> Approuvé
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600">
                      En attente
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    {!r.approved && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => approveMut.mutate(r.id)}
                        disabled={approveMut.isPending}
                        aria-label="Approuver"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        if (confirm("Supprimer cet avis ?")) deleteMut.mutate(r.id);
                      }}
                      aria-label="Supprimer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
