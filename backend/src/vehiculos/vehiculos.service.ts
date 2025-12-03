import { Injectable } from '@nestjs/common';

@Injectable()
export class VehiculosService {
  health(): string {
    return 'vehiculos ok';
  }
}
