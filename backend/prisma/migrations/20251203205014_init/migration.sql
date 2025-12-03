-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('USUARIO', 'ENCARGADO', 'SUPERVISOR', 'ADMIN');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "rol" "Rol" NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vehiculo" (
    "id" SERIAL NOT NULL,
    "placa" TEXT NOT NULL,
    "marca" TEXT,
    "modelo" TEXT,
    "tipo" TEXT,
    "kmActual" INTEGER NOT NULL DEFAULT 0,
    "kmUltimoMantenimiento" INTEGER NOT NULL DEFAULT 0,
    "fechaUltimoMantenimiento" TIMESTAMP(3),

    CONSTRAINT "Vehiculo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Asignacion" (
    "id" SERIAL NOT NULL,
    "vehiculoId" INTEGER NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "encargadoId" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "horaSalida" TEXT,
    "kmSalida" INTEGER,
    "uso" TEXT,
    "checklist" JSONB,
    "niveles" JSONB,
    "observaciones" TEXT,
    "pdfUrl" TEXT,
    "firmaUsuario" TEXT,
    "firmaEncargado" TEXT,

    CONSTRAINT "Asignacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FotoAsignacion" (
    "id" SERIAL NOT NULL,
    "asignacionId" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "FotoAsignacion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_correo_key" ON "Usuario"("correo");

-- CreateIndex
CREATE UNIQUE INDEX "Vehiculo_placa_key" ON "Vehiculo"("placa");

-- AddForeignKey
ALTER TABLE "Asignacion" ADD CONSTRAINT "Asignacion_vehiculoId_fkey" FOREIGN KEY ("vehiculoId") REFERENCES "Vehiculo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asignacion" ADD CONSTRAINT "Asignacion_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asignacion" ADD CONSTRAINT "Asignacion_encargadoId_fkey" FOREIGN KEY ("encargadoId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FotoAsignacion" ADD CONSTRAINT "FotoAsignacion_asignacionId_fkey" FOREIGN KEY ("asignacionId") REFERENCES "Asignacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
