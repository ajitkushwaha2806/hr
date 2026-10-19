import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <SignIn
      routing="path"
      path="/sign-in"
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