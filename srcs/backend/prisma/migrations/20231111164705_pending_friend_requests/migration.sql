-- CreateTable
CREATE TABLE "_PendingRequest" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_PendingRequest_AB_unique" ON "_PendingRequest"("A", "B");

-- CreateIndex
CREATE INDEX "_PendingRequest_B_index" ON "_PendingRequest"("B");

-- AddForeignKey
ALTER TABLE "_PendingRequest" ADD CONSTRAINT "_PendingRequest_A_fkey" FOREIGN KEY ("A") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PendingRequest" ADD CONSTRAINT "_PendingRequest_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
