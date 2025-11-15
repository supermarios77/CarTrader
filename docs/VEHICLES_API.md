# 🚗 Vehicle Listings API Documentation

## Overview

Production-ready vehicle listings system with comprehensive CRUD operations, image uploads, filtering, search, and security.

## Endpoints

### 1. Create Vehicle Listing
**POST** `/vehicles`

**Authentication:** Required

**Request:**
- Body: `CreateVehicleDto` (JSON)
- Files: `images` (multipart/form-data, max 10 images, 5MB each)

**Response:** `VehicleResponseDto`

**Example:**
```bash
curl -X POST http://localhost:3001/vehicles \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "title=2019 Toyota Corolla" \
  -F "price=2500000" \
  -F "year=2019" \
  -F "mileage=50000" \
  -F "categoryId=CAT_ID" \
  -F "makeId=MAKE_ID" \
  -F "modelId=MODEL_ID" \
  -F "transmission=MANUAL" \
  -F "fuelType=PETROL" \
  -F "bodyType=SEDAN" \
  -F "city=Karachi" \
  -F "images=@image1.jpg" \
  -F "images=@image2.jpg"
```

### 2. List Vehicles
**GET** `/vehicles`

**Authentication:** Optional (public endpoint)

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20, max: 100)
- `categoryId` (string)
- `makeId` (string)
- `modelId` (string)
- `city` (string)
- `province` (string)
- `status` (VehicleStatus enum)
- `transmission` (TransmissionType enum)
- `fuelType` (FuelType enum)
- `bodyType` (BodyType enum)
- `minPrice` (number)
- `maxPrice` (number)
- `minYear` (number)
- `maxYear` (number)
- `minMileage` (number)
- `maxMileage` (number)
- `search` (string) - Search in title and description
- `featured` (boolean)
- `userId` (string) - Filter by user (admin/moderator)
- `sortBy` (string) - `price` | `year` | `mileage` | `createdAt` | `views`
- `sortOrder` (string) - `asc` | `desc`

**Response:** `VehicleListResponseDto` with pagination

**Example:**
```bash
curl "http://localhost:3001/vehicles?page=1&limit=20&city=Karachi&minPrice=1000000&maxPrice=5000000&sortBy=price&sortOrder=asc"
```

### 3. Get Single Vehicle
**GET** `/vehicles/:id`

**Authentication:** Optional (public endpoint)

**Response:** `VehicleResponseDto`

**Note:** Increments view count for ACTIVE vehicles

**Example:**
```bash
curl http://localhost:3001/vehicles/VEHICLE_ID
```

### 4. Update Vehicle
**PUT** `/vehicles/:id`

**Authentication:** Required (owner only)

**Request:**
- Body: `UpdateVehicleDto` (JSON, partial)
- Files: `images` (optional, multipart/form-data)

**Response:** `VehicleResponseDto`

**Example:**
```bash
curl -X PUT http://localhost:3001/vehicles/VEHICLE_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"price": 2400000, "status": "ACTIVE"}'
```

### 5. Delete Vehicle
**DELETE** `/vehicles/:id`

**Authentication:** Required (owner only)

**Response:** 204 No Content

**Note:** Deletes all associated images from storage

**Example:**
```bash
curl -X DELETE http://localhost:3001/vehicles/VEHICLE_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 6. Mark Vehicle as Sold
**POST** `/vehicles/:id/sold`

**Authentication:** Required (owner only)

**Request:** `MarkSoldDto` (optional notes)

**Response:** `VehicleResponseDto`

**Example:**
```bash
curl -X POST http://localhost:3001/vehicles/VEHICLE_ID/sold \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"notes": "Sold to private buyer"}'
```

### 7. Publish Draft Vehicle
**POST** `/vehicles/:id/publish`

**Authentication:** Required (owner only)

**Response:** `VehicleResponseDto`

**Note:** Requires at least one image. Sets status to ACTIVE and expiresAt to 90 days.

**Example:**
```bash
curl -X POST http://localhost:3001/vehicles/VEHICLE_ID/publish \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Data Models

