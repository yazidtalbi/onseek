# Personalization Implementation Guide

## Overview
This document describes the personalization system implemented for the Onseek requests feed. The system allows users to select category preferences and receive a personalized feed ranked by relevance.

## Database Schema

### New Tables

1. **categories** - Stores all available categories
   - `id` (uuid, primary key)
   - `name` (text, unique)
   - `slug` (text, unique)
   - `icon` (text, nullable)
   - `parent_id` (uuid, nullable, references categories)
   - `created_at` (timestamptz)

2. **request_categories** - Many-to-many join table
   - `request_id` (uuid, references requests)
   - `category_id` (uuid, references categories)
   - `created_at` (timestamptz)
   - Primary key: (request_id, category_id)

3. **user_preferences** - User's category preferences
   - `user_id` (uuid, references profiles)
   - `category_id` (uuid, references categories)
   - `weight` (numeric, default 1.0)
   - `updated_at` (timestamptz)
   - Primary key: (user_id, category_id)

4. **user_hidden_categories** - Categories user wants to hide
   - `user_id` (uuid, references profiles)
   - `category_id` (uuid, references categories)
   - `created_at` (timestamptz)
   - Primary key: (user_id, category_id)

### Indexes
- `categories_slug_idx` on categories(slug)
- `categories_parent_idx` on categories(parent_id)
- `request_categories_request_idx` on request_categories(request_id)
- `request_categories_category_idx` on request_categories(category_id)
- `user_preferences_user_idx` on user_preferences(user_id)
- `user_preferences_category_idx` on user_preferences(category_id)
- `user_hidden_categories_user_idx` on user_hidden_categories(user_id)
- `user_hidden_categories_category_idx` on user_hidden_categories(category_id)

## Migration

Run the migration file:
```bash
supabase migration up
# or
psql -f supabase/migrations/011_add_personalization.sql
```

The migration:
- Creates all new tables
- Seeds categories from existing structure
- Migrates existing requests to use the new category system
- Sets up RLS policies

## API / Server Actions

### `savePreferencesAction(categoryIds: string[])`
Saves user's category preferences. Replaces all existing preferences.

**Location:** `src/actions/preference.actions.ts`

### `hideCategoryAction(categoryId: string)`
Hides a category for the user and removes it from preferences.

**Location:** `src/actions/preference.actions.ts`

### `getUserPreferencesAction()`
Fetches user's preferences and hidden categories.

**Location:** `src/actions/preference.actions.ts`

### `getCategoriesAction()`
Fetches all available categories.

**Location:** `src/actions/preference.actions.ts`

### `getPersonalizedFeedAction(mode, cursor, limit)`
Fetches personalized feed with ranking.

**Parameters:**
- `mode`: "for_you" | "latest" | "trending"
- `cursor`: Optional cursor for pagination
- `limit`: Number of items per page (default 20)

**Returns:**
```typescript
{
  items: RequestItem[],
  nextCursor: string | null,
  hasMore: boolean,
  debug?: { ... }
}
```

**Location:** `src/actions/preference.actions.ts`

## Ranking Logic

### "For You" Feed
1. **Category Match Score**: Sum of weights for matched categories
2. **Recency Score**: Newer requests get higher score (decay over 7 days)
3. **Activity Score**: Based on submission count (normalized to 0-1)
4. **Combined Score**: `categoryScore * 0.6 + recencyScore * 0.2 + activityScore * 0.2`
5. **80/20 Mix**: Top 80% by score, 20% latest (serendipity)

### "Latest" Feed
- Simple ordering by `created_at DESC`

### "Trending" Feed
- Combines submission count with recency decay
- Formula: `activityScore * recencyDecay`
- Decay over 3 days

## UI Components

### Category Preferences (`src/components/settings/category-preferences.tsx`)
- Multi-select category picker
- Searchable list
- Shows selected count
- Save button with loading states

### Feed Mode Tabs (`src/components/requests/feed-mode-tabs.tsx`)
- Toggle between "For you", "Latest", "Trending"
- Shows selected interests when in "For you" mode
- Disables "For you" if no preferences set

### Personalized Feed (`src/components/requests/personalized-feed.tsx`)
- Infinite scroll feed
- Mode switching
- Loading and error states
- Empty state with CTA to set preferences

### Request Card Updates
- Shows matched categories with highlight
- Displays "Because you follow: X" indicator
- Category tags with matched styling

### Request Menu Updates
- "Hide category" option for each category
- Confirmation dialog
- Updates preferences automatically

## User Flow

### First Time User
1. Sees "Latest" feed by default
2. Can switch to "For you" but sees empty state
3. CTA to go to settings and select categories
4. After selecting, "For you" feed becomes available

### Returning User with Preferences
1. Sees "For you" feed by default
2. Can switch between modes
3. Sees match indicators on relevant requests
4. Can hide categories from request menu

### Settings Flow
1. Navigate to `/app/settings`
2. Scroll to "Interests" section
3. Search and select categories
4. Click "Save Preferences"
5. Feed updates automatically

## Type Definitions

New types in `src/lib/types.ts`:
- `Category`
- `UserPreference`
- `FeedMode`
- `PersonalizedFeedResponse`
- Extended `RequestItem` with:
  - `categories?: Category[]`
  - `matchedCategories?: Category[]`
  - `personalizationScore?: number`
  - `matchReason?: string`

## Testing

### Manual Testing Steps

1. **Run Migration**
   ```bash
   supabase migration up
   ```

2. **Verify Categories Seeded**
   - Check that categories table has data
   - Verify request_categories has mappings for existing requests

3. **Test Preferences**
   - Go to `/app/settings`
   - Select some categories
   - Save and verify they're stored

4. **Test Feed**
   - Go to `/app`
   - Switch between feed modes
   - Verify "For you" shows matched requests
   - Check match indicators appear

5. **Test Hide Category**
   - Open a request menu
   - Click "Hide [Category]"
   - Verify category is hidden
   - Check feed updates

## Performance Considerations

1. **Indexes**: All foreign keys and frequently queried columns are indexed
2. **Pagination**: Uses cursor-based pagination for efficiency
3. **Filtering**: Hidden categories filtered in application layer (could be optimized with DB function)
4. **Ranking**: Done in application layer for flexibility (could be moved to DB function for scale)

## Future Enhancements

1. **Database Functions**: Move ranking logic to PostgreSQL functions for better performance
2. **Materialized Views**: Pre-compute scores for faster queries
3. **Machine Learning**: Use ML for better personalization
4. **A/B Testing**: Test different ranking algorithms
5. **Analytics**: Track which matches lead to engagement

## Files Changed/Created

### Database
- `supabase/migrations/011_add_personalization.sql`

### Types
- `src/lib/types.ts` (extended)

### Server Actions
- `src/actions/preference.actions.ts` (new)

### Components
- `src/components/settings/category-preferences.tsx` (new)
- `src/components/requests/feed-mode-tabs.tsx` (new)
- `src/components/requests/personalized-feed.tsx` (new)
- `src/components/requests/request-card.tsx` (updated)
- `src/components/requests/request-menu.tsx` (updated)

### Pages
- `src/app/app/page.tsx` (updated)
- `src/app/app/settings/page.tsx` (updated)

## Notes

- The system maintains backward compatibility with the existing `category` field on requests
- Existing requests are automatically migrated to use the new category system
- If a user has no preferences, "For you" mode falls back to "Latest"
- The 80/20 serendipity mix ensures users don't get stuck in a filter bubble

