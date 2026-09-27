import { useState, useEffect, useRef } from "react";

const playMessageSound = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.08); // A5

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  } catch (err) {
    console.warn("Message chime error:", err.message);
  }
};

const ChatModal = ({
  isOpen,
  onClose,
  socket,
  recipientSocketId,
  recipientName,
  userType, // "user" or "captain"
  rideId,
}) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef(null);

  const riderQuickReplies = [
    "I'm at the pickup point",
    "Coming down in 2 mins",
    "Waiting near the main gate",
    "Which vehicle model?",
  ];

  const captainQuickReplies = [
    "I have arrived at pickup",
    "Stuck in traffic, be there soon",
    "Hazard lights are on",
    "Please come to the main road",
  ];

  const quickReplies = userType === "captain" ? captainQuickReplies : riderQuickReplies;

  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (data) => {
      if (data.rideId && rideId && data.rideId !== rideId) return;

      playMessageSound();
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + Math.random(),
          senderType: data.senderType,
          senderName: data.senderName,
          text: data.message,
          timestamp: data.timestamp || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isMe: false,
        },
      ]);
    };

    socket.on("receive-message", handleReceiveMessage);
    return () => socket.off("receive-message", handleReceiveMessage);
  }, [socket, rideId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const sendMessage = (textToSend) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const newMsg = {
      id: Date.now() + Math.random(),
      senderType: userType,
      senderName: userType === "captain" ? "Driver" : "Rider",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isMe: true,
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText("");

    if (socket && recipientSocketId) {
      socket.emit("send-message", {
        recipientSocketId,
        message: text,
        senderType: userType,
        senderName: userType === "captain" ? "Driver" : "Rider",
        rideId,
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[600] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-md h-[85vh] sm:h-[600px] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="p-4 bg-gray-900 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center text-lg">
              {recipientName ? recipientName.charAt(0).toUpperCase() : "C"}
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base capitalize">
                {recipientName || (userType === "captain" ? "Rider" : "Driver")}
              </h3>
              <p className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                In-Trip Live Chat
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
          >
            <i className="ri-close-line text-xl"></i>
          </button>
        </div>

        {/* Quick Reply Chips */}
        <div className="p-3 bg-gray-50 border-b overflow-x-auto flex gap-2 no-scrollbar">
          {quickReplies.map((reply, idx) => (
            <button
              key={idx}
              onClick={() => sendMessage(reply)}
              className="text-xs font-medium bg-white hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 border border-gray-200 text-gray-700 px-3 py-1.5 rounded-full whitespace-nowrap transition shadow-sm active:scale-95"
            >
              {reply}
            </button>
          ))}
        </div>

        {/* Messages List */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#f8fafc]">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400">
              <i className="ri-chat-smile-2-line text-4xl mb-2 text-gray-300"></i>
              <p className="text-sm font-semibold text-gray-600">No messages yet</p>
              <p className="text-xs text-gray-400 mt-1">
                Coordinate pickup location or instructions with quick replies above.
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.isMe ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                    msg.isMe
                      ? "bg-black text-white rounded-br-xs"
                      : "bg-white text-gray-900 border border-gray-100 rounded-bl-xs"
                  }`}
                >
                  <p className="leading-relaxed">{msg.text}</p>
                </div>
                <span className="text-[10px] text-gray-400 mt-1 px-1">
                  {msg.timestamp}
                </span>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="p-3 bg-white border-t flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-gray-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="bg-black disabled:bg-gray-200 text-white disabled:text-gray-400 w-10 h-10 rounded-xl flex items-center justify-center transition hover:bg-gray-800"
          >
            <i className="ri-send-plane-fill text-lg"></i>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatModal;
