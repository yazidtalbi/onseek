import { getPageBySlug } from "@/lib/strapi/content";

const defaultContent = {
  title: "About Us",
  content: `Onseek is a community-powered platform that helps you find the best products and deals. Our community of hunters helps you discover verified links for the items you're looking for.

We believe in making shopping easier by connecting people who need products with those who know where to find them.`,
};

export default async function AboutPage() {
  let content = defaultContent;
  
  try {
    const cmsContent = await getPageBySlug("about");
    if (cmsContent?.attributes) {
      content = {
        title: cmsContent.attributes.title || defaultContent.title,
        content: cmsContent.attributes.content || defaultContent.content,
      };
    }
  } catch (error) {
    console.warn("Could not fetch content from Strapi, using default content:", error);
  }

  return (
    <div className="min-h-screen bg-background px-6 py-16">
      <div className="mx-auto max-w-3xl space-y-6">
        <h1 className="text-3xl font-semibold">{content.title}</h1>
        <div className="prose prose-sm text-muted-foreground">
          {content.content.split("\n\n").map((paragraph, index) => (
            <p key={index} className="mb-4">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

