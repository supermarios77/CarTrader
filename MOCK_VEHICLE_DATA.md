# Mock Vehicle Data for Testing

Copy and paste these values into the "List Your Vehicle" form.

## ⚠️ Important: Get Real IDs First

Before using this data, you need to get the actual Category, Make, and Model IDs from your database.

### Quick Way to Get IDs:

**Option 1: Use Prisma Studio (Recommended)**
```bash
docker-compose exec backend sh -c "cd /app/packages/prisma && pnpm prisma studio"
```
Then open http://localhost:5555 in your browser and copy the IDs from the Category, Make, and Model tables.

**Option 2: Run the seed script (if not already done)**
```bash
pnpm db:seed
```
This will create Categories, Makes, and Models (Toyota Corolla, Honda Civic, Suzuki Alto, etc.)

**Option 3: Query via backend API (if endpoints exist)**
You can also check the network tab in browser dev tools when browsing vehicles to see what IDs are being used.

---

## Example 1: 2020 Toyota Corolla XLI (Sedan)

### Basic Information
- **Title**: `2020 Toyota Corolla XLI 1.8L Automatic`
- **Description**: 
```
Well-maintained Toyota Corolla XLI in excellent condition. Single owner, regularly serviced at authorized Toyota service center. All original parts, no accidents. Perfect for daily commute. AC, power steering, power windows, central locking, music system all working perfectly. Original paint, no scratches. Ready to drive.
```
- **Price**: `3500000`
- **Year**: `2020`
- **Mileage**: `45000`
- **Mileage Unit**: `km` (select from dropdown)

### Specifications
- **Transmission**: `AUTOMATIC` (select from dropdown)
- **Fuel Type**: `PETROL` (select from dropdown)
- **Body Type**: `SEDAN` (select from dropdown)
- **Engine Capacity**: `1800`
- **Color**: `White`

### Location
- **City**: `Karachi`
- **Province**: `Sindh`
- **Address**: `Gulshan-e-Iqbal, Block 5`

### Vehicle Classification (⚠️ Replace with real IDs)
- **Category ID**: `[Get from database - should be "Cars" category]`
- **Make ID**: `[Get from database - should be "Toyota" make]`
- **Model ID**: `[Get from database - should be "Corolla" model]`

---

## Example 2: 2018 Honda Civic RS Turbo (Sedan)

### Basic Information
- **Title**: `2018 Honda Civic RS Turbo 1.5L CVT`
- **Description**: 
```
Premium Honda Civic RS Turbo with all features. Turbo engine, excellent fuel economy. Leather seats, sunroof, push start, keyless entry. Well maintained, service history available. Accident-free, original paint. Perfect condition.
```
- **Price**: `5200000`
- **Year**: `2018`
- **Mileage**: `65000`
- **Mileage Unit**: `km`

### Specifications
- **Transmission**: `CVT` (select from dropdown)
- **Fuel Type**: `PETROL` (select from dropdown)
- **Body Type**: `SEDAN` (select from dropdown)
- **Engine Capacity**: `1500`
- **Color**: `Black`
- **Registration City**: `Karachi`
- **Registration Year**: `2018`

### Location
- **City**: `Lahore`
- **Province**: `Punjab`
- **Address**: `DHA Phase 5`

### Vehicle Classification (⚠️ Replace with real IDs)
- **Category ID**: `[Get from database - should be "Cars" category]`
- **Make ID**: `[Get from database - should be "Honda" make]`
- **Model ID**: `[Get from database - should be "Civic" model]`

---

## Example 3: 2021 Suzuki Alto VXR (Hatchback)

### Basic Information
- **Title**: `2021 Suzuki Alto VXR 660cc Manual`
- **Description**: 
```
Brand new condition Suzuki Alto VXR. Low mileage, perfect for city driving. Excellent fuel economy. All features working. Single owner, garage kept. No accidents, original paint. Service book available.
```
- **Price**: `1850000`
- **Year**: `2021`
- **Mileage**: `25000`
- **Mileage Unit**: `km`

