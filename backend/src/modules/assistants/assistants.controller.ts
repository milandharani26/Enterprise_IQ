import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AssistantsService } from './assistants.service';
import { CreateAssistantDto } from './dto/create-assistant.dto';
import { UpdateAssistantDto } from './dto/update-assistant.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('assistants')
@Controller('assistants')
export class AssistantsController {
  constructor(private readonly assistantsService: AssistantsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new assistant' })
  create(@Body() createAssistantDto: CreateAssistantDto) {
    return this.assistantsService.create(createAssistantDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all assistants' })
  findAll() {
    return this.assistantsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an assistant by id' })
  findOne(@Param('id') id: string) {
    return this.assistantsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an assistant' })
  update(
    @Param('id') id: string,
    @Body() updateAssistantDto: UpdateAssistantDto,
  ) {
    return this.assistantsService.update(id, updateAssistantDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an assistant' })
  remove(@Param('id') id: string) {
    return this.assistantsService.remove(id);
  }
}
