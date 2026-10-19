"use client";

import { Suspense } from "react";
import ProfilePage from "@/components/pages/restaurant/profile";
import Loader from "@/components/global/loader";

const Page = () => {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[350px] w-full">
          <Loader />
        </div>
      }
    >
      <ProfilePage />
    </Suspense>
  );
};

export default Page;