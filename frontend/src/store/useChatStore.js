import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  friendReqSends: [],
  friendReqReceives: [],
  suggestedFriends: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/friends/users");

      set({ users: res.data[0] || [] });
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data.message || error.response.data.error);
      } else if (error.request) {
        toast.error("No response from server. Please try again later.");
      }
      console.log("Error in getUsers: ", error);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data.message || error.response.data.error);
      } else if (error.request) {
        toast.error("No response from server. Please try again later.");
      }
      console.log("Error in getMessages: ", error);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser } = get();
    try {
      await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        messageData
      );
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data.message || error.response.data.error);
      } else if (error.request) {
        toast.error("No response from server. Please try again later.");
      }
      console.log("Error in sendMessages: ", error);
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;
    socket.on("newMessage", (newMessage) => {
      if (
        newMessage.senderId !== selectedUser._id &&
        newMessage.receiverId !== selectedUser._id
      )
        return;

      set({ messages: [...get().messages, newMessage] });
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) socket.off("newMessage");
  },

  setSelectedUser: async (selectedUser) => {
    const { selectedUser: currectSelectedUser } = get();
    if (currectSelectedUser != selectedUser) {
      set({ selectedUser });
      set({ messages: [] });
    }
  },

  getSuggestFriends: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/friends/suggestion");

      set({ suggestedFriends: res.data[0] || [] });
      set({ friendReqSends: res.data[1] || [] });
      set({ friendReqReceives: res.data[2] || [] });
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data.message || error.response.data.error);
      } else if (error.request) {
        toast.error("No response from server. Please try again later.");
      }
      console.log("Error in getSuggestFriends: ", error);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  sendRequest: async (recipientId) => {
    try {
      const res = await axiosInstance.post("/friends/request", { recipientId });
      if (res.data.message) {
        get().getUsers();
        get().getSuggestFriends();
        toast.success(res.data.message);
      } else {
        toast.error(res.data.error);
      }
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data.message || error.response.data.error);
      } else if (error.request) {
        toast.error("No response from server. Please try again later.");
      }
      console.log("Error in sendRequest: ", error);
    }
  },

  sendResponse: async (requesterId, accept) => {
    try {
      const res = await axiosInstance.post("/friends/response", {
        requesterId,
        accept,
      });

      if (res.data.message) {
        if (accept) get().getUsers();
        get().getSuggestFriends();
        toast.success(res.data.message);
      } else {
        toast.error(res.data.error);
      }
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data.message || error.response.data.error);
      } else if (error.request) {
        toast.error("No response from server. Please try again later.");
      }
      console.log("Error in sendResponse: ", error);
    }
  },
}));
