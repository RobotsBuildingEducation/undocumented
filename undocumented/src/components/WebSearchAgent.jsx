import React, { useEffect, useState } from "react";
import { Button, Spinner, Form, Modal } from "react-bootstrap";
import Markdown from "react-markdown";
import { MdSupportAgent } from "react-icons/md";
import { doc, getDoc } from "firebase/firestore";
import { database } from "../database/setup";
import { useWebSearchAgent } from "../hooks/useWebSearchAgent";
import { lang } from "../utils/utils";

export const WebSearchAgent = ({
  didKey,
  showModal,
  setShowModal,
  language,
}) => {
  // State to control modal visibility.

  // Separate fields for city and state.
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  // Field for any additional info.
  const [additionalInfo, setAdditionalInfo] = useState("");
  // Option to include profile info.
  const [includeProfile, setIncludeProfile] = useState(false);
  const [profile, setProfile] = useState(null);

  // Hook to call the search agent.
  const { fullResponse, messages, loading, submitPrompt } = useWebSearchAgent({
    model: "gpt-4o-mini",
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    temperature: 0.9,
    useWebSearch: true,
  });

  // Fetch the user's profile info from Firestore if available.
  useEffect(() => {
    const fetchProfile = async () => {
      if (!didKey) return;
      try {
        const docRef = doc(database, "users", didKey);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile({
            description: docSnap.data().description,
          });
        } else {
          console.error("No profile data found for", didKey);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };
    fetchProfile();
  }, [didKey]);

  // Build and submit the query when the user clicks "Start Search".
  const handleStartSearch = async () => {
    let query = `City: ${city}\nState: ${stateName}\n\n`;
    if (additionalInfo.trim().length > 0) {
      query += `Additional Info: ${additionalInfo}\n\n`;
    }
    // Optionally include profile info.
    if (includeProfile && profile) {
      query += `Profile Info: ${JSON.stringify(profile, null, 2)}\n\n`;
    }
    // Append a date requirement.
    const today = new Date().toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    query += `The user is undocumented and is searching for legal assistance to navigate law enforcement. The assistance must be accessible and affordable. Return a list outlining the name, expected costs or fees (cost or fees must be reported.), phone number and address (if available) and website link in list format. Do not use headers, only use bold.`;

    query += ` The user is speaking ${
      language === "en" ? "English" : "Spanish"
    } so return your results in ${language === "en" ? "English" : "Spanish"}.`;

    await submitPrompt([{ content: query, role: "user" }]);
  };

  // Render the response from the agent.
  const renderChatContent = () => {
    if (loading) {
      return (
        <div className="text-center py-4">
          <Spinner animation="border" role="status">
            <span className="sr-only">
              {lang[language]["webSearchAgent.spinnerText"]}
            </span>
          </Spinner>
          <p className="mt-3">{lang[language]["webSearchAgent.spinnerText"]}</p>
        </div>
      );
    } else if (fullResponse) {
      return (
        <div>
          {fullResponse.output &&
            fullResponse.output.map((item, idx) => {
              if (item.type === "message") {
                const outputTextItem = item.content.find(
                  (c) => c.type === "output_text"
                );
                if (!outputTextItem) return null;
                return (
                  <div
                    key={idx}
                    style={{
                      padding: "16px",
                      border: "1px solid #e2e8f0",
                      borderRadius: "4px",
                      marginBottom: "16px",
                    }}
                  >
                    <Markdown children={outputTextItem.text} />
                  </div>
                );
              }
              return null;
            })}
        </div>
      );
    } else if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      return (
        <div>
          <h5>
            {lastMessage.role === "assistant"
              ? lang[language]["webSearchAgent.resultsTitle"]
              : lang[language]["webSearchAgent.queryTitle"]}
          </h5>
          <p style={{ whiteSpace: "pre-wrap", fontSize: "16px" }}>
            {lastMessage.content}
          </p>
        </div>
      );
    } else {
      return <p>{lang[language]["webSearchAgent.noResults"]}</p>;
    }
  };

  return (
    <>
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {lang[language]["webSearchAgent.modalTitle"]}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>{lang[language]["webSearchAgent.description"]}</div>
          <br />

          <Form>
            <Form.Group controlId="city">
              <Form.Label style={{ fontWeight: "bold" }}>
                {lang[language]["webSearchAgent.cityLabel"]}
              </Form.Label>
              <Form.Control
                type="text"
                placeholder={lang[language]["webSearchAgent.cityPlaceholder"]}
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </Form.Group>
            <Form.Group
              controlId="state"
              className="mt-3"
              style={{ fontWeight: "bold" }}
            >
              <Form.Label>
                {lang[language]["webSearchAgent.stateLabel"]}
              </Form.Label>
              <Form.Control
                type="text"
                placeholder={lang[language]["webSearchAgent.statePlaceholder"]}
                value={stateName}
                onChange={(e) => setStateName(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="additionalInfo" className="mt-3">
              <Form.Label style={{ fontWeight: "bold" }}>
                {lang[language]["webSearchAgent.additionalInfoLabel"]}
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder={
                  lang[language]["webSearchAgent.additionalInfoPlaceholder"]
                }
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
              />
            </Form.Group>
            {/* <Form.Group controlId="includeProfile" className="mt-3">
              <Form.Check
                type="checkbox"
                label="Include my profile info"
                checked={includeProfile}
                onChange={(e) => setIncludeProfile(e.target.checked)}
              />
            </Form.Group> */}
          </Form>
          <br />
          <div
            className="mt-3"
            style={{
              display: "flex",
              justifyContent: "right",
            }}
          >
            <Button variant="dark" onClick={handleStartSearch}>
              {lang[language]["webSearchAgent.startSearchButton"]}
            </Button>
          </div>
          {/* <hr /> */}
          <br />
          <br />
          {renderChatContent()}
        </Modal.Body>
      </Modal>
    </>
  );
};
