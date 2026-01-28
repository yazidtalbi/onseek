import { getPageBySlug } from "@/lib/strapi/content";

const defaultContent = {
  title: "California Notice at Collection",
  content: `This notice is for California residents under the California Consumer Privacy Act (CCPA).

We collect personal information such as your email address, username, and activity on the platform. This information is used to provide and improve our services.

You have the right to know what personal information we collect, request deletion of your personal information, and opt-out of the sale of personal information (we do not sell personal information).`,
};

export default async function CaliforniaNoticePage() {
  let content = defaultContent;
  
  try {
    const cmsContent = await getPageBySlug("privacy-california");
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

