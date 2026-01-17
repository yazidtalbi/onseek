import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll(keyHints: string[] = []) {
          const store = cookieStore as any;
          
          // Try to use getAll if it exists (with keyHints parameter)
          if (typeof store.getAll === "function") {
            const allCookies = store.getAll();
            if (keyHints.length === 0) {
              return allCookies;
            }
            // Filter by hints if provided
            return allCookies.filter((cookie: { name: string }) =>
              keyHints.some((hint) => {
                const hintLower = hint.toLowerCase();
                const cookieNameLower = cookie.name.toLowerCase();
                return cookieNameLower.includes(hintLower) || cookieNameLower.startsWith(hintLower);
              })
            );
          }
          
          // Fallback: manually collect cookies
          const result: { name: string; value: string }[] = [];
          
          // Try to iterate over all cookies using Symbol.iterator
          try {
            if (store && typeof store[Symbol.iterator] === "function") {
              for (const entry of store) {
                let name: string;
                let value: string;
                
                // Handle different entry formats
                if (Array.isArray(entry)) {
                  name = entry[0];
                  const cookieObj = entry[1];
                  value = typeof cookieObj === "object" && cookieObj?.value ? cookieObj.value : String(cookieObj);
                } else if (entry && typeof entry === "object") {
                  name = entry.name || entry[0];
                  value = entry.value || entry[1];
                } else {
                  continue;
                }
                
                // If hints provided, filter
                if (keyHints.length === 0 || keyHints.some((hint) => {
                  const hintLower = hint.toLowerCase();
                  const nameLower = name.toLowerCase();
                  return nameLower.includes(hintLower) || nameLower.startsWith(hintLower);
                })) {
                  result.push({ name, value });
                }
              }
              
              if (result.length > 0 || keyHints.length === 0) {
                return result;
              }
            }
          } catch (e) {
            // Iterator might not work, fall through to manual collection
          }
          
          // Manual collection using get() for specific hints
          if (keyHints.length > 0) {
            for (const hint of keyHints) {
              // Try exact match
              const cookie = cookieStore.get(hint);
              if (cookie) {
                result.push({ name: cookie.name, value: cookie.value });
              }
              
              // Try variations with prefixes/suffixes for Supabase cookies
              const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.split("//")[1]?.split(".")[0] || "";
              const variations = [
                `sb-${hint}`,
                `${hint}-chunk`,
                `sb-${baseUrl}-${hint}`,
                `${baseUrl}-${hint}`,
              ];
              
              for (const variant of variations) {
                const variantCookie = cookieStore.get(variant);
                if (variantCookie && !result.find((c) => c.name === variantCookie.name)) {
                  result.push({ name: variantCookie.name, value: variantCookie.value });
                }
              }
            }
          }
          
          return result;
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch (err) {
            // Ignore set errors - might not be allowed in some contexts
          }
        },
      },
    }
  );
}

