-- CreateTable
CREATE TABLE "sidebar_items" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "sector" TEXT NOT NULL,
    "is_custom" BOOLEAN NOT NULL DEFAULT false,
    "is_hidden" BOOLEAN NOT NULL DEFAULT false,
    "powerbi_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sidebar_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "sidebar_items_sector_idx" ON "sidebar_items"("sector");

-- CreateIndex
CREATE INDEX "sidebar_items_sector_path_idx" ON "sidebar_items"("sector", "path");
