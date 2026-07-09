import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Calendar, ArrowRight } from "lucide-react";
import { SiteHeader, TopBar, Footer } from "@/components/layout/SiteHeader";
import { getLatestBlogPosts } from "@/lib/catalog.functions";
import type { BlogPost } from "@/lib/catalog.types";

export const Route = createFileRoute("/journal")({
  head: () => ({
    meta: [
      { title: "Journal · Maison" },
      {
        name: "description",
        content:
          "Histoires, guides et inspiration de l'équipe Maison — design, matériaux et art de vivre contemporain.",
      },
    ],
  }),
  component: JournalListPage,
});

function formatDate(unix: number): string {
  return new Date(unix * 1000).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function JournalListPage() {
  const query = useQuery({
    queryKey: ["blog", "all"],
    queryFn: () => getLatestBlogPosts({ data: { limit: 50 } }),
  });

  const posts = query.data ?? [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopBar />
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-muted-foreground">
            Journal Maison
          </p>
          <h1 className="mt-4 font-serif text-4xl leading-tight text-foreground sm:text-5xl">
            Histoires & inspiration.
          </h1>
          <p className="mt-4 text-[15px] text-muted-foreground">
            Notes de design, analyses de matériaux, visites d'intérieurs et la réflexion derrière
            chaque pièce que nous créons.
          </p>
        </div>

        {query.isLoading ? (
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[4/3] bg-[var(--brand-muted)]" />
                <div className="mt-4 h-4 w-24 bg-[var(--brand-muted)]" />
                <div className="mt-3 h-5 w-3/4 bg-[var(--brand-muted)]" />
                <div className="mt-2 h-4 w-full bg-[var(--brand-muted)]" />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="mt-20 text-center">
            <p className="text-sm text-muted-foreground">Aucun article publié pour le moment.</p>
          </div>
        ) : (
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post: BlogPost) => (
              <article key={post.id} className="group flex flex-col">
                <Link
                  to="/journal/$slug"
                  params={{ slug: post.id }}
                  className="overflow-hidden bg-[var(--brand-muted)]"
                >
                  <img
                    src={post.image_url}
                    alt={post.title}
                    loading="lazy"
                    className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </Link>
                <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar size={13} />
                  <span>{formatDate(post.created_at)}</span>
                </div>
                <Link
                  to="/journal/$slug"
                  params={{ slug: post.id }}
                  className="mt-2 text-base font-semibold leading-snug text-foreground transition-colors group-hover:text-[var(--brand-accent)]"
                >
                  {post.title}
                </Link>
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{post.excerpt}</p>
                <Link
                  to="/journal/$slug"
                  params={{ slug: post.id }}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.2em] uppercase text-[var(--brand-accent)] hover:opacity-80"
                >
                  Lire la suite <ArrowRight size={14} />
                </Link>
              </article>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
