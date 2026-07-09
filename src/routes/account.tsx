import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { User, Package, Mail, LogOut, ShoppingBag, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader, TopBar, Footer } from "@/components/layout/SiteHeader";
import { useAuth } from "@/contexts/AuthContext";
import { listCustomerOrders } from "@/lib/customer.functions";
import { ORDER_STATUS_LABEL, type OrderStatus } from "@/lib/catalog.types";
import { toast } from "sonner";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "Mon compte · Maison" },
      { name: "description", content: "Gérez votre compte Maison et consultez vos commandes." },
    ],
  }),
  component: AccountPage,
});

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  paid: "bg-sky-100 text-sky-800",
  shipped: "bg-violet-100 text-violet-800",
  delivered: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-neutral-200 text-neutral-700",
  refunded: "bg-rose-100 text-rose-800",
};

function formatDate(unix: number): string {
  return new Date(unix * 1000).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function AccountPage() {
  const { customer, token, logout, loading } = useAuth();
  const navigate = useNavigate();

  const ordersQuery = useQuery({
    queryKey: ["account", "orders"],
    queryFn: () => listCustomerOrders({ data: { token: token ?? "" } }),
    enabled: !!token,
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <TopBar />
        <SiteHeader />
        <div className="mx-auto max-w-4xl px-4 py-24 text-center sm:px-6">
          <p className="text-sm text-muted-foreground">Chargement…</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <TopBar />
        <SiteHeader />
        <div className="mx-auto max-w-lg px-4 py-24 text-center sm:px-6">
          <User size={48} className="mx-auto text-muted-foreground/30" />
          <h1 className="mt-6 font-serif text-3xl text-foreground">Connectez-vous</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Consultez votre historique de commandes et gérez vos informations.
          </p>
          <Button
            className="mt-6 rounded-none bg-foreground px-8 text-xs font-semibold tracking-[0.2em] uppercase text-background hover:bg-foreground/90"
            asChild
          >
            <Link to="/login">Se connecter</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const orders = ordersQuery.data ?? [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopBar />
      <SiteHeader />
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={14} /> Accueil
        </Link>
        <h1 className="mt-6 font-serif text-3xl leading-tight text-foreground sm:text-4xl">
          Mon compte
        </h1>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_2fr]">
          <section className="rounded-lg border border-[var(--brand-hairline)] p-6">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-[var(--brand-muted)]">
                <User size={20} className="text-foreground" />
              </div>
              <div>
                <p className="font-semibold text-foreground">{customer.name}</p>
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Mail size={12} /> {customer.email}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-6 w-full rounded-none text-xs tracking-wider uppercase"
              onClick={() => {
                logout();
                toast.success("Déconnecté");
                navigate({ to: "/" });
              }}
            >
              <LogOut className="mr-2 h-4 w-4" /> Se déconnecter
            </Button>
          </section>

          <section>
            <h2 className="flex items-center gap-2 text-sm font-semibold tracking-[0.2em] uppercase text-foreground">
              <Package size={16} /> Historique des commandes
            </h2>

            {ordersQuery.isLoading ? (
              <p className="mt-4 text-sm text-muted-foreground">Chargement…</p>
            ) : orders.length === 0 ? (
              <div className="mt-6 rounded-lg border border-[var(--brand-hairline)] p-8 text-center">
                <ShoppingBag size={32} className="mx-auto text-muted-foreground/30" />
                <p className="mt-4 text-sm text-muted-foreground">Aucune commande pour le moment.</p>
                <Button
                  variant="outline"
                  className="mt-4 rounded-none border-foreground/80 px-6 text-xs font-semibold tracking-[0.2em] uppercase"
                  asChild
                >
                  <Link to="/shop">Commencer mes achats</Link>
                </Button>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {orders.map((o) => (
                  <Link
                    key={o.id}
                    to="/order/$orderId"
                    params={{ orderId: o.id }}
                    className="block rounded-lg border border-[var(--brand-hairline)] p-4 transition-colors hover:bg-[var(--brand-muted)]/50"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          #{o.id.slice(0, 8).toUpperCase()}
                        </p>
                        <p className="text-xs text-muted-foreground">{formatDate(o.created_at)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-foreground">
                          ${o.total.toFixed(2)}
                        </p>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide mt-1 ${STATUS_COLORS[o.status] ?? ""}`}
                        >
                          {ORDER_STATUS_LABEL[o.status as OrderStatus] ?? o.status}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}
