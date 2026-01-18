import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  // Skip for personal items
  if (url === "personal-item") {
    return NextResponse.json({ imageUrl: null, articleName: null, price: null });
  }

  try {
    // Try to fetch the page and extract Open Graph image
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    
    // Extract og:title or og:title meta tag
    const ogTitleMatch = html.match(
      /<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["'][^>]*>/i
    );
    
    // Fallback to page title if no og:title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    
    const articleName = ogTitleMatch?.[1] || titleMatch?.[1] || null;
    
    // Extract price - first check elements with class or data containing "current-price"
    let price: number | null = null;
    
    // Method 1: Check for elements with class or data containing "current-price" (partial match)
    const currentPricePatterns = [
      /<[^>]*class=["'][^"']*current-price[^"']*["'][^>]*>([^<]+)</i,  // class containing "current-price"
      /<[^>]*data-[^=]*current-price[^=]*=["']([^"']+)["'][^>]*>/i,  // data attribute containing "current-price"
    ];
    
    for (const pattern of currentPricePatterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        // Extract number from the matched content (handle $99.99, €99.99, 99.99$, etc.)
        const priceMatch = match[1].match(/(\d+[,.]?\d*)/);
        if (priceMatch && priceMatch[1]) {
          const priceStr = priceMatch[1].replace(/,/g, '.');
          price = parseFloat(priceStr);
          if (price && !isNaN(price)) break;
        }
      }
    }
    
    // Method 2: If no current-price found, look for price patterns with $ or € sign (before or after)
    if (!price) {
      const pricePatterns = [
        /[\$€](\d+[,.]?\d*)/,  // $99.99, €99.99, $99,99, €99,99, $99, €99
        /(\d+[,.]?\d*)[\$€]/,  // 99.99$, 99,99€, 99$, 99€
      ];
      
      for (const pattern of pricePatterns) {
        const match = html.match(pattern);
        if (match && match[1]) {
          // Replace comma with dot for decimal parsing
          const priceStr = match[1].replace(/,/g, '.');
          price = parseFloat(priceStr);
          if (price && !isNaN(price)) break;
        }
      }
    }
    
    // Extract og:image or og:image:url meta tag
    const ogImageMatch = html.match(
      /<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["'][^>]*>/i
    ) || html.match(
      /<meta[^>]*property=["']og:image:url["'][^>]*content=["']([^"']+)["'][^>]*>/i
    );

    let imageUrl: string | null = null;
    if (ogImageMatch && ogImageMatch[1]) {
      imageUrl = ogImageMatch[1];
      
      // Handle relative URLs
      if (imageUrl.startsWith("//")) {
        imageUrl = `https:${imageUrl}`;
      } else if (imageUrl.startsWith("/")) {
        try {
          const urlObj = new URL(url);
          imageUrl = `${urlObj.protocol}//${urlObj.host}${imageUrl}`;
        } catch {
          // If URL parsing fails, return as is
        }
      }
    } else {
      // Fallback to thumbnail service if no OG image found
      const encodedUrl = encodeURIComponent(url);
      imageUrl = `https://image.thum.io/get/width/400/crop/700/${encodedUrl}`;
    }
    
      return NextResponse.json({ imageUrl, articleName, price });
  } catch (error) {
    console.error("Error fetching link preview:", error);
    
    // Fallback to thumbnail service on error
    try {
      const encodedUrl = encodeURIComponent(url);
      const fallbackUrl = `https://image.thum.io/get/width/400/crop/700/${encodedUrl}`;
      return NextResponse.json({ imageUrl: fallbackUrl, articleName: null, price: null });
    } catch {
      return NextResponse.json({ imageUrl: null, articleName: null, price: null });
    }
  }
}

