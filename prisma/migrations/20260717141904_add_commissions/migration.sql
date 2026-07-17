-- CreateTable
CREATE TABLE "commissions" (
    "id" SERIAL NOT NULL,
    "sales_report_id" INTEGER NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "date" DATE NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "commissions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "commissions" ADD CONSTRAINT "commissions_sales_report_id_fkey" FOREIGN KEY ("sales_report_id") REFERENCES "sales_reports"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
