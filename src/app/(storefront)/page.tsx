import { Homepage } from "@/components/storefront/homepage";
import { getHomepageData } from "@/lib/storefront";

export default async function HomePage() {
  const data = await getHomepageData();
  return <Homepage slides={data.slides} sections={data.sections} featuredProducts={data.featuredProducts} />;
}
