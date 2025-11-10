-- CreateEnum
CREATE TYPE "ListingModerationAction" AS ENUM ('SUBMITTED', 'APPROVED', 'REJECTED', 'SUSPENDED', 'REINSTATED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ListingStatus" ADD VALUE 'PENDING_REVIEW';
ALTER TYPE "ListingStatus" ADD VALUE 'REJECTED';
ALTER TYPE "ListingStatus" ADD VALUE 'SUSPENDED';

-- CreateTable
CREATE TABLE "ListingModerationLog" (
    "id" BIGSERIAL NOT NULL,
    "listingId" BIGINT NOT NULL,
    "action" "ListingModerationAction" NOT NULL,
    "reason" TEXT,
    "metadata" JSONB,
    "actorId" BIGINT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ListingModerationLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ListingModerationLog_listingId_createdAt_idx" ON "ListingModerationLog"("listingId", "createdAt");

-- AddForeignKey
ALTER TABLE "ListingModerationLog" ADD CONSTRAINT "ListingModerationLog_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingModerationLog" ADD CONSTRAINT "ListingModerationLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
