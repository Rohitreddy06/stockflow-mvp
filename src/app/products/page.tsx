import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import Navbar from "@/components/Navbar";
import ProductControls from "@/components/ProductControls";
import ProductForm from "@/components/ProductForm";
import type { Prisma } from "@prisma/client";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const instant = false;

interface ProductsPageProps {
  searchParams: Promise<{ search?: string | string[] }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  await connection();
  const session = await getSession();
  if (!session) redirect("/login");

  const params = await searchParams;
  const searchValue = Array.isArray(params.search) ? params.search[0] : params.search;
  const search = searchValue?.trim().slice(0, 100) ?? "";

  const where: Prisma.ProductWhereInput = {
    orgId: session.orgId,
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { sku: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const products = await prisma.product.findMany({
    where,
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      sku: true,
      description: true,
      quantityOnHand: true,
      costPrice: true,
      sellingPrice: true,
      lowStockThreshold: true,
    },
  });

  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Products</h1>
            <p className="mt-2 text-slate-600">Manage product details and inventory levels.</p>
          </div>
          <span className="text-sm text-slate-500">{products.length} products shown</span>
        </div>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="mb-5 text-lg font-semibold text-slate-900">Add a product</h2>
          <ProductForm />
        </section>

        <section className="mt-8">
          <form action="/products" method="get" className="mb-4 flex max-w-xl gap-2">
            <label htmlFor="product-search" className="sr-only">Search by name or SKU</label>
            <input
              id="product-search"
              name="search"
              type="search"
              defaultValue={search}
              placeholder="Search by name or SKU"
              className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900"
            />
            <button
              type="submit"
              className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700"
            >
              Search
            </button>
            {search && (
              <Link
                href="/products"
                className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-white"
              >
                Clear
              </Link>
            )}
          </form>

          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th scope="col" className="px-5 py-3">Product</th>
                  <th scope="col" className="px-5 py-3">SKU</th>
                  <th scope="col" className="px-5 py-3">Quantity</th>
                  <th scope="col" className="px-5 py-3">Price</th>
                  <th scope="col" className="px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((product) => (
                  <tr key={product.id} className="align-top">
                    <td className="min-w-48 px-5 py-4">
                      <p className="font-medium text-slate-900">{product.name}</p>
                      {product.description && (
                        <p className="mt-1 max-w-xs text-xs text-slate-500">{product.description}</p>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-slate-600">{product.sku}</td>
                    <td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-900">
                      {product.quantityOnHand}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                      {product.sellingPrice === null
                        ? "—"
                        : new Intl.NumberFormat(undefined, {
                            maximumFractionDigits: 2,
                          }).format(product.sellingPrice)}
                    </td>
                    <td className="min-w-72 px-5 py-4">
                      <ProductControls
                        productId={product.id}
                        quantityOnHand={product.quantityOnHand}
                      />
                      <details className="mt-3">
                        <summary className="cursor-pointer text-sm font-medium text-indigo-700 hover:text-indigo-900">
                          Edit product
                        </summary>
                        <div className="mt-3 min-w-80 rounded-lg bg-slate-50 p-4">
                          <ProductForm
                            product={{
                              ...product,
                              id: product.id,
                            }}
                          />
                        </div>
                      </details>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-slate-500">
                      {search
                        ? "No products match your search."
                        : "No products yet. Use the form above to add your first product."}
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
