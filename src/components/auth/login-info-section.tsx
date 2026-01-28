"use client";

import { CheckCircle2, Zap, Users, TrendingUp } from "lucide-react";
import Link from "next/link";

export function LoginInfoSection() {
  const features = [
    {
      icon: Zap,
      title: "Fast results",
      description: "Get quality product links in minutes from the community",
    },
    {
      icon: Users,
      title: "Community-driven",
      description: "Connect with hunters who find the best deals",
    },
    {
      icon: TrendingUp,
      title: "Build reputation",
      description: "Earn points by submitting winning proposals",
    },
  ];

  return (
    <div className="flex flex-col h-full justify-center space-y-8">
      {/* Welcome message */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-3">
          Welcome back to Onseek
        </h2>
        <p className="text-gray-600 leading-relaxed">
          Continue your journey of finding the best products and helping others discover great deals.
        </p>
      </div>

      {/* Features */}
      <div className="space-y-4">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <div key={index} className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <Icon className="h-5 w-5 text-[#7755FF]" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {feature.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick actions */}
      <div className="pt-4 border-t border-gray-200">
        <p className="text-sm font-semibold text-gray-900 mb-3">
          Quick actions
        </p>
        <div className="space-y-2">
          <Link
            href="/app/new"
            className="block text-sm text-[#7755FF] hover:text-[#6644EE] hover:underline"
          >
            → Create a new request
          </Link>
          <Link
            href="/app"
            className="block text-sm text-[#7755FF] hover:text-[#6644EE] hover:underline"
          >
            → Explore live requests
          </Link>
          <Link
            href="/app/requests"
            className="block text-sm text-[#7755FF] hover:text-[#6644EE] hover:underline"
          >
            → View your requests
          </Link>
        </div>
      </div>
    </div>
  );
}

