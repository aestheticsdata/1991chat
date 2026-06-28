import { DotLoader } from "@components/DotLoader";
import { ROLE, STATUS } from "@services/conversation.constants";
import type { MessageRole, MessageStatus } from "@services/conversation.types";
import Markdown from "react-markdown";

interface MessageProps {
  role?: MessageRole;
  content: string;
  status?: MessageStatus;
}

export function Message({ role, content, status }: MessageProps) {
  if (role === ROLE.USER) {
    return (
      <div className="flex justify-end">
        <div className="max-w-4/5 whitespace-pre-wrap rounded-2xl bg-elevated px-4 py-2.5 text-ink">{content}</div>
      </div>
    );
  }

  if (status === STATUS.PENDING) {
    return <DotLoader />;
  }

  return (
    <div className="flex flex-col">
      <div className="prose max-w-none">
        <Markdown>{content}</Markdown>
      </div>
      {status === STATUS.ERROR && <div className="text-red-500">error</div>}
    </div>
  );
}
