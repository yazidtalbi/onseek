import { getPageBySlug } from "@/lib/strapi/content";

const defaultContent = {
  title: "Your Privacy Choices",
  content: `You have control over your privacy on Onseek. Here are the choices available to you:

- Update your profile information at any time
- Delete your account and all associated data
- Control notification preferences
- Manage cookie preferences

For more information, please contact our support team.`,
};

export default async function PrivacyChoicesPage() {
  let content = defaultContent;
  
  try {
    const cmsContent = await getPageBySlug("privacy-choices");
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

