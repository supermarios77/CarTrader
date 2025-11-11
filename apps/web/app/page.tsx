import {
  AccessoryCategories,
} from "@/components/landing/accessory-categories"
import { AppPromo } from "@/components/landing/app-promo"
import { BrandGrid } from "@/components/landing/brand-grid"
import { CategoryTiles } from "@/components/landing/category-tiles"
import { HeroSearch } from "@/components/landing/hero-search"
import { FeaturedListings, RecentListings } from "@/components/landing/listing-showcase"
import { MediaHighlights } from "@/components/landing/media-highlights"
import { QuickActions } from "@/components/landing/quick-actions"

export default function Home() {
  return (
    <div className="space-y-16 pb-24">
      <div className="container space-y-12">
        <HeroSearch />
        <QuickActions />
        <CategoryTiles />
        <FeaturedListings />
        <RecentListings />
        <BrandGrid />
        <AccessoryCategories />
        <MediaHighlights />
        <AppPromo />
      </div>
    </div>
  )
}
