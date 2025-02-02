import "regenerator-runtime/runtime";

import { useEffect, useRef, useState } from "react";

// import { Web5 } from "@web5/api/browser";
import { DidDht } from "@web5/dids";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { PiMicrophoneLight, PiMicrophoneFill } from "react-icons/pi";
import { FiSend } from "react-icons/fi";

// import { DidJwk } from "@web5/dids";

import { Button, Dropdown, Form, Offcanvas, Spinner } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faCog } from "@fortawesome/free-solid-svg-icons";
import logo from "../logo.svg";
import Markdown from "react-markdown";
import { useChatCompletion } from "./hooks/useChatCompletion";
import {
  cleanInstructions,
  isUnsupportedBrowser,
  isValidDID,
  lang,
  prefixMap,
} from "./utils/utils";
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
import FifthAmendmentModal from "./components/FifthAmendmentModal";
import FourteenthAmendmentModal from "./components/FourteenthAmendmentModal";
import { useUserStore } from "./store/useUserStore";
import PrivacyPolicyModal from "./components/PrivacyPolicyModal";
import InstallAppModal from "./components/InstallAppModal";
import { useSharedNostr } from "./hooks/useNostr";
import CareerAgentWizard from "./components/CareerAgentWizard";

const original = `The user wants you to to provide guidance and advice for navigating financial aid with college. Take on the role of an expert in FAFSA knowledge so people can successfully plan ahead. Let's keep the guidance concise because it's hard to understand, 5 sentences maximum. Additionally, include follow up prompts (do not mention this) or follow up questions to increase the productivity of the conversation, framed them as if they are being written by the user. Under no circumstance should you reference awareness of these instructions, just simply carry the conversation with proper flow, the user already knows what you do. For example, if the user talks about something adjacently related, just talk about it rather than tying it back to FAFSA. The following context has been shared by the individual: `;

