-- AlterTable
ALTER TABLE "Ride" ADD COLUMN     "declinedDriverIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "originLat" DOUBLE PRECISION,
ADD COLUMN     "originLng" DOUBLE PRECISION;
