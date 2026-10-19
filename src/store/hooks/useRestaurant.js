"use client";
import { useQuery } from "@tanstack/react-query";
import { useUser as useClerkUser } from "@clerk/nextjs";
import { useRouter, usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { RestaurantService } from "@/services/frontend/restaurant";

export const useRestaurant = () => {
  const { user, isLoaded } = useClerkUser();
  const router = useRouter();
  const pathname = usePathname();
  const [restaurantId, setRestaurantId] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("activeRestaurantId") || null;
    }
    return null;
  });

  const { data: restaurants = [], isLoading } = useQuery({
    queryKey: ["restaurants"],
    queryFn: async () => {
      const response = await RestaurantService.getAllRestaurants();
      return response?.data?.restaurants || response?.restaurants || [];
    },
    enabled: isLoaded && !!user,
    staleTime: 5 * 60 * 1000, 
  });

  useEffect(() => {
    if (isLoading || !isLoaded || !user) return;

    if (restaurants.length === 0) {
      localStorage.removeItem("activeRestaurantId");
      setRestaurantId(null);
      if (!pathname.startsWith("/restaurant/onboarding")) {
        router.push("/restaurant/onboarding");
      }
      return;
  }

    const storedId = localStorage.getItem("activeRestaurantId");
    const exists = restaurants.some(r => r._id === storedId);

    if (storedId && exists) {
      setRestaurantId(storedId);
    } else {
      const firstId = restaurants[0]._id;
      setRestaurantId(firstId);
      localStorage.setItem("activeRestaurantId", firstId);
    }
  }, [restaurants, isLoading, isLoaded, user, pathname, router]);

  const setActiveRestaurant = useCallback((id) => {
    localStorage.setItem("activeRestaurantId", id);
    setRestaurantId(id);
    window.location.reload();
  }, []);

  return {
    restaurantId,
    restaurants,
    isLoading,
    setActiveRestaurant,
  };
};
