import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <SignIn
      routing="path"
      path="/sign-in"
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