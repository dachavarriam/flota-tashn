-- CreateEnum
CREATE TYPE "EstadoAsignacion" AS ENUM ('ACTIVA', 'FINALIZADA', 'CANCELADA');

-- AlterEnum
ALTER TYPE "Rol" ADD VALUE 'SUPERUSER';

-- AlterTable
ALTER TABLE "Asignacion" ADD COLUMN     "estado" "EstadoAsignacion" NOT NULL DEFAULT 'ACTIVA',
ADD COLUMN     "horaRetorno" TEXT,
ADD COLUMN     "kmRetorno" INTEGER;

-- CreateTable
CREATE TABLE "Mantenimiento" (
    "id" SERIAL NOT NULL,
    "vehiculoId" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tipo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "costo" DOUBLE PRECISION,
    "kmActual" INTEGER NOT NULL,
    "proximoMantenimiento" INTEGER,
    "observaciones" TEXT,

    CONSTRAINT "Mantenimiento_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Mantenimiento" ADD CONSTRAINT "Mantenimiento_vehiculoId_fkey" FOREIGN KEY ("vehiculoId") REFERENCES "Vehiculo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
