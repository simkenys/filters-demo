// src/data/fetchers.js
import { ALL_OPTION } from "../constants/filters";
import * as D from "./fakeDataArrays";

/**
 * Fetcher signature:
 * async function fetchX({ parentValues = [], extraDeps = [], signal }) => Promise<Array<{id,label,...}>>
 *
 * These fake fetchers return arrays (NOT including ALL_OPTION). useFilterOptions will add ALL_OPTION.
 * Replace these with real API implementations in production by calling setFetchers(...)
 */

const defaultDelay = (ms = 100) => new Promise((r) => setTimeout(r, ms));

const DEFAULT_FETCHERS = {
  continent: async () => {
    await defaultDelay();
    return D.FAKE_CONTINENTS;
  },
  country: async ({ parentValues = [] } = {}) => {
    await defaultDelay();
    const [continent] = parentValues;
    return continent && continent.id !== -1
      ? D.FAKE_COUNTRIES.filter((c) => c.continentId === continent.id)
      : D.FAKE_COUNTRIES;
  },
  region: async ({ parentValues = [] } = {}) => {
    await defaultDelay();
    const [country] = parentValues;
    return country && country.id !== -1
      ? D.FAKE_REGIONS.filter((r) => r.countryId === country.id)
      : D.FAKE_REGIONS;
  },
  city: async ({ parentValues = [] } = {}) => {
    await defaultDelay();
    const [region] = parentValues;
    return region && region.id !== -1
      ? D.FAKE_CITIES.filter((c) => c.regionId === region.id)
      : D.FAKE_CITIES;
  },
  store: async ({ parentValues = [] } = {}) => {
    await defaultDelay();
    const [city] = parentValues;
    return city && city.id !== -1
      ? D.FAKE_STORES.filter((s) => s.cityId === city.id)
      : D.FAKE_STORES;
  },
  department: async ({ parentValues = [] } = {}) => {
    await defaultDelay();
    const [store] = parentValues;
    return store && store.id !== -1
      ? D.FAKE_DEPARTMENTS.filter((x) => x.storeId === store.id)
      : D.FAKE_DEPARTMENTS;
  },
  category: async ({ parentValues = [] } = {}) => {
    await defaultDelay();
    const [department] = parentValues;
    return department && department.id !== -1
      ? D.FAKE_CATEGORIES.filter((x) => x.departmentId === department.id)
      : D.FAKE_CATEGORIES;
  },
  subCategory: async ({ parentValues = [] } = {}) => {
    await defaultDelay();
    const [category] = parentValues;
    return category && category.id !== -1
      ? D.FAKE_SUBCATEGORIES.filter((x) => x.categoryId === category.id)
      : D.FAKE_SUBCATEGORIES;
  },
  brand: async ({ parentValues = [] } = {}) => {
    await defaultDelay();
    const [subCategory] = parentValues;
    return subCategory && subCategory.id !== -1
      ? D.FAKE_BRANDS.filter((x) => x.subCategoryId === subCategory.id)
      : D.FAKE_BRANDS;
  },
  productLine: async ({ parentValues = [] } = {}) => {
    await defaultDelay();
    const [brand] = parentValues;
    return brand && brand.id !== -1
      ? D.FAKE_PRODUCTLINES.filter((x) => x.brandId === brand.id)
      : D.FAKE_PRODUCTLINES;
  },
  product: async ({ parentValues = [] } = {}) => {
    await defaultDelay();
    const [productLine] = parentValues;
    return productLine && productLine.id !== -1
      ? D.FAKE_PRODUCTS.filter((x) => x.productLineId === productLine.id)
      : D.FAKE_PRODUCTS;
  },
  variant: async ({ parentValues = [] } = {}) => {
    await defaultDelay();
    const [product] = parentValues;
    return product && product.id !== -1
      ? D.FAKE_VARIANTS.filter((x) => x.productId === product.id)
      : D.FAKE_VARIANTS;
  },
  promotion: async ({ parentValues = [] } = {}) => {
    await defaultDelay();
    const [variant] = parentValues;
    return variant && variant.id !== -1
      ? D.FAKE_PROMOTIONS.filter((x) => x.variantId === variant.id)
      : D.FAKE_PROMOTIONS;
  },
  campaign: async ({ parentValues = [] } = {}) => {
    await defaultDelay();
    const [promotion] = parentValues;
    return promotion && promotion.id !== -1
      ? D.FAKE_CAMPAIGNS.filter((x) => x.promotionId === promotion.id)
      : D.FAKE_CAMPAIGNS;
  },
  channel: async () => {
    await defaultDelay();
    return D.FAKE_CHANNELS;
  },
  customerType: async () => {
    await defaultDelay();
    return D.FAKE_CUSTOMERTYPES;
  },
  loyaltyTier: async ({ parentValues = [] } = {}) => {
    await defaultDelay();
    const [customerType] = parentValues;
    return customerType && customerType.id !== -1
      ? D.FAKE_LOYALTYTIERS.filter((x) => x.customerTypeId === customerType.id)
      : D.FAKE_LOYALTYTIERS;
  },
  paymentMethod: async ({ parentValues = [] } = {}) => {
    await defaultDelay();
    const [channel] = parentValues;
    return channel && channel.id !== -1
      ? D.FAKE_PAYMENTMETHODS.filter((x) => x.channelId === channel.id)
      : D.FAKE_PAYMENTMETHODS;
  },
  orderStatus: async () => {
    await defaultDelay();
    return D.FAKE_ORDERSTATUS;
  },
  shippingMethod: async ({ parentValues = [] } = {}) => {
    await defaultDelay();
    const [region] = parentValues;
    return region && region.id !== -1
      ? D.FAKE_SHIPPINGMETHODS.filter((x) => x.regionId === region.id)
      : D.FAKE_SHIPPINGMETHODS;
  },
};

// module-level fetcher map that can be overridden at bootstrap
let FETCHERS = { ...DEFAULT_FETCHERS };

/**
 * Replace fetchers (used in production bootstrap)
 * e.g. setFetchers({ country: fetchCountriesApi, product: fetchProductsApi })
 */
export function setFetchers(map) {
  FETCHERS = { ...FETCHERS, ...map };
}

/**
 * Read fetcher by name. Returns undefined if missing.
 */
export function getFetcher(name) {
  return FETCHERS[name];
}

/**
 * For convenience we export each default fetcher (useful for testing),
 * but components/hooks should use getFetcher() via useFilterConfig.
 */
export const {
  continent: fetchContinents,
  country: fetchCountries,
  region: fetchRegions,
  city: fetchCities,
  store: fetchStores,
  department: fetchDepartments,
  category: fetchCategories,
  subCategory: fetchSubCategories,
  brand: fetchBrands,
  productLine: fetchProductLines,
  product: fetchProducts,
  variant: fetchVariants,
  promotion: fetchPromotions,
  campaign: fetchCampaigns,
  channel: fetchChannels,
  customerType: fetchCustomerTypes,
  loyaltyTier: fetchLoyaltyTiers,
  paymentMethod: fetchPaymentMethods,
  orderStatus: fetchOrderStatus,
  shippingMethod: fetchShippingMethods,
} = FETCHERS;
