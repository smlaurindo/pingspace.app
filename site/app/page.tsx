import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/header";
import {
  Zap,
  Activity,
  Sparkles,
  ArrowRight,
  Check,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <Header />

      <main className="flex-1 flex flex-col justify-center items-center">
        <section className="container flex flex-col items-center justify-center gap-6 pb-8 pt-16 md:pb-12 md:pt-24 lg:pt-32">
          <Badge variant="secondary" className="mb-4">
            <Sparkles className="mr-1 size-3" />
            Totally Free • Real-time Events
          </Badge>

          <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 text-center">
            <h1 className="text-4xl font-bold leading-tight tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
              Real-time notifications{" "}
              <span className="bg-linear-to-r from-primary to-primary/50 bg-clip-text text-transparent">
                made simple
              </span>
            </h1>

            <p className="max-w-2xl text-lg text-muted-foreground sm:text-xl">
              Create your space, invite users, and publish or subscribe to topics instantly.
              Perfect for webhooks, event streaming, and real-time notifications.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Button size="lg" asChild className="gap-2">
                <Link href="/auth/sign-up">
                  Get Started Free
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#how-it-works">Learn More</Link>
              </Button>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Check className="size-4 text-primary" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="size-4 text-primary" />
                <span>Free forever</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="size-4 text-primary" />
                <span>Ready in 2 minutes</span>
              </div>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="mt-12 w-full max-w-5xl">
            <div className="relative overflow-hidden rounded-lg border bg-card shadow-2xl">
              <div className="absolute inset-0 bg-linear-to-tr from-primary/20 to-transparent" />
              <div className="relative p-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="size-3 rounded-full bg-red-500" />
                    <div className="size-3 rounded-full bg-yellow-500" />
                    <div className="size-3 rounded-full bg-green-500" />
                  </div>
                  <div className="space-y-2 rounded-lg bg-muted p-4 font-mono text-sm">
                    <div className="text-muted-foreground">
                      <span className="text-primary">POST</span> /v1/topics/user-registrations/pings
                    </div>
                    <div className="pl-4 text-muted-foreground">
                      {`{ "event": "user.registered", "email": "user@example.com" }`}
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <Activity className="size-4 animate-pulse text-green-500" />
                      <span className="text-xs text-green-600 dark:text-green-400">
                        Delivered to 3 subscribers in real-time
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="flex items-center justify-center border-t py-6">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Zap className="size-4" />
            </div>
            <span className="font-semibold">PingSpace</span>
          </div>
          <p className="text-center text-sm text-muted-foreground">
            Built with ❤️ by{" "}
            <a
              href="https://github.com/cybermumuca"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline underline-offset-4"
            >
              cybermumuca
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}