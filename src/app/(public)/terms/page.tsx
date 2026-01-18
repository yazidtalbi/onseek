import { getPageBySlug } from "@/lib/strapi/content";

const defaultContent = {
  title: "Terms of Service",
  content: `By using Onseek, you agree to act responsibly, share accurate links, and respect other members. Requests and submissions are community generated, and Onseek does not guarantee product availability or pricing accuracy.

We reserve the right to remove content that violates our guidelines or is reported for abuse. Use Onseek at your own discretion.`,
};

export default async function TermsPage() {
  let content = defaultContent;
  
  try {
    const cmsContent = await getPageBySlug("terms");
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
