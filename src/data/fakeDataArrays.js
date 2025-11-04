// src/data/fakeDataArrays.js
export const FAKE_CONTINENTS = [
  { id: 1, label: "Europe" },
  { id: 2, label: "North America" },
  { id: 3, label: "Asia" },
];

export const FAKE_COUNTRIES = [
  { id: 10, continentId: 1, label: "France" },
  { id: 11, continentId: 1, label: "Germany" },
  { id: 20, continentId: 2, label: "USA" },
  { id: 21, continentId: 2, label: "Canada" },
  { id: 30, continentId: 3, label: "Japan" },
];

export const FAKE_REGIONS = [
  { id: 100, countryId: 10, label: "Île-de-France" },
  { id: 200, countryId: 20, label: "California" },
  { id: 300, countryId: 30, label: "Kansai" },
];

export const FAKE_CITIES = [
  { id: 1001, regionId: 100, label: "Paris" },
  { id: 2001, regionId: 200, label: "Los Angeles" },
  { id: 3001, regionId: 300, label: "Osaka" },
];

export const FAKE_STORES = [
  { id: 5001, cityId: 1001, label: "Store #101 Paris" },
  { id: 5002, cityId: 2001, label: "Store #305 LA" },
  { id: 5003, cityId: 3001, label: "Store #702 Osaka" },
];

export const FAKE_DEPARTMENTS = [
  { id: 6001, storeId: 5001, label: "Electronics" },
  { id: 6002, storeId: 5001, label: "Home" },
  { id: 6003, storeId: 5002, label: "Clothing" },
  { id: 6004, storeId: 5003, label: "Furniture" },
];

export const FAKE_CATEGORIES = [
  { id: 7001, departmentId: 6001, label: "TVs" },
  { id: 7002, departmentId: 6002, label: "Kitchen" },
  { id: 7003, departmentId: 6003, label: "Shoes" },
  { id: 7004, departmentId: 6004, label: "Tables" },
];

export const FAKE_SUBCATEGORIES = [
  { id: 8001, categoryId: 7001, label: "OLED TVs" },
  { id: 8002, categoryId: 7003, label: "Running Shoes" },
];

export const FAKE_BRANDS = [
  { id: 9001, subCategoryId: 8001, label: "Samsung" },
  { id: 9002, subCategoryId: 8002, label: "Nike" },
];

export const FAKE_PRODUCTLINES = [
  { id: 10001, brandId: 9001, label: "Galaxy Series" },
  { id: 10002, brandId: 9002, label: "Air Max" },
];

export const FAKE_PRODUCTS = [
  { id: 11001, productLineId: 10001, label: "Galaxy S23" },
  { id: 11002, productLineId: 10002, label: "Air Max 90" },
];

export const FAKE_VARIANTS = [
  { id: 12001, productId: 11001, label: "Blue 128GB" },
  { id: 12002, productId: 11002, label: "Red 256GB" },
];

export const FAKE_PROMOTIONS = [
  { id: 13001, variantId: 12001, label: "Black Friday" },
  { id: 13002, variantId: 12002, label: "Clearance" },
];

export const FAKE_CAMPAIGNS = [
  { id: 14001, promotionId: 13001, label: "Q4 Global Campaign" },
  { id: 14002, promotionId: 13002, label: "End of Season" },
];

export const FAKE_CHANNELS = [
  { id: 15001, label: "Online" },
  { id: 15002, label: "In-Store" },
];

export const FAKE_CUSTOMERTYPES = [
  { id: 16001, label: "Retail" },
  { id: 16002, label: "Wholesale" },
];

export const FAKE_LOYALTYTIERS = [
  { id: 17001, customerTypeId: 16001, label: "Bronze" },
  { id: 17002, customerTypeId: 16001, label: "Silver" },
  { id: 17003, customerTypeId: 16002, label: "Gold" },
];

export const FAKE_PAYMENTMETHODS = [
  { id: 18001, channelId: 15001, label: "Credit Card" },
  { id: 18002, channelId: 15002, label: "Cash" },
];

export const FAKE_ORDERSTATUS = [
  { id: 19001, label: "Pending" },
  { id: 19002, label: "Shipped" },
  { id: 19003, label: "Delivered" },
];

export const FAKE_SHIPPINGMETHODS = [
  { id: 20001, regionId: 100, label: "Ground" },
  { id: 20002, regionId: 200, label: "Air" },
  { id: 20003, regionId: 300, label: "Express" },
];
