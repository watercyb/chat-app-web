export function formatMessageTime(date) {
  return (
    new Date(date).toLocaleDateString("en-US", {
    }) +
    " " +
    new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
  );
}
