import { useState, useRef, useEffect, useMemo } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search, User, ShoppingBag, Menu, X, ChevronRight, LogOut, Package, Mail, Phone, MapPin, Instagram, Youtube } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { getCategories } from "@/lib/catalog.functions";

const IMG = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=400&h=500&q=80`;

const CATEGORY_IMAGES: Record<string, string> = {
  "tv-units": "photo-1616486338812-3dadae4b4ace",
  libraries: "photo-1507473885765-e6ed057f782c",
  shelves: "photo-1615873968403-89e068629265",
  tables: "photo-1499933374294-4584851497cc",
  sofas: "photo-1555041469-a586c61ea9bc",
  rugs: "photo-1600166898405-da9535204843",
  beds: "photo-1616627561950-9f746e330187",
};

const NAV_ITEMS = [
  { label: "Accueil", to: "/" as const },
  { label: "Boutique", to: "/shop" as const, hasMega: true },
  { label: "Journal", to: "/journal" as const },
  { label: "À propos", to: "/about" as const },
];

export function SiteHeader() {
  const location = useLocation();
  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const megaRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { customer, logout } = useAuth();
  const { count } = useCart();
  const categoriesQuery = useQuery({ queryKey: ["categories"], queryFn: () => getCategories() });
  const categories = categoriesQuery.data ?? [];
  const shopSublinks = useMemo(() => [
    { label: "Voir tout", to: "/shop" as const },
    ...categories.map((c) => ({
      label: c.label,
      to: "/shop" as const,
      category: c.slug,
    })),
  ], [categories]);
  const prevPath = useRef(location.pathname);

  useEffect(() => {
    if (location.pathname !== prevPath.current) {
      window.scrollTo({ top: 0, behavior: "instant" });
      prevPath.current = location.pathname;
    }
  }, [location.pathname]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        megaOpen &&
        megaRef.current &&
        triggerRef.current &&
        !megaRef.current.contains(e.target as Node) &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setMegaOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [megaOpen]);

  useEffect(() => {
    setMegaOpen(false);
    setMobileOpen(false);
  }, [location.pathname]);

  const isShop = location.pathname === "/shop";

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--brand-hairline)] bg-background/95 backdrop-blur">
      <div className="mx-auto grid max-w-7xl grid-cols-2 items-center px-4 py-5 sm:px-6 lg:grid-cols-3 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl font-semibold tracking-[0.25em] uppercase">Maison</span>
        </Link>

        <nav className="hidden items-center justify-center gap-8 lg:flex">
          {NAV_ITEMS.map((item) =>
            item.hasMega ? (
              <div key={item.label} className="relative">
                <button
                  ref={triggerRef}
                  onMouseEnter={() => setMegaOpen(true)}
                  onClick={() => setMegaOpen(!megaOpen)}
                  className={cn(
                    "text-[13px] font-medium tracking-[0.12em] uppercase transition-colors",
                    isShop
                      ? "text-[var(--brand-accent)]"
                      : "text-foreground/80 hover:text-[var(--brand-accent)]",
                  )}
                >
                  {item.label}
                </button>

                <div
                  ref={megaRef}
                  onMouseLeave={() => setMegaOpen(false)}
                  className={cn(
                    "fixed left-1/2 top-[73px] z-50 w-4/5 -translate-x-1/2 border border-[var(--brand-hairline)] bg-background shadow-xl transition-all duration-200",
                    megaOpen
                      ? "visible translate-y-0 opacity-100"
                      : "invisible -translate-y-2 opacity-0 pointer-events-none",
                  )}
                >
                  <div className="grid grid-cols-2 gap-0 md:grid-cols-3 lg:grid-cols-4">
                    {shopSublinks.map((sublink) => (
                      <Link
                        key={sublink.label}
                        to={sublink.to}
                        search={sublink.category ? { category: sublink.category } : undefined}
                        className="group relative flex items-center gap-4 border-b border-r border-[var(--brand-hairline)] p-5 transition-colors hover:bg-[var(--brand-muted)]"
                        onClick={() => setMegaOpen(false)}
                      >
                        {sublink.category && CATEGORY_IMAGES[sublink.category] ? (
                          <div className="h-14 w-14 shrink-0 overflow-hidden bg-[var(--brand-muted)]">
                            <img
                              src={IMG(CATEGORY_IMAGES[sublink.category])}
                              alt=""
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          </div>
                        ) : (
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center bg-foreground text-[11px] font-semibold tracking-[0.2em] uppercase text-background">
                              Tout
                            </div>
                        )}
                        <div>
                          <p className="text-sm font-semibold text-foreground">{sublink.label}</p>
                          {sublink.category && (
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              Parcourir {sublink.label.toLowerCase()}
                            </p>
                          )}
                        </div>
                        <ChevronRight
                          size={14}
                          className="ml-auto shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
                        />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <Link
                key={item.label}
                to={item.to}
                className="text-[13px] font-medium tracking-[0.12em] uppercase text-foreground/80 transition-colors hover:text-[var(--brand-accent)]"
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>

        <div className="flex items-center justify-end gap-5">
          <Link
            to="/search"
            aria-label="Rechercher"
            className="text-foreground/80 hover:text-foreground"
          >
            <Search size={18} />
          </Link>
          {customer ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 text-foreground/80 hover:text-foreground">
                  <User size={18} />
                  <span className="hidden text-xs text-muted-foreground sm:inline">
                    {customer.name}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem asChild>
                  <Link to="/account" className="flex items-center gap-2">
                    <Package size={15} />
                    <span>Mes commandes</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="flex items-center gap-2 text-destructive focus:text-destructive"
                  onClick={() => {
                    logout();
                    toast.success("Déconnecté");
                  }}
                >
                  <LogOut size={15} />
                  <span>Déconnexion</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              to="/login"
              aria-label="Compte"
              className="text-foreground/80 hover:text-foreground"
            >
              <User size={18} />
            </Link>
          )}
          <Link
            to="/cart"
            aria-label="Panier"
            className="relative text-foreground/80 hover:text-foreground"
          >
            <ShoppingBag size={18} />
            {count > 0 && (
              <span className="absolute -right-2 -top-2 grid h-4 w-4 place-items-center rounded-full bg-[var(--brand-accent)] text-[10px] font-semibold text-[var(--brand-accent-foreground)]">
                {count > 9 ? "9+" : count}
              </span>
            )}
          </Link>
          <button
            aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
            className="ml-1 text-foreground/80 lg:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <div
        className={cn(
          "fixed inset-0 top-[73px] z-40 bg-background lg:hidden transition-transform duration-300",
          mobileOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <nav className="flex flex-col overflow-y-auto px-4 pb-20 pt-6">
          {NAV_ITEMS.map((item) => (
            <div key={item.label}>
              <Link
                to={item.to}
                className="block border-b border-[var(--brand-hairline)] py-4 text-sm font-semibold tracking-[0.15em] uppercase text-foreground"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
              {item.hasMega && (
                <div className="space-y-1 pb-2 pt-1">
                  <Link
                    to="/shop"
                    className="block py-2 pl-6 text-xs font-medium tracking-wider text-muted-foreground hover:text-foreground"
                    onClick={() => setMobileOpen(false)}
                  >
                    Voir tout
                  </Link>
                  {categories.map((c) => (
                    <Link
                      key={c.slug}
                      to="/shop"
                      search={{ category: c.slug }}
                      className="block py-2 pl-6 text-xs font-medium tracking-wider text-muted-foreground hover:text-foreground"
                      onClick={() => setMobileOpen(false)}
                    >
                      {c.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
          {customer ? (
            <>
              <Link
                to="/account"
                className="flex items-center gap-3 border-t border-[var(--brand-hairline)] pt-6 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => setMobileOpen(false)}
              >
                <Package size={14} /> Mes commandes
              </Link>
              <button
                className="mt-3 flex items-center gap-3 text-xs text-destructive hover:text-destructive"
                onClick={() => {
                  logout();
                  toast.success("Déconnecté");
                  setMobileOpen(false);
                }}
              >
                <LogOut size={14} /> Déconnexion
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="mt-6 flex items-center gap-3 border-t border-[var(--brand-hairline)] pt-6 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => setMobileOpen(false)}
            >
              <User size={14} /> Connexion / Inscription
            </Link>
          )}
        </nav>
      </div>

      {megaOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm max-lg:hidden"
          onClick={() => setMegaOpen(false)}
        />
      )}
    </header>
  );
}

export function TopBar() {
  return (
    <div className="border-b border-[var(--brand-hairline)] bg-foreground text-background">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 text-[11px] tracking-wider uppercase sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <span className="hidden items-center gap-1.5 sm:inline-flex">+1 (555) 010 2040</span>
          <span className="hidden items-center gap-1.5 md:inline-flex">hello@maison.co</span>
        </div>
        <p className="text-center opacity-90">
          Livraison offerte dès 250$ · Nouveautés chaque semaine
        </p>
        <div className="hidden gap-4 md:flex">
          <Link to="/account" className="hover:opacity-100 opacity-70">
            Suivre ma commande
          </Link>
          <a href="mailto:hello@maison.co" className="hover:opacity-100 opacity-70">
            Aide
          </a>
        </div>
      </div>
    </div>
  );
}

export function Footer() {
  const categoriesQuery = useQuery({ queryKey: ["categories"], queryFn: () => getCategories() });
  const categories = categoriesQuery.data ?? [];
  return (
    <footer className="border-t border-[var(--brand-hairline)] bg-[var(--brand-muted)]">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link
              to="/"
              className="text-lg font-semibold tracking-[0.25em] uppercase text-foreground"
            >
              Maison
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Mobilier moderne pour des intérieurs aérés et réfléchis. Des pièces conçues avec soin
              pour durer — des bibliothèques en chêne massif aux canapés en bouclette.
            </p>
            <div className="mt-6 flex items-center gap-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground transition-colors hover:text-foreground"
                aria-label="YouTube"
              >
                <Youtube size={18} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold tracking-[0.2em] uppercase text-foreground">
              Boutique
            </h3>
            <ul className="mt-5 space-y-3">
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link
                    to="/shop"
                    search={{ category: c.slug }}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {c.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to="/shop"
                  className="text-sm font-medium text-[var(--brand-accent)] transition-colors hover:opacity-80"
                >
                  Voir tout
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold tracking-[0.2em] uppercase text-foreground">
              Liens rapides
            </h3>
            <ul className="mt-5 space-y-3">
              <li>
                <Link
                  to="/about"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  À propos
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  to="/journal"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Journal
                </Link>
              </li>
              <li>
                <Link
                  to="/search"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Recherche
                </Link>
              </li>
              <li>
                <Link
                  to="/account"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Mon compte
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold tracking-[0.2em] uppercase text-foreground">
              Contact
            </h3>
            <ul className="mt-5 space-y-4">
              <li className="flex items-start gap-3 text-sm text-muted-foreground">
                <Phone size={15} className="mt-0.5 shrink-0" />
                <span>+1 (555) 010 2040</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-muted-foreground">
                <Mail size={15} className="mt-0.5 shrink-0" />
                <a
                  href="mailto:hello@maison.co"
                  className="transition-colors hover:text-foreground"
                >
                  hello@maison.co
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm text-muted-foreground">
                <MapPin size={15} className="mt-0.5 shrink-0" />
                <span>
                  120 Broadway, Suite 300
                  <br />
                  New York, NY 10271
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-[var(--brand-hairline)]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} Maison. Tous droits réservés.</p>
          <div className="flex gap-6">
            <Link to="/" className="hover:text-foreground">
              Confidentialité
            </Link>
            <Link to="/" className="hover:text-foreground">
              CGV
            </Link>
            <Link to="/" className="hover:text-foreground">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
