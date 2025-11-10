-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED', 'SOLD');

-- CreateEnum
CREATE TYPE "ListingType" AS ENUM ('CAR', 'BIKE', 'TRUCK', 'SUV', 'VAN', 'BUS', 'OTHER');

-- CreateEnum
CREATE TYPE "FuelType" AS ENUM ('PETROL', 'DIESEL', 'CNG', 'HYBRID', 'ELECTRIC', 'LPG', 'OTHER');

-- CreateEnum
CREATE TYPE "TransmissionType" AS ENUM ('MANUAL', 'AUTOMATIC', 'SEMI_AUTOMATIC', 'CVT');

-- CreateEnum
CREATE TYPE "BodyType" AS ENUM ('SEDAN', 'HATCHBACK', 'SUV', 'CROSSOVER', 'COUPE', 'CONVERTIBLE', 'WAGON', 'VAN', 'PICKUP', 'OTHER');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'VIDEO', 'DOCUMENT');

-- CreateTable
CREATE TABLE "Listing" (
    "id" BIGSERIAL NOT NULL,
    "sellerId" BIGINT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priceCents" BIGINT NOT NULL,
    "currencyCode" TEXT NOT NULL DEFAULT 'PKR',
    "status" "ListingStatus" NOT NULL DEFAULT 'DRAFT',
    "type" "ListingType" NOT NULL,
    "year" INTEGER,
    "make" TEXT,
    "model" TEXT,
    "variant" TEXT,
    "mileageKm" INTEGER,
    "engineCapacity" INTEGER,
    "fuelType" "FuelType",
    "transmission" "TransmissionType",
    "bodyType" "BodyType",
    "exteriorColor" TEXT,
    "interiorColor" TEXT,
    "vin" TEXT,
    "registrationCity" TEXT,
    "ownership" TEXT,
    "features" JSONB,
    "locationCity" TEXT,
    "locationState" TEXT,
    "locationLatitude" DECIMAL(12,8),
    "locationLongitude" DECIMAL(12,8),
    "publishedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Listing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListingMedia" (
    "id" BIGSERIAL NOT NULL,
    "listingId" BIGINT NOT NULL,
    "type" "MediaType" NOT NULL DEFAULT 'IMAGE',
    "url" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ListingMedia_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Listing_sellerId_status_createdAt_idx" ON "Listing"("sellerId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "Listing_status_type_createdAt_idx" ON "Listing"("status", "type", "createdAt");

-- CreateIndex
CREATE INDEX "Listing_locationCity_locationState_idx" ON "Listing"("locationCity", "locationState");

-- CreateIndex
CREATE INDEX "ListingMedia_listingId_sortOrder_idx" ON "ListingMedia"("listingId", "sortOrder");

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingMedia" ADD CONSTRAINT "ListingMedia_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
