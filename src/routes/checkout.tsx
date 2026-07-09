import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, Trash2, Minus, Plus, ShoppingBag, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { SiteHeader, TopBar, Footer } from "@/components/layout/SiteHeader";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { placeOrder } from "@/lib/customer.functions";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Commander · Maison" },
      {
        name: "description",
        content: "Finalisez votre commande.",
      },
    ],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { items, count, total, removeItem, updateQuantity, clearCart } = useCart();
  const { customer, token } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(customer?.name ?? "");
  const [email, setEmail] = useState(customer?.email ?? "");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  const placeOrderMut = useMutation({
    mutationFn: () =>
      placeOrder({
        data: {
          customer_name: name.trim(),
          customer_email: email.trim(),
          customer_phone: phone.trim(),
          shipping_address: address.trim(),
          notes: notes.trim(),
          items: items.map((i) => ({
            product_id: i.product_id,
            title: i.title,
            quantity: i.quantity,
            unit_price: i.price,
          })),
          auth_token: token ?? undefined,
        },
      }),
    onSuccess: (res) => {
      clearCart();
      navigate({ to: "/order/$orderId", params: { orderId: res.id } });
    },
    onError: (e: Error) => toast.error(e.message || "Échec de la commande"),
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (items.length === 0) {
      toast.error("Votre panier est vide.");
      return;
    }
    placeOrderMut.mutate();
  }

  if (count === 0 && !placeOrderMut.isSuccess) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <TopBar />
        <SiteHeader />
        <div className="mx-auto max-w-lg px-4 py-24 text-center sm:px-6">
          <ShoppingBag size={48} className="mx-auto text-muted-foreground/30" />
          <h1 className="mt-6 font-serif text-3xl text-foreground">Votre panier est vide</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Ajoutez des produits avant de commander.
          </p>
          <Button
            variant="outline"
            className="mt-6 rounded-none border-foreground/80 px-8 text-xs font-semibold tracking-[0.2em] uppercase"
            asChild
          >
            <Link to="/shop">Continuer mes achats</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopBar />
      <SiteHeader />
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <Link
          to="/shop"
          className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={14} /> Continuer mes achats
        </Link>
        <h1 className="mt-6 font-serif text-3xl leading-tight text-foreground sm:text-4xl">
          Commander
        </h1>

        <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_420px]">
          <section>
            <h2 className="text-sm font-semibold tracking-[0.2em] uppercase text-foreground">
              Coordonnées
            </h2>
            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <div>
                <Label htmlFor="co-name">Nom complet</Label>
                <Input
                  id="co-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="rounded-none"
                />
              </div>
              <div>
                <Label htmlFor="co-email">Email</Label>
                <Input
                  id="co-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="rounded-none"
                />
              </div>
              <div>
                <Label htmlFor="co-phone">Téléphone</Label>
                <Input
                  id="co-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000 0000"
                  className="rounded-none"
                />
              </div>
              <div>
                <Label htmlFor="co-address">Adresse de livraison</Label>
                <Textarea
                  id="co-address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={3}
                  required
                  className="rounded-none"
                />
              </div>
              <div>
                <Label htmlFor="co-notes">Notes de commande (facultatif)</Label>
                <Textarea
                  id="co-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="rounded-none"
                />
              </div>

              {!customer && (
                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Lock size={12} />
                  Commander en tant qu'invité. Votre email sera utilisé pour la confirmation de commande.
                </p>
              )}

              <Button
                type="submit"
                className="w-full rounded-none bg-foreground py-6 text-[11px] font-semibold tracking-[0.2em] uppercase text-background hover:bg-foreground/90"
                disabled={placeOrderMut.isPending}
              >
                {placeOrderMut.isPending ? "Commande en cours…" : `Passer la commande — $${total.toFixed(2)}`}
              </Button>
            </form>
          </section>

          <section>
            <h2 className="text-sm font-semibold tracking-[0.2em] uppercase text-foreground">
              Récapitulatif
            </h2>
            <div className="mt-6 rounded-lg border border-[var(--brand-hairline)]">
              <div className="divide-y divide-[var(--brand-hairline)]">
                {items.map((item) => (
                  <div key={item.product_id} className="flex gap-4 px-4 py-4">
                    <div className="h-16 w-12 shrink-0 overflow-hidden bg-[var(--brand-muted)]">
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex flex-1 flex-col justify-between">
                      <div className="flex justify-between gap-2">
                        <p className="text-sm font-medium leading-tight text-foreground">
                          {item.title}
                        </p>
                        <button
                          onClick={() => removeItem(item.product_id)}
                          className="shrink-0 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                            className="grid h-6 w-6 place-items-center rounded border border-[var(--brand-hairline)] text-muted-foreground hover:text-foreground"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-6 text-center text-xs font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                            className="grid h-6 w-6 place-items-center rounded border border-[var(--brand-hairline)] text-muted-foreground hover:text-foreground"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                        <p className="text-sm font-semibold text-foreground">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-[var(--brand-hairline)] px-4 py-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Sous-total</span>
                  <span className="font-semibold text-foreground">${total.toFixed(2)}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Livraison</span>
                  <span className="text-muted-foreground">Calculé à l'étape suivante</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}
