import { redirect } from "next/navigation";

export default function DashboardOverviewPage() {
  redirect("/dashboard?tab=overview");
}
