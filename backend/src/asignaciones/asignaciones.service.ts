import { Injectable } from '@nestjs/common';

@Injectable()
export class AsignacionesService {
  health(): string {
    return 'asignaciones ok';
  }
}
