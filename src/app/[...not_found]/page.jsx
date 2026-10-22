import { redirect } from "next/navigation";

export default function CatchAllNotFoundPage() {
  redirect("/");
}
