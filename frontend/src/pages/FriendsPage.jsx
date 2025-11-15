import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";

const FriendsPage = () => {
  const {
    friendReqSends,
    friendReqReceives,
    suggestedFriends,
    getSuggestFriends,
    sendRequest,
    sendResponse,
  } = useChatStore();

  useEffect(() => {
    getSuggestFriends();
  }, [getSuggestFriends]);

  return (
    <div className="h-screen bg-base-200">
      <div className="pt-20 p-4">
        <div className="w-full max-w-2xl mx-auto grid grid-rows-3 gap-6">
          {/* ----------- Suggested Friends ----------- */}
          <div className="card bg-base-100 shadow p-4">
            <h2 className="text-xl font-semibold mb-3">Suggested Friends</h2>

            <div className="space-y-3">
              {suggestedFriends?.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-base-200"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={user.profilePic || "/avatar.png"}
                      alt={user.fullName}
                      className="w-10 h-10 rounded-full"
                    />
                    <span className="font-medium">{user.fullName}</span>
                  </div>

                  {/* send request button — no logic */}
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      sendRequest(user._id);
                    }}
                  >
                    Send Request
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* ----------- Friend Requests Sent ----------- */}
          <div className="card bg-base-100 shadow p-4">
            <h2 className="text-xl font-semibold mb-3">Requests You Sent</h2>

            <div className="space-y-3">
              {friendReqSends?.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-base-200"
                >
                  <img
                    src={user.profilePic || "/avatar.png"}
                    alt={user.fullName}
                    className="w-10 h-10 rounded-full"
                  />
                  <span className="font-medium">{user.fullName}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ----------- Friend Requests Received ----------- */}
          <div className="card bg-base-100 shadow p-4">
            <h2 className="text-xl font-semibold mb-3">
              Requests You Received
            </h2>

            <div className="space-y-3">
              {friendReqReceives?.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-base-200"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={user.profilePic || "/avatar.png"}
                      alt={user.fullName}
                      className="w-10 h-10 rounded-full"
                    />
                    <span className="font-medium">{user.fullName}</span>
                  </div>

                  <div className="flex gap-2">
                    {/* accept button — no logic */}
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => {
                        sendResponse(user._id, true);
                      }}
                    >
                      Accept
                    </button>

                    {/* decline button — no logic */}
                    <button
                      className="btn btn-error btn-sm"
                      onClick={() => {
                        sendResponse(user._id, false);
                      }}
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FriendsPage;
