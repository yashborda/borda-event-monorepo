import { getFeaturedSocialPosts } from '@/lib/social-api'

import { INSTAGRAM } from '@/config/site'
import { GALLERY_IMAGES } from '@/content/media'

import { GalleryPreview } from './_components/home/gallery-preview'
import { Hero } from './_components/home/hero'
import { HowItWorks } from './_components/home/how-it-works'
import { type FeedItem, InstagramFeed } from './_components/home/instagram-feed'
import { HomeServices } from './_components/home/services-grid'
import { StatsBand } from './_components/home/stats-band'
import { Testimonials } from './_components/home/testimonials'
import { WhyChooseUs } from './_components/home/why-choose-us'
import { WhatsAppCta } from './_components/whatsapp-cta'

const buildFeed = async (): Promise<FeedItem[]> => {
  const posts = (await getFeaturedSocialPosts()).filter(
    (post) => post.platform === 'instagram'
  )
  if (posts.length) {
    return posts.map((post) => ({
      id: post.id,
      image: post.thumbnail?.url ?? null,
      href: post.postUrl,
      caption: post.caption,
    }))
  }
  // Design fallback until reels are added in admin → links to the profile.
  return GALLERY_IMAGES.map((img, i) => ({
    id: `local-${i}`,
    image: img.src,
    href: INSTAGRAM,
    caption: img.label,
  }))
}

const Home = async () => {
  const feed = await buildFeed()

  return (
    <main>
      <Hero />
      <HomeServices />
      <WhyChooseUs />
      <StatsBand />
      <GalleryPreview />
      <InstagramFeed items={feed} />
      <HowItWorks />
      <Testimonials />
      <WhatsAppCta />
    </main>
  )
}

export default Home
