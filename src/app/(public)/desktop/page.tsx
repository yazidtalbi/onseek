import { getPageBySlug } from "@/lib/strapi/content";

const defaultContent = {
  title: "Desktop App",
  content: `Download the Onseek desktop app for a better experience. The desktop app provides faster performance and offline capabilities.

Desktop app coming soon. Stay tuned for updates!`,
};

export default async function DesktopPage() {
  let content = defaultContent;
  
  try {
    const cmsContent = await getPageBySlug("desktop");
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

