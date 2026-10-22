import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <SignIn
      routing="path"
      path="/sign-in"
      fallbackRedirectUrl="/"
      forceRedirectUrl="/"
      appearance={{
        layout: {
          logoImageUrl: "/assets/icons/logo.png",
        },
      }}
    />
  );
}