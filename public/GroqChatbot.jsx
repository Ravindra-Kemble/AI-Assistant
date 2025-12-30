const { useState, useRef, useEffect } = React;

function GroqChatbot() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(
    () => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  );
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const API_URL = "http://localhost:3001/api";

  const scrollToBottom = () => {
    const container = document.querySelector(".scrollbar-custom");
    if (container)
      container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
    else messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const header = document.getElementById("app-header");
    const inputArea = document.getElementById("app-input");
    if (!header || !inputArea) return;
    const setHeights = () => {
      document.documentElement.style.setProperty(
        "--header-height",
        `${header.offsetHeight}px`
      );
      document.documentElement.style.setProperty(
        "--input-height",
        `${inputArea.offsetHeight}px`
      );
    };
    setHeights();
    const ro = new ResizeObserver(setHeights);
    ro.observe(header);
    ro.observe(inputArea);
    window.addEventListener("resize", setHeights);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", setHeights);
    };
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue("");
    setIsLoading(true);
    setError(null);

    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);

    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          sessionId: sessionId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get response");
      }

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.message },
      ]);
    } catch (error) {
      console.error("Error:", error);
      setError(error.message);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `I apologize, but I encountered an error: ${error.message}. Please try again.`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = async () => {
    try {
      await fetch(`${API_URL}/clear`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sessionId }),
      });
      setMessages([]);
      setError(null);
    } catch (error) {
      console.error("Error clearing chat:", error);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        "--header-height": "175px",
        "--input-height": "100px",
        background:
          "linear-gradient(to bottom right, rgb(6, 78, 59), rgb(17, 94, 89), rgb(22, 78, 99))",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        id="app-header"
        className="glass-effect"
        style={{
          position: "sticky",
          top: "0px",
          zIndex: 10000,
          padding: "2px",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              className="float-animation"
              style={{
                background:
                  "linear-gradient(to bottom right, rgb(52, 211, 153), rgb(20, 184, 166))",
                padding: "12px",
                borderRadius: "16px",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
              }}
            >
              <Sparkles />
            </div>
            <div>
              <h1
                style={{
                  fontSize: "1.875rem",
                  fontWeight: "bold",
                  background:
                    "linear-gradient(to right, rgb(209, 250, 229), rgb(204, 251, 241), rgb(207, 250, 254))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  fontFamily: "'Playfair Display', serif",
                }}
              >
                AI Assistant
              </h1>
              <p
                style={{
                  color: "rgb(167, 243, 208)",
                  fontSize: "0.75rem",
                  marginTop: "-24px",
                }}
              >
                Powered by Ravindra
              </p>
            </div>
          </div>

          <button
            onClick={handleClearChat}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 16px",
              background: "rgba(255, 255, 255, 0.1)",
              color: "rgb(209, 250, 229)",
              borderRadius: "12px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              cursor: "pointer",
              transition: "all 0.3s",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "rgba(255, 255, 255, 0.2)";
              e.target.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "rgba(255, 255, 255, 0.1)";
              e.target.style.transform = "scale(1)";
            }}
          >
            <Trash2 />
            <span style={{ fontSize: "0.875rem", fontWeight: "500" }}>
              Clear
            </span>
          </button>
        </div>
      </div>

      <div
        className="scrollbar-custom"
        style={{
          flex: "none",
          height:
            "calc(100vh - var(--header-height, 96px) - var(--input-height, 88px))",
          overflowY: "auto",
          padding: "24px",
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: "24px",
          }}
        >
          {messages.length === 0 && (
            <div
              className="message-enter"
              style={{
                textAlign: "center",
                paddingTop: "96px",
                paddingBottom: "96px",
              }}
            >
              <div
                className="glass-effect"
                style={{
                  display: "inline-block",
                  padding: "32px",
                  borderRadius: "24px",
                  marginBottom: "32px",
                }}
              >
                <Bot />
              </div>
              <h2
                style={{
                  fontSize: "1.875rem",
                  fontWeight: "bold",
                  color: "rgb(236, 253, 245)",
                  marginBottom: "16px",
                  fontFamily: "'Playfair Display', serif",
                }}
              >
                Welcome! How can I help you today?
              </h2>
              <p
                style={{
                  color: "rgb(167, 243, 208)",
                  fontSize: "1rem",
                  maxWidth: "28rem",
                  margin: "0 auto",
                  lineHeight: "1.75",
                }}
              >
                Ask me anything—from creative ideas to technical questions. I'm
                here to assist with lightning-fast responses.
              </p>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={index}
              className="message-enter"
              style={{
                display: "flex",
                gap: "16px",
                justifyContent:
                  message.role === "assistant" ? "flex-start" : "flex-end",
              }}
            >
              {message.role === "assistant" && (
                <div style={{ flexShrink: 0, paddingTop: "4px" }}>
                  <div
                    style={{
                      background:
                        "linear-gradient(to bottom right, rgb(52, 211, 153), rgb(20, 184, 166))",
                      padding: "10px",
                      borderRadius: "12px",
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                    }}
                  >
                    <Bot />
                  </div>
                </div>
              )}

              <div
                className="message-bubble glass-effect"
                style={{
                  maxWidth: "80%",
                  borderRadius: "16px",
                  padding: "16px 20px",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                  transition: "all 0.3s",
                  ...(message.role === "assistant"
                    ? {
                        color: "rgb(236, 253, 245)",
                        borderLeft: "4px solid rgb(52, 211, 153)",
                      }
                    : {
                        background:
                          "linear-gradient(to bottom right, rgb(16, 185, 129), rgb(20, 184, 166))",
                        color: "white",
                      }),
                }}
              >
                <p
                  style={{
                    fontSize: "0.875rem",
                    lineHeight: "1.75",
                    whiteSpace: "pre-wrap",
                    margin: 0,
                  }}
                  dangerouslySetInnerHTML={{
                    __html: window.sanitizeAndHighlight(message.content),
                  }}
                />
              </div>

              {message.role === "user" && (
                <div style={{ flexShrink: 0, paddingTop: "4px" }}>
                  <div
                    style={{
                      background: "rgba(255, 255, 255, 0.2)",
                      backdropFilter: "blur(4px)",
                      padding: "10px",
                      borderRadius: "12px",
                      border: "1px solid rgba(255, 255, 255, 0.3)",
                    }}
                  >
                    <User />
                  </div>
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div
              className="message-enter"
              style={{ display: "flex", gap: "16px" }}
            >
              <div style={{ flexShrink: 0, paddingTop: "4px" }}>
                <div
                  style={{
                    background:
                      "linear-gradient(to bottom right, rgb(52, 211, 153), rgb(20, 184, 166))",
                    padding: "10px",
                    borderRadius: "12px",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <Bot />
                </div>
              </div>
              <div
                className="glass-effect"
                style={{
                  borderRadius: "16px",
                  padding: "16px 20px",
                  borderLeft: "4px solid rgb(52, 211, 153)",
                }}
              >
                <div
                  className="typing-indicator"
                  style={{ display: "flex", gap: "6px" }}
                >
                  <span
                    style={{
                      width: "10px",
                      height: "10px",
                      background: "rgb(167, 243, 208)",
                      borderRadius: "50%",
                    }}
                  ></span>
                  <span
                    style={{
                      width: "10px",
                      height: "10px",
                      background: "rgb(167, 243, 208)",
                      borderRadius: "50%",
                    }}
                  ></span>
                  <span
                    style={{
                      width: "10px",
                      height: "10px",
                      background: "rgb(167, 243, 208)",
                      borderRadius: "50%",
                    }}
                  ></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div id="app-input">
        <form
          onSubmit={handleSendMessage}
          style={{
            maxWidth: "1280px",
            margin: "10px 100px 7px 100px",
          }}
        >
          <div style={{ display: "flex", gap: "12px" }}>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your message..."
              disabled={isLoading}
              style={{
                flex: 1,
                background: "rgba(255, 255, 255, 0.05)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: "16px",
                padding: "16px 24px",
                color: "rgb(236, 253, 245)",
                fontSize: "1rem",
                outline: "none",
                transition: "all 0.3s",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "rgb(52, 211, 153)";
                e.target.style.boxShadow = "0 0 0 2px rgba(52, 211, 153, 0.3)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "rgba(255, 255, 255, 0.2)";
                e.target.style.boxShadow = "none";
              }}
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              style={{
                background:
                  "linear-gradient(to bottom right, rgb(16, 185, 129), rgb(20, 184, 166))",
                color: "white",
                padding: "16px 24px",
                borderRadius: "16px",
                border: "none",
                cursor: "pointer",
                transition: "all 0.3s",
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
                opacity: !inputValue.trim() || isLoading ? 0.5 : 1,
              }}
              onMouseEnter={(e) => {
                if (!(!inputValue.trim() || isLoading)) {
                  e.target.style.transform = "scale(1.05)";
                  e.target.style.background =
                    "linear-gradient(to bottom right, rgb(52, 211, 153), rgb(45, 212, 191))";
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "scale(1)";
                e.target.style.background =
                  "linear-gradient(to bottom right, rgb(16, 185, 129), rgb(20, 184, 166))";
              }}
            >
              <Send />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

window.GroqChatbot = GroqChatbot;
