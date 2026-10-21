import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <SignUp
      routing="path"
      path="/sign-up"
      fallbackRedirectUrl="/dashboard"
      forceRedirectUrl="/dashboard"
      appearance={{
        layout: {
          logoImageUrl: "/logo.png",
        },
      }}
    />
  );
}