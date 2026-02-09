import { redirect } from "next/navigation";

import { ROUTES } from "@/app/components/shell/routes";

export default function Home() {
  redirect(ROUTES.CHAT);
}
