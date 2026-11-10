"use server";

import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  clearSessionCookie,
  getSession,
  setSessionCookie,
  signToken,
} from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ActionState } from "@/lib/action-state";

const PASSWORD_MIN_LENGTH = 8;

function getString(formData: FormData, name: string): string | null {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : null;
}

function getPassword(formData: FormData): string | null {
  const value = formData.get("password");
  return typeof value === "string" ? value : null;
}

function getOptionalNonNegativeNumber(
  formData: FormData,
  name: string,
  integer = false,
): number | null | undefined {
  const rawValue = formData.get(name);
  if (rawValue === null) return null;
  if (typeof rawValue !== "string") return undefined;
  const value = rawValue.trim();
  if (value === "") return null;

  const parsed = Number(value);
  if (
    !Number.isFinite(parsed) ||
    parsed < 0 ||
    (integer && (!Number.isInteger(parsed) || parsed > 2_147_483_647))
  ) {
    return undefined;
  }
  return parsed;
}

function isUniqueConstraintError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

function isDatabaseConnectionError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientInitializationError ||
    (error instanceof Prisma.PrismaClientKnownRequestError &&
      ["P1000", "P1001", "P2039"].includes(error.code))
  );
}

function databaseUnavailableError(): ActionState {
  return {
    error:
      "Unable to reach the database. Check DATABASE_URL and confirm your Supabase project and database credentials are active.",
  };
}

function validateProduct(formData: FormData):
  | {
      data: {
        name: string;
        sku: string;
        description: string | null;
        quantityOnHand: number;
        costPrice: number | null;
        sellingPrice: number | null;
        lowStockThreshold: number | null;
      };
    }
  | { error: string } {
  const name = getString(formData, "name");
  const sku = getString(formData, "sku");
  const description = getString(formData, "description");
  const quantityOnHand = getOptionalNonNegativeNumber(formData, "quantityOnHand", true);
  const costPrice = getOptionalNonNegativeNumber(formData, "costPrice");
  const sellingPrice = getOptionalNonNegativeNumber(formData, "sellingPrice");
  const lowStockThreshold = getOptionalNonNegativeNumber(
    formData,
    "lowStockThreshold",
    true,
  );

  if (!name || name.length > 200) {
    return { error: "Enter a product name no longer than 200 characters." };
  }
  if (!sku || sku.length > 100) {
    return { error: "Enter an SKU no longer than 100 characters." };
  }
  if (description !== null && description.length > 2000) {
    return { error: "Description must be no longer than 2,000 characters." };
  }
  if (quantityOnHand === null || quantityOnHand === undefined) {
    return { error: "Quantity on hand must be a non-negative whole number." };
  }
  if (costPrice === undefined || sellingPrice === undefined) {
    return { error: "Prices must be valid non-negative numbers." };
  }
  if (lowStockThreshold === undefined) {
    return { error: "Low-stock threshold must be a non-negative whole number." };
  }

  return {
    data: {
      name,
      sku: sku.toUpperCase(),
      description: description || null,
      quantityOnHand,
      costPrice,
      sellingPrice,
      lowStockThreshold,
    },
  };
}

async function requireSession() {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

export async function signup(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = getString(formData, "email")?.toLowerCase();
  const password = getPassword(formData);
  const organizationName = getString(formData, "organizationName");

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return { error: "Enter a valid email address." };
  }
  if (
    !password ||
    password.length < PASSWORD_MIN_LENGTH ||
    Buffer.byteLength(password, "utf8") > 72
  ) {
    return { error: "Password must be between 8 and 72 characters." };
  }
  if (!organizationName || organizationName.length > 120) {
    return { error: "Enter an organization name no longer than 120 characters." };
  }

  const passwordHash = await bcrypt.hash(password, 12);
  let created: { id: string; email: string; orgId: string };
  try {
    const organization = await prisma.organization.create({
      data: {
        name: organizationName,
        users: { create: { email, passwordHash } },
      },
      select: {
        id: true,
        users: { select: { id: true, email: true } },
      },
    });
    const user = organization.users[0];
    if (!user) throw new Error("Organization signup did not create its owner.");
    created = { id: user.id, email: user.email, orgId: organization.id };
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return { error: "An account with that email already exists." };
    }
    if (isDatabaseConnectionError(error)) return databaseUnavailableError();
    throw error;
  }

  await setSessionCookie(
    signToken({ userId: created.id, email: created.email, orgId: created.orgId }),
  );
  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function login(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = getString(formData, "email")?.toLowerCase();
  const password = getPassword(formData);
  if (!email || !password) return { error: "Enter your email and password." };

  let user: {
    id: string;
    email: string;
    orgId: string;
    passwordHash: string;
  } | null;
  try {
    user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, orgId: true, passwordHash: true },
    });
  } catch (error) {
    if (isDatabaseConnectionError(error)) return databaseUnavailableError();
    throw error;
  }
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return { error: "Email or password is incorrect." };
  }

  await setSessionCookie(
    signToken({ userId: user.id, email: user.email, orgId: user.orgId }),
  );
  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function logout(): Promise<void> {
  await clearSessionCookie();
  revalidatePath("/", "layout");
  redirect("/login");
}

export async function createProduct(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireSession();
  const product = validateProduct(formData);
  if ("error" in product) return product;

  try {
    await prisma.product.create({
      data: { ...product.data, orgId: session.orgId },
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return { error: "That SKU is already in use in your organization." };
    }
    throw error;
  }

  revalidatePath("/products");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateProduct(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireSession();
  const productId = getString(formData, "productId");
  const product = validateProduct(formData);
  if (!productId) return { error: "Product not found." };
  if ("error" in product) return product;

  try {
    const result = await prisma.product.updateMany({
      where: { id: productId, orgId: session.orgId },
      data: product.data,
    });
    if (result.count === 0) return { error: "Product not found." };
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return { error: "That SKU is already in use in your organization." };
    }
    throw error;
  }

  revalidatePath("/products");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateStock(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireSession();
  const productId = getString(formData, "productId");
  const change = getString(formData, "change");
  if (!productId || (change !== "1" && change !== "-1")) {
    return { error: "A valid product and stock adjustment are required." };
  }

  const result = await prisma.product.updateMany({
    where: {
      id: productId,
      orgId: session.orgId,
      ...(change === "-1" ? { quantityOnHand: { gt: 0 } } : {}),
    },
    data:
      change === "1"
        ? { quantityOnHand: { increment: 1 } }
        : { quantityOnHand: { decrement: 1 } },
  });
  if (result.count === 0) {
    const productExists = await prisma.product.findFirst({
      where: { id: productId, orgId: session.orgId },
      select: { id: true },
    });
    if (!productExists) return { error: "Product not found." };
  }

  revalidatePath("/products");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteProduct(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireSession();
  const productId = getString(formData, "productId");
  if (!productId) return { error: "A product is required." };

  const result = await prisma.product.deleteMany({
    where: { id: productId, orgId: session.orgId },
  });
  if (result.count === 0) return { error: "Product not found." };

  revalidatePath("/products");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateSettings(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireSession();
  const threshold = getOptionalNonNegativeNumber(formData, "defaultLowStockAlert", true);
  if (threshold === null || threshold === undefined) {
    return { error: "Enter a non-negative whole-number threshold." };
  }

  const result = await prisma.organization.updateMany({
    where: { id: session.orgId },
    data: { defaultLowStockAlert: threshold },
  });
  if (result.count === 0) throw new Error("Organization not found.");

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return { success: true };
}
