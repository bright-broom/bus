/*
  Warnings:

  - You are about to alter the column `route_id` on the `departures` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(10)`.
  - You are about to alter the column `stop_id` on the `departures` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(10)`.
  - You are about to alter the column `departure_time` on the `departures` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(5)`.
  - The primary key for the `route_stops` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `route_id` on the `route_stops` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(10)`.
  - You are about to alter the column `stop_id` on the `route_stops` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(10)`.
  - The primary key for the `routes` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `routes` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(10)`.
  - You are about to alter the column `name` on the `routes` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `color` on the `routes` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(7)`.
  - The primary key for the `stops` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `stops` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(10)`.
  - You are about to alter the column `name` on the `stops` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.

*/
-- DropForeignKey
ALTER TABLE "departures" DROP CONSTRAINT "departures_route_id_fkey";

-- DropForeignKey
ALTER TABLE "departures" DROP CONSTRAINT "departures_stop_id_fkey";

-- DropForeignKey
ALTER TABLE "route_stops" DROP CONSTRAINT "route_stops_route_id_fkey";

-- DropForeignKey
ALTER TABLE "route_stops" DROP CONSTRAINT "route_stops_stop_id_fkey";

-- AlterTable
ALTER TABLE "departures" ADD COLUMN     "season_end" TIMESTAMP(3),
ADD COLUMN     "season_start" TIMESTAMP(3),
ALTER COLUMN "route_id" SET DATA TYPE VARCHAR(10),
ALTER COLUMN "stop_id" SET DATA TYPE VARCHAR(10),
ALTER COLUMN "departure_time" SET DATA TYPE VARCHAR(5);

-- AlterTable
ALTER TABLE "route_stops" DROP CONSTRAINT "route_stops_pkey",
ADD COLUMN     "duration_minutes" INTEGER,
ALTER COLUMN "route_id" SET DATA TYPE VARCHAR(10),
ALTER COLUMN "stop_id" SET DATA TYPE VARCHAR(10),
ADD CONSTRAINT "route_stops_pkey" PRIMARY KEY ("route_id", "stop_id");

-- AlterTable
ALTER TABLE "routes" DROP CONSTRAINT "routes_pkey",
ADD COLUMN     "display_order" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "id" SET DATA TYPE VARCHAR(10),
ALTER COLUMN "name" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "color" SET DATA TYPE VARCHAR(7),
ADD CONSTRAINT "routes_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "stops" DROP CONSTRAINT "stops_pkey",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "latitude" DECIMAL(8,6),
ADD COLUMN     "longitude" DECIMAL(9,6),
ALTER COLUMN "id" SET DATA TYPE VARCHAR(10),
ALTER COLUMN "name" SET DATA TYPE VARCHAR(100),
ADD CONSTRAINT "stops_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE INDEX "departures_season_start_season_end_idx" ON "departures"("season_start", "season_end");

-- CreateIndex
CREATE INDEX "route_stops_stop_order_idx" ON "route_stops"("stop_order");

-- CreateIndex
CREATE INDEX "routes_display_order_idx" ON "routes"("display_order");

-- CreateIndex
CREATE INDEX "routes_is_active_idx" ON "routes"("is_active");

-- CreateIndex
CREATE INDEX "stops_name_idx" ON "stops"("name");

-- CreateIndex
CREATE INDEX "stops_latitude_longitude_idx" ON "stops"("latitude", "longitude");

-- AddForeignKey
ALTER TABLE "route_stops" ADD CONSTRAINT "route_stops_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "routes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "route_stops" ADD CONSTRAINT "route_stops_stop_id_fkey" FOREIGN KEY ("stop_id") REFERENCES "stops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "departures" ADD CONSTRAINT "departures_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "routes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "departures" ADD CONSTRAINT "departures_stop_id_fkey" FOREIGN KEY ("stop_id") REFERENCES "stops"("id") ON DELETE CASCADE ON UPDATE CASCADE;
