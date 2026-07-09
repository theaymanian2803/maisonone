import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { SiteHeader, TopBar, Footer } from "@/components/layout/SiteHeader";
import { useAuth } from "@/contexts/AuthContext";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Créer un compte · Maison" },
      { name: "description", content: "Créez votre compte Maison." },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      await register(email, name, password, confirmPassword);
      toast.success("Compte créé");
      navigate({ to: "/" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de l'inscription.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopBar />
      <SiteHeader />
      <div className="mx-auto grid min-h-[70vh] max-w-6xl px-4 py-12 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div className="flex flex-col justify-center lg:pr-16">
          <Link
            to="/"
            className="inline-flex w-fit items-center gap-1.5 text-xs font-semibold tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft size={14} /> Accueil
          </Link>
          <h1 className="mt-8 font-serif text-3xl leading-tight text-foreground sm:text-4xl">
            Rejoignez Maison.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Créez un compte pour enregistrer vos informations, suivre vos commandes et payer plus rapidement.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 max-w-sm space-y-5">
            <div>
              <Label htmlFor="reg-name">Nom complet</Label>
              <Input
                id="reg-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jean Dupont"
                required
                minLength={1}
                className="mt-1.5 rounded-none border-foreground/20 bg-background h-11"
              />
            </div>
            <div>
              <Label htmlFor="reg-email">E-mail</Label>
              <Input
                id="reg-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@exemple.com"
                required
                className="mt-1.5 rounded-none border-foreground/20 bg-background h-11"
              />
            </div>
            <div>
              <Label htmlFor="reg-password">Mot de passe</Label>
              <div className="relative mt-1.5">
                <Input
                  id="reg-password"
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Créez un mot de passe (8 caractères min.)"
                  required
                  minLength={8}
                  className="rounded-none border-foreground/20 bg-background h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <Label htmlFor="reg-confirm">Confirmer le mot de passe</Label>
              <div className="relative mt-1.5">
                <Input
                  id="reg-confirm"
                  type={showPw ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Répétez votre mot de passe"
                  required
                  minLength={8}
                  className="rounded-none border-foreground/20 bg-background h-11 pr-10"
                />
              </div>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button
              type="submit"
              className="h-12 w-full rounded-none bg-foreground text-[11px] font-semibold tracking-[0.2em] uppercase text-background hover:bg-foreground/90"
              disabled={pending}
            >
              {pending ? "Création…" : "Créer un compte"}
            </Button>
          </form>

          <p className="mt-6 text-sm text-muted-foreground">
            Déjà un compte ?{" "}
            <Link
              to="/login"
              className="font-semibold text-foreground underline underline-offset-4 hover:no-underline"
            >
              Se connecter
            </Link>
          </p>
        </div>

        <div className="hidden overflow-hidden lg:block">
          <div className="flex h-full flex-col justify-center">
            <img
              src="https://images.unsplash.com/photo-1616627561950-9f746e330187?auto=format&fit=crop&w=800&h=1000&q=80"
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
