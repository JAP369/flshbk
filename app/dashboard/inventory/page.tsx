import { redirect } from "next/navigation";

export default function DashboardInventoryPage() {
  redirect("/dashboard?tab=inventory");
}
