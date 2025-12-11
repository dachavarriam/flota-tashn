-- AlterEnum
ALTER TYPE "EstadoAsignacion" ADD VALUE 'EN_REVISION';

-- AlterTable
ALTER TABLE "Asignacion" ADD COLUMN     "tieneDanos" BOOLEAN NOT NULL DEFAULT false;
