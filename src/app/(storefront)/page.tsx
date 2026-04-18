import { Homepage } from "@/components/storefront/homepage";
import { getTrackingNamingSettings } from "@/lib/site-settings";
import { getHomepageData } from "@/lib/storefront";

export default async function HomePage() {
  const [data, trackingNaming] = await Promise.all([
    getHomepageData(),
    getTrackingNamingSettings(),
  ]);

  return (
    <Homepage
      slides={data.slides}
      sections={data.sections}
      featuredProducts={data.featuredProducts}
      featuredProductsTrackingListId={trackingNaming.homeFeaturedListId}
      featuredProductsTrackingListName={trackingNaming.homeFeaturedListName}
    />
  );
}
