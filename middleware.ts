import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const url = request.nextUrl.clone();
  const hostname = request.headers.get("host");

  // 1. Force non-www domain for SEO consistency
  if (hostname?.startsWith("www.")) {
    const newHostname = hostname.replace(/^www\./, "");
    url.host = newHostname;
    return NextResponse.redirect(url, 301);
  }

  // 2. Redirect legacy /category routes to new /[category] format
  if (url.pathname.startsWith("/category/")) {
    const categorySlug = url.pathname.replace("/category/", "");
    url.pathname = `/${categorySlug}`;
    return NextResponse.redirect(url, 301);
  }

  // 3. Resolve /legal 404 by redirecting to /terms
  if (url.pathname === "/legal") {
    url.pathname = "/terms";
    return NextResponse.redirect(url, 301);
  }

  // Allow guests to access /app routes, but protect specific actions
  // Only redirect to login for protected routes like /app/settings, /app/submissions, etc.
  const protectedPaths = ["/app/settings", "/app/submissions", "/app/new", "/app/profile"];
  const isProtectedPath = protectedPaths.some(path => request.nextUrl.pathname.startsWith(path));
  
  if (isProtectedPath && !user) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirectTo", request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (
    (request.nextUrl.pathname === "/login" ||
      request.nextUrl.pathname === "/signup") &&
    user
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Set pathname header for use in layouts
  response.headers.set("x-pathname", request.nextUrl.pathname);

  return response;
}

export const config = {
  matcher: ["/", "/app/:path*", "/login", "/signup", "/tags/:path*", "/requests/:path*"],
};

