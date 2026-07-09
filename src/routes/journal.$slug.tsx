import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader, TopBar, Footer } from "@/components/layout/SiteHeader";
import { getBlogPostById, getLatestBlogPosts } from "@/lib/catalog.functions";

export const Route = createFileRoute("/journal/$slug")({
  loader: async ({ params }) => {
    const post = await getBlogPostById({ data: { id: params.slug } });
    if (!post) throw new Error("Post not found");
    return post;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData.title} · Maison Journal` },
      { name: "description", content: loaderData.excerpt },
    ],
  }),
  component: JournalDetailPage,
  notFoundComponent: () => (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Article introuvable</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Cet article n'existe pas ou a été supprimé.
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

function formatDate(unix: number): string {
  return new Date(unix * 1000).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function JournalDetailPage() {
  const { slug } = Route.useParams();
  const post = Route.useLoaderData();

  const relatedQuery = useQuery({
    queryKey: ["blog", "latest", 4],
    queryFn: () => getLatestBlogPosts({ data: { limit: 4 } }),
  });

  const related = relatedQuery.data?.filter((a) => a.id !== post.id) ?? [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopBar />
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={14} /> Retour au Journal
        </Link>

        <article className="mt-10">
          <div className="overflow-hidden bg-[var(--brand-muted)]">
            <img
              src={post.image_url}
              alt={post.title}
              className="h-[300px] w-full object-cover sm:h-[420px] lg:h-[480px]"
            />
          </div>

          <div className="mt-8">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar size={14} />
              <span>{formatDate(post.created_at)}</span>
            </div>
            <h1 className="mt-4 font-serif text-3xl leading-tight text-foreground sm:text-4xl">
              {post.title}
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{post.excerpt}</p>

            <div className="mt-8 border-t border-[var(--brand-hairline)] pt-8">
              {post.content ? (
                <div className="prose prose-sm max-w-none text-muted-foreground [&>p]:leading-relaxed">
                  {post.content.split("\n").map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  Contenu complet de l'article à venir. En attendant, explorez notre collection pour
                  trouver l'inspiration.
                </p>
              )}
            </div>
          </div>
        </article>

        {related.length > 0 && (
          <section className="mt-16 border-t border-[var(--brand-hairline)] pt-12">
            <h2 className="text-2xl font-semibold tracking-[0.18em] uppercase text-foreground text-center">
              Plus d'articles
            </h2>
            <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2">
              {related.slice(0, 2).map((a) => (
                <Link
                  key={a.id}
                  to="/journal/$slug"
                  params={{ slug: a.id }}
                  className="group flex flex-col"
                >
                  <div className="overflow-hidden bg-[var(--brand-muted)]">
                    <img
                      src={a.image_url}
                      alt={a.title}
                      loading="lazy"
                      className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <h3 className="mt-4 text-base font-semibold leading-snug text-foreground">
                    {a.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{a.excerpt}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
