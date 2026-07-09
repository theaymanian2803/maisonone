import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import {
  Star,
  Truck,
  ShieldCheck,
  ArrowLeft,
  ShoppingBag,
  MessageSquare,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { getProductById, getProductsByCategory } from "@/lib/catalog.functions";
import { getProductReviews, getCanReview, createReview } from "@/lib/review.functions";
import { CATEGORY_LABEL } from "@/lib/catalog.types";
import { SiteHeader, TopBar, Footer } from "@/components/layout/SiteHeader";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";

export const Route = createFileRoute("/products/$productId")({
  loader: async ({ params }) => {
    const product = await getProductById({ data: { id: params.productId } });
    if (!product) throw new Error("Product not found");
    return product;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData.title} · Maison` },
      {
        name: "description",
        content: `${loaderData.title} — ${CATEGORY_LABEL[loaderData.category]} de Maison. Mobilier premium pour les intérieurs modernes.`,
      },
    ],
  }),
  component: ProductDetailPage,
  notFoundComponent: () => (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Produit introuvable</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Ce produit n'existe pas ou a été supprimé.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Retour à l'accueil
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
          size={16}
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

const DESCRIPTIONS: Record<string, string> = {
  "s-tv-1":
    "Fabriqué en chêne nordique massif avec une finition huilée chaude, ce meuble TV allie lignes épurées mid-century et généreux rangements. Trois tiroirs à fermeture amortie et deux compartiments ouverts gardent vos médias organisés sans encombrement.",
  "s-tv-2":
    "Un meuble média aux lignes fines en acier noir mat et placage de noyer américain. Les portes coulissantes révèlent des étagères ajustables pour l'électronique, les jeux et les livres — conçu pour les salons minimalistes.",
  "s-tv-3":
    "Ce meuble mural suspendu apporte une présence architecturale à toute pièce. La composition asymétrique d'étagères ouvertes et de rangements fermés est finie en laque faible COV avec une surface charbon mate.",
  "s-tv-4":
    "Un meuble TV compact en acier laqué poudre avec un plateau en bois d'acacia naturel. Les niches ouvertes ventilent les composants tout en dissimulant les câbles derrière le panneau amovible.",
  "s-tb-1":
    "Une table basse ronde sculpturale en marbre style Carrare avec une base en laiton brossé. Le plateau de 120 cm accueille confortablement quatre tasses tandis que le bord biseauté capte la lumière.",
  "s-tb-2":
    "Le chêne européen chaud rencontre l'acier noirci dans cette table basse conçue pour la vie décontractée. La vaste étagère inférieure accueille magazines, plateaux ou une pile de livres de design à portée de main.",
  "s-tb-3":
    "Trois tables en verre graduées qui s'emboîtent ou se séparent. Chaque pièce présente du verre trempé de 8 mm aux bords polis et de fines pattes dorées.",
  "s-tb-4":
    "Une table d'appoint sculpturale en béton moulé avec une finition cirée à la main. La forme organique repose sur un mince trépied en bronze et fonctionne aussi bien près d'un canapé que comme support pour plantes.",
  "s-rg-1":
    "Tissé à la main par des artisans berbères dans l'Atlas, ce tapis en laine apporte une texture authentique aux sols modernes. La laine naturelle non teinte varie du crème à l'ivoire chaud.",
  "s-rg-2":
    "Un long chemin de moquette dans un gris-beige sourd avec de subtiles rayures tuftées à la main. Le poil bas de 8 mm est assez durable pour les couloirs tout en restant doux sous les pieds.",
  "s-rg-3":
    "Une construction en boucle dans quatre tons de sable crée une surface texturée qui cache les empreintes et ajoute une chaleur acoustique. Fabriqué à partir de fibres PET recyclées.",
  "s-rg-4":
    "Un motif géométrique en ivoire et charbon qui référence le travail classique des carreaux marocains. Le tissage haut-bas donne à la surface plane une sensation dimensionnelle au toucher.",
  "s-sf-1":
    "Notre trois-places le plus vendu avec des assises profondes, des coussins moelleux mélange plumes et une housse sur mesure en lin belge. Les accoudoirs fins gardent la silhouette épurée et adaptée aux appartements citadins.",
  "s-sf-2":
    "Enveloppé de laine bouclette crémeuse, ce causeuse apporte douceur et chaleur à toute pièce. Le dossier arrondi et les pieds en bois tourné lui donnent une sensation mid-century aux proportions contemporaines.",
  "s-sf-3":
    "Un système de canapé d'angle modulaire qui s'adapte à votre espace — réorganisez la forme en L à gauche ou à droite, ajoutez une méridienne ou séparez-le en deux groupes assis indépendants. Rembourré en tissu performance.",
  "s-sf-4":
    "Un fauteuil en cuir profond en pleine fleur de cognac qui développe une riche patine avec le temps. Les larges accoudoirs sont parfaits pour y poser un livre ou une tasse de thé.",
};

function ProductDetailPage() {
  const { productId } = Route.useParams();
  const product = Route.useLoaderData();
  const { addItem } = useCart();
  const { customer, token } = useAuth();
  const qc = useQueryClient();

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewBody, setReviewBody] = useState("");
  const [reviewName, setReviewName] = useState(customer?.name ?? "");
  const [selectedImage, setSelectedImage] = useState(product.image_url);
  const [reviewFormOpen, setReviewFormOpen] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const galleryImages = [product.image_url, ...(product.gallery ?? [])].filter(Boolean);

  const relatedQuery = useQuery({
    queryKey: ["products", "category", product.category],
    queryFn: () => getProductsByCategory({ data: { category: product.category } }),
  });

  const reviewsQuery = useQuery({
    queryKey: ["reviews", productId],
    queryFn: () => getProductReviews({ data: { productId } }),
  });

  const canReviewQuery = useQuery({
    queryKey: ["can-review", productId, token],
    queryFn: () => getCanReview({ data: { productId, authToken: token ?? undefined } }),
    enabled: !!token,
  });

  const related = relatedQuery.data?.filter((p) => p.id !== product.id) ?? [];
  const reviews = reviewsQuery.data ?? [];
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : product.rating;
  const canReview = canReviewQuery.data?.canReview ?? false;
  const hasReviewed = canReviewQuery.data?.hasReviewed ?? false;

  const createReviewMut = useMutation({
    mutationFn: () =>
      createReview({
        data: {
          productId,
          rating: reviewRating,
          title: reviewTitle.trim(),
          body: reviewBody.trim(),
          customerName: reviewName.trim(),
          authToken: token ?? undefined,
        },
      }),
    onSuccess: () => {
      toast.success("Avis soumis — en attente d'approbation");
      setReviewFormOpen(false);
      setReviewRating(5);
      setReviewTitle("");
      setReviewBody("");
      setReviewError(null);
      qc.invalidateQueries({ queryKey: ["reviews", productId] });
      qc.invalidateQueries({ queryKey: ["can-review", productId] });
    },
    onError: (e: Error) => setReviewError(e.message || "Échec de la soumission de l'avis"),
  });

  function onSubmitReview(e: FormEvent) {
    e.preventDefault();
    setReviewError(null);
    if (!reviewBody.trim()) {
      setReviewError("Veuillez rédiger un avis.");
      return;
    }
    if (!reviewName.trim()) {
      setReviewError("Veuillez saisir votre nom.");
      return;
    }
    createReviewMut.mutate();
  }

  const categoryLabel = CATEGORY_LABEL[product.category] ?? product.category;
  const description =
    DESCRIPTIONS[product.id] ??
    `Un ${categoryLabel.toLowerCase()} premium de la dernière collection Maison. Conçu avec des matériaux réfléchis et des lignes épurées pour les intérieurs modernes.`;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopBar />
      <SiteHeader />

      <main>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={14} /> Retour
          </Link>
        </div>

        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="space-y-3">
              <div className="overflow-hidden bg-[var(--brand-muted)]">
                <img
                  src={selectedImage}
                  alt={product.title}
                  className="h-[400px] w-full object-cover sm:h-[520px] lg:h-[640px] transition-opacity duration-300"
                />
              </div>
              {galleryImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {galleryImages.map((url, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(url)}
                      className={`shrink-0 overflow-hidden border-2 transition-all duration-200 ${
                        selectedImage === url
                          ? "border-foreground opacity-100"
                          : "border-transparent opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={url}
                        alt={`${product.title} vue ${i + 1}`}
                        className="h-16 w-20 object-cover sm:h-20 sm:w-24"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col justify-center">
              <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-muted-foreground">
                {CATEGORY_LABEL[product.category]}
              </p>
              <h1 className="mt-3 font-serif text-3xl leading-tight text-foreground sm:text-4xl">
                {product.title}
              </h1>

              <div className="mt-4 flex items-baseline gap-3">
                <span className="text-2xl font-semibold text-[var(--brand-accent)]">
                  ${product.current_price}
                </span>
                <span className="text-base text-muted-foreground line-through">
                  ${product.original_price}
                </span>
                <span className="rounded-full bg-[var(--brand-accent)] px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-[var(--brand-accent-foreground)]">
                  {product.discount_badge}
                </span>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <Rating value={Math.round(avgRating)} />
                <span className="text-sm text-muted-foreground">
                  {avgRating.toFixed(1)} ({reviews.length}{" "}
                  {reviews.length === 1 ? "avis" : "avis"})
                </span>
              </div>

              <p className="mt-8 leading-relaxed text-muted-foreground">{description}</p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button
                  className="h-12 flex-1 rounded-none bg-foreground text-[11px] font-semibold tracking-[0.2em] uppercase text-background hover:bg-foreground/90"
                  onClick={() => {
                    addItem({
                      product_id: product.id,
                      title: product.title,
                      image_url: product.image_url,
                      price: product.current_price,
                    });
                    toast.success("Ajouté au panier");
                  }}
                >
                  <ShoppingBag className="mr-2 h-4 w-4" /> Ajouter au panier
                </Button>
              </div>

              <div className="mt-10 grid grid-cols-2 gap-4 border-t border-[var(--brand-hairline)] pt-8">
                <div className="flex items-start gap-3">
                  <Truck strokeWidth={1.25} size={20} className="mt-0.5 shrink-0 text-foreground" />
                  <div>
                    <p className="text-sm font-semibold">Livraison offerte</p>
                    <p className="text-xs text-muted-foreground">Pour les commandes de plus de 250 $</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <ShieldCheck
                    strokeWidth={1.25}
                    size={20}
                    className="mt-0.5 shrink-0 text-foreground"
                  />
                  <div>
                    <p className="text-sm font-semibold">Garantie 10 ans</p>
                    <p className="text-xs text-muted-foreground">Sur chaque pièce encadrée</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-[var(--brand-hairline)]">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center gap-6 py-2">
              <span className="h-px w-16 bg-[var(--brand-hairline)] sm:w-28" />
              <h2 className="text-center text-2xl font-semibold tracking-[0.18em] uppercase text-foreground sm:text-3xl">
                Avis clients
              </h2>
              <span className="h-px w-16 bg-[var(--brand-hairline)] sm:w-28" />
            </div>

            <div className="mt-10 mx-auto max-w-3xl">
              {canReview && !hasReviewed && !reviewFormOpen && (
                <div className="mb-8 text-center">
                  <Button
                    variant="outline"
                    className="rounded-none border-foreground/80 px-8 text-xs font-semibold tracking-[0.2em] uppercase"
                    onClick={() => setReviewFormOpen(true)}
                  >
                    <MessageSquare className="mr-2 h-4 w-4" /> Écrire un avis
                  </Button>
                </div>
              )}

              {hasReviewed && (
                <div className="mb-8 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle size={16} className="text-green-600" /> Vous avez déjà donné votre avis sur ce produit.
                </div>
              )}

              {reviewFormOpen && (
                <div className="mb-10 rounded-lg border border-[var(--brand-hairline)] p-6">
                  <h3 className="text-sm font-semibold tracking-[0.2em] uppercase text-foreground">
                    Écrire votre avis
                  </h3>
                  <form onSubmit={onSubmitReview} className="mt-5 space-y-4">
                    <div>
                      <Label>Note</Label>
                      <div className="mt-1 flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <button
                            key={n}
                            type="button"
                            onClick={() => setReviewRating(n)}
                            className="p-0.5"
                          >
                            <Star
                              size={22}
                              className={cn(
                                n <= reviewRating
                                  ? "fill-[var(--brand-accent)] text-[var(--brand-accent)]"
                                  : "text-[var(--brand-hairline)]",
                              )}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="rv-title">Titre (optionnel)</Label>
                      <Input
                        id="rv-title"
                        value={reviewTitle}
                        onChange={(e) => setReviewTitle(e.target.value)}
                        placeholder="Résumez votre expérience"
                        maxLength={200}
                        className="rounded-none"
                      />
                    </div>
                    <div>
                      <Label htmlFor="rv-name">Votre nom</Label>
                      <Input
                        id="rv-name"
                        value={reviewName}
                        onChange={(e) => setReviewName(e.target.value)}
                        placeholder="Jane D."
                        required
                        maxLength={200}
                        className="rounded-none"
                      />
                    </div>
                    <div>
                      <Label htmlFor="rv-body">Avis</Label>
                      <Textarea
                        id="rv-body"
                        value={reviewBody}
                        onChange={(e) => setReviewBody(e.target.value)}
                        placeholder="Qu'avez-vous aimé ou non ? Partagez les détails pour aider les autres à choisir."
                        rows={4}
                        required
                        maxLength={5000}
                        className="rounded-none"
                      />
                    </div>
                    {reviewError && <p className="text-sm text-destructive">{reviewError}</p>}
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setReviewFormOpen(false)}
                      >
                        Annuler
                      </Button>
                      <Button type="submit" size="sm" disabled={createReviewMut.isPending}>
                        {createReviewMut.isPending ? "Soumission en cours…" : "Soumettre l'avis"}
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {reviewsQuery.isLoading ? (
                <div className="space-y-6">
                  {[1, 2].map((i) => (
                    <div
                      key={i}
                      className="animate-pulse space-y-3 rounded-lg border border-[var(--brand-hairline)] p-5"
                    >
                      <div className="h-4 w-24 rounded bg-[var(--brand-muted)]" />
                      <div className="h-3 w-48 rounded bg-[var(--brand-muted)]" />
                      <div className="h-12 w-full rounded bg-[var(--brand-muted)]" />
                    </div>
                  ))}
                </div>
              ) : reviews.length === 0 ? (
                <div className="py-12 text-center">
                  <MessageSquare size={32} className="mx-auto text-muted-foreground/30" />
                  <p className="mt-4 text-sm text-muted-foreground">Aucun avis pour le moment.</p>
                  {!token && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      <Link to="/login" className="underline hover:text-foreground">
                        Connectez-vous
                      </Link>{" "}
                      pour être le premier à donner votre avis.
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {reviews.map((r) => (
                    <div
                      key={r.id}
                      className="rounded-lg border border-[var(--brand-hairline)] p-5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                size={14}
                                className={cn(
                                  i < r.rating
                                    ? "fill-[var(--brand-accent)] text-[var(--brand-accent)]"
                                    : "text-[var(--brand-hairline)]",
                                )}
                              />
                            ))}
                          </div>
                          <span className="text-sm font-semibold text-foreground">
                            {r.title || "Avis"}
                          </span>
                        </div>
                        {r.verified_purchase && (
                          <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-green-700">
                            <CheckCircle size={12} /> Vérifié
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {r.customer_name} · {new Date(r.created_at * 1000).toLocaleDateString()}
                      </p>
                      <p className="mt-3 text-sm leading-relaxed text-foreground">{r.body}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {related.length > 0 && (
          <section className="border-t border-[var(--brand-hairline)] bg-[var(--brand-muted)]/40">
            <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
              <div className="flex items-center justify-center gap-6 py-2">
                <span className="h-px w-16 bg-[var(--brand-hairline)] sm:w-28" />
                <h2 className="text-center text-2xl font-semibold tracking-[0.18em] uppercase text-foreground sm:text-3xl">
                  Produits associés
                </h2>
                <span className="h-px w-16 bg-[var(--brand-hairline)] sm:w-28" />
              </div>
              <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
                {related.slice(0, 4).map((p) => (
                  <Link
                    key={p.id}
                    to="/products/$productId"
                    params={{ productId: p.id }}
                    className="group flex flex-col"
                  >
                    <div className="relative overflow-hidden bg-[var(--brand-muted)]">
                      <img
                        src={p.image_url}
                        alt={p.title}
                        loading="lazy"
                        className="aspect-[4/5] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <span className="absolute right-3 top-3 rounded-full bg-[var(--brand-accent)] px-2.5 py-1 text-[11px] font-semibold tracking-wide text-[var(--brand-accent-foreground)]">
                        {p.discount_badge}
                      </span>
                    </div>
                    <div className="pt-4">
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
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
