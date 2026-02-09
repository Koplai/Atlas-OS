import { redirect } from "next/navigation";

import { ROUTES } from "@/app/components/shell/routes";

export default function ChatIndex() {
  redirect(ROUTES.CHAT_NEW);
}
