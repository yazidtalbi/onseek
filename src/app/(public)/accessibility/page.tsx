import { getPageBySlug } from "@/lib/strapi/content";

const defaultContent = {
  title: "Accessibility",
  content: `Onseek is committed to making our platform accessible to everyone. We strive to meet WCAG 2.1 Level AA standards.

If you encounter any accessibility issues or have suggestions for improvement, please contact us. We're continuously working to improve the accessibility of our platform.`,
};

export default async function AccessibilityPage() {
  let content = defaultContent;
  
  try {
    const cmsContent = await getPageBySlug("accessibility");
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

