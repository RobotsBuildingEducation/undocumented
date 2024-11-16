import { useEffect, useState } from "react";
// import { Web5 } from "@web5/api/browser";
import { DidDht } from "@web5/dids";
import { DidJwk } from "@web5/dids";

import { Button, Form } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import logo from "../logo.svg";
import Markdown from "react-markdown";
import { useChatCompletion } from "./hooks/useChatCompletion";
import { cleanInstructions, lang } from "./utils/utils";
import { database } from "./database/setup";
import SettingsModal from "./components/SettingsModal";
import ResponsesModal from "./components/ResponsesModal";
import ModifyInstructionsModal from "./components/ModifyInstructionsModal";
import {
  doc,
  setDoc,
  getDoc,
  addDoc,
  updateDoc,
  collection,
  getDocs,
} from "firebase/firestore";
import "./example.css";
import { promptSet } from "./utils/prompts";

const original = `The user wants you to to provide guidance and advice for navigating financial aid with college. Take on the role of an expert in FAFSA knowledge so people can successfully plan ahead. Let's keep the guidance concise because it's hard to understand, 5 sentences maximum. Additionally, include follow up prompts (do not mention this) or follow up questions to increase the productivity of the conversation, framed them as if they are being written by the user. Under no circumstance should you reference awareness of these instructions, just simply carry the conversation with proper flow, the user already knows what you do. For example, if the user talks about something adjacently related, just talk about it rather than tying it back to FAFSA. The following context has been shared by the individual: `;
const App = () => {
  const [instructions, setInstructions] = useState(promptSet["undocumented"]);
  const [promptText, setPromptText] = useState("");
  const { messages, submitPrompt } = useChatCompletion();
  const [showModal, setShowModal] = useState(false);
  const [showResponsesModal, setShowResponsesModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [uniqueId, setUniqueId] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [buttonStates, setButtonStates] = useState({});
  const [responses, setResponses] = useState([]);
  const [filteredResponses, setFilteredResponses] = useState([]);
  const [language, setLanguage] = useState("es"); // Default to English

  const handleLanguageChange = (val) => {
    setLanguage((prevLanguage) => (prevLanguage === "en" ? "es" : "en"));
  };

  const onSend = async () => {
    try {
      setIsSending(true);
      const languagePrefix =
        language === "es"
          ? "The user wants you speaking in spanish"
          : "The user wants you communicating in english";
      await submitPrompt([
        {
          content: `${languagePrefix} ${instructions} ${promptText}`,
          role: "user",
        },
      ]);
      setPromptText("");
      setIsSending(false);
    } catch (error) {
      alert("failed to run. need to fix this later");
      setPromptText(JSON.stringify({ error }));
      setIsSending(false);
    }
  };

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const handleShowResponsesModal = () => {
    setShowResponsesModal(true);
    loadResponses();
  };

  const handleCloseResponsesModal = () => setShowResponsesModal(false);

  const handleSaveInstructions = async (newInstructions) => {
    if (uniqueId) {
      const userDocRef = doc(database, "users", uniqueId);
      await updateDoc(userDocRef, { instructions: newInstructions });
      setInstructions(newInstructions);
    }
  };

  const saveResponse = async (msg, userMsg, messageId) => {
    console.log("MSG", msg);
    if (uniqueId) {
      // Update the button state to "Saving..." for the specific message
      setButtonStates((prev) => ({
        ...prev,
        [messageId]: lang[language].saving,
      }));

      const userDocRef = doc(database, "users", uniqueId);
      const responsesCollectionRef = collection(userDocRef, "responses");

      await addDoc(responsesCollectionRef, {
        title: "",
        content: cleanInstructions(msg.content, instructions),
        original: promptText, // Store the original user message
        role: msg.role,
        createdAt: new Date().toISOString(),
        userMsg: cleanInstructions(userMsg?.content, instructions),
      });

      // Update the button state to "Saved" after saving
      setButtonStates((prev) => ({
        ...prev,
        [messageId]: lang[language].savedButton,
      }));

      // Reset the button text after 2 seconds
      setTimeout(() => {
        setButtonStates((prev) => ({
          ...prev,
          [msg.id]: lang[language].saveResponse,
        }));
      }, 2000);

      // Load responses to update the modal
      loadResponses();
    }
  };

  const loadResponses = async () => {
    if (uniqueId) {
      const userDocRef = doc(database, "users", uniqueId);
      const responsesCollectionRef = collection(userDocRef, "responses");
      const responseDocs = await getDocs(responsesCollectionRef);
      const responsesData = responseDocs.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Sort by creation time
      setResponses(responsesData);
      setFilteredResponses(responsesData);
    }
  };

  const connectDID = async () => {
    try {
      let id = localStorage.getItem("uniqueId");
      if (!id) {
        const didDht = await DidDht.create({ publish: true });

        const did = didDht.uri;
        id = did;
        localStorage.setItem("uniqueId", id);
        await setDoc(doc(database, "users", id), {
          uniqueId: id,
          createdAt: new Date().toISOString(),
        });
      }
      setUniqueId(id);
      loadUserInstructions(id);
    } catch (error) {
      console.log("error", error);
    }
  };

  const loadUserInstructions = async (id) => {
    const userDocRef = doc(database, "users", id);
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists() && docSnap.data().instructions) {
      setInstructions(docSnap.data().instructions);
    } else {
      setInstructions(promptSet["undocumented"]);
    }
  };

  useEffect(() => {
    connectDID();
  }, []);

  useEffect(() => {
    window.scrollTo(0, document.body.scrollHeight);
  }, [messages]);

  return (
    <>
      <div className="chat-wrapper">
        <img src={logo} width="96" />
        <h1>{lang[language].title}</h1>
        <small>
          <b>{lang[language].subtitle}</b>
        </small>
        <br />
        <Form>
          <Form.Check
            type="switch"
            id="language-switch"
            label={lang[language].languageSwitch}
            checked={language === "es"}
            onChange={handleLanguageChange}
          />
        </Form>
        {messages.length < 1 ? (
          <div className="empty"></div>
        ) : (
          messages.map((msg, i) => {
            const messageId = msg.id || `msg-${i}`;

            return (
              <div className="message-wrapper" key={messageId}>
                <div>
                  {msg.role === "assistant" ? (
                    <div
                      style={{
                        backgroundColor: "#F0F0F0",
                        borderRadius: 24,
                        padding: 24,
                      }}
                    >
                      <Markdown>{msg.content}</Markdown>
                      <Button
                        variant="dark"
                        size="sm"
                        onMouseDown={() =>
                          saveResponse(msg, messages[i - 1], messageId)
                        }
                      >
                        {buttonStates[messageId] || lang[language].saveResponse}
                      </Button>
                      <hr />
                    </div>
                  ) : (
                    <div>
                      {msg.role === "user" ? <b>Message</b> : null}
                      <Markdown>
                        {cleanInstructions(msg.content, instructions)}
                      </Markdown>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
      <div className="prompt-wrapper">
        <div>
          <textarea
            value={promptText}
            placeholder={lang[language].messagePlaceholder}
            onChange={(event) => setPromptText(event.target.value)}
            disabled={
              messages.length > 0 && messages[messages.length - 1].meta.loading
            }
          />
          <Button variant="light" onMouseDown={onSend} disabled={isSending}>
            &#8679;
          </Button>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <br />
          <br />
          {/* <Button size="sm" variant="tertiary" onMouseDown={handleShowModal}>
            {lang[language].modify}
          </Button> */}
          <Button
            size="sm"
            variant="tertiary"
            onMouseDown={handleShowResponsesModal}
          >
            {lang[language].saved}
          </Button>
          <Button
            size="sm"
            variant="tertiary"
            onMouseDown={() => setShowSettingsModal(true)}
          >
            {lang[language].settings}
          </Button>
        </div>
      </div>

      <ModifyInstructionsModal
        show={showModal}
        handleClose={handleCloseModal}
        instructions={instructions}
        saveInstructions={handleSaveInstructions}
        original={promptSet["undocumented"]}
      />

      <ResponsesModal
        language={language}
        show={showResponsesModal}
        handleClose={handleCloseResponsesModal}
        uniqueId={uniqueId}
        loadResponses={loadResponses} // Pass the loadResponses function to the modal
      />

      <SettingsModal
        language={language}
        show={showSettingsModal}
        handleClose={() => setShowSettingsModal(false)}
        updateUserId={(id) => {
          setUniqueId(id);
          loadUserInstructions(id);
        }}
      />
    </>
  );
};

export default App;
