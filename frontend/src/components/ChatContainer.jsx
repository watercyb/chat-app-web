import MessageInput from "./MessageInput";
import ChatHeader from "./ChatHeader";
import ChatMessages from "./ChatMessages";

const ChatContainer = () => {
  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />
      <ChatMessages />
      <MessageInput />
    </div>
  );
};

export default ChatContainer;
