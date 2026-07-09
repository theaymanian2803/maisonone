import { createFileRoute, Link } from "@tanstack/react-router";
import { Award, ShieldCheck, Truck, Headphones, ArrowRight } from "lucide-react";
import { SiteHeader, TopBar, Footer } from "@/components/layout/SiteHeader";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "À propos · Maison" },
      {
        name: "description",
        content:
          "Nous concevons et sourçons des meubles honnêtes et durables — des bibliothèques en chêne massif aux canapés en bouclette — pour les intérieurs modernes.",
      },
    ],
  }),
  component: AboutPage,
});

const IMG = (id: string, w = 800, h = 900) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;

function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopBar />
      <SiteHeader />
      <main>
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-muted-foreground">
                À propos de Maison
              </p>
              <h1 className="mt-4 font-serif text-4xl leading-tight text-foreground sm:text-5xl">
                Un mobilier réfléchi pour les intérieurs modernes.
              </h1>
              <p className="mt-6 text-[15px] leading-relaxed text-muted-foreground">
                Maison a été fondée sur une conviction simple : votre intérieur doit être apaisant,
                actuel et vraiment personnel. Nous concevons et sourçons des pièces honnêtes et
                durables — des bibliothèques en chêne massif aux canapés en bouclette — pour ceux
                qui privilégient la qualité à la quantité.
              </p>
              <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
                Chaque collection est fabriquée en petites séries avec des matériaux avec lesquels
                nous aimerions vivre pendant des décennies. Nous travaillons directement avec des
                artisans et fabricants qui partagent notre engagement pour une production éthique,
                des salaires équitables et un minimum de déchets.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Button
                  asChild
                  className="rounded-none border-foreground/80 bg-foreground px-8 py-6 text-xs font-semibold tracking-[0.2em] uppercase text-background hover:bg-foreground/90"
                >
                  <Link to="/shop">Découvrir la collection</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="rounded-none border-foreground/80 px-8 py-6 text-xs font-semibold tracking-[0.2em] uppercase hover:bg-foreground hover:text-background"
                >
                  <Link to="/contact">Contactez-nous</Link>
                </Button>
              </div>
            </div>
            <div className="overflow-hidden">
              <img
                src={IMG("photo-1616486338812-3dadae4b4ace", 800, 1000)}
                alt="Salon Maison"
                className="h-[500px] w-full object-cover sm:h-[600px]"
              />
            </div>
          </div>
        </section>

        <section className="border-y border-[var(--brand-hairline)] bg-[var(--brand-muted)]/60">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-muted-foreground">
                Nos valeurs
              </p>
              <h2 className="mt-4 font-serif text-3xl leading-tight text-foreground sm:text-4xl">
                Fabriqué avec intention.
              </h2>
            </div>
            <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "Matériaux de qualité",
                  text: "Nous sélectionnons des bois massifs, des lin naturels et des tissus d'ameublement premium qui vieillissent avec élégance.",
                },
                {
                  title: "Fabrication éthique",
                  text: "Nos ateliers sont gérés par des partenaires, justement rémunérés et soumis à des normes environnementales et de sécurité rigoureuses.",
                },
                {
                  title: "Design intemporel",
                  text: "Nous évitons les tendances au profit de lignes épurées et de proportions réfléchies qui traversent les décennies.",
                },
                {
                  title: "Petites séries",
                  text: "Les séries limitées réduisent les déchets et garantissent une plus grande attention aux détails sur chaque pièce.",
                },
                {
                  title: "Garantie 10 ans",
                  text: "Chaque pièce encadrée est couverte par notre garantie décennale contre les défauts de fabrication.",
                },
                {
                  title: "Neutre en carbone",
                  text: "Nous compensons les émissions de transport et utilisons des emballages recyclés pour toutes nos livraisons.",
                },
              ].map((v) => (
                <div key={v.title} className="border border-[var(--brand-hairline)] p-8">
                  <h3 className="text-sm font-semibold tracking-[0.15em] uppercase text-foreground">
                    {v.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{v.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="overflow-hidden">
              <img
                src={IMG("photo-1507473885765-e6ed057f782c", 800, 1000)}
                alt="Bibliothèque Maison"
                className="h-[450px] w-full object-cover sm:h-[550px]"
              />
            </div>
            <div>
              <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-muted-foreground">
                Notre histoire
              </p>
              <h2 className="mt-4 font-serif text-3xl leading-tight text-foreground sm:text-4xl">
                D'un petit atelier à votre salon.
              </h2>
              <p className="mt-6 text-[15px] leading-relaxed text-muted-foreground">
                Ce qui a commencé comme l'atelier d'un seul menuisier dans l'État de New York est
                devenu une collection curated de meubles conçus pour la façon dont nous vivons
                aujourd'hui. Nous croyons que chaque pièce mérite un mobilier aussi fonctionnel que
                beau — et que le bon design ne doit pas se faire au détriment de la planète.
              </p>
              <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
                Aujourd'hui, Maison travaille avec un réseau de fabricants en petites séries à
                travers l'Amérique du Nord et l'Europe, vous proposant des meubles prêts à être
                aimés pour toute une vie.
              </p>
            </div>
          </div>
        </section>

        <section className="border-t border-[var(--brand-hairline)] bg-[var(--brand-muted)]/60">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
              {[
                { icon: Truck, title: "Livraison offerte", text: "Pour les commandes de plus de 250 $" },
                { icon: ShieldCheck, title: "Paiement sécurisé", text: "Paiement crypté" },
                { icon: Headphones, title: "Assistance", text: "7 jours sur 7, 9h–20h" },
                { icon: Award, title: "Garantie", text: "Garantie 10 ans" },
              ].map(({ icon: Icon, title, text }) => (
                <div key={title} className="flex items-start gap-4">
                  <Icon strokeWidth={1.25} size={28} className="mt-0.5 shrink-0 text-foreground" />
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{title}</h3>
                    <p className="mt-0.5 text-sm text-muted-foreground">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
