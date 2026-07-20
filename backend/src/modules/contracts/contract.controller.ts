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
import { ContractResponseDto } from '../../common/mappers/contract.mapper';
import { ContractService, ContractsSummaryDto, PaginatedContractsDto } from './contract.service';
import { CreateContractItemDto, UpdateContractItemDto } from './dto/contract-item.dto';
import { CreateContractDto, ListContractsQueryDto, UpdateContractDto } from './dto/contract.dto';

@Controller('contracts')
export class ContractController {
  constructor(private contractService: ContractService) {}

  @Post()
  create(@Body() dto: CreateContractDto): Promise<ContractResponseDto> {
    return this.contractService.create(dto);
  }

  @Get()
  findAll(@Query() query: ListContractsQueryDto): Promise<PaginatedContractsDto> {
    return this.contractService.findAll(query);
  }

  // Precisa vir antes de ':id' para não ser capturado pela rota de parâmetro.
  @Get('summary')
  summary(): Promise<ContractsSummaryDto> {
    return this.contractService.summary();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<ContractResponseDto> {
    return this.contractService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateContractDto): Promise<ContractResponseDto> {
    return this.contractService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id') id: string): Promise<void> {
    return this.contractService.delete(id);
  }

  @Post(':id/approve')
  approve(@Param('id') id: string): Promise<ContractResponseDto> {
    return this.contractService.approve(id);
  }

  @Post(':id/close')
  close(@Param('id') id: string): Promise<ContractResponseDto> {
    return this.contractService.close(id);
  }

  @Post(':id/items')
  addItem(
    @Param('id') id: string,
    @Body() dto: CreateContractItemDto,
  ): Promise<ContractResponseDto> {
    return this.contractService.addItem(id, dto);
  }

  @Patch(':id/items/:itemId')
  updateItem(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateContractItemDto,
  ): Promise<ContractResponseDto> {
    return this.contractService.updateItem(id, itemId, dto);
  }

  @Delete(':id/items/:itemId')
  deleteItem(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
  ): Promise<ContractResponseDto> {
    return this.contractService.deleteItem(id, itemId);
  }
}
