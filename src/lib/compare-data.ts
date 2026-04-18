export interface CompetitorData {
  slug: string;
  name: string;
  category: string; // main category color theme
  accentColor: string; // hex for progress bar / active nav color
  tagline: string;
  heroConflict: string;
  heroSubheadline: string;
  conflictBody: string[];
  tableRows: {
    feature: string;
    competitor: string | boolean;
    onseek: string | boolean;
  }[];
  useCaseCards: { icon: string; title: string; description: string }[];
  faqs: { question: string; answer: string }[];
  metaDescription: string;
  schemaRating: number;
  schemaReviewCount: number;
}

export const COMPETITORS: Record<string, CompetitorData> = {
  "facebook-marketplace": {
    slug: "facebook-marketplace",
    name: "Facebook Marketplace",
    category: "Fashion & Accessories",
    accentColor: "#1877F2",
    tagline: "No more ghosting. No more 'Is this available?'",
    heroConflict:
      "Facebook Marketplace is built for browsing. Onseek is built for buying.",
    heroSubheadline:
      "Facebook Marketplace is for scrolling. Onseek is for getting exactly what you need. See how the reverse-marketplace model eliminates ghosting, scams, and hours of dead-end conversations.",
    conflictBody: [
      "Facebook Marketplace feels like a garage sale that never ends. You find something, message the seller, wait 48 hours, and get 'sorry, already sold.' Multiply that by 20 listings and you've lost an entire afternoon.",
      "Seller verification is non-existent. Photos are uploaded once and never updated. Prices are 'negotiable' — which really means 'I have no idea what this is worth.' Meanwhile you're stuck filtering through spam accounts and community groups with zero structure.",
      "The core problem: the burden of searching falls entirely on you. You scroll, you compare, you negotiate, you get ghosted. Onseek flips this model completely.",
    ],
    tableRows: [
      { feature: "Request-First Model", competitor: false, onseek: true },
      { feature: "Direct Seller Matchmaking", competitor: false, onseek: true },
      { feature: "Budget-Led Negotiation", competitor: false, onseek: true },
      { feature: "No-Scroll Experience", competitor: false, onseek: true },
      { feature: "Structured Requirements", competitor: false, onseek: true },
      { feature: "Ghosting Protection", competitor: false, onseek: true },
      { feature: "Verified Proposals Only", competitor: false, onseek: true },
      { feature: "Category-Specific Search", competitor: "Limited", onseek: true },
    ],
    useCaseCards: [
      { icon: "💻", title: "Finding a MacBook Pro", description: "Post your exact specs & budget. Sellers compete for your business instead of you cold-messaging 30 listings." },
      { icon: "👟", title: "Rare Sneakers", description: "Specify colorway, size, and condition. Get matched with verified resellers who actually have what you want." },
      { icon: "🛋️", title: "Vintage Furniture", description: "Set your location and style preferences. Receive proposals from dealers in your area — no ghosting, no wasted trips." },
      { icon: "📱", title: "Unlocked Phones", description: "Define your carrier requirements and budget cap. Get competing offers from certified sellers within hours." },
    ],
    faqs: [
      { question: "How is Onseek safer than Facebook Marketplace?", answer: "Every seller on Onseek submits a structured proposal that includes verified product details, price, and shipping info. Unlike Facebook Marketplace where anyone can post anything, Onseek proposals are tied to accountable profiles and rated by the community." },
      { question: "Can I find the same items as on Facebook Marketplace?", answer: "Yes — and more. Facebook Marketplace is limited to local listings and secondhand goods. Onseek handles everything from secondhand items to brand-new products, services, and digital goods across 15+ categories." },
      { question: "Does it cost more than Facebook Marketplace?", answer: "Onseek is free to post requests and browse proposals. Unlike Facebook Marketplace, where hidden fees and payment disputes are common, Onseek's structured proposal system gives you full price transparency before you commit." },
      { question: "What if I don't get any proposals?", answer: "If your request gets fewer than 3 proposals in 72 hours, our system automatically boosts visibility and notifies relevant community members. You're never left in the dark." },
      { question: "Is Onseek only for secondhand items?", answer: "No. While Facebook Marketplace focuses on C2C resale, Onseek handles new items, services, travel bookings, tech rentals, and more. It's intent-driven commerce, not a secondhand marketplace." },
    ],
    metaDescription:
      "Tired of ghosting on Facebook Marketplace? Discover how Onseek's request-first model gets you exactly what you need — without scrolling, negotiating, or getting ignored.",
    schemaRating: 4.8,
    schemaReviewCount: 1240,
  },
  "etsy": {
    slug: "etsy",
    name: "Etsy",
    category: "Fashion & Accessories",
    accentColor: "#F1641E",
    tagline: "Stop hunting. Let the right maker find you.",
    heroConflict: "Etsy is for browsing. Onseek is for finding exactly what you want.",
    heroSubheadline:
      "Etsy has 100 million listings. Finding the right handmade piece, vintage item, or custom product still takes hours. Onseek flips the model — you post your requirements and verified sellers come to you.",
    conflictBody: [
      "Etsy's search algorithm buries the best makers behind paid ads and keyword-stuffed titles. You search for 'custom leather wallet' and get 42,000 results ranked by who spent the most on promoted listings — not by who does the best work.",
      "Custom orders on Etsy require back-and-forth messaging across 10 different sellers to get a quote. There's no standardised request format, no price comparison, and no accountability if a seller disappears mid-order. You're essentially doing project management for your own purchase.",
      "The platform is built for the seller's discovery, not the buyer's certainty. Onseek is the opposite — you define what you need once, with a clear budget, and the right makers respond directly.",
    ],
    tableRows: [
      { feature: "Request-First Model", competitor: false, onseek: true },
      { feature: "Direct Maker Matchmaking", competitor: false, onseek: true },
      { feature: "Budget-Led Negotiation", competitor: false, onseek: true },
      { feature: "No-Scroll Experience", competitor: false, onseek: true },
      { feature: "Structured Requirements", competitor: false, onseek: true },
      { feature: "Verified Proposals Only", competitor: false, onseek: true },
      { feature: "Custom Order Management", competitor: "Manual", onseek: true },
      { feature: "Price Transparency Upfront", competitor: false, onseek: true },
    ],
    useCaseCards: [
      { icon: "💍", title: "Custom Jewellery", description: "Describe your stone, metal, and budget. Verified jewellers submit proposals — no messaging 20 shops to get a quote." },
      { icon: "👗", title: "Vintage Clothing", description: "Specify era, size, condition, and max price. Vintage curators surface exactly what you're looking for, fast." },
      { icon: "🖼️", title: "Custom Artwork", description: "Define your style, dimensions, and deadline. Artists who match your brief respond directly with pricing and samples." },
      { icon: "🕯️", title: "Handmade Home Goods", description: "Set your material, scent, or aesthetic requirements. Independent makers compete for your order on your terms." },
    ],
    faqs: [
      { question: "How is Onseek safer than Etsy?", answer: "Etsy disputes require seller cooperation and can take weeks to resolve. Onseek proposals are structured commitments — every detail from materials to delivery timeline is locked before you accept, with community-rated accountability behind each seller." },
      { question: "Can I find the same items as on Etsy?", answer: "Yes, and with less effort. Many independent makers and vintage sellers on Onseek also sell on Etsy, but through Onseek's proposal system you get personalised quotes for your exact requirements instead of filtering through thousands of listings." },
      { question: "Does it cost more than Etsy?", answer: "Posting a request on Onseek is completely free. Unlike Etsy where transaction fees, payment processing fees, and offsite ad fees add 8-15% to every purchase (often passed on to buyers through inflated prices), Onseek's model creates direct price competition." },
      { question: "Can I commission custom pieces like on Etsy?", answer: "Absolutely — and it's much faster. Instead of messaging 15 sellers individually to explain your requirements, you post once with full specifications. Only makers who can meet your brief respond with a structured proposal." },
      { question: "What about vintage and one-of-a-kind items?", answer: "Vintage and unique items are a core strength of Onseek. Our community includes specialist curators and vintage hunters who can source specific items by era, brand, condition, or style — things that would take hours to find through Etsy search." },
    ],
    metaDescription:
      "Tired of scrolling through 100M Etsy listings? Onseek's request-first model connects you directly with the right maker or vintage seller — post your requirements, receive proposals.",
    schemaRating: 4.8,
    schemaReviewCount: 1560,
  },
  "ebay": {
    slug: "ebay",
    name: "eBay",
    category: "Tech & Electronics",
    accentColor: "#E53238",
    tagline: "No bids. No auctions. Just verified offers.",
    heroConflict: "eBay is for auction hunters. Onseek is for intentional buyers.",
    heroSubheadline:
      "eBay's auction model creates artificial urgency and price uncertainty. Onseek lets you define your budget upfront and receive competing fixed-price proposals on your timeline.",
    conflictBody: [
      "eBay's auction model is a 1995 solution to a 2026 problem. You monitor a listing for 7 days, get outbid with 3 seconds remaining, and start the whole process over. Meanwhile 'Buy It Now' prices are 30% above market because sellers know you're desperate.",
      "The feedback system is outdated. Sellers with 99.2% feedback scores have thousands of unresolved disputes buried in the 0.8%. International shipping estimates are unreliable. Return policies are seller-dependent and routinely ignored.",
      "The biggest problem: eBay optimizes for seller revenue, not buyer satisfaction. Onseek is structurally the opposite — sellers compete for your attention on your terms.",
    ],
    tableRows: [
      { feature: "Request-First Model", competitor: false, onseek: true },
      { feature: "Fixed-Price Proposals", competitor: "Partial", onseek: true },
      { feature: "Budget-Led Negotiation", competitor: false, onseek: true },
      { feature: "No Auction Stress", competitor: false, onseek: true },
      { feature: "Structured Requirements", competitor: false, onseek: true },
      { feature: "Verified Proposals Only", competitor: false, onseek: true },
      { feature: "Immediate Price Clarity", competitor: false, onseek: true },
      { feature: "Community Reputation", competitor: "Partial", onseek: true },
    ],
    useCaseCards: [
      { icon: "🎮", title: "Gaming Consoles", description: "State your condition requirements and max budget. Get competing offers without bidding wars or last-second sniping." },
      { icon: "⌚", title: "Luxury Watches", description: "Specify reference number, condition, and documentation. Only verified sellers with authentication knowledge respond." },
      { icon: "🧩", title: "Collector Items", description: "Define provenance requirements and budget. Community experts surface options eBay's algorithm would never recommend." },
      { icon: "🔧", title: "Professional Tools", description: "Set your spec sheet and location. Get fixed-price proposals from trade suppliers — no bidding required." },
    ],
    faqs: [
      { question: "How is Onseek safer than eBay?", answer: "eBay's buyer protection requires you to escalate disputes and wait up to 30 days for resolution. Onseek's proposal system means you only pay once you've reviewed and accepted a structured offer with full product transparency upfront." },
      { question: "Can I find the same items as on eBay?", answer: "Yes. Our community sources items across the same global inventory as eBay, but through a curated proposal format that filters out counterfeit listings, misleading photos, and bait-and-switch pricing." },
      { question: "Does it cost more than eBay?", answer: "Onseek has no listing fees, final value fees, or PayPal transaction fees. The price you see in a proposal is the price you pay. Compare that to eBay's complex fee structure that adds 10-15% to most transactions." },
      { question: "What about rare collectibles where I need bidding?", answer: "Onseek isn't an auction platform, but you can specify in your request that you're open to price negotiation. Sellers can submit proposals within a range and you select the best offer — without the artificial auction deadline pressure." },
      { question: "Is shipping more reliable than eBay?", answer: "Proposals on Onseek include explicit shipping terms as part of the structured response. Sellers who misrepresent shipping timelines receive community strikes that affect their ranking, creating strong accountability incentives." },
    ],
    metaDescription:
      "Tired of eBay auctions and last-second bids? Onseek's request-first model gives you fixed-price proposals from verified sellers — on your timeline and within your budget.",
    schemaRating: 4.7,
    schemaReviewCount: 890,
  },
  "amazon": {
    slug: "amazon",
    name: "Amazon",
    category: "Home & Living",
    accentColor: "#FF9900",
    tagline: "A million options. Zero decisions made for you.",
    heroConflict: "Amazon sells everything. Onseek finds the right thing.",
    heroSubheadline:
      "Amazon's infinite catalogue is its biggest weakness. Onseek cuts through the noise by letting you define requirements once and receiving curated proposals that already match.",
    conflictBody: [
      "Amazon has 350 million products. It also has 12 million fake reviews, counterfeit listings disguised as the real thing, and an algorithm that promotes paid placements over quality. The 'Amazon's Choice' badge means nothing.",
      "The paradox of choice is real. You search for a standing desk, get 8,000 results, spend 2 hours reading reviews that may be fake, order something that looks different in person, and fight for a return. The 'convenience' of Amazon requires enormous buyer effort.",
      "Prime created the expectation of instant delivery, but it didn't solve the problem of deciding what to buy. That's the gap Onseek fills — intent-driven commerce where you define the spec and the right seller comes to you.",
    ],
    tableRows: [
      { feature: "Request-First Model", competitor: false, onseek: true },
      { feature: "Curated Proposals", competitor: false, onseek: true },
      { feature: "Budget-Led Negotiation", competitor: false, onseek: true },
      { feature: "Zero Fake Reviews", competitor: false, onseek: true },
      { feature: "Structured Requirements", competitor: false, onseek: true },
      { feature: "Verified Proposals Only", competitor: false, onseek: true },
      { feature: "Niche Category Expertise", competitor: "Limited", onseek: true },
      { feature: "Community Vetting", competitor: false, onseek: true },
    ],
    useCaseCards: [
      { icon: "🏠", title: "Home Furniture", description: "Describe your dimensions, material, and style. Get proposals from verified furniture dealers rather than generic Amazon listings." },
      { icon: "🎨", title: "Art & Decor", description: "Define your aesthetic, size, and budget. Connect with independent artists and curators Amazon would never surface." },
      { icon: "🧴", title: "Beauty & Skincare", description: "Specify ingredients, skin type, and country of origin. Get recommendations from certified beauty specialists." },
      { icon: "🏋️", title: "Fitness Equipment", description: "State your space constraints and training goals. Receive competing proposals from specialist fitness retailers." },
    ],
    faqs: [
      { question: "How is Onseek safer than Amazon?", answer: "Amazon has a documented counterfeit problem that even their own brand protection programs struggle to solve. Every Onseek proposal is a structured commitment from an accountable seller — product details, price, and shipping are locked before you accept." },
      { question: "Can I find the same items as on Amazon?", answer: "Yes, often at better prices. Because Onseek sellers respond to your specific budget, you frequently receive proposals below Amazon's listed price — especially for specialty categories where Amazon's margins are high." },
      { question: "Does it cost more than Amazon?", answer: "Onseek is free to use. Unlike Amazon where Prime membership costs $139/year and seller fees get baked into product prices, Onseek's proposal system creates direct competition that drives prices down." },
      { question: "What about Amazon's fast shipping?", answer: "You can specify shipping speed as a requirement in your Onseek request. Sellers who can meet your timeline will include that in their proposal. For specialty items, the right product beats fast delivery of the wrong one." },
      { question: "Can I use Onseek for services, not just products?", answer: "Absolutely. This is where Onseek significantly extends beyond Amazon. From home renovation services to freelance design, Onseek handles service requests with the same structured proposal format." },
    ],
    metaDescription:
      "Amazon has 350M products and 12M fake reviews. Onseek's request-first model cuts through the noise — define your requirements once, receive curated proposals from verified sellers.",
    schemaRating: 4.8,
    schemaReviewCount: 3120,
  },
  "craigslist": {
    slug: "craigslist",
    name: "Craigslist",
    category: "Services",
    accentColor: "#7E57C2",
    tagline: "Modern commerce. Safety you can trust.",
    heroConflict: "Craigslist is 1999. Onseek is the future.",
    heroSubheadline:
      "Craigslist's anonymous classifieds created the wild west of online commerce. Onseek builds structured accountability into every interaction — so you never have to meet a stranger in a parking lot.",
    conflictBody: [
      "Craigslist has barely changed since 1996. Anonymous posts, no seller verification, cash-in-parking-lot transactions, and a scam rate that requires every buyer to be a trained fraud detective. 'Too good to be true' isn't a warning on Craigslist — it's Tuesday.",
      "The platform assumes you have unlimited time and infinite patience. You email 10 people, 3 respond, 2 flake, 1 shows up but the item is damaged and they claim it was like that when you arrived. No recourse. No rating system that matters.",
      "Craigslist optimizes for the seller's convenience. Onseek optimizes for the buyer's outcome. The difference is a structured proposal system where accountability is built into every transaction.",
    ],
    tableRows: [
      { feature: "Request-First Model", competitor: false, onseek: true },
      { feature: "Seller Verification", competitor: false, onseek: true },
      { feature: "Budget-Led Negotiation", competitor: false, onseek: true },
      { feature: "Safe Exchange Protocol", competitor: false, onseek: true },
      { feature: "Structured Requirements", competitor: false, onseek: true },
      { feature: "Community Reputation", competitor: false, onseek: true },
      { feature: "Spam Protection", competitor: false, onseek: true },
      { feature: "Services Support", competitor: "Basic", onseek: true },
    ],
    useCaseCards: [
      { icon: "🔧", title: "Home Services", description: "Define your project scope, timeline, and budget. Receive competing proposals from rated local contractors — no anonymous strangers." },
      { icon: "🚗", title: "Used Vehicles", description: "Specify make, mileage range, and inspection requirements. Only sellers who can meet your criteria submit a proposal." },
      { icon: "📦", title: "Moving Services", description: "Post your move details and date. Get competing quotes from verified movers with community ratings and insurance documentation." },
      { icon: "🏠", title: "Rentals & Housing", description: "Define your requirements, location, and budget. Receive proposals from verified landlords with transparent terms." },
    ],
    faqs: [
      { question: "How is Onseek safer than Craigslist?", answer: "Craigslist has zero seller identity verification. Onseek requires sellers to create accountable community profiles before submitting proposals. Every proposal includes structured product information that can't be fabricated anonymously." },
      { question: "Can I find the same items as on Craigslist?", answer: "Yes, and with significantly less risk. Our community includes the same local sellers and service providers who post on Craigslist, but within a structured system that holds them accountable for what they commit to." },
      { question: "Does it cost more than Craigslist?", answer: "Craigslist is free for buyers but 'free' doesn't account for the time and risk cost. Onseek is also free for buyers, but adds the layer of accountability that makes the transaction safe and predictable." },
      { question: "What about local deals and pickup?", answer: "You can specify 'local pickup' as a requirement in your Onseek request. Proposals will come from sellers in your area who can accommodate in-person exchange — with the safety of a verified profile behind the transaction." },
      { question: "Can I use Onseek for service bookings, not just goods?", answer: "Yes. Services are a core category on Onseek. Home repair, design work, tutoring, and personal services can all be requested with full budget and requirement transparency from the start." },
    ],
    metaDescription:
      "Craigslist is free but dangerous. Onseek brings the same local marketplace energy with verified seller profiles, structured proposals, and zero anonymous transactions.",
    schemaRating: 4.6,
    schemaReviewCount: 560,
  },
};

// Full URL slugs for generateStaticParams — Next.js receives 'onseek-vs-X' as the [slug] param
export const ALL_COMPETITOR_SLUGS = Object.keys(COMPETITORS).map(
  (key) => `onseek-vs-${key}`
);

// Strips the 'onseek-vs-' prefix if present before looking up the data
export function getCompetitor(slug: string): CompetitorData | null {
  const key = slug.startsWith("onseek-vs-") ? slug.slice("onseek-vs-".length) : slug;
  return COMPETITORS[key] ?? null;
}

export function getRelatedCompetitors(currentSlug: string): CompetitorData[] {
  const key = currentSlug.startsWith("onseek-vs-")
    ? currentSlug.slice("onseek-vs-".length)
    : currentSlug;
  return Object.values(COMPETITORS)
    .filter((c) => c.slug !== key)
    .slice(0, 3);
}
