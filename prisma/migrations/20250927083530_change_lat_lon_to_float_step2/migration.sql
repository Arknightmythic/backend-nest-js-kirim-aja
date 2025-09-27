/*
  Warnings:

  - You are about to drop the column `destination_latitude_float` on the `shipment_details` table. All the data in the column will be lost.
  - You are about to drop the column `destination_longitude_float` on the `shipment_details` table. All the data in the column will be lost.
  - You are about to alter the column `destination_latitude` on the `shipment_details` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Double`.
  - You are about to alter the column `destination_longitude` on the `shipment_details` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Double`.

*/
-- AlterTable
ALTER TABLE `shipment_details` DROP COLUMN `destination_latitude_float`,
    DROP COLUMN `destination_longitude_float`,
    MODIFY `destination_latitude` DOUBLE NULL,
    MODIFY `destination_longitude` DOUBLE NULL;
