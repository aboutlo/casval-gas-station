-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('CREATED', 'AWAITING_USER', 'PROCESSING', 'COMPLETED', 'FAILED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "Supplier" AS ENUM ('TRANSAK', 'RAMP');

-- CreateEnum
CREATE TYPE "Network" AS ENUM ('ETHEREUM', 'POLYGON', 'KOVAN', 'MUMBAI');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('BANK_TRANSFER', 'CARD_PAYMENT');

-- CreateEnum
CREATE TYPE "OrderType" AS ENUM ('BUY', 'SELL');

-- CreateTable
CREATE TABLE "Currency" (
    "id" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "decimals" INTEGER NOT NULL,
    "address" TEXT,
    "network" TEXT,
    "chainId" INTEGER,
    "chain" TEXT,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "kind" "OrderType" NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "status" "OrderStatus" NOT NULL DEFAULT E'CREATED',
    "supplier" "Supplier" NOT NULL,
    "supplierId" TEXT NOT NULL,
    "supplierIdWithSupplier" TEXT NOT NULL,
    "sellCurrencyId" TEXT NOT NULL,
    "sellAmount" DECIMAL(65,30) NOT NULL,
    "buyCurrencyId" TEXT NOT NULL,
    "buyAmount" DECIMAL(65,30) NOT NULL,
    "sellerWallet" TEXT,
    "buyerWallet" TEXT NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "rate" DECIMAL(65,30) NOT NULL,
    "feeCurrencyId" TEXT NOT NULL,
    "supplierFee" DECIMAL(65,30) NOT NULL,
    "networkFee" DECIMAL(65,30) NOT NULL,
    "totalFee" DECIMAL(65,30) NOT NULL,
    "transactionHash" TEXT,
    "events" JSONB[],

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Order.supplierIdWithSupplier_unique" ON "Order"("supplierIdWithSupplier");

-- AddForeignKey
ALTER TABLE "Order" ADD FOREIGN KEY ("sellCurrencyId") REFERENCES "Currency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD FOREIGN KEY ("buyCurrencyId") REFERENCES "Currency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD FOREIGN KEY ("feeCurrencyId") REFERENCES "Currency"("id") ON DELETE CASCADE ON UPDATE CASCADE;
