import { redirect } from "next/navigation";

export default function AggregatorRedirect() {
  redirect("/categories/tcg");
}
