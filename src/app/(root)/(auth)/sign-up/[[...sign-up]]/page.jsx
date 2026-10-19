import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <SignUp
      routing="path"
      path="/sign-up"
      fallbackRedirectUrl="/onboarding"
      forceRedirectUrl="/onboarding"
      unsafeMetadata={{
        role: "EMPLOYEE",
      }}
      appearance={{
        layout: {
          logoImageUrl: "/logo.png",
        },
      }}
    />
  );
}