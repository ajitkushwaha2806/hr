import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <SignUp
      routing="path"
      path="/sign-up"
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