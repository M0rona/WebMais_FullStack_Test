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
  Query,
} from '@nestjs/common';
import { ClientService, PaginatedClientsDto } from './client.service';
import { ClientResponseDto } from '../../common/mappers/client.mapper';
import { CreateClientDto, ListClientsQueryDto, UpdateClientDto } from './dto/client.dto';

@Controller('clients')
export class ClientController {
  constructor(private clientService: ClientService) {}

  @Post()
  create(@Body() dto: CreateClientDto): Promise<ClientResponseDto> {
    return this.clientService.create(dto);
  }

  @Get()
  findAll(@Query() query: ListClientsQueryDto): Promise<PaginatedClientsDto> {
    return this.clientService.findAll(query);
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
