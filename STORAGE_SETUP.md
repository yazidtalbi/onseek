# Supabase Storage Setup for Request Images

## Create Storage Bucket

To enable image uploads for requests, you need to create a Supabase Storage bucket:

### Option 1: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **New bucket**
4. Set the bucket name to: `request-images`
5. Set it to **Public bucket** (or configure RLS policies if you prefer private)
6. Click **Create bucket**

### Option 2: Using SQL

Run this SQL in your Supabase SQL Editor:

```sql
-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('request-images', 'request-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies (optional, for RLS)
-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'request-images');

-- Allow public read access
CREATE POLICY "Public can view images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'request-images');

-- Allow users to delete their own images
CREATE POLICY "Users can delete their own images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'request-images' AND (storage.foldername(name))[1] = auth.uid()::text);
```

### Storage Configuration

- **Bucket name**: `request-images`
- **Public access**: Recommended (set to `true`) for easier image display
- **File size limit**: 5MB per file (enforced in the API)
- **Max files per request**: 5 (enforced in the API)
- **Allowed file types**: Images only (validated in the API)

### File Structure

Images are stored with the following path structure:
```
{user_id}/{timestamp}-{index}-{random}.webp
```

Example:
```
abc123-def456-789/1704123456789-0-a7b3c9d.webp
```

### Testing

After creating the bucket, try uploading an image through the request form. The upload should work without errors.

