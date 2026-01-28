import { getPageBySlug } from "@/lib/strapi/content";

const defaultContent = {
  title: "Trust, Safety & Security",
  content: `At Onseek, we take trust, safety, and security seriously. We work to ensure our platform is a safe place for everyone.

We verify submissions, monitor for abuse, and provide tools for users to report inappropriate content. Your data is protected with industry-standard security measures.`,
};

export default async function TrustPage() {
  let content = defaultContent;
  
  try {
    const cmsContent = await getPageBySlug("trust");
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

