import { Body, Controller, Delete, Get, HttpCode, Param, Post, UseGuards } from '@nestjs/common';
import { ConversationService } from '@application/conversations/conversation.service';
import { CreateConversationDto } from '@application/dto/create-conversation.dto';
import { Conversation } from '@domain/conversation.entity';
import { CsrfGuard } from '@interface/http/csrf.guard';
import { AuthUser, CurrentUser } from '@interface/http/current-user.decorator';
import { SessionAuthGuard } from '@interface/http/session-auth.guard';

@Controller('conversations')
@UseGuards(SessionAuthGuard, CsrfGuard)
export class ConversationsController {
  constructor(private readonly conversations: ConversationService) {}

  @Get()
  async list(@CurrentUser() user: AuthUser) {
    const items = await this.conversations.list(user.id);
    return items.map((c) => summary(c));
  }

  @Post()
  async create(@CurrentUser() user: AuthUser, @Body() dto: CreateConversationDto) {
    const conversation = await this.conversations.create(user.id, dto.title);
    return summary(conversation);
  }

  @Get(':id')
  async get(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    const conversation = await this.conversations.getOwned(user.id, id);
    return {
      ...summary(conversation),
      messages: conversation.messages.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        status: m.status,
        createdAt: m.createdAt,
      })),
    };
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@CurrentUser() user: AuthUser, @Param('id') id: string): Promise<void> {
    await this.conversations.delete(user.id, id);
  }
}

function summary(c: Conversation) {
  return { id: c.id, title: c.title, createdAt: c.createdAt, updatedAt: c.updatedAt };
}
