import { createFileRoute, Link } from "@tanstack/react-router";
import { Star, Truck, ShieldCheck, Headphones, Award, ArrowRight, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SiteHeader, TopBar, Footer } from "@/components/layout/SiteHeader";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Maison — Mobilier & Décoration" },
      {
        name: "description",
        content:
          "Lits, bibliothèques, étagères, meubles TV, canapés et tapis — un mobilier moderne pour des intérieurs aérés et réfléchis.",
      },
    ],
  }),
  component: Storefront,
});

/* ---------------- Data ---------------- */

type Product = {
  id: string;
  title: string;
  price: number;
  original: number;
  discount: number;
  rating: number;
  image: string;
};

const IMG = (id: string, w = 800, h = 900) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;

const TV_UNITS: Product[] = [
  {
    id: "s-tv-1",
    title: "Console TV en chêne nordique",
    price: 649,
    original: 819,
    discount: 20,
    rating: 5,
    image: IMG("photo-1616486338812-3dadae4b4ace"),
  },
  {
    id: "s-tv-2",
    title: "Meuble média linéaire",
    price: 529,
    original: 699,
    discount: 25,
    rating: 4,
    image: IMG("photo-1567016432779-094069958ea5"),
  },
  {
    id: "s-tv-3",
    title: "Meuble mural suspendu",
    price: 899,
    original: 1120,
    discount: 20,
    rating: 5,
    image: IMG("photo-1615873968403-89e068629265"),
  },
  {
    id: "s-tv-4",
    title: "Support TV studio",
    price: 379,
    original: 479,
    discount: 20,
    rating: 4,
    image: IMG("photo-1595428774223-ef52624120d2"),
  },
];

const COFFEE_TABLES: Product[] = [
  {
    id: "s-tb-1",
    title: "Table basse ronde en marbre",
    price: 449,
    original: 599,
    discount: 25,
    rating: 5,
    image: IMG("photo-1499933374294-4584851497cc"),
  },
  {
    id: "s-tb-2",
    title: "Table basse Terra en chêne",
    price: 319,
    original: 399,
    discount: 20,
    rating: 4,
    image: IMG("photo-1533090481720-856c6e3c1fdc"),
  },
  {
    id: "s-tb-3",
    title: "Set de tables gigognes verre",
    price: 289,
    original: 379,
    discount: 24,
    rating: 4,
    image: IMG("photo-1493663284031-b7e3aefcae8e"),
  },
  {
    id: "s-tb-4",
    title: "Table d'appoint Sculpt",
    price: 219,
    original: 279,
    discount: 22,
    rating: 5,
    image: IMG("photo-1567538096630-e0c55bd6374c"),
  },
];

const RUGS: Product[] = [
  {
    id: "s-rg-1",
    title: "Tapis berbère en laine 200×290",
    price: 349,
    original: 469,
    discount: 25,
    rating: 5,
    image: IMG("photo-1600166898405-da9535204843"),
  },
  {
    id: "s-rg-2",
    title: "Tapis couloir à rayures douces",
    price: 189,
    original: 239,
    discount: 20,
    rating: 4,
    image: IMG("photo-1558618666-fcd25c85cd64"),
  },
  {
    id: "s-rg-3",
    title: "Tapis velours bouclé sable",
    price: 279,
    original: 359,
    discount: 22,
    rating: 4,
    image: IMG("photo-1584285405429-136bf988919c"),
  },
  {
    id: "s-rg-4",
    title: "Tapis géométrique ivoire",
    price: 399,
    original: 519,
    discount: 23,
    rating: 5,
    image: IMG("photo-1519710164239-da123dc03ef4"),
  },
];

const SOFAS: Product[] = [
  {
    id: "s-sf-1",
    title: "Canapé Cloud 3 places",
    price: 1499,
    original: 1899,
    discount: 21,
    rating: 5,
    image: IMG("photo-1555041469-a586c61ea9bc"),
  },
  {
    id: "s-sf-2",
    title: "Banquette Linden en bouclette",
    price: 1199,
    original: 1499,
    discount: 20,
    rating: 5,
    image: IMG("photo-1493666438817-866a91353ca9"),
  },
  {
    id: "s-sf-3",
    title: "Canapé d'angle modulable",
    price: 1899,
    original: 2399,
    discount: 21,
    rating: 4,
    image: IMG("photo-1540574163026-643ea20ade25"),
  },
  {
    id: "s-sf-4",
    title: "Fauteuil cuir Terra",
    price: 799,
    original: 999,
    discount: 20,
    rating: 5,
    image: IMG("photo-1567538096621-38d2284b23ff"),
  },
];

