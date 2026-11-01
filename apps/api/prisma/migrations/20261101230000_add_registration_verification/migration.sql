-- Existing accounts were created before local email verification was required.
UPDATE "users" SET "emailVerified" = true WHERE "emailVerified" = false;

CREATE TABLE "registration_verifications" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "otpHash" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "lastSentAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "registration_verifications_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "registration_verifications_email_key"
ON "registration_verifications"("email");

CREATE INDEX "registration_verifications_expiresAt_idx"
ON "registration_verifications"("expiresAt");
