-- AlterTable
ALTER TABLE `shipment_details` ADD COLUMN `destination_latitude_float` DOUBLE NULL,
    ADD COLUMN `destination_longitude_float` DOUBLE NULL;

UPDATE `shipment_details`
SET
  `destination_latitude_float` = CAST(`destination_latitude` AS DOUBLE),
  `destination_longitude_float` = CAST(`destination_longitude` AS DOUBLE)
WHERE
  `destination_latitude` IS NOT NULL AND `destination_longitude` IS NOT NULL;
