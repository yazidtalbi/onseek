/**
 * Strapi CMS Content Types
 * 
 * Define your Strapi content types here to ensure type safety
 */

import { StrapiImage, StrapiComponent } from './client';

// Landing Page Content
export interface LandingPageContent {
  id: number;
  attributes: {
    heroBadge: string;
    heroTitle: string;
    heroDescription: string;
    ctaPrimaryText: string;
    ctaPrimaryLink: string;
    ctaSecondaryText: string;
    ctaSecondaryLink: string;
    features: FeatureItem[];
    sampleRequest: SampleRequest;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
  };
}

export interface FeatureItem {
  id: number;
  title: string;
  description: string;
  icon?: string;
}

export interface SampleRequest {
  id: number;
  title: string;
  description: string;
  topSubmission: {
    text: string;
    score: string;
    store: string;
    price: string;
  };
}

// Page Content (for Terms, Privacy, etc.)
export interface PageContent {
  id: number;
  attributes: {
    title: string;
    slug: string;
    content: string;
    seoTitle?: string;
    seoDescription?: string;
    seoImage?: { data: StrapiImage | null };
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
  };
}

// Global Site Settings
export interface SiteSettings {
  id: number;
  attributes: {
    siteName: string;
    siteDescription: string;
    logo?: { data: StrapiImage | null };
    favicon?: { data: StrapiImage | null };
    footerText?: string;
    socialLinks?: {
      twitter?: string;
      facebook?: string;
      instagram?: string;
      linkedin?: string;
    };
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
  };
}

// Navigation Items
export interface NavigationItem {
  id: number;
  attributes: {
    label: string;
    url: string;
    target?: '_blank' | '_self';
    order: number;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
  };
}

// Announcement/Banner
export interface Announcement {
  id: number;
  attributes: {
    title: string;
    message: string;
    type: 'info' | 'warning' | 'success' | 'error';
    isActive: boolean;
    link?: string;
    linkText?: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
  };
}