const ARTICLES = [
  {
    id: "s-a-1",
    title: "Comment superposer les textures dans un salon moderne",
    excerpt:
      "Un guide rapide pour mélanger lin, laine et chêne sans perdre cette sensation aérée et minimaliste que votre espace mérite.",
    image: IMG("photo-1616627561950-9f746e330187", 700, 500),
  },
  {
    id: "s-a-2",
    title: "Petite bibliothèque, grand impact : des étagères qui fonctionnent",
    excerpt:
      "Six agencements d'étagères qui transforment n'importe quel coin en un vrai espace de lecture — sans travaux.",
    image: IMG("photo-1507473885765-e6ed057f782c", 700, 500),
  },
  {
    id: "s-a-3",
    title: "Choisir la bonne taille de tapis pour votre canapé",
    excerpt:
      "La règle d'or que les architectes d'intérieur utilisent vraiment — plus les erreurs courantes qui rétrécissent visuellement votre pièce.",
    image: IMG("photo-1584285405429-136bf988919c", 700, 500),
  },
  {
    id: "s-a-4",
    title: "Minimalisme chaleureux : une palette pour chaque saison",
    excerpt:
      "Comment construire un intérieur à la fois actuel et habité avec une palette chromatique maîtrisée et discrètement affirmée.",
    image: IMG("photo-1616486338812-3dadae4b4ace", 700, 500),
  },
];

/* ---------------- Small primitives ---------------- */

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-center gap-6 py-2">
      <span className="h-px w-16 bg-[var(--brand-hairline)] sm:w-28" />
      <h2 className="text-center text-2xl font-semibold tracking-[0.18em] uppercase text-foreground sm:text-3xl">
        {title}
      </h2>
      <span className="h-px w-16 bg-[var(--brand-hairline)] sm:w-28" />
    </div>
  );
}

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

function ProductCard({ p }: { p: Product }) {
  const { addItem } = useCart();
  return (
    <div className="group flex flex-col">
      <div className="relative overflow-hidden bg-[var(--brand-muted)]">
        <Link to="/products/$productId" params={{ productId: p.id }}>
          <img
            src={p.image}
            alt={p.title}
            loading="lazy"
            className="aspect-[4/5] w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>
        <span className="absolute right-3 top-3 rounded-full bg-[var(--brand-accent)] px-2.5 py-1 text-[11px] font-semibold tracking-wide text-[var(--brand-accent-foreground)]">
          -{p.discount}%
        </span>
        <button
          onClick={() => {
            addItem({
              product_id: p.id,
              title: p.title,
              image_url: p.image,
              price: p.price,
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
          <span className="text-base font-semibold text-[var(--brand-accent)]">${p.price}</span>
          <span className="text-sm text-muted-foreground line-through">${p.original}</span>
        </div>
        <div className="mt-2">
          <Rating value={p.rating} />
        </div>
      </Link>
    </div>
  );
}

function ProductSection({
  title,
  products,
  showViewMore = true,
}: {
  title: string;
  products: Product[];
  showViewMore?: boolean;
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <SectionHeader title={title} />
      <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.title} p={p} />
        ))}
      </div>
      {showViewMore && (
        <div className="mt-12 flex justify-center">
          <Button
            variant="outline"
            className="rounded-none border-foreground/80 px-8 py-6 text-xs font-semibold tracking-[0.2em] uppercase hover:bg-foreground hover:text-background"
          >
            Voir plus
          </Button>
        </div>
      )}
    </section>
  );
}

/* ---------------- Page sections ---------------- */

