import type { FeedEntry } from '@extractus/feed-extractor'
import { extract } from '@extractus/feed-extractor'

export async function getFeed() {
  const data = await extract('https://feeds.feedburner.com/TheHackersNews', {
    getExtraEntryFields(entryData: any) {
      return {
        pubDate: entryData.pubDate || '',
      }
    },
  })
  return data.entries as (FeedEntry & { pubDate: string })[]
}