### Specifications
- **Transmission**: `MANUAL` (select from dropdown)
- **Fuel Type**: `PETROL` (select from dropdown)
- **Body Type**: `HATCHBACK` (select from dropdown)
- **Engine Capacity**: `660`
- **Color**: `Silver`

### Location
- **City**: `Islamabad`
- **Province**: `Islamabad Capital Territory`
- **Address**: `F-7 Markaz`

### Vehicle Classification (⚠️ Replace with real IDs)
- **Category ID**: `[Get from database - should be "Cars" category]`
- **Make ID**: `[Get from database - should be "Suzuki" make]`
- **Model ID**: `[Get from database - should be "Alto" model]`

---

## Example 4: 2019 Honda CB 150F (Motorcycle)

### Basic Information
- **Title**: `2019 Honda CB 150F 150cc`
- **Description**: 
```
Well-maintained Honda CB 150F. Excellent condition, low mileage. All original parts. Perfect for daily commute. Service history available. No accidents.
```
- **Price**: `185000`
- **Year**: `2019`
- **Mileage**: `15000`
- **Mileage Unit**: `km`

### Specifications
- **Transmission**: `MANUAL` (select from dropdown)
- **Fuel Type**: `PETROL` (select from dropdown)
- **Body Type**: `MOTORCYCLE` (select from dropdown)
- **Engine Capacity**: `150`
- **Color**: `Red`

### Location
- **City**: `Lahore`
- **Province**: `Punjab`
- **Address**: `Model Town`

### Vehicle Classification (⚠️ Replace with real IDs)
- **Category ID**: `[Get from database - should be "Bikes" category]`
- **Make ID**: `[Get from database - should be "Honda" make (bikes)]`
- **Model ID**: `[Get from database - should be "CB 150F" model]`

---

## Quick Reference: Common Values

### Transmission Types
- `MANUAL`
- `AUTOMATIC`
- `CVT`
- `SEMI_AUTOMATIC`

### Fuel Types
- `PETROL`
- `DIESEL`
- `HYBRID`
- `ELECTRIC`
- `CNG`
- `LPG`

### Body Types
- `SEDAN`
- `HATCHBACK`
- `SUV`
- `COUPE`
- `CONVERTIBLE`
- `WAGON`
- `VAN`
- `PICKUP`
- `MOTORCYCLE`
- `SCOOTER`
- `OTHER`

### Pakistani Cities (Common)
- Karachi, Lahore, Islamabad, Rawalpindi, Faisalabad, Multan, Peshawar, Quetta, Sialkot, Gujranwala

### Pakistani Provinces
- Sindh, Punjab, Khyber Pakhtunkhwa, Balochistan, Islamabad Capital Territory, Gilgit-Baltistan, Azad Jammu and Kashmir

---

## How to Get Real IDs

### Option 1: Using Prisma Studio (Easiest)
```bash
docker-compose exec backend sh -c "cd /app/packages/prisma && pnpm prisma studio"
```
Then open http://localhost:5555 in your browser and browse the Category, Make, and Model tables.

### Option 2: Using Database Query
```bash
docker-compose exec postgres psql -U postgres -d cartrader -c "SELECT id, name FROM \"Category\";"
docker-compose exec postgres psql -U postgres -d cartrader -c "SELECT id, name, \"categoryId\" FROM \"Make\" LIMIT 10;"
docker-compose exec postgres psql -U postgres -d cartrader -c "SELECT id, name, \"makeId\" FROM \"Model\" LIMIT 10;"
```

### Option 3: Check Seed File
The seed file at `packages/prisma/seed.ts` shows what categories and makes are created. You'll need to check the database for the actual UUIDs after seeding.

---

## Notes

- All prices are in PKR (Pakistani Rupees)
- Mileage is typically in kilometers for Pakistan
- Make sure to run the seed script first: `pnpm db:seed`
- Category, Make, and Model IDs are UUIDs and will be different each time you seed