function Hero() {
  const big = IMG("photo-1616486338812-3dadae4b4ace", 1200, 1600);
  const topRight = IMG("photo-1567016432779-094069958ea5", 1100, 700);
  const bottomRight = IMG("photo-1493663284031-b7e3aefcae8e", 1100, 700);

  const OverlayButton = ({ children }: { children: React.ReactNode }) => (
    <button className="rounded-none border border-white/80 bg-white/10 px-6 py-3 text-[11px] font-semibold tracking-[0.25em] uppercase text-white backdrop-blur-sm transition-colors hover:bg-white hover:text-foreground">
      {children}
    </button>
  );

  return (
    <section className="mx-auto max-w-7xl px-4 pt-8 pb-10 sm:px-6 lg:px-8">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="relative overflow-hidden">
          <img
            src={big}
            alt="Salon moderne aménagé"
            className="h-[420px] w-full object-cover sm:h-[560px] lg:h-[720px]"
          />
          <div className="absolute inset-0 flex flex-col justify-between p-8">
            <div className="max-w-sm">
              <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-white/90">
                Nouvelle Collection · 2026
              </p>
              <h1 className="mt-4 font-serif text-4xl leading-tight text-white sm:text-5xl">
                Des pièces qui respirent.
              </h1>
            </div>
            <div className="flex justify-center">
              <Link to="/shop">
                <OverlayButton>Acheter</OverlayButton>
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-rows-2 gap-4">
          <div className="relative overflow-hidden">
            <img
              src={topRight}
              alt="Meubles média et étagères"
              className="h-[204px] w-full object-cover sm:h-[272px] lg:h-[352px]"
            />
            <div className="absolute inset-0 flex items-end justify-start p-6">
              <Link to="/shop">
                <OverlayButton>Meubles TV</OverlayButton>
              </Link>
            </div>
          </div>
          <div className="relative overflow-hidden">
            <img
              src={bottomRight}
              alt="Collection de tables basses"
              className="h-[204px] w-full object-cover sm:h-[272px] lg:h-[352px]"
            />
            <div className="absolute inset-0 flex items-end justify-end p-6">
              <Link to="/shop">
                <OverlayButton>Tables</OverlayButton>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustBadges() {
  const items = [
    { icon: Truck, title: "Livraison offerte", text: "Pour toute commande de plus de 250$." },
    {
      icon: ShieldCheck,
      title: "Paiement sécurisé",
      text: "Paiement crypté avec des prestataires de confiance.",
    },
    { icon: Headphones, title: "Service client", text: "Des vrais gens, 7j/7, 9h–20h." },
    { icon: Award, title: "Garantie qualité", text: "Garantie 10 ans sur chaque pièce encadrée." },
  ];
  return (
    <section className="border-y border-[var(--brand-hairline)] bg-[var(--brand-muted)]/60">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-16 sm:px-6 lg:grid-cols-4 lg:px-8">
        {items.map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex items-start gap-4">
            <Icon strokeWidth={1.25} size={36} className="mt-1 shrink-0 text-foreground" />
            <div>
              <h3 className="text-sm font-semibold tracking-wide text-foreground">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Blog() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <SectionHeader title="Blog" />
      <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {ARTICLES.map((a) => (
          <article key={a.title} className="group flex flex-col">
            <div className="overflow-hidden bg-[var(--brand-muted)]">
              <img
                src={a.image}
                alt={a.title}
                loading="lazy"
                className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <h3 className="mt-5 text-base font-semibold leading-snug text-foreground">{a.title}</h3>
            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{a.excerpt}</p>
            <Link
              to="/journal/$slug"
              params={{ slug: a.id }}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.2em] uppercase text-[var(--brand-accent)] hover:opacity-80"
            >
              Lire la suite <ArrowRight size={14} />
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}

function AboutUs() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="overflow-hidden">
        <img
          src={IMG("photo-1616627561950-9f746e330187", 1600, 900)}
          alt="Intérieur moderne et élégant"
          className="h-[300px] w-full object-cover sm:h-[420px] lg:h-[520px]"
        />
      </div>
      <div className="mx-auto mt-14 max-w-2xl text-center">
        <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-muted-foreground">
          À propos
        </p>
        <h2 className="mt-4 font-serif text-3xl leading-tight text-foreground sm:text-4xl">
          Un mobilier réfléchi pour les intérieurs modernes.
        </h2>
        <p className="mt-5 text-[15px] leading-relaxed text-muted-foreground">
          Nous concevons et sélectionnons des pièces honnêtes et durables — des bibliothèques en
          chêne massif aux canapés en bouclette — pour ceux qui construisent des intérieurs
          apaisants, actuels et vraiment personnels. Chaque collection est fabriquée en petites
          séries avec des matériaux avec lesquels nous aimerions vivre pendant des décennies.
        </p>
      </div>
    </section>
  );
}

/* ---------------- Page ---------------- */

function Storefront() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopBar />
      <SiteHeader />
      <main>
        <Hero />
        <ProductSection title="Meubles TV" products={TV_UNITS} />
        <ProductSection title="Tables basses" products={COFFEE_TABLES} showViewMore={false} />
        <TrustBadges />
        <ProductSection title="Tapis modernes" products={RUGS} />
        <ProductSection title="Canapés" products={SOFAS} showViewMore={false} />
        <Blog />
        <AboutUs />
      </main>
      <Footer />
    </div>
  );
}
