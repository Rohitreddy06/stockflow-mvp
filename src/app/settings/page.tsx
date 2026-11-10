import { connection } from "next/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import SettingsForm from "@/components/SettingsForm";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const instant = false;

export default async function SettingsPage() {
  await connection();
  const session = await getSession();
  if (!session) redirect("/login");

  const organization = await prisma.organization.findUnique({
    where: { id: session.orgId },
    select: { name: true, defaultLowStockAlert: true },
  });
  if (!organization) redirect("/login");

  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Settings</h1>
        <p className="mt-2 text-slate-600">
          Manage inventory alerts for {organization.name}.
        </p>
        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Inventory alerts</h2>
          <SettingsForm defaultLowStockAlert={organization.defaultLowStockAlert} />
        </section>
      </main>
    </>
  );
}
