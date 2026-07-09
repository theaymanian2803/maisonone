import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo, useEffect } from "react";
import { Search, Star, ShoppingBag, SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { getAllProducts, getProductsByCategory, getCategories } from "@/lib/catalog.functions";
import { type ProductCategory, type Category } from "@/lib/catalog.types";
import { SiteHeader, TopBar, Footer } from "@/components/layout/SiteHeader";
import { useCart } from "@/contexts/CartContext";

export const Route = createFileRoute("/shop")({
  validateSearch: (search: Record<string, unknown>) => ({
    category: (search.category as ProductCategory) || undefined,
  }),
  head: () => ({
    meta: [
      { title: "Boutique · Maison" },
      {
        name: "description",
        content:
          "Parcourez notre collection complète de mobilier moderne — meubles TV, canapés, tapis, tables, rangements et plus.",
      },
    ],
  }),
  component: ShopPage,
});

const SORT_OPTIONS = [
  { value: "default", label: "En vedette" },
  { value: "price-asc", label: "Prix: croissant" },
  { value: "price-desc", label: "Prix: décroissant" },
  { value: "rating", label: "Mieux notés" },
] as const;

function Rating({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={14}
          className={cn(
            i < value
              ? "fill-[var(--brand-accent)] text-[var(--brand-accent)]"
              : "text-[var(--brand-hairline)]",
          )}
        />
      ))}
    </div>
  );
}

