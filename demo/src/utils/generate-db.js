import fs from "fs";

// Base data
const continents = [
  { id: 1, label: "America" },
  { id: 2, label: "Europe" },
  { id: 3, label: "Asia" },
];

const countries = [
  { id: 1, continentId: 1, label: "USA" },
  { id: 2, continentId: 1, label: "Canada" },
  { id: 3, continentId: 2, label: "Belgium" },
  { id: 4, continentId: 2, label: "Germany" },
  { id: 5, continentId: 3, label: "Japan" },
  { id: 6, continentId: 3, label: "China" },
];

const regions = [
  { id: 1, continentId: 1, countryId: 1, label: "California" },
  { id: 2, continentId: 1, countryId: 1, label: "New York" },
  { id: 3, continentId: 2, countryId: 3, label: "Flanders" },
  { id: 4, continentId: 2, countryId: 4, label: "Bavaria" },
  { id: 5, continentId: 3, countryId: 5, label: "Kanto" },
  { id: 6, continentId: 3, countryId: 6, label: "Guangdong" },
];

const cities = [
  { id: 1, continentId: 1, countryId: 1, regionId: 1, label: "Los Angeles" },
  { id: 2, continentId: 1, countryId: 1, regionId: 1, label: "San Francisco" },
  { id: 3, continentId: 1, countryId: 1, regionId: 2, label: "New York City" },
  { id: 4, continentId: 2, countryId: 3, regionId: 3, label: "Brussels" },
  { id: 5, continentId: 2, countryId: 4, regionId: 4, label: "Munich" },
  { id: 6, continentId: 3, countryId: 5, regionId: 5, label: "Tokyo" },
  { id: 7, continentId: 3, countryId: 6, regionId: 6, label: "Guangzhou" },
];

// Helper to pick a random item

// Initialize arrays
const stores = [];
const departments = [];
const teams = [];
const employees = [];

// Adjustable parameters
const STORE_COUNT = 5; // per city
const DEPT_PER_STORE = 5;
const TEAM_PER_DEPT = 5;
const EMP_PER_TEAM = 5;

let storeId = 1;
let deptId = 1;
let teamId = 1;
let empId = 1;

for (const city of cities) {
  for (let s = 0; s < STORE_COUNT; s++) {
    const store = {
      id: storeId,
      continentId: city.continentId,
      countryId: city.countryId,
      regionId: city.regionId,
      cityId: city.id,
      label: `Store ${storeId}`,
    };
    stores.push(store);

    // Departments
    for (let d = 0; d < DEPT_PER_STORE; d++) {
      const dept = {
        id: deptId,
        continentId: city.continentId,
        countryId: city.countryId,
        regionId: city.regionId,
        cityId: city.id,
        storeId: store.id,
        label: `Department ${deptId}`,
      };
      departments.push(dept);

      // Teams
      for (let t = 0; t < TEAM_PER_DEPT; t++) {
        const team = {
          id: teamId,
          continentId: city.continentId,
          countryId: city.countryId,
          regionId: city.regionId,
          cityId: city.id,
          storeId: store.id,
          departmentId: dept.id,
          label: `Team ${teamId}`,
        };
        teams.push(team);

        // Employees
        for (let e = 0; e < EMP_PER_TEAM; e++) {
          const emp = {
            id: empId,
            continentId: city.continentId,
            countryId: city.countryId,
            regionId: city.regionId,
            cityId: city.id,
            storeId: store.id,
            departmentId: dept.id,
            teamId: team.id,
            label: `Employee ${empId}`,
          };
          employees.push(emp);
          empId++;
        }

        teamId++;
      }

      deptId++;
    }

    storeId++;
  }
}

// Final dataset
const db = {
  continents,
  countries,
  regions,
  cities,
  stores,
  departments,
  teams,
  employees,
};

// Write to file
fs.writeFileSync("db.json", JSON.stringify(db, null, 2));
console.log("✅ db.json generated successfully!");
console.log(
  `Totals — Stores: ${stores.length}, Departments: ${departments.length}, Teams: ${teams.length}, Employees: ${employees.length}`
);
