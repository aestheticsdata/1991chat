import { Body, Controller, Post, Req, Res, UseGuards } from "@nestjs/common";
import type { Request, Response } from "express";
import { StreamChatUseCase } from "@application/chat/stream-chat.use-case";
import { SendMessageDto } from "@application/dto/send-message.dto";
import { CsrfGuard } from "@interface/http/csrf.guard";
import { AuthUser, CurrentUser } from "@interface/http/current-user.decorator";
import { SessionAuthGuard } from "@interface/http/session-auth.guard";
import { writeSse } from "@interface/http/sse-writer";

@Controller("chat")
@UseGuards(SessionAuthGuard, CsrfGuard)
export class ChatController {
  constructor(private readonly streamChat: StreamChatUseCase) {}

  /**
   * Send a message in a conversation and stream the assistant reply as SSE.
   * `start()` runs first (ownership check + persist the user message); if it
   * throws we get a clean HTTP error. Only then do we begin writing the stream.
   * A client disconnect (stop button) aborts the provider via AbortController.
   */
  @Post("stream")
  async stream(
    @CurrentUser() user: AuthUser,
    @Body() dto: SendMessageDto,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const turn = await this.streamChat.start({
      userId: user.id,
      conversationId: dto.conversationId,
      content: dto.content,
    });

    const abort = new AbortController();
    req.on("close", () => abort.abort());

    await writeSse(res, this.streamChat.stream(turn, abort.signal), {
      userMessageId: turn.userMessage.id,
      assistantMessageId: turn.assistant.id,
    });
  }
}
