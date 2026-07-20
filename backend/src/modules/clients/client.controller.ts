import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ClientService } from './client.service';
import { ClientResponseDto } from '../../common/mappers/client.mapper';
import { CreateClientDto, UpdateClientDto } from './dto/client.dto';

@Controller('clients')
export class ClientController {
  constructor(private clientService: ClientService) {}

  @Post()
  create(@Body() dto: CreateClientDto): Promise<ClientResponseDto> {
    return this.clientService.create(dto);
  }

  @Get()
  findAll(): Promise<ClientResponseDto[]> {
    return this.clientService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<ClientResponseDto> {
    return this.clientService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateClientDto): Promise<ClientResponseDto> {
    return this.clientService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id') id: string): Promise<void> {
    return this.clientService.delete(id);
  }
}
