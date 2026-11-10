import { connection } from "next/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const instant = false;

export default async function DashboardPage() {
  await connection();
  const session = await getSession();
  if (!session) redirect("/login");

  const organization = await prisma.organization.findUnique({
    where: { id: session.orgId },
    select: { name: true, defaultLowStockAlert: true },
  });
  if (!organization) redirect("/login");

  const [totalProducts, quantity, lowStockProducts] = await Promise.all([
    prisma.product.count({ where: { orgId: session.orgId } }),
    prisma.product.aggregate({
      where: { orgId: session.orgId },
      _sum: { quantityOnHand: true },
    }),
    prisma.product.findMany({
      where: {
        orgId: session.orgId,
        OR: [
          {
            lowStockThreshold: null,
            quantityOnHand: { lte: organization.defaultLowStockAlert },
          },
          { lowStockThreshold: { not: null } },
        ],
      },
      orderBy: [{ quantityOnHand: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        sku: true,
        quantityOnHand: true,
        lowStockThreshold: true,
      },
    }),
  ]);

  const productsBelowThreshold = lowStockProducts.filter((product) => {
    const threshold = product.lowStockThreshold ?? organization.defaultLowStockAlert;
    return product.quantityOnHand <= threshold;
  });

  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div>
          <p className="text-sm font-medium text-indigo-700">{organization.name}</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
          <p className="mt-2 text-slate-600">A quick overview of your inventory.</p>
        </div>

        <section aria-label="Inventory summary" className="mt-8 grid gap-5 sm:grid-cols-2">
          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Total products (SKUs)</p>
            <p className="mt-3 text-3xl font-bold text-slate-900">{totalProducts}</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Total quantity on hand</p>
            <p className="mt-3 text-3xl font-bold text-slate-900">
              {quantity._sum.quantityOnHand ?? 0}
            </p>
          </article>
        </section>

        <section className="mt-10">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Low stock</h2>
              <p className="mt-1 text-sm text-slate-500">
                Products at or below their configured threshold.
              </p>
            </div>
            <span className="rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-800">
              {productsBelowThreshold.length} {productsBelowThreshold.length === 1 ? "item" : "items"}
            </span>
          </div>
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th scope="col" className="px-5 py-3">Product</th>
                  <th scope="col" className="px-5 py-3">SKU</th>
                  <th scope="col" className="px-5 py-3">Quantity</th>
                  <th scope="col" className="px-5 py-3">Threshold</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {productsBelowThreshold.map((product) => (
                  <tr key={product.id}>
                    <td className="whitespace-nowrap px-5 py-4 font-medium text-slate-900">
                      {product.name}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-slate-600">{product.sku}</td>
                    <td className="whitespace-nowrap px-5 py-4 font-semibold text-amber-800">
                      {product.quantityOnHand}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                      {product.lowStockThreshold ?? organization.defaultLowStockAlert}
                    </td>
                  </tr>
                ))}
                {productsBelowThreshold.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-5 py-10 text-center text-slate-500">
                      All products are above their low-stock thresholds.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </>
  );
}