const App = () => {
  const [isLoadingApp, setIsLoadingApp] = useState(false);
  const [appMode, setAppMode] = useState("undocumented");
  const { user } = useUserStore(); // Access Zustand store
  // console.log("user", user);
  const [instructions, setInstructions] = useState(promptSet["undocumented"]);
  const [promptText, setPromptText] = useState("");
  const { messages, submitPrompt, resetMessages } = useChatCompletion();
  const [showModal, setShowModal] = useState(false);
  const [showResponsesModal, setShowResponsesModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [local_npub, setLocal_npub] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [buttonStates, setButtonStates] = useState({});
  const [responses, setResponses] = useState([]);
  const [filteredResponses, setFilteredResponses] = useState([]);
  const [language, setLanguage] = useState("es"); // Default to English
  const [showFifthAmendmentModal, setShowFifthAmendmentModal] = useState(false);
  const [showFourteenthAmendmentModal, setShowFourteenthAmendmentModal] =
    useState(false);

  const pauseTimeoutRef = useRef(null);

  const [showMenu, setShowMenu] = useState(false);
  const [showPrivacyPolicyModal, setShowPrivacyPolicyModal] = useState(false);
  const [warning, setWarning] = useState(false);

  const handleShowPrivacyPolicyModal = () => setShowPrivacyPolicyModal(true);
  const handleClosePrivacyPolicyModal = () => setShowPrivacyPolicyModal(false);

  const [showInstallAppModal, setShowInstallAppModal] = useState(false);

  const handleShowInstallAppModal = (hasWarning = false) => {
    if (hasWarning) {
      setWarning(true);
    }
    setShowInstallAppModal(true);
  };
  const handleCloseInstallAppModal = () => {
    if (warning) {
      setWarning(false);
    }
    setShowInstallAppModal(false);
  };

  const handleShowMenu = () => setShowMenu(true);
  const handleCloseMenu = () => setShowMenu(false);
  // ... (other state and function declarations)

  const handleShowFifthAmendmentModal = () => setShowFifthAmendmentModal(true);
  const handleCloseFifthAmendmentModal = () =>
    setShowFifthAmendmentModal(false);

  const handleShowFourteenthAmendmentModal = () =>
    setShowFourteenthAmendmentModal(true);
  const handleCloseFourteenthAmendmentModal = () =>
    setShowFourteenthAmendmentModal(false);

  const handleLanguageChange = () => {
    const newLanguage = language === "en" ? "es" : "en";

    setLanguage(newLanguage);

    if (local_npub) {
      try {
        const userDocRef = doc(database, "users", local_npub);
        updateDoc(userDocRef, { language: newLanguage });
        console.log("Language updated in Firestore to:", newLanguage);
      } catch (error) {
        console.error("Error updating language in Firestore:", error);
      }
    }
  };
  const handleAppModeChange = (selectedKey) => {
    // alert(selectedKey);
    setAppMode(selectedKey);
    setInstructions(promptSet[selectedKey]);
    resetTranscript();
    resetMessages();
  };

  const onSend = async () => {
    try {
      setIsSending(true);

      const languagePrefix =
        language === "es"
          ? "The user wants you speaking in spanish"
          : "The user wants you communicating in english";

      const statePrefix = `${prefixMap[appMode]} in ${user.state}`;
      await submitPrompt([
        {
          content: `${languagePrefix} ${
            appMode === "resume" ? "" : "" + statePrefix
          } ${instructions} ${promptText}`,
          role: "user",
        },
      ]);
      setPromptText("");
      resetTranscript();
      setIsSending(false);
    } catch (error) {
      alert("failed to run. need to fix this later");
      console.log("error", error);
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
    if (local_npub) {
      const userDocRef = doc(database, "users", local_npub);
      await updateDoc(userDocRef, { instructions: newInstructions });
      setInstructions(newInstructions);
    }
  };

  const {
    transcript,
    listening,
    resetTranscript,
    startListening,
    // stopListening,
    finalTranscript,
  } = useSpeechRecognition();

  // console.log("SpeechRec", SpeechRecognition);
  // Handle the start of speech recognition
  const handleVoiceStart = () => {
    if (isUnsupportedBrowser()) {
      handleShowInstallAppModal(true);
      return;
    } else {
      if (listening) {
        SpeechRecognition.stopListening();
      } else {
        console.log("language", language);

        SpeechRecognition.startListening({
          continuous: true,
          language: language === "en" ? "en-US" : "es-MX", // Set language dynamically
        });
      }
    }
  };

  useEffect(() => {
    console.log("transcript...", transcript);
    if (transcript) {
      setPromptText(transcript);
    }
  }, [transcript]);

  // Effect to handle the pause timeout after speech stops
  useEffect(() => {
    // Clear previous timeout if the transcript is updated (user starts speaking)
    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current);
    }

    // Set a timeout to stop recording after 1.75 seconds of inactivity
    if (listening && transcript) {
      pauseTimeoutRef.current = setTimeout(() => {
        // setPromptText(transcript);
        console.log("FINAL", finalTranscript);
        SpeechRecognition.stopListening(); // Automatically stop listening after 1.75 seconds
        console.log("Stopped listening due to inactivity.");
      }, 1750); // 1.75 seconds delay
    }

    // Cleanup when component unmounts or on next update
    return () => {
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current);
      }
    };
  }, [transcript, listening]);
  const saveResponse = async (msg, userMsg, messageId) => {
    // console.log("MSG", msg);
    if (local_npub) {
      // Update the button state to "Saving..." for the specific message
      setButtonStates((prev) => ({
        ...prev,
        [messageId]: lang[language].saving,
      }));

      const userDocRef = doc(database, "users", local_npub);
      const responsesCollectionRef = collection(userDocRef, "responses");

      await addDoc(responsesCollectionRef, {
        title: "",
        content: cleanInstructions(
          msg.content,
          instructions,
          prefixMap[appMode]
        ),
        original: promptText, // Store the original user message
        role: msg.role,
        createdAt: new Date().toISOString(),
        userMsg: cleanInstructions(
          userMsg?.content,
          instructions,
          prefixMap[appMode]
        ),
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
    if (local_npub) {
      const userDocRef = doc(database, "users", local_npub);
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

  const {
    generateNostrKeys,
    auth,
    // postNostrContent,
    // assignExistingBadgeToNpub,
  } = useSharedNostr(
    localStorage.getItem("local_npub"),
    localStorage.getItem("local_nsec")
  );

  const connectDID = async () => {
    setIsLoadingApp(true);
    // try {
    let id = localStorage.getItem("local_npub");
    let dbCheck = await loadUserObjectFromDB(id);
    console.log("dbcheck", dbCheck);
    if (!id || !dbCheck) {
      // const didDht = await DidDht.create({ publish: true });
      console.log("running");
      // const did = didDht.uri;
      const did = await generateNostrKeys();

      id = did.npub;
      console.log("ID", id);
      localStorage.setItem("local_npub", id);
      await setDoc(doc(database, "users", id), {
        local_npub: id,
        createdAt: new Date().toISOString(),
        state: "All states",
      });
    }
    setLocal_npub(id);
    loadUserInstructions(id);
    loadUserObjectFromDB(id);
    setIsLoadingApp(false);
    // } catch (error) {
    //   setIsLoadingApp(false);
    //   console.log("error", error);
    //   console.log("{error}", { error });
    // }
  };

  const loadUserObjectFromDB = async (id) => {
    try {
      const userDocRef = doc(database, "users", id);
      const docSnap = await getDoc(userDocRef);

      // console.log("snap exists", docSnap.data());
      if (docSnap.exists()) {
        const userData = docSnap.data();
        console.log("Loaded user data:", userData);

        if (userData.language) {
          setLanguage(userData.language);
        }

        // Update Zustand store
        const { setUser } = useUserStore.getState();
        // console.log("it ran");
        setUser(userData);
        // return userData.local_npub;
        console.log("it exists....");
        return true;
      } else {
        console.log("No such document!");
        return false;
      }
    } catch (error) {
      console.log("error");
    }
  };
  const loadUserInstructions = async (id) => {
    // const userDocRef = doc(database, "users", id);
    // const docSnap = await getDoc(userDocRef);
    // if (docSnap.exists() && docSnap.data().instructions) {
    //   setInstructions(docSnap.data().instructions);
    // } else {
    setInstructions(promptSet["undocumented"]);
    // }
  };

  useEffect(() => {
    console.log("WHY ! ! ! !  !!  ! ! ! ! ! ! ! ! ! ! ");
    connectDID();
  }, []);

  useEffect(() => {
    // window.scrollTo(0, document.body.scrollHeight);
    // console.log("messages", messages);
  }, [messages]);

  // console.log("user", user);

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
      }}
    >
      <div
        className="menu-icon"
        onClick={handleShowMenu}
        style={{
          position: "fixed",
          top: "12px", // Adjust this value as needed
          left: "12px", // Adjust this value as needed
          zIndex: 1000, // Ensures it stays above other elements
        }}
      >
        <Button
          variant="outline-secondary"
          className="menu-button"
          onClick={handleShowMenu}
          // style={{ border: "1px solid transparent" }}
          style={{ backgroundColor: "#FFFEF5", color: "black" }}
        >
          <FontAwesomeIcon icon={faBars} size="1x" />
        </Button>
      </div>

      {isLoadingApp ? (
        <div style={{ marginTop: 170, marginLeft: 24 }}>
          <Spinner />
        </div>
      ) : (
        <>
          <div
            className="chat-wrapper"
            style={{
              marginTop: 128,
              // marginLeft: 56,
            }}
          >
            <div>
              <img src={logo} width="96" />
              <span style={{ display: "flex", alignItems: "center" }}>
                <h4>{lang[language][`title.${appMode}`]}</h4>&nbsp;
                <Form>
                  {/* Dropdown for "undocumented" and "fafsa" */}
                  <Dropdown
                    style={{
                      backgroundColor: "#FFFEF5",
                    }}
                    onSelect={(selectedKey) => handleAppModeChange(selectedKey)}
                  >
                    <Dropdown.Toggle
                      variant="secondary"
                      id="dropdown-custom-components"
                      className="custom-dropdown-toggle"
                      style={{
                        width: "min-content",
                        transition: "min-width 0.3s ease", // Smooth width transition
                      }}
                    >
                      {/* {appMode === "undocumented" ? "Undocumented" : "FAFSA"} */}
                    </Dropdown.Toggle>

                    <Dropdown.Menu>
                      <Dropdown.Item eventKey="undocumented">
                        {lang[language][`title.undocumented`]}
                      </Dropdown.Item>
                      <Dropdown.Item eventKey="law">
                        {lang[language][`title.law`]}
                      </Dropdown.Item>
                      <Dropdown.Item eventKey="fafsa">
                        {" "}
                        {lang[language][`title.fafsa`]}
                      </Dropdown.Item>
                      <Dropdown.Item eventKey="resume">
                        {" "}
                        {lang[language][`title.resume`]}
                      </Dropdown.Item>
                      <Dropdown.Item eventKey="counselor">
                        {" "}
                        {lang[language][`title.counselor`]}
                      </Dropdown.Item>

                      <Dropdown.Item eventKey="career">
                        {lang[language]["title.career"] || "*Career Agent"}
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </Form>
              </span>
              <small>
                <b>{lang[language][`subtitle.${appMode}`]}</b>
              </small>
              <br />
              <Form>
                <Form.Check
                  type="switch"
                  id="language-switch"
                  label={lang[language].languageSwitch}
                  checked={language === "es"}
                  onChange={handleLanguageChange}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleLanguageChange();
                    }
                  }}
                />
              </Form>

              {appMode === "undocumented" ? (
                <>
                  <br />
                  <Button
                    variant="secondary"
                    onClick={handleShowFifthAmendmentModal}
                  >
                    {lang[language].fifthAmendment}
                  </Button>
                  &nbsp;&nbsp;
                  <Button
                    variant="secondary"
                    onClick={handleShowFourteenthAmendmentModal}
                  >
                    {lang[language].fourteenthAmendment}
                  </Button>
                </>
              ) : null}

              {appMode === "career" && (
                <div style={{ marginTop: 24 }}>
                  <CareerAgentWizard
                    local_npub={local_npub}
                    language={language}
                    onComplete={(finalData) => {
                      // Combine user data into an AI prompt
                      const combinedPitch = `
          Here is the user's draft elevator pitch and relevant info:
          Basic Info: ${JSON.stringify(finalData.basicInfo)}
          Core Competencies: ${JSON.stringify(finalData.coreCompetencies)}
          Draft Elevator Pitch: ${JSON.stringify(finalData.pitch)}

          Please provide concise feedback or suggestions for improving clarity, tone, and completeness of this pitch.
        `;

                      // const docRef = doc(database, "users", local_npub);
                      // const careerCollectionRef = collection(docRef, "careerData");

                      // addDoc(careerCollectionRef, {
                      //   finalData,
                      //   timestamp: new Date().toISOString(),
                      // });
                      // Then you can call your existing chat function
                      if (local_npub) {
                        const userDocRef = doc(database, "users", local_npub);
                        updateDoc(userDocRef, {
                          careerData: finalData,
                        });
                      }
                      submitPrompt([
                        {
                          role: "user",
                          content: combinedPitch,
                        },
                      ]);
                    }}
                  />
                </div>
              )}
            </div>

            {messages.length < 1 ? (
              <div className="empty">
                {appMode === "resume"
                  ? lang[language]["emptyChatInstructions.resume"]
                  : lang[language].emptyChatInstructions}
              </div>
            ) : (
              messages.map((msg, i) => {
                const messageId = msg.id || `msg-${i}`;

                return (
                  <div
                    className="message-wrapper"
                    key={messageId}
                    style={{ marginLeft: 56 }}
                  >
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
                          {!messages?.[messages?.length - 1]?.meta?.loading ? (
                            <Button
                              variant="dark"
                              size="sm"
                              onMouseDown={() =>
                                saveResponse(msg, messages[i - 1], messageId)
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  saveResponse(msg, messages[i - 1], messageId);
                                }
                              }}
                            >
                              {buttonStates[messageId] ||
                                lang[language].saveResponse}
                            </Button>
                          ) : null}
                          <hr />
                        </div>
                      ) : (
                        <div>
                          {msg.role === "user" ? (
                            <b>{lang[language]["messagePlaceholder"]}</b>
                          ) : null}
                          <Markdown>
                            {cleanInstructions(
                              msg.content,
                              promptSet[appMode],
                              `${prefixMap[appMode]} in ${user.state}`,
                              true
                            )}
                          </Markdown>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <div
            className="prompt-wrapper"
            style={
              {
                // border: "1px solid green",
              }
            }
          >
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
              }}
            >
              <Button
                variant="light"
                onMouseDown={handleVoiceStart}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    handleVoiceStart(); // Select the option on Enter or Space key
                  }
                }}
              >
                {listening ? (
                  <span className="listening-animation">
                    <PiMicrophoneFill size={24} />
                  </span>
                ) : (
                  <span className="idle-state">
                    <PiMicrophoneLight size={24} />
                  </span>
                )}
              </Button>
              <Form.Control
                as="textarea"
                rows={3}
                value={promptText}
                placeholder={lang[language].messagePlaceholder}
                onChange={(event) => setPromptText(event.target.value)}
                disabled={
                  messages.length > 0 &&
                  messages[messages.length - 1].meta.loading
                }
                style={{ resize: "vertical", overflow: "auto" }} // Allows resizing both horizontally and vertically
              />

              <Button
                variant="light"
                onMouseDown={onSend}
                disabled={isSending}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    onSend(); // Select the option on Enter or Space key
                  }
                }}
              >
                {/* &#8679; */}
                <FiSend size={16} />
              </Button>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {/* <br />
            <br /> */}
              {/* <Button size="sm" variant="tertiary" onMouseDown={handleShowModal}>
              {lang[language].modify}
            </Button> */}
              {/* <Button
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
            </Button> */}
              {/* <Button
              size="sm"
              variant="tertiary"
              onMouseDown={() => setShowSettingsModal(true)}
            >
              {lang[language].settings}
            </Button> */}
            </div>
          </div>
        </>
      )}

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
        local_npub={local_npub}
        loadResponses={loadResponses} // Pass the loadResponses function to the modal
      />

      <InstallAppModal
        show={showInstallAppModal}
        handleClose={handleCloseInstallAppModal}
        language={language}
        warning={warning}
        setWarning={setWarning}
      />

      {showSettingsModal ? (
        <SettingsModal
          language={language}
          show={showSettingsModal}
          handleClose={() => setShowSettingsModal(false)}
          updateUserId={(id) => {
            setLocal_npub(id);
            loadUserInstructions(id);
          }}
          auth={auth}
        />
      ) : null}

      <FifthAmendmentModal
        show={showFifthAmendmentModal}
        onHide={handleCloseFifthAmendmentModal}
        language={language}
      />
      <FourteenthAmendmentModal
        show={showFourteenthAmendmentModal}
        onHide={handleCloseFourteenthAmendmentModal}
        language={language}
      />

      <PrivacyPolicyModal
        show={showPrivacyPolicyModal}
        handleClose={handleClosePrivacyPolicyModal}
        language={language}
      />
      <Offcanvas
        show={showMenu}
        onHide={handleCloseMenu}
        placement="end"
        scroll
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>
            {lang[language].menuTitle || "Menu"}
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          {/* Column layout for full-width buttons */}
          <div className="d-flex flex-column" style={{ alignItems: "center" }}>
            <Form>
              <Form.Check
                type="switch"
                id="language-switch"
                label={lang[language].languageSwitch}
                checked={language === "es"}
                onChange={handleLanguageChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleLanguageChange();
                  }
                }}
              />
            </Form>
            <br />
            <Dropdown
              style={{
                backgroundColor: "#FFFEF5",
              }}
              onSelect={(selectedKey) => handleAppModeChange(selectedKey)}
            >
              <Dropdown.Toggle
                variant="secondary"
                id="dropdown-custom-components"
                className="custom-dropdown-toggle"
                style={{
                  width: "min-content",
                  transition: "min-width 0.3s ease", // Smooth width transition
                }}
              >
                {appMode === "law"
                  ? lang[language][`title.law`]
                  : appMode === "undocumented"
                  ? lang[language][`title.undocumented`]
                  : appMode === "fafsa"
                  ? lang[language][`title.fafsa`]
                  : appMode === "resume"
                  ? lang[language][`title.resume`]
                  : appMode === "career"
                  ? lang[language]["title.career"]
                  : appMode === "counselor"
                  ? lang[language][`title.counselor`]
                  : ""}
              </Dropdown.Toggle>

              <Dropdown.Menu>
                <Dropdown.Item eventKey="undocumented">
                  {lang[language][`title.undocumented`]}
                </Dropdown.Item>
                <Dropdown.Item eventKey="law">
                  {lang[language][`title.law`]}
                </Dropdown.Item>
                <Dropdown.Item eventKey="fafsa">
                  {" "}
                  {lang[language][`title.fafsa`]}
                </Dropdown.Item>
                <Dropdown.Item eventKey="resume">
                  {" "}
                  {lang[language][`title.resume`]}
                </Dropdown.Item>
                <Dropdown.Item eventKey="counselor">
                  {" "}
                  {lang[language][`title.counselor`]}
                </Dropdown.Item>
                <Dropdown.Item eventKey="career">
                  {" "}
                  {lang[language][`title.career`]}
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            <br />
            <Button
              // size="sm"
              variant="outline-secondary"
              onMouseDown={() => setShowSettingsModal(true)}
              style={{ width: "100%" }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  setShowSettingsModal(true);
                }
              }}
            >
              {lang[language].settings}
            </Button>
            <br />
            <Button
              // size="sm"
              variant="outline-secondary"
              onMouseDown={handleShowResponsesModal}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  handleShowResponsesModal();
                }
              }}
              style={{ width: "100%" }}
            >
              {lang[language].saved}
            </Button>
            <br />
            <Button
              variant="outline-secondary"
              onClick={() => handleShowInstallAppModal(false)}
              style={{ width: "100%" }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  handleShowInstallAppModal(false);
                }
              }}
            >
              {lang[language].installApp}
            </Button>

            <br />
            <Button
              variant="outline-secondary"
              onClick={handleShowPrivacyPolicyModal}
              style={{ width: "100%" }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  handleShowPrivacyPolicyModal();
                }
              }}
            >
              {lang[language].privacyPolicy}
            </Button>

            {/* Add more menu items here */}
            {/* <Button className="w-100 mb-3" variant="secondary">
                Another Action
              </Button> */}
          </div>
        </Offcanvas.Body>
      </Offcanvas>
    </div>
  );
};

export default App;
