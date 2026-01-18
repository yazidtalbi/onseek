import { getPageBySlug } from "@/lib/strapi/content";

const defaultContent = {
  title: "Privacy Policy",
  content: `Onseek stores your account information, requests, and submissions to deliver the service. We do not sell personal information.

You can update your profile or delete your account at any time by contacting support.`,
};

export default async function PrivacyPage() {
  let content = defaultContent;
  
  try {
    const cmsContent = await getPageBySlug("privacy");
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
