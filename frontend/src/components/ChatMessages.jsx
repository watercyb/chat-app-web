import { useEffect, useRef } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { formatMessageTime } from "../lib/utils";

const ChatMessages = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const messageContainerRef = useRef(null);
  const firstView = useRef(false);

  const THRESHOLD = 150;

  useEffect(() => {
    getMessages(selectedUser._id);

    firstView.current = true;

    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [
    selectedUser._id,
    getMessages,
    subscribeToMessages,
    unsubscribeFromMessages,
  ]);

  useEffect(() => {
    if (messageContainerRef.current && !isMessagesLoading) {
      const container = messageContainerRef.current;
      const scrollBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight;

      const scrollToBottom = () => {
        messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
      };

      if (messageEndRef.current && messages) {
        if (firstView.current) {
          firstView.current = false;
          const images = container.querySelectorAll("img");
          let loadedCount = 0;

          images.forEach((img) => {
            if (img.complete) {
              loadedCount++;
              return;
            }
            img.addEventListener("load", () => {
              if (++loadedCount === images.length) scrollToBottom();
            });
          });
          scrollToBottom();
        } else if (
          scrollBottom < THRESHOLD ||
          (messages.length > 0 &&
            messages[messages.length - 1].senderId === authUser._id)
        ) {
          const images = messageEndRef.current.querySelectorAll("img");
          if (images.length > 1) {
            const img = images[1];
            if (img.complete) {
              scrollToBottom();
            } else {
              img.addEventListener(
                "load",
                () => {
                  scrollToBottom();
                },
                { once: true }
              );
            }
          } else {
            scrollToBottom();
          }
        }
      }
    }
  }, [messages]);

  if (isMessagesLoading) return <MessageSkeleton />;
  if (!selectedUser) return <div></div>;

  return (
    <div
      className="flex-1 overflow-y-auto p-4 space-y-4"
      ref={messageContainerRef}
    >
      {messages.map((message) => (
        <div
          key={message._id}
          className={`chat ${
            message.senderId === authUser._id ? "chat-end" : "chat-start"
          }`}
          ref={messageEndRef}
        >
          <div className="chat-image avatar">
            <div className="size-10 rounded-full border">
              <img
                src={
                  message.senderId === authUser.id
                    ? authUser.profilePic || "/avatar.png"
                    : selectedUser.profilePic || "/avatar.png"
                }
                alt="profile pic"
              />
            </div>
          </div>
          <div className="chat-header mb-1">
            <time className="text-xs opacity-50 ml-1">
              {formatMessageTime(message.createdAt)}
            </time>
          </div>
          <div className="chat-bubble flex flex-col">
            {message.image && (
              <img
                src={message.image}
                alt="Attachment"
                className="sm:max-w-[200px] rounded-md mb-2"
              />
            )}
            {message.text && <div>{message.text}</div>}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatMessages;
