import { useUser as useClerkUser } from "@clerk/nextjs";

export const useActiveUser = () => {
  const { isLoaded, isSignedIn, user } = useClerkUser();
  const userData = user
    ? {
        id: user.id,
        name: user.fullName || user.firstName || "User",
        email: user.primaryEmailAddress?.emailAddress || "",
        avatar: user.imageUrl || "",
      }
    : null;

  return {
    isLoaded,
    isSignedIn,
    user: userData,
  };
};
