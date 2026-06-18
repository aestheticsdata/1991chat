import { Module, Provider } from '@nestjs/common';
import { ChatLlmProvider } from '@domain/ports/chat-llm-provider.port';
import { MockLlmAdapter } from '@infrastructure/llm/mock/mock-llm.adapter';
import { RemoteLlmAdapter } from '@infrastructure/llm/remote/remote-llm.adapter';

// Read at module-eval time. main.ts loads `dotenv/config` before importing the
// app, so .env values are already in process.env here.
const useRemote = (process.env.LLM_PROVIDER ?? 'mock') === 'remote';

// One binding switches the whole app between the mock and a real provider.
const provider: Provider = useRemote
  ? { provide: ChatLlmProvider, useClass: RemoteLlmAdapter }
  : { provide: ChatLlmProvider, useClass: MockLlmAdapter };

@Module({
  providers: [provider],
  exports: [ChatLlmProvider],
})
export class LlmModule {}
