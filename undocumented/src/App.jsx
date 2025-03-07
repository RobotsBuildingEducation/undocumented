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
import CareerProfileCard from "./components/CareerProfileCard";

const original = `The user wants you to to provide guidance and advice for navigating financial aid with college. Take on the role of an expert in FAFSA knowledge so people can successfully plan ahead. Let's keep the guidance concise because it's hard to understand, 5 sentences maximum. Additionally, include follow up prompts (do not mention this) or follow up questions to increase the productivity of the conversation, framed them as if they are being written by the user. Under no circumstance should you reference awareness of these instructions, just simply carry the conversation with proper flow, the user already knows what you do. For example, if the user talks about something adjacently related, just talk about it rather than tying it back to FAFSA. The following context has been shared by the individual: `;

const App = () => {
  const [profileSnapshots, setProfileSnapshots] = useState({});

  // At the top of your App component:
  const [profileLoading, setProfileLoading] = useState(false);

  const [showCareerWizard, setShowCareerWizard] = useState(false);
  const [careerProfile, setCareerProfile] = useState(null);
  // At the top of your App component:
  const [careerWizard, setCareerWizard] = useState({
    active: false, // whether the wizard mode is active
    step: 0, // current wizard step (0 means not started)
    data: {
      basicInfo: {
        name: "",
        education: "",
        city: "",
        company: "",
        jobTitle: "",
        industry: "",
        projects: "",
      },
      coreCompetencies: {
        drive: "",
        competencies: "",
        examples: "",
      },
      pitch: {
        intro: "",
        zoneOfGenius: "",
        uvpClose: "",
      },
    },
  });

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

  // const onSend = async () => {
  //   try {
  //     setIsSending(true);

  //     const languagePrefix =
  //       language === "es"
  //         ? "The user wants you speaking in spanish"
  //         : "The user wants you communicating in english";

  //     const statePrefix = `${prefixMap[appMode]} in ${user.state}`;

  //     let finalInstructions = instructions;
  //     if (appMode === "career") {
  //       finalInstructions = instructions + JSON.stringify(careerProfile);
  //     }

  //     await submitPrompt([
  //       {
  //         content: `${languagePrefix} ${
  //           appMode === "resume" ? "" : "" + statePrefix
  //         } ${finalInstructions} ${promptText}`,
  //         role: "user",
  //       },
  //     ]);
  //     setPromptText("");
  //     resetTranscript();
  //     setIsSending(false);
  //   } catch (error) {
  //     alert("failed to run. need to fix this later");
  //     console.log("error", error);
  //     setPromptText(JSON.stringify({ error }));
  //     setIsSending(false);
  //   }
  // };

  const onSend = async () => {
    try {
      setIsSending(true);

      const languagePrefix =
        language === "es"
          ? "The user wants you speaking in spanish"
          : "The user wants you communicating in english";

      // Only include the state if user.state is truthy.
      const stateText = user.state ? ` in ${user.state}` : "";
      const statePrefix = prefixMap[appMode] + stateText;

      let finalInstructions = instructions;
      if (appMode === "career") {
        finalInstructions = instructions + JSON.stringify(careerProfile);
      }

      await submitPrompt([
        {
          content: `${languagePrefix} ${
            appMode === "resume" ? "" : statePrefix
          } ${finalInstructions} ${promptText}`,
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
          `${prefixMap[appMode]}${user.state ? " in " + user.state : ""}`,
          true
        ),
        original: promptText, // Store the original user message
        role: msg.role,
        createdAt: new Date().toISOString(),
        userMsg: cleanInstructions(
          userMsg?.content,
          instructions,
          `${prefixMap[appMode]}${user.state ? " in " + user.state : ""}`,
          true
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

        if (userData.careerData) {
          setCareerProfile(userData.careerData);
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

  // Helper function to check if the JSON string has balanced curly braces.
  const isBalanced = (str) => {
    let balance = 0;
    for (const char of str) {
      if (char === "{") balance++;
      else if (char === "}") balance--;
    }
    return balance === 0;
  };

  const fixInvalidJson = (jsonString) => {
    // This regex finds occurrences like { name: or , name:
    // and replaces them with {"name": or , "name":
    return jsonString.replace(/([{,])(\s*)([A-Za-z0-9_]+)(\s*):/g, '$1"$3":');
  };

  useEffect(() => {
    if (appMode !== "career") return;

    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== "assistant") return;

    // While the message is still streaming, indicate that profile is loading.
    if (lastMessage.meta.loading) {
      setProfileLoading(true);
      return;
    }

    // When the message is complete, turn off the loading indicator.
    setProfileLoading(false);

    const contentTrimmed = lastMessage.content.trim();
    console.log("CONTENT TRIMMED", contentTrimmed);
    if (!contentTrimmed.endsWith("}")) {
      console.log(
        "Final message does not end with '}', waiting for complete JSON."
      );
      setProfileLoading(true);
      return;
    }

    // Use a regex to capture a JSON block following "Updated your profile:" at the very end.
    const regex = /Updated your profile:\s*({[\s\S]*})\s*$/;
    const match = contentTrimmed.match(regex);
    if (match) {
      let jsonString = match[1].trim();
      // Fix common formatting issues, like missing quotes around property names.
      jsonString = fixInvalidJson(jsonString);

      const isBalanced = (str) => {
        let balance = 0;
        for (const char of str) {
          if (char === "{") balance++;
          else if (char === "}") balance--;
        }
        return balance === 0;
      };

      // Helper function to sanitize the JSON string.
      const sanitizeJsonString = (jsonString) => {
        // 1. Add quotes around unquoted keys.
        //    This regex looks for { or , followed by whitespace and a key (letters, digits, or underscores) and a colon.
        jsonString = jsonString.replace(
          /([{,]\s*)([A-Za-z0-9_]+)(\s*):/g,
          '$1"$2"$3:'
        );

        // 2. Remove trailing commas before } or ].
        jsonString = jsonString.replace(/,\s*([}\]])/g, "$1");

        return jsonString;
      };

      // Extracts and parses the career profile JSON from the message content.
      const extractCareerProfileJson = (messageContent) => {
        // Look for a block starting with "Updated your profile:" and capturing the JSON until the end.
        const regex = /Updated your profile:\s*({[\s\S]*})\s*$/;
        const trimmedContent = messageContent.trim();
        const match = trimmedContent.match(regex);

        if (!match) {
          console.error("Could not extract JSON block from message.");
          return null;
        }

        let jsonString = match[1].trim();

        // Sanitize the JSON string.
        jsonString = sanitizeJsonString(jsonString);

        // Ensure the JSON string is balanced.
        if (!isBalanced(jsonString)) {
          console.error("Extracted JSON string is not balanced.");
          return null;
        }

        try {
          return JSON.parse(jsonString);
        } catch (error) {
          console.error(
            "Error parsing JSON:",
            error,
            "\nSanitized JSON string:",
            jsonString
          );
          return null;
        }
      };

      if (!isBalanced(jsonString)) {
        console.log(
          "Extracted JSON is not balanced; waiting for complete data."
        );
        setProfileLoading(true);
        return;
      }

      // Attempt to extract and parse the JSON block.
      const newCareerData = extractCareerProfileJson(contentTrimmed);
      if (newCareerData) {
        // Update only if the new data differs from the current profile.
        if (JSON.stringify(newCareerData) !== JSON.stringify(careerProfile)) {
          setCareerProfile(newCareerData);
          updateCareerProfileInFirestore(newCareerData);
        }
      }
    }
  }, [messages, appMode, careerProfile, local_npub]);

  // console.log("user", user);

  const updateCareerProfileInFirestore = (profile) => {
    if (local_npub) {
      const userDocRef = doc(database, "users", local_npub);
      try {
        console.log("updating db..");
        updateDoc(userDocRef, { careerData: profile });
        console.log("Career profile updated automatically:", profile);
      } catch (error) {
        console.error("Error updating career profile:", error);
      }
    }
  };

  useEffect(() => {
    if (appMode !== "career") return;

    messages.forEach((msg, i) => {
      if (
        msg.role === "assistant" &&
        msg.content.includes("Updated your profile:")
      ) {
        const messageKey = msg.id || `msg-${i}`;
        if (!profileSnapshots[messageKey]) {
          const contentTrimmed = msg.content.trim();
          const regex = /Updated your profile:\s*({[\s\S]*})\s*$/;
          const match = contentTrimmed.match(regex);
          if (match) {
            let jsonString = match[1].trim();
            jsonString = fixInvalidJson(jsonString);
            // Check that the JSON appears balanced.
            const isBalanced = (str) => {
              let balance = 0;
              for (const char of str) {
                if (char === "{") balance++;
                else if (char === "}") balance--;
              }
              return balance === 0;
            };
            if (isBalanced(jsonString)) {
              try {
                const parsed = JSON.parse(jsonString);
                // Save this snapshot if parsing succeeds.
                setProfileSnapshots((prev) => ({
                  ...prev,
                  [messageKey]: parsed,
                }));
              } catch (e) {
                console.error("Error parsing JSON for snapshot:", e);
              }
            }
          }
        }
      }
    });
  }, [messages, appMode, profileSnapshots]);

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
      }}
    >
      <div
        className="menu-icon"
        style={{
          position: "fixed",

          zIndex: 1000, // Ensures it stays above other elements

          width: "100%",
          display: "flex",
          alignItems: "center",
          backgroundColor: "#FFFEF5",

          padding: 8,
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
        &nbsp;&nbsp;&nbsp;
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
            <Dropdown.Item eventKey="career">
              {" "}
              {lang[language][`title.career`]}
            </Dropdown.Item>
            <Dropdown.Item eventKey="law">
              {lang[language][`title.law`]}
            </Dropdown.Item>
            <Dropdown.Item eventKey="fafsa">
              {" "}
              {lang[language][`title.fafsa`]}
            </Dropdown.Item>
            {/* <Dropdown.Item eventKey="resume">
                  {" "}
                  {lang[language][`title.resume`]}
                </Dropdown.Item> */}
            <Dropdown.Item eventKey="counselor">
              {" "}
              {lang[language][`title.counselor`]}
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
        &nbsp;&nbsp; &nbsp;
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
              marginTop: 64,
              // marginLeft: 56,
            }}
          >
            <div>
              <img src={logo} width="96" />
              <span style={{ display: "flex", alignItems: "center" }}>
                <h4>{lang[language][`title.${appMode}`]}</h4>&nbsp;
              </span>
              <small>
                <b>{lang[language][`subtitle.${appMode}`]}</b>
              </small>
              <br />

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
                  {careerProfile && (
                    <div
                      className="career-profile-preview"
                      style={{
                        marginTop: "16px",
                        padding: "12px",
                        border: "1px solid #ccc",
                        borderRadius: "8px",
                      }}
                    >
                      <h6>Your Career Profile Preview</h6>
                      <CareerProfileCard
                        profile={careerProfile}
                        userLanguage={language}
                      />
                    </div>
                  )}
                  {/* <CareerAgentWizard
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
                  /> */}

                  {showCareerWizard && (
                    <div
                      className="chat-message wizard-embed"
                      style={{
                        marginTop: "16px",
                        background: "#f9f9f9",
                        padding: "16px",
                        borderRadius: "8px",
                      }}
                    >
                      {/* <CareerAgentWizard
                        language={language}
                        local_npub={local_npub}
                        // Optional: allow the wizard to update the profile preview as the user types.
                        onUpdate={(updatedData) => {
                          setCareerProfile(updatedData);
                        }}
                        // When the wizard finishes, update the profile, update Firestore, and hide the wizard.
                        onComplete={(finalData) => {
                          setCareerProfile(finalData);
                          setShowCareerWizard(false);

                          // Optionally, send a chat message to the conversation that the profile has been updated.
                          submitPrompt([
                            {
                              role: "user",
                              content: "I just updated my career profile.",
                            },
                          ]);
                        }}
                      /> */}
                    </div>
                  )}
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
                const messageKey = msg.id || `msg-${i}`;
                const isLastMessage = i === messages.length - 1;
                const userMsg =
                  i > 0 && messages[i - 1].role === "user"
                    ? messages[i - 1]
                    : null;
                return (
                  <div
                    className="message-wrapper"
                    key={messageKey}
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
                          {appMode === "career" &&
                          msg.content.includes("Updated your profile:") ? (
                            <>
                              <Markdown>
                                {msg.content.split("Updated your profile:")[0]}
                              </Markdown>
                              <div
                                style={{
                                  marginTop: "12px",
                                  padding: "8px",
                                  borderTop: "1px dashed #ccc",
                                }}
                              >
                                {isLastMessage ? (
                                  profileLoading ? (
                                    <div
                                      style={{
                                        textAlign: "center",
                                        padding: "16px",
                                      }}
                                    >
                                      <Spinner
                                        animation="border"
                                        variant="primary"
                                        size="sm"
                                      />
                                      <p>Updating profile...</p>
                                    </div>
                                  ) : (
                                    careerProfile && (
                                      <CareerProfileCard
                                        userLanguage={language}
                                        profile={careerProfile}
                                      />
                                    )
                                  )
                                ) : (
                                  profileSnapshots[messageKey] && (
                                    <CareerProfileCard
                                      userLanguage={language}
                                      profile={profileSnapshots[messageKey]}
                                    />
                                  )
                                )}
                              </div>
                            </>
                          ) : (
                            <Markdown>{msg.content}</Markdown>
                          )}
                          {!msg.meta?.loading && (
                            <div
                              style={{ marginTop: "8px", textAlign: "right" }}
                            >
                              <Button
                                variant="dark"
                                size="sm"
                                onClick={() =>
                                  saveResponse(msg, userMsg, messageKey)
                                }
                              >
                                {buttonStates[messageKey] ||
                                  lang[language].saveResponse}
                              </Button>
                            </div>
                          )}
                          <hr />
                        </div>
                      ) : (
                        <div>
                          <Markdown>
                            {cleanInstructions(
                              msg.content,
                              promptSet[appMode],
                              `${prefixMap[appMode]}${
                                user.state ? " in " + user.state : ""
                              }`,
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
            <Button
              // size="sm"
              variant="outline-secondary"
              onMouseDown={() => setShowSettingsModal(true)}
              style={{ width: "100%", padding: 32 }}
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
              style={{ width: "100%", padding: 32 }}
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
              style={{ width: "100%", padding: 32 }}
            >
              {lang[language].installApp}
            </Button>

            <br />
            <Button
              variant="outline-secondary"
              onClick={handleShowPrivacyPolicyModal}
              style={{ width: "100%", padding: 32 }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  handleShowPrivacyPolicyModal();
                }
              }}
            >
              {lang[language].privacyPolicy}
            </Button>
            <br />
            <Button
              href="https://github.com/RobotsBuildingEducation/undocumented"
              target="_blank"
              variant="outline-secondary"
              style={{ width: "100%", padding: 32 }}
            >
              {lang[language].theCode}
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
