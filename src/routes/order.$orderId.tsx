import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader, TopBar, Footer } from "@/components/layout/SiteHeader";
import { getOrderById } from "@/lib/customer.functions";

export const Route = createFileRoute("/order/$orderId")({
  head: ({ params }) => ({
    meta: [
      { title: `Order ${params.orderId.slice(0, 8)}… · Maison` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OrderConfirmationPage,
});

function OrderConfirmationPage() {
  const { orderId } = Route.useParams();

  const orderQuery = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => getOrderById({ data: { id: orderId } }),
  });

  if (orderQuery.isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <TopBar />
        <SiteHeader />
        <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
          <p className="text-sm text-muted-foreground">Chargement de la commande…</p>
        </div>
        <Footer />
      </div>
    );
  }

  const order = orderQuery.data;

  if (!order) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <TopBar />
        <SiteHeader />
        <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
          <h1 className="font-serif text-3xl text-foreground">Commande introuvable</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Nous n'avons pas trouvé cette commande. Elle a peut-être été supprimée.
          </p>
          <Button
            variant="outline"
            className="mt-6 rounded-none border-foreground/80 px-8 text-xs font-semibold tracking-[0.2em] uppercase"
            asChild
          >
            <Link to="/">Accueil</Link>
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
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
        <CheckCircle size={48} className="mx-auto text-green-600" />
        <h1 className="mt-6 font-serif text-3xl leading-tight text-foreground sm:text-4xl">
          Merci pour votre commande
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Nous enverrons une confirmation à{" "}
          <span className="font-medium text-foreground">{order.customer_email}</span>.
        </p>

        <div className="mx-auto mt-10 max-w-md rounded-lg border border-[var(--brand-hairline)] text-left">
          <div className="flex items-center gap-3 border-b border-[var(--brand-hairline)] px-5 py-4">
            <Package size={18} className="text-muted-foreground" />
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-muted-foreground">
                Commande
              </p>
              <p className="text-sm font-medium text-foreground">
                #{order.id.slice(0, 8).toUpperCase()}
              </p>
            </div>
          </div>
          <div className="divide-y divide-[var(--brand-hairline)] px-5">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">{item.quantity}×</span>
                  <p className="text-sm text-foreground">{item.title}</p>
                </div>
                <p className="text-sm font-medium text-foreground">
                  ${(item.unit_price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
          <div className="border-t border-[var(--brand-hairline)] px-5 py-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">Total</span>
              <span className="text-lg font-bold text-foreground">${order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 text-xs text-muted-foreground">
          <p>Livraison : {order.shipping_address}</p>
          {order.customer_phone && <p className="mt-1">Téléphone : {order.customer_phone}</p>}
          <p className="mt-1">
            Statut : <span className="font-medium capitalize text-foreground">{order.status}</span>
          </p>
        </div>

        <div className="mt-10 flex justify-center gap-4">
          <Button
            variant="outline"
            className="rounded-none border-foreground/80 px-8 text-xs font-semibold tracking-[0.2em] uppercase"
            asChild
          >
            <Link to="/shop">Continuer mes achats</Link>
          </Button>
        </div>
      </div>
      <Footer />
    </div>
  );
}
