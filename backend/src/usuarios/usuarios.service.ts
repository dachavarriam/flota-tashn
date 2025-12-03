import { Injectable } from '@nestjs/common';

@Injectable()
export class UsuariosService {
  health(): string {
    return 'usuarios ok';
  }
}
