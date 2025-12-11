import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  Query
} from '@nestjs/common';
import { MantenimientosService } from './mantenimientos.service';
import { CreateMantenimientoDto } from './dto/create-mantenimiento.dto';
import { UpdateMantenimientoDto } from './dto/update-mantenimiento.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Rol } from '@prisma/client';

@Controller('mantenimientos')
@UseGuards(JwtAuthGuard)
export class MantenimientosController {
  constructor(private readonly mantenimientosService: MantenimientosService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Rol.ADMIN, Rol.SUPERVISOR, Rol.ENCARGADO)
  create(@Body() createMantenimientoDto: CreateMantenimientoDto) {
    return this.mantenimientosService.create(createMantenimientoDto);
  }

  @Get()
  findAll(@Query('vehiculoId') vehiculoId?: string) {
    if (vehiculoId) {
      return this.mantenimientosService.findByVehiculo(parseInt(vehiculoId));
    }
    return this.mantenimientosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.mantenimientosService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Rol.ADMIN, Rol.SUPERVISOR, Rol.ENCARGADO)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMantenimientoDto: UpdateMantenimientoDto
  ) {
    return this.mantenimientosService.update(id, updateMantenimientoDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Rol.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.mantenimientosService.remove(id);
  }
}
