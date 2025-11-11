import Link from "next/link"

import { Card, CardContent } from "@/components/ui/card"

const videos = [
  {
    id: "v1",
    title: "Hybrid showdown: Sportage vs Tucson vs Haval",
    duration: "09:45",
  },
  {
    id: "v2",
    title: "Budget used cars that hold their value in 2024",
    duration: "06:12",
  },
  {
    id: "v3",
    title: "Inside the CarTrader inspection lab",
    duration: "04:31",
  },
]

const articles = [
  {
    id: "a1",
    title: "Import duty changes and what they mean for buyers",
    readTime: "5 min read",
  },
  {
    id: "a2",
    title: "EV charging map: best spots across major cities",
    readTime: "7 min read",
  },
  {
    id: "a3",
    title: "Maintaining resale value: technician checklist",
    readTime: "4 min read",
  },
]

export function MediaHighlights() {
  return (
    <section className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
      <div className="space-y-4 rounded-3xl border border-border/60 bg-background p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Latest reviews & videos</h2>
          <Link href="/videos" className="text-sm text-primary hover:underline">
            View all
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {videos.map((video) => (
            <Card
              key={video.id}
              className="group overflow-hidden border-border/70 bg-muted/30 transition hover:-translate-y-1 hover:border-border hover:shadow-lg"
            >
              <div className="relative aspect-video overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.25),_transparent_70%)]">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 transition duration-500 group-hover:brightness-110" />
                <span className="absolute left-4 top-4 rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-blue-100">
                  Video
                </span>
                <span className="absolute bottom-3 right-3 rounded-md bg-slate-900/80 px-2 py-1 text-xs font-medium text-white">
                  {video.duration}
                </span>
              </div>
              <CardContent className="space-y-2 p-4">
                <Link
                  href={`/videos/${video.id}`}
                  className="line-clamp-2 text-sm font-medium text-foreground/90 transition hover:text-primary"
                >
                  {video.title}
                </Link>
                <p className="text-xs text-muted-foreground">Watch now</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      <div className="space-y-4 rounded-3xl border border-border/60 bg-muted/30 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">From the CarTrader journal</h2>
          <Link href="/blog" className="text-sm text-primary hover:underline">
            Read more
          </Link>
        </div>
        <ul className="space-y-4">
          {articles.map((article) => (
            <li
              key={article.id}
              className="group rounded-2xl border border-transparent bg-background/80 p-4 transition hover:border-border/80 hover:bg-background"
            >
              <Link
                href={`/blog/${article.id}`}
                className="line-clamp-2 text-sm font-medium text-foreground transition group-hover:text-primary"
              >
                {article.title}
              </Link>
              <p className="text-xs text-muted-foreground">{article.readTime}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

