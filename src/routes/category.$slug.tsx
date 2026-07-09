import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Star, ShoppingBag, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { getCategories, getProductsByCategory } from "@/lib/catalog.functions";
import { SiteHeader, TopBar, Footer } from "@/components/layout/SiteHeader";
import { useCart } from "@/contexts/CartContext";

export const Route = createFileRoute("/category/$slug")({
  loader: async ({ params }) => {
    const slug = params.slug;
    const categories = await getCategories();
    const match = categories.find((c) => c.slug === slug);
    if (!match) throw new Error("Category not found");
    return { slug, label: match.label };
  },
  head: ({ loaderData }) => {
    const label = loaderData.label;
    return {
      meta: [
        { title: `${label} · Maison` },
        {
          name: "description",
          content: `Découvrez notre collection de ${label.toLowerCase()} — mobilier moderne haut de gamme par Maison.`,
        },
      ],
    };
  },
  component: CategoryPage,
  notFoundComponent: () => (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Catégorie introuvable</h2>
        <p className="mt-2 text-sm text-muted-foreground">Cette catégorie n'existe pas.</p>
        <div className="mt-6">
          <Link
            to="/shop"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Tout parcourir
          </Link>
        </div>
      </div>
    </div>
  ),
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

function CategoryPage() {
  const { slug, label } = Route.useLoaderData();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const productsQuery = useQuery({
    queryKey: ["products", "category", slug],
    queryFn: () => getProductsByCategory({ data: { category: slug } }),
  });

  const products = productsQuery.data ?? [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopBar />
      <SiteHeader />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <Link
          to="/shop"
          className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={14} /> Tous les produits
        </Link>

        <div className="mt-8 text-center">
          <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-muted-foreground">
            Collection Maison
          </p>
          <h1 className="mt-3 font-serif text-4xl leading-tight text-foreground sm:text-5xl">
            {label}
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {products.length} {products.length === 1 ? "produit" : "produits"}
          </p>
        </div>

        <section className="mt-12">
          {productsQuery.isLoading ? (
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
          ) : products.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-base text-muted-foreground">Aucun produit dans cette catégorie.</p>
              <Button
                variant="outline"
                className="mt-4 rounded-none border-foreground/80 px-8 text-xs font-semibold tracking-[0.2em] uppercase"
                asChild
              >
                <Link to="/shop">Voir tous les produits</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
              {products.map((p) => (
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
                    <h3 className="text-[15px] font-semibold text-foreground">{p.title}</h3>
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
