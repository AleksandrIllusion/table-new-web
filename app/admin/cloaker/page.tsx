import { redirect } from "next/navigation";

/** Legacy route — renamed to /admin/shift */
export default function Page() {
  redirect("/admin/shift");
}
