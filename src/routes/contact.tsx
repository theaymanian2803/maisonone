import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Phone, Mail, MapPin, Clock, Send, ArrowRight } from "lucide-react";
import { SiteHeader, TopBar, Footer } from "@/components/layout/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contactez-nous · Maison" },
      {
        name: "description",
        content: "Contactez Maison. Visitez notre showroom, appelez-nous ou envoyez-nous un message.",
      },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email || !message) {
      toast.error("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    setSending(true);
    await new Promise((r) => setTimeout(r, 1000));
    toast.success("Message envoyé ! Nous vous répondrons sous 24 heures.");
    setName("");
    setEmail("");
    setSubject("");
    setMessage("");
    setSending(false);
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopBar />
      <SiteHeader />
      <main>
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-muted-foreground">
              Contactez-nous
            </p>
            <h1 className="mt-4 font-serif text-4xl leading-tight text-foreground sm:text-5xl">
              Nous serions ravis de vous entendre.
            </h1>
            <p className="mt-4 text-[15px] text-muted-foreground">
              Que vous ayez une question sur un produit, besoin de conseils sur les dimensions ou
                envie de visiter notre showroom — nous sommes là pour vous aider.
            </p>
          </div>

          <div className="mt-16 grid gap-12 lg:grid-cols-5">
            <div className="space-y-8 lg:col-span-2">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-[var(--brand-hairline)]">
                  <Phone size={16} className="text-foreground" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Téléphone</h3>
                  <p className="mt-1 text-sm text-muted-foreground">+1 (555) 010 2040</p>
                  <p className="text-xs text-muted-foreground">Lun–Ven, 9h–18h EST</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-[var(--brand-hairline)]">
                  <Mail size={16} className="text-foreground" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Email</h3>
                  <a
                    href="mailto:hello@maison.co"
                    className="mt-1 block text-sm text-[var(--brand-accent)] transition-colors hover:opacity-80"
                  >
                    hello@maison.co
                  </a>
                  <p className="text-xs text-muted-foreground">Nous répondons sous 24h</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-[var(--brand-hairline)]">
                  <MapPin size={16} className="text-foreground" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Showroom</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    120 Broadway, Suite 300
                    <br />
                    New York, NY 10271
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-[var(--brand-hairline)]">
                  <Clock size={16} className="text-foreground" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Horaires</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Lun–Sam : 10h–19h
                    <br />
                    Dimanche : 11h–17h
                  </p>
                </div>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="border border-[var(--brand-hairline)] p-8 lg:col-span-3"
            >
              <h2 className="text-sm font-semibold tracking-[0.15em] uppercase text-foreground">
                Envoyez-nous un message
              </h2>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="text-xs font-medium text-foreground">
                    Nom <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1.5 rounded-none"
                    placeholder="Votre nom"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="text-xs font-medium text-foreground">
                    Email <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1.5 rounded-none"
                    placeholder="vous@exemple.com"
                    required
                  />
                </div>
              </div>
              <div className="mt-5">
                <label htmlFor="subject" className="text-xs font-medium text-foreground">
                  Sujet
                </label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="mt-1.5 rounded-none"
                  placeholder="Comment pouvons-nous vous aider ?"
                />
              </div>
              <div className="mt-5">
                <label htmlFor="message" className="text-xs font-medium text-foreground">
                  Message <span className="text-destructive">*</span>
                </label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="mt-1.5 rounded-none"
                  rows={5}
                  placeholder="Dites-nous en plus..."
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={sending}
                className="mt-6 w-full rounded-none bg-foreground py-6 text-xs font-semibold tracking-[0.2em] uppercase text-background hover:bg-foreground/90"
              >
                {sending ? "Envoi en cours…" : "Envoyer"}
                {!sending && <Send size={14} className="ml-2" />}
              </Button>
            </form>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
