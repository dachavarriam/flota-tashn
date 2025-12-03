import { Injectable } from '@nestjs/common';

@Injectable()
export class AlertasService {
  health(): string {
    return 'alertas ok';
  }
}
