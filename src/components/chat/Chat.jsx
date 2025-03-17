import React from "react";
import { useState, useEffect, useRef } from "react";
import ChatBubblev1 from "./ChatBubblev1";
import ChatHistory from "./ChatHistory";
import reset from "../../assets/reset.png";
import "../../index.css";

const ChatBubble = (props) => {
  const { chatHistory, client, isPointerLocked } = props;
  const [isHovered, setIsHovered] = useState(false);
  const [history, setHistory] = useState(1);
  const [session, setSession] = useState("-1");
  const [messages, setMessages] = useState([]);
  const [errorResponse, setErrorResponse] = useState(false);
  const timer = useRef(null);
  const errorMessage = " Error in retrieving response. Please reset session.";

  // Toggle History panel
  const showHistory = () => {
    if (!isPointerLocked) {
      setHistory(!history);
    }
  };

  // Takes User text from the textBox
  const userInput = (text) => {
    client?.setUserText(text);
  };

  // Reset Session
  const ResetHistory = () => {
    const storedData = localStorage.getItem("messages");
    if (storedData) {
      // Parse the retrieved data from JSON format
      const parsedData = JSON.parse(storedData);
      // Update the messages for the current character ID in the stored data
      parsedData[client?.characterId] = {
        sessionID: -1,
        message: [""],
      };
      // Update the stored data in localStorage
      localStorage.setItem("messages", JSON.stringify(parsedData));
    }
    if (client?.convaiClient?.current) {
      client?.convaiClient.current.resetSession();
    }
    setSession("-1");
    setMessages([]);
    client?.setUserText("");
    client?.setNpcText("");
  };

  // Handle reset click with pointer lock check
  const handleResetClick = (e) => {
    if (!isPointerLocked) {
      ResetHistory();
    }
    e.preventDefault();
  };

  // Retrieve Latest chat history of a particular character
  useEffect(() => {
    const storedData = localStorage.getItem("messages");

    if (client?.characterId) {
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        const characterIDs = Object.keys(parsedData);

        if (characterIDs.includes(client?.characterId)) {
          const parsedSessionID = parsedData[client?.characterId].sessionID;
          if (parsedSessionID) {
            setSession(parsedSessionID);
          }

          const parsedMessage = parsedData[client?.characterId].message;
          if (parsedMessage) {
            const storedMessages = JSON.parse(parsedMessage);
            setMessages(storedMessages);
          }
        } else {
          setMessages([]);
        }
      } else {
        setSession("-1");
        setMessages([]);
      }
    }
  }, [client?.characterId]);

  // Store latest User and Npc Messages into the chat history
  useEffect(() => {
    if (
      client?.convaiClient?.current &&
      session === "-1" &&
      client?.convaiClient?.current?.sessionId
    ) {
      setSession(client.convaiClient.current.sessionId);
    }
    if (client?.characterId && messages.length) {
      const messagesJSON = JSON.stringify(messages);
      const storedData = localStorage.getItem("messages");

      if (storedData) {
        const parsedData = JSON.parse(storedData);
        parsedData[client.characterId] = {
          sessionID: session,
          message: messagesJSON,
        };
        localStorage.setItem("messages", JSON.stringify(parsedData));
      } else {
        const messagesData = {
          [client.characterId]: {
            sessionID: session,
            message: messagesJSON,
          },
        };
        localStorage.setItem("messages", JSON.stringify(messagesData));
      }
    }
  }, [client?.characterId, messages, session]);

  // Stores User message
  useEffect(() => {
    const newMessage = {
      sender: "user",
      content: client?.userText,
    };
    if (client?.userText !== "" && client?.userEndOfResponse) {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      client?.setUserEndOfResponse(false);
      timer.current = setTimeout(() => {
        setErrorResponse(true);
      }, 7000);
    }
  }, [client?.userEndOfResponse, client?.userText]);

  // Stores Npc's message
  useEffect(() => {
    if (errorResponse && !client?.npcText) {
      client.npcText = errorMessage;
      const newMessage = {
        sender: "npc",
        content: errorMessage,
      };
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setErrorResponse(false);
    } else {
      const newMessage = {
        sender: "npc",
        content: client?.npcText,
      };
      if (client?.npcText !== "") {
        setErrorResponse(false);
        clearTimeout(timer.current);
      }
      if (client?.npcText !== "" && !client?.isTalking) {
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      }
    }
  }, [client?.isTalking, errorResponse, client?.npcText]);

  return (
    <section className="ChatBubble">
      <div style={{ display: "flex" }}>
        <div
          style={{
            backgroundColor: isHovered
              ? "rgba(0, 0, 0, 1)"
              : "rgba(0, 0, 0, 0.7)",
            borderRadius: "10px",
            width: "8vw",
            height: "2.5vw",
            color: "white",
            display: "flex",
            justifyContent: "center",
            cursor: isPointerLocked ? "default" : "pointer",
            marginBottom: "10px",
            pointerEvents: isPointerLocked ? "none" : "auto",
          }}
          onMouseEnter={() => !isPointerLocked && setIsHovered(true)}
          onMouseLeave={() => !isPointerLocked && setIsHovered(false)}
          onClick={handleResetClick}
        >
          <div
            style={{
              alignSelf: "center",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <img
              loading="lazy"
              src={reset}
              height="20vw"
              width="20vw"
              alt="reset chat"
            ></img>
          </div>
          <div
            style={{
              alignSelf: "center",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              marginLeft: "7px",
              fontWeight: "bold",
            }}
          >
            <p style={{ fontSize: "0.78vw" }}>Reset Session</p>
          </div>
        </div>
      </div>
      {chatHistory === "Show" && (
        <ChatHistory
          history={history}
          messages={messages}
          showHistory={showHistory}
          npcName={client?.npcName ? client.npcName : "Npc"}
          userName={client?.userName ? client.userName : "User"}
        />
      )}
      <ChatBubblev1
        npcText={client?.npcText}
        userText={client?.userText}
        messages={messages}
        keyPressed={client?.keyPressed}
      />
    </section>
  );
};

export default ChatBubble;