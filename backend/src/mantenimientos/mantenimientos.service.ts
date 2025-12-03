import { Injectable } from '@nestjs/common';

@Injectable()
export class MantenimientosService {
  health(): string {
    return 'mantenimientos ok';
  }
}
