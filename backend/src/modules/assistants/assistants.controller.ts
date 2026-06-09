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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('assistants')
@ApiBearerAuth()
@Controller('assistants')
export class AssistantsController {
  constructor(private readonly assistantsService: AssistantsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new assistant' })
  @ApiResponse({ status: 201, description: 'Assistant successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  create(@Body() createAssistantDto: CreateAssistantDto) {
    return this.assistantsService.create(createAssistantDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all assistants' })
  @ApiResponse({ status: 200, description: 'Return all assistants.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  findAll() {
    return this.assistantsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an assistant by id' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Return the assistant.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Assistant not found.' })
  findOne(@Param('id') id: string) {
    return this.assistantsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an assistant' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Assistant successfully updated.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Assistant not found.' })
  update(
    @Param('id') id: string,
    @Body() updateAssistantDto: UpdateAssistantDto,
  ) {
    return this.assistantsService.update(id, updateAssistantDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an assistant' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Assistant successfully deleted.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Assistant not found.' })
  remove(@Param('id') id: string) {
    return this.assistantsService.remove(id);
  }
}
