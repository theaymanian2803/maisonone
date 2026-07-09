import { createFileRoute, Link } from "@tanstack/react-router";
import { ShoppingBag, Trash2, Minus, Plus, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader, TopBar, Footer } from "@/components/layout/SiteHeader";
import { useCart } from "@/contexts/CartContext";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Panier · Maison" },
      {
        name: "description",
        content: "Vérifiez votre panier avant de commander.",
      },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { items, count, total, removeItem, updateQuantity, clearCart } = useCart();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopBar />
      <SiteHeader />
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <Link
          to="/shop"
          className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={14} /> Continuer mes achats
        </Link>
        <h1 className="mt-6 font-serif text-3xl leading-tight text-foreground sm:text-4xl">Panier</h1>

        {count === 0 ? (
          <div className="py-24 text-center">
            <ShoppingBag size={48} className="mx-auto text-muted-foreground/30" />
            <p className="mt-6 text-base text-muted-foreground">Votre panier est vide.</p>
            <Button
              variant="outline"
              className="mt-6 rounded-none border-foreground/80 px-8 text-xs font-semibold tracking-[0.2em] uppercase"
              asChild
            >
              <Link to="/shop">Parcourir les produits</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_380px]">
            <section>
              <div className="divide-y divide-[var(--brand-hairline)] border-t border-[var(--brand-hairline)]">
                {items.map((item) => (
                  <div key={item.product_id} className="flex gap-5 py-6">
                    <div className="h-24 w-20 shrink-0 overflow-hidden bg-[var(--brand-muted)]">
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex flex-1 flex-col justify-between">
                      <div className="flex justify-between gap-2">
                        <div>
                          <Link
                            to="/products/$productId"
                            params={{ productId: item.product_id }}
                            className="text-sm font-semibold text-foreground hover:underline"
                          >
                            {item.title}
                          </Link>
                          <p className="mt-0.5 text-sm font-semibold text-[var(--brand-accent)]">
                            ${item.price.toFixed(2)}
                          </p>
                        </div>
                        <button
                          onClick={() => removeItem(item.product_id)}
                          className="shrink-0 text-muted-foreground hover:text-destructive"
                          aria-label="Supprimer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                            className="grid h-8 w-8 place-items-center rounded-none border border-[var(--brand-hairline)] text-muted-foreground hover:text-foreground"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-8 text-center text-sm font-medium text-foreground">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                            className="grid h-8 w-8 place-items-center rounded-none border border-[var(--brand-hairline)] text-muted-foreground hover:text-foreground"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <p className="ml-auto text-sm font-semibold text-foreground">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={clearCart}
                  className="text-xs font-semibold tracking-[0.15em] uppercase text-muted-foreground hover:text-destructive"
                >
                  Vider le panier
                </button>
              </div>
            </section>

            <aside className="h-fit rounded-lg border border-[var(--brand-hairline)] p-6">
              <h2 className="text-sm font-semibold tracking-[0.2em] uppercase text-foreground">
                Récapitulatif
              </h2>
              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Sous-total ({count} articles)</span>
                  <span className="font-semibold text-foreground">${total.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Livraison</span>
                  <span className="text-muted-foreground">Calculé à la commande</span>
                </div>
              </div>
              <div className="mt-5 border-t border-[var(--brand-hairline)] pt-5">
                <div className="flex items-center justify-between">
                  <span className="text-base font-semibold text-foreground">Total</span>
                  <span className="text-lg font-bold text-foreground">${total.toFixed(2)}</span>
                </div>
              </div>
              <Button
                className="mt-6 w-full rounded-none bg-foreground py-6 text-[11px] font-semibold tracking-[0.2em] uppercase text-background hover:bg-foreground/90"
                asChild
              >
                <Link to="/checkout">Commander</Link>
              </Button>
            </aside>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
