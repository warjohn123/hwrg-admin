-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "expense_type" AS ENUM ('Chicky Oink', 'Imagawayaki', 'Potato Fry', 'HWRG Eggs');

-- CreateEnum
CREATE TYPE "leave_type" AS ENUM ('SICK', 'VACATION');

-- CreateEnum
CREATE TYPE "leave_request_status" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "branch_assignments" (
    "id" SERIAL NOT NULL,
    "user_id" UUID NOT NULL,
    "branch_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "branch_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "branches" (
    "id" SERIAL NOT NULL,
    "assignment" VARCHAR(255) NOT NULL,
    "branch_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "branches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collection_reports" (
    "id" SERIAL NOT NULL,
    "date" DATE NOT NULL,
    "branch_sales" JSONB NOT NULL,
    "add_ons" JSONB NOT NULL,
    "expenses" JSONB NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "collection_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_expenses" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "branch_id" INTEGER NOT NULL,
    "type" "expense_type",
    "date" DATE NOT NULL,
    "name" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "expense_date" DATE,

    CONSTRAINT "company_expenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expenses" (
    "id" SERIAL NOT NULL,
    "sales_report_id" INTEGER,
    "name" TEXT NOT NULL,
    "value" DECIMAL NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "expenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "remit_add_ons" (
    "id" BIGSERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "remit_id" BIGINT,
    "name" TEXT,
    "value" DECIMAL,

    CONSTRAINT "remit_add_ons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "remit_expenses" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "remit_id" BIGINT NOT NULL,
    "name" TEXT,
    "value" DECIMAL,

    CONSTRAINT "remit_expenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "remit_reports" (
    "id" BIGSERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "title" TEXT,
    "report_date" DATE,
    "sales" JSONB,

    CONSTRAINT "remit_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales_reports" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "report_date" DATE NOT NULL,
    "cash" DECIMAL(10,2) NOT NULL,
    "cash_fund" DECIMAL(10,2) NOT NULL,
    "sales" JSONB,
    "inventory" JSONB,
    "on_duty" VARCHAR(255),
    "prepared_by" VARCHAR(255),
    "branch_id" INTEGER NOT NULL,
    "type" VARCHAR(255),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "user_id" UUID NOT NULL,
    "cashier" UUID[],
    "cook" UUID[],

    CONSTRAINT "sales_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timelogs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" UUID DEFAULT gen_random_uuid(),
    "clock_in_photo" TEXT,
    "clock_in" TIMESTAMPTZ(6),
    "clock_out" TIMESTAMPTZ(6),
    "date" DATE,
    "clock_out_photo" TEXT,

    CONSTRAINT "timelogs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT,
    "assignment" TEXT,
    "address" TEXT,
    "bday" TEXT,
    "contact" TEXT,
    "email" TEXT,
    "name" TEXT,
    "id" UUID NOT NULL,
    "rate_per_day" DECIMAL,
    "first_duty_date" TEXT,
    "documents" TEXT[],
    "picture" TEXT,
    "emergency_contact_name" TEXT,
    "emergency_contact_number" TEXT,
    "sss_no" TEXT,
    "pagibig_no" TEXT,
    "tin_no" TEXT,
    "philhealth_no" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leave_requests" (
    "id" SERIAL NOT NULL,
    "user_id" UUID NOT NULL,
    "leave_type" "leave_type" NOT NULL,
    "date_from" DATE NOT NULL,
    "date_to" DATE NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "leave_request_status" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "leave_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "unique_user_branch" ON "branch_assignments"("user_id", "branch_id");

-- CreateIndex
CREATE UNIQUE INDEX "branches_branch_name_key" ON "branches"("branch_name");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_id_key" ON "users"("id");

-- AddForeignKey
ALTER TABLE "branch_assignments" ADD CONSTRAINT "fk_branch" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "branch_assignments" ADD CONSTRAINT "fk_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "company_expenses" ADD CONSTRAINT "company_expenses_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_sales_report_id_fkey" FOREIGN KEY ("sales_report_id") REFERENCES "sales_reports"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "remit_add_ons" ADD CONSTRAINT "remit_add_ons_remit_id_fkey" FOREIGN KEY ("remit_id") REFERENCES "remit_reports"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "remit_expenses" ADD CONSTRAINT "remit_expenses_remit_id_fkey" FOREIGN KEY ("remit_id") REFERENCES "remit_reports"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sales_reports" ADD CONSTRAINT "sales_reports_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sales_reports" ADD CONSTRAINT "sales_reports_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "timelogs" ADD CONSTRAINT "timelogs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

