-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tg_id" BIGINT NOT NULL,
    "username" TEXT,
    "avatar_url" TEXT,
    "stars" INTEGER NOT NULL DEFAULT 0,
    "bought_gifts" INTEGER NOT NULL DEFAULT 0,
    "sold_gifts" INTEGER NOT NULL DEFAULT 0,
    "referred_users" INTEGER NOT NULL DEFAULT 0,
    "referral_code" TEXT,
    "registered_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_blocked" BOOLEAN NOT NULL DEFAULT false,
    "block_reason" TEXT
);

-- CreateTable
CREATE TABLE "Gift" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" INTEGER NOT NULL,
    "total_quantity" INTEGER NOT NULL,
    "available_quantity" INTEGER NOT NULL,
    "sticker_url" TEXT,
    "status" TEXT NOT NULL DEFAULT 'not_unique',
    "frame_type" TEXT NOT NULL DEFAULT 'default',
    "ribbon_text" TEXT,
    "ribbon_color" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_limited" BOOLEAN NOT NULL DEFAULT false,
    "limited_until" DATETIME
);

-- CreateTable
CREATE TABLE "Purchase" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "gift_id" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL DEFAULT 1,
    "stars_spent" INTEGER NOT NULL,
    "purchased_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Purchase_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Purchase_gift_id_fkey" FOREIGN KEY ("gift_id") REFERENCES "Gift" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserGift" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "gift_id" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL DEFAULT 1,
    "is_worn" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "UserGift_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserGift_gift_id_fkey" FOREIGN KEY ("gift_id") REFERENCES "Gift" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Banner" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "image_url" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "LiveFeed" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "gift_id" INTEGER NOT NULL,
    "username" TEXT,
    "gift_name" TEXT,
    "sticker_url" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LiveFeed_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "LiveFeed_gift_id_fkey" FOREIGN KEY ("gift_id") REFERENCES "Gift" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LeaderboardStat" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "stars_spent" INTEGER NOT NULL DEFAULT 0,
    "gifts_bought" INTEGER NOT NULL DEFAULT 0,
    "period" TEXT NOT NULL DEFAULT 'all_time',
    "week_start" DATETIME,
    "week_end" DATETIME,
    CONSTRAINT "LeaderboardStat_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "NewsPost" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "image_url" TEXT,
    "text" TEXT NOT NULL,
    "button_text" TEXT,
    "button_url" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_active" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "AdminActionLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "admin_id" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "details" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Backup" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "backup_time" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "file_path" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'success'
);

-- CreateIndex
CREATE UNIQUE INDEX "User_tg_id_key" ON "User"("tg_id");
