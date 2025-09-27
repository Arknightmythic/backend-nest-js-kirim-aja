-- DropForeignKey
ALTER TABLE `shipment_histories` DROP FOREIGN KEY `shipment_histories_branch_id_fkey`;

-- DropForeignKey
ALTER TABLE `shipment_histories` DROP FOREIGN KEY `shipment_histories_user_id_fkey`;

-- DropIndex
DROP INDEX `shipment_histories_branch_id_fkey` ON `shipment_histories`;

-- DropIndex
DROP INDEX `shipment_histories_user_id_fkey` ON `shipment_histories`;

-- AlterTable
ALTER TABLE `shipment_histories` MODIFY `user_id` INTEGER NULL,
    MODIFY `branch_id` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `shipment_histories` ADD CONSTRAINT `shipment_histories_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `shipment_histories` ADD CONSTRAINT `shipment_histories_branch_id_fkey` FOREIGN KEY (`branch_id`) REFERENCES `branches`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
