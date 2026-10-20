import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <SignUp
      routing="path"
      path="/sign-up"
      fallbackRedirectUrl="/onboarding"
      forceRedirectUrl="/onboarding"
      appearance={{
        layout: {
          logoImageUrl: "/logo.png",
        },
      }}
    />
  );
}