import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { Search as SearchIcon, Star, ShoppingBag, X, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { getAllProducts } from "@/lib/catalog.functions";
import { CATEGORY_LABEL } from "@/lib/catalog.types";
import { SiteHeader, TopBar, Footer } from "@/components/layout/SiteHeader";
import { useCart } from "@/contexts/CartContext";

export const Route = createFileRoute("/search")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: (search.q as string) || "",
  }),
  head: () => ({
    meta: [
      { title: "Recherche · Maison" },
      { name: "description", content: "Recherchez dans notre collection de mobilier moderne." },
    ],
  }),
  component: SearchPage,
});

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

function SearchPage() {
  const { q: urlQuery } = useSearch({ from: Route.id });
  const navigate = useNavigate();
  const [input, setInput] = useState(urlQuery);
  const { addItem } = useCart();

  const allProductsQuery = useQuery({
    queryKey: ["products", "all"],
    queryFn: () => getAllProducts(),
  });

  const results = useMemo(() => {
    const query = urlQuery.toLowerCase().trim();
    if (!query) return [];
    const products = allProductsQuery.data ?? [];
    return products.filter(
      (p) =>
        p.title.toLowerCase().includes(query) ||
        CATEGORY_LABEL[p.category].toLowerCase().includes(query),
    );
  }, [urlQuery, allProductsQuery.data]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    navigate({ to: "/search", search: trimmed ? { q: trimmed } : {}, replace: true });
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopBar />
      <SiteHeader />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={14} /> Accueil
        </Link>
        <h1 className="mt-6 font-serif text-3xl leading-tight text-foreground sm:text-4xl">
          Recherche
        </h1>

        <form onSubmit={handleSearch} className="relative mt-8 max-w-xl">
          <SearchIcon
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Rechercher…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="h-12 w-full rounded-none border-foreground/20 pl-12 pr-12 text-base"
            autoFocus
          />
          {input && (
            <button
              type="button"
              onClick={() => {
                setInput("");
                navigate({ to: "/search", search: {}, replace: true });
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X size={18} />
            </button>
          )}
        </form>

        {urlQuery && (
          <p className="mt-4 text-sm text-muted-foreground">
            {results.length} {results.length === 1 ? "résultat" : "résultats"} pour "
            <span className="font-medium text-foreground">{urlQuery}</span>"
          </p>
        )}

        <section className="mt-8">
          {allProductsQuery.isLoading ? (
            <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
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
          ) : !urlQuery ? (
            <div className="py-16 text-center">
              <p className="text-sm text-muted-foreground">Saisissez un terme pour rechercher des produits.</p>
            </div>
          ) : results.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-base text-muted-foreground">Aucun produit trouvé.</p>
              <p className="mt-2 text-sm text-muted-foreground">Essayez un autre terme de recherche.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
              {results.map((p) => (
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
                      {CATEGORY_LABEL[p.category]}
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
      </div>
      <Footer />
    </div>
  );
}