### CreateVehicleDto
```typescript
{
  categoryId: string;          // Required
  makeId: string;              // Required
  modelId: string;              // Required
  title: string;                // Required, 10-200 chars
  description?: string;         // Optional, max 5000 chars
  price: number;                // Required, >= 0
  currency?: string;            // Optional, default: "PKR"
  year: number;                 // Required, 1900-current+1
  mileage: number;              // Required, >= 0
  mileageUnit?: string;         // Optional, default: "km"
  transmission: TransmissionType; // Required
  fuelType: FuelType;           // Required
  bodyType: BodyType;           // Required
  engineCapacity?: number;      // Optional, in CC
  color?: string;               // Optional
  registrationCity?: string;    // Optional
  registrationYear?: number;    // Optional
  city: string;                 // Required
  province?: string;            // Optional
  address?: string;             // Optional
  latitude?: number;            // Optional
  longitude?: number;           // Optional
  features?: Array<{            // Optional
    name: string;
    value?: string;
  }>;
}
```

### VehicleResponseDto
```typescript
{
  id: string;
  userId: string;
  title: string;
  description: string | null;
  price: number;
  currency: string;
  year: number;
  mileage: number;
  status: VehicleStatus;
  featured: boolean;
  views: number;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
  soldAt: Date | null;
  expiresAt: Date | null;
  category: { id, name, slug };
  make: { id, name, slug, logo };
  model: { id, name, slug };
  user: { id, email, firstName, lastName, phone, city };
  images: Array<{ id, url, thumbnailUrl, order, isPrimary, alt }>;
  features: Array<{ id, name, value }>;
  _count: { favorites, messages, reviews };
  isFavorite?: boolean; // If user is authenticated
}
```

## Enums

### VehicleStatus
- `DRAFT` - Not published yet
- `ACTIVE` - Published and visible
- `SOLD` - Vehicle has been sold
- `EXPIRED` - Listing expired
- `SUSPENDED` - Suspended by admin

### TransmissionType
- `MANUAL`
- `AUTOMATIC`
- `CVT`
- `SEMI_AUTOMATIC`

### FuelType
- `PETROL`
- `DIESEL`
- `HYBRID`
- `ELECTRIC`
- `CNG`
- `LPG`

### BodyType
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

## Security Features

1. **Authentication:** JWT required for create/update/delete
2. **Authorization:** Only owners can update/delete their vehicles
3. **Rate Limiting:** ThrottlerGuard on all endpoints
4. **Input Validation:** Comprehensive DTO validation
5. **File Upload Security:**
   - Max 10 images per vehicle
   - Max 5MB per image
   - Only jpg, jpeg, png, webp allowed
6. **Privacy:** DRAFT vehicles only visible to owner
7. **View Count:** Only incremented for ACTIVE vehicles

## Business Logic

1. **Vehicle Creation:**
   - Validates category, make, model exist and are active
   - Creates vehicle with DRAFT status
   - Uploads images to MinIO
   - Creates features if provided

2. **Vehicle Publishing:**
   - Requires at least one image
   - Sets status to ACTIVE
   - Sets expiresAt to 90 days from now
   - Sets publishedAt timestamp

3. **Vehicle Updates:**
   - Only owner can update
   - Validates references if changing category/make/model
   - Can add new images (appended to existing)
   - Can update features (replaces all)

4. **Vehicle Deletion:**
   - Only owner can delete
   - Deletes all images from MinIO storage
   - Cascade deletes images and features from database

5. **Filtering:**
   - Public users only see ACTIVE vehicles
   - Authenticated users see their own DRAFT vehicles
   - Comprehensive filter options
   - Full-text search in title and description

## Image Upload

- **Storage:** MinIO object storage
- **Bucket:** `vehicles`
- **Path:** `vehicles/{uuid}.{ext}`
- **Max Files:** 10 per vehicle
- **Max Size:** 5MB per file
- **Formats:** jpg, jpeg, png, webp
- **Primary Image:** First image is marked as primary

## Error Handling

- `400 Bad Request` - Validation errors
- `401 Unauthorized` - Missing/invalid token
- `403 Forbidden` - Not owner of vehicle
- `404 Not Found` - Vehicle doesn't exist or not accessible
- `409 Conflict` - Duplicate or constraint violation

## Rate Limiting

- All endpoints: 100 requests per minute per IP
- Applied via ThrottlerGuard

## Notes

- Vehicles are created in DRAFT status by default
- Must be published to be visible to public
- Publishing requires at least one image
- View count only increments for ACTIVE vehicles
- Expired vehicles can be renewed (future feature)

