// src/hooks/useFilterConfig.js
import { ALL_OPTION } from "../constants/filters";
import { getFetcher } from "../data/fetchers";

/**
 * Centralized filter configuration list.
 * Each entry defines: name, label, dependsOn (parent keys), defaultValue and fetcher function (from fetchers module).
 *
 * IMPORTANT: fetcher is a function reference obtained from getFetcher(name).
 */
export const useFilterConfig = () => {
  const cfg = [
    {
      name: "continent",
      label: "Continent",
      dependsOn: [],
      defaultValue: ALL_OPTION,
    },
    {
      name: "country",
      label: "Country",
      dependsOn: ["continent"],
      defaultValue: ALL_OPTION,
    },
    {
      name: "region",
      label: "Region",
      dependsOn: ["country"],
      defaultValue: ALL_OPTION,
    },
    {
      name: "city",
      label: "City",
      dependsOn: ["region"],
      defaultValue: ALL_OPTION,
    },
    {
      name: "store",
      label: "Store",
      dependsOn: ["city"],
      defaultValue: ALL_OPTION,
    },
    {
      name: "department",
      label: "Department",
      dependsOn: ["store"],
      defaultValue: ALL_OPTION,
    },
    {
      name: "category",
      label: "Category",
      dependsOn: ["department"],
      defaultValue: ALL_OPTION,
    },
    {
      name: "subCategory",
      label: "Subcategory",
      dependsOn: ["category"],
      defaultValue: ALL_OPTION,
    },
    {
      name: "brand",
      label: "Brand",
      dependsOn: ["subCategory"],
      defaultValue: ALL_OPTION,
    },
    {
      name: "productLine",
      label: "Product Line",
      dependsOn: ["brand"],
      defaultValue: ALL_OPTION,
    },
    {
      name: "product",
      label: "Product",
      dependsOn: ["productLine"],
      defaultValue: ALL_OPTION,
    },
    {
      name: "variant",
      label: "Variant",
      dependsOn: ["product"],
      defaultValue: ALL_OPTION,
    },
    {
      name: "promotion",
      label: "Promotion",
      dependsOn: ["variant"],
      defaultValue: ALL_OPTION,
    },
    {
      name: "campaign",
      label: "Campaign",
      dependsOn: ["promotion"],
      defaultValue: ALL_OPTION,
    },
    {
      name: "channel",
      label: "Sales Channel",
      dependsOn: [],
      defaultValue: ALL_OPTION,
    },
    {
      name: "customerType",
      label: "Customer Type",
      dependsOn: [],
      defaultValue: ALL_OPTION,
    },
    {
      name: "loyaltyTier",
      label: "Loyalty Tier",
      dependsOn: ["customerType"],
      defaultValue: ALL_OPTION,
    },
    {
      name: "paymentMethod",
      label: "Payment Method",
      dependsOn: ["channel"],
      defaultValue: ALL_OPTION,
    },
    {
      name: "orderStatus",
      label: "Order Status",
      dependsOn: [],
      defaultValue: ALL_OPTION,
    },
    {
      name: "shippingMethod",
      label: "Shipping Method",
      dependsOn: ["region"],
      defaultValue: ALL_OPTION,
    },
  ];

  // attach fetcher references dynamically (read from fetchers module)
  return cfg.map((f) => ({ ...f, fetcher: getFetcher(f.name) }));
};
