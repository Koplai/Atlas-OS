import ChatThread from "@/app/components/chat/ChatThread";

export default async function ThreadPage(props: { params: Promise<{ threadId: string }> }) {
  const { threadId } = await props.params;
  return <ChatThread threadId={threadId} />;
}