function ShopPage() {
  const navigate = useNavigate();
  const { category: urlCategory } = useSearch({ from: Route.id });
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<ProductCategory | "all">(
    urlCategory ?? "all",
  );
  const [sort, setSort] = useState("default");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const { addItem } = useCart();

  const allProductsQuery = useQuery({
    queryKey: ["products", "all"],
    queryFn: () => getAllProducts(),
  });

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: () => getCategories(),
  });

  const categories = categoriesQuery.data ?? [];
  const categoryLabelMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const c of categories) map[c.slug] = c.label;
    return map;
  }, [categories]);

  useEffect(() => {
    setActiveCategory(urlCategory ?? "all");
  }, [urlCategory]);

  const categoryProductsQuery = useQuery({
    queryKey: ["products", "category", activeCategory],
    queryFn: () =>
      activeCategory === "all"
        ? getAllProducts()
        : getProductsByCategory({ data: { category: activeCategory } }),
    enabled: activeCategory !== "all",
  });

  const products =
    activeCategory === "all" ? (allProductsQuery.data ?? []) : (categoryProductsQuery.data ?? []);

  const filtered = useMemo(() => {
    let list = products;

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) || (categoryLabelMap[p.category]?.toLowerCase() ?? p.category).includes(q),
      );
    }

    switch (sort) {
      case "price-asc":
        list = [...list].sort((a, b) => a.current_price - b.current_price);
        break;
      case "price-desc":
        list = [...list].sort((a, b) => b.current_price - a.current_price);
        break;
      case "rating":
        list = [...list].sort((a, b) => b.rating - a.rating);
        break;
    }

    return list;
  }, [products, search, sort]);

  const allProducts = allProductsQuery.data ?? [];
  const isLoading = allProductsQuery.isLoading;
  const resultCount = filtered.length;

  function setCategory(cat: ProductCategory | "all") {
    setActiveCategory(cat);
    navigate({ to: "/shop", search: cat === "all" ? {} : { category: cat }, replace: true });
  }

  const selectedLabel = activeCategory === "all" ? "Tout" : (categoryLabelMap[activeCategory] ?? activeCategory);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: allProducts.length };
    for (const cat of categories) {
      counts[cat.slug] = allProducts.filter((p) => p.category === cat.slug).length;
    }
    return counts;
  }, [allProducts, categories]);

  const sidebar = (
    <div>
      <h3 className="text-xs font-semibold tracking-[0.2em] uppercase text-foreground">
        Catégories
      </h3>
      <ul className="mt-4 space-y-1">
        <li>
          <button
            onClick={() => setCategory("all")}
            className={cn(
              "flex w-full items-center justify-between px-3 py-2 text-sm transition-colors",
              activeCategory === "all"
                ? "bg-foreground text-background font-medium"
                : "text-muted-foreground hover:text-foreground hover:bg-[var(--brand-muted)]",
            )}
          >
            <span>Tout</span>
            <span className="text-[11px] opacity-60">{categoryCounts.all}</span>
          </button>
        </li>
        {categories.map((c) => (
          <li key={c.slug}>
            <button
              onClick={() => setCategory(c.slug as ProductCategory)}
              className={cn(
                "flex w-full items-center justify-between px-3 py-2 text-sm transition-colors",
                activeCategory === c.slug
                  ? "bg-foreground text-background font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-[var(--brand-muted)]",
              )}
            >
              <span>{c.label}</span>
              <span className="text-[11px] opacity-60">{categoryCounts[c.slug]}</span>
            </button>
          </li>
        ))}
      </ul>

      {activeCategory !== "all" && (
        <button
          onClick={() => setCategory("all")}
          className="mt-4 w-full border border-[var(--brand-hairline)] px-3 py-2 text-[11px] font-semibold tracking-[0.15em] uppercase text-muted-foreground transition-colors hover:bg-[var(--brand-muted)] hover:text-foreground"
        >
          Effacer le filtre
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopBar />
      <SiteHeader />

      <section className="mx-auto max-w-7xl px-4 pt-16 pb-6 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-muted-foreground">
            Collection Maison
          </p>
          <h1 className="mt-3 font-serif text-4xl leading-tight text-foreground sm:text-5xl">
            Boutique
          </h1>
          <p className="mt-3 text-muted-foreground">
            {resultCount} {resultCount === 1 ? "produit" : "produits"}
            {activeCategory !== "all" && ` in ${(categoryLabelMap[activeCategory] ?? activeCategory).toLowerCase()}`}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="lg:hidden">
          <div className="mb-4 flex items-center justify-between gap-4 border-b border-[var(--brand-hairline)] pb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              className="flex items-center gap-1.5 text-xs tracking-wider uppercase"
            >
              <SlidersHorizontal size={14} />
              {selectedLabel}
            </Button>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  placeholder="Rechercher…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-9 w-36 rounded-none border-foreground/20 pl-8 text-xs"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="h-9 appearance-none rounded-none border border-foreground/20 bg-background px-2 pr-7 text-xs font-medium tracking-wider uppercase text-muted-foreground outline-none hover:text-foreground focus:border-foreground/40 cursor-pointer"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={12}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground"
                />
              </div>
            </div>
          </div>

          {mobileFiltersOpen && (
            <div className="mb-6 border border-[var(--brand-hairline)] p-4">{sidebar}</div>
          )}
        </div>

        <div className="hidden lg:flex lg:gap-10">
          <aside className="w-[220px] shrink-0">
            <div className="sticky top-[97px]">{sidebar}</div>
          </aside>

          <div className="min-w-0 flex-1 pb-20">
            <div className="mb-6 flex items-center justify-between border-b border-[var(--brand-hairline)] pb-4">
              <div className="relative w-56">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  placeholder="Rechercher…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-9 w-full rounded-none border-foreground/20 pl-8 text-xs"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="h-9 appearance-none rounded-none border border-foreground/20 bg-background px-3 pr-8 text-xs font-medium tracking-wider uppercase text-muted-foreground outline-none hover:text-foreground focus:border-foreground/40 cursor-pointer"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={12}
                  className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground"
                />
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-[4/5] bg-[var(--brand-muted)]" />
                    <div className="mt-4 space-y-2">
                      <div className="h-4 w-3/4 rounded bg-[var(--brand-muted)]" />
                      <div className="h-4 w-1/2 rounded bg-[var(--brand-muted)]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-24 text-center">
                <p className="text-base text-muted-foreground">Aucun produit trouvé.</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Essayez de modifier votre recherche ou vos filtres.
                </p>
                <Button
                  variant="outline"
                  className="mt-6 rounded-none border-foreground/80 px-8 text-xs font-semibold tracking-[0.2em] uppercase"
                  onClick={() => {
                    setSearch("");
                    setCategory("all");
                    setSort("default");
                  }}
                >
                  Tout effacer
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3">
                {filtered.map((p) => (
                  <div key={p.id} className="group flex flex-col">
                    <div className="relative overflow-hidden bg-[var(--brand-muted)]">
                      <Link to="/products/$productId" params={{ productId: p.id }}>
                        <img
                          src={p.image_url}
                          alt={p.title}
                          loading="lazy"
                          className="aspect-[4/5] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </Link>
                      <span className="absolute right-3 top-3 rounded-full bg-[var(--brand-accent)] px-2.5 py-1 text-[11px] font-semibold tracking-wide text-[var(--brand-accent-foreground)]">
                        {p.discount_badge}
                      </span>
                      <button
                        onClick={() => {
                          addItem({
                            product_id: p.id,
                            title: p.title,
                            image_url: p.image_url,
                            price: p.current_price,
                          });
                          toast.success("Ajouté au panier");
                        }}
                        className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-2 bg-foreground py-3 text-[11px] font-semibold tracking-[0.2em] uppercase text-background opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <ShoppingBag size={14} /> Ajouter au panier
                      </button>
                    </div>
                    <Link to="/products/$productId" params={{ productId: p.id }} className="pt-4">
                      <p className="text-[11px] font-medium tracking-[0.15em] uppercase text-muted-foreground">
                        {categoryLabelMap[p.category] ?? p.category}
                      </p>
                      <h3 className="mt-1 text-[15px] font-semibold text-foreground">{p.title}</h3>
                      <div className="mt-1 flex items-baseline gap-2">
                        <span className="text-base font-semibold text-[var(--brand-accent)]">
                          ${p.current_price}
                        </span>
                        <span className="text-sm text-muted-foreground line-through">
                          ${p.original_price}
                        </span>
                      </div>
                      <div className="mt-2">
                        <Rating value={p.rating} />
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6 lg:px-8 lg:hidden">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-x-6 gap-y-10">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[4/5] bg-[var(--brand-muted)]" />
                <div className="mt-4 space-y-2">
                  <div className="h-4 w-3/4 rounded bg-[var(--brand-muted)]" />
                  <div className="h-4 w-1/2 rounded bg-[var(--brand-muted)]" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-base text-muted-foreground">Aucun produit trouvé.</p>
            <p className="mt-2 text-sm text-muted-foreground">Essayez de modifier votre recherche ou vos filtres.</p>
            <Button
              variant="outline"
              className="mt-6 rounded-none border-foreground/80 px-8 text-xs font-semibold tracking-[0.2em] uppercase"
              onClick={() => {
                setSearch("");
                setCategory("all");
                setSort("default");
              }}
            >
              Tout effacer
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-6 gap-y-10">
            {filtered.map((p) => (
              <div key={p.id} className="group flex flex-col">
                <div className="relative overflow-hidden bg-[var(--brand-muted)]">
                  <Link to="/products/$productId" params={{ productId: p.id }}>
                    <img
                      src={p.image_url}
                      alt={p.title}
                      loading="lazy"
                      className="aspect-[4/5] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </Link>
                  <span className="absolute right-3 top-3 rounded-full bg-[var(--brand-accent)] px-2.5 py-1 text-[11px] font-semibold tracking-wide text-[var(--brand-accent-foreground)]">
                    {p.discount_badge}
                  </span>
                  <button
                    onClick={() => {
                      addItem({
                        product_id: p.id,
                        title: p.title,
                        image_url: p.image_url,
                        price: p.current_price,
                      });
                      toast.success("Ajouté au panier");
                    }}
                    className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-2 bg-foreground py-3 text-[11px] font-semibold tracking-[0.2em] uppercase text-background opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <ShoppingBag size={14} /> Ajouter au panier
                  </button>
                </div>
                <Link to="/products/$productId" params={{ productId: p.id }} className="pt-4">
                  <p className="text-[11px] font-medium tracking-[0.15em] uppercase text-muted-foreground">
                    {categoryLabelMap[p.category] ?? p.category}
                  </p>
                  <h3 className="mt-1 text-[15px] font-semibold text-foreground">{p.title}</h3>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-base font-semibold text-[var(--brand-accent)]">
                      ${p.current_price}
                    </span>
                    <span className="text-sm text-muted-foreground line-through">
                      ${p.original_price}
                    </span>
                  </div>
                  <div className="mt-2">
                    <Rating value={p.rating} />
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
