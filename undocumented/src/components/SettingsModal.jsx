import { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Form,
  InputGroup,
  FormControl,
  Alert,
} from "react-bootstrap";
import isEmpty from "lodash/isEmpty";
import { doc, setDoc } from "firebase/firestore";

import { lang } from "../utils/utils";
import { database } from "../database/setup";
import USStatesDropdown from "./USStatesDropdown";
import { useUserStore } from "../store/useUserStore";

const SettingsModal = ({ show, handleClose, language, auth }) => {
  const { user, setUser } = useUserStore(); // Access Zustand store
  const [inputId, setInputId] = useState("");
  const [error, setError] = useState("");

  const [accountSwitchSuccess, setAccountSwitchSuccess] = useState(false);
  const [selectedState, setSelectedState] = useState("");

  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    setSelectedState(user?.state === "All states" ? "" : user?.state);
  }, []);

  useEffect(() => {
    // if (user?.local_npub) {
    //   setInputId(user.local_npub); // Pre-fill input with current user ID
    // }
  }, [user]);

  const isValidDID = (did) => {
    return /^did:(key|dht|ion):/.test(did);
  };

  const handleSave = async () => {
    console.log("inputID...", inputId);
    // if (inputId !== "") {
    // if (!isValidDID(inputId)) {
    //   setError(lang[language].invalidDid);
    //   setAccountSwitchSuccess(false);
    //   return;
    // }
    // return;
    // }

    console.log(auth(inputId));
    let newId = auth(inputId);
    try {
      const userDocRef = doc(database, "users", newId);
      const stateresult = isEmpty(selectedState) ? "All states" : selectedState;

      const updatedUser = {
        local_npub: newId || newId,
        state: stateresult,
        createdAt: new Date().toISOString(),
      };

      await setDoc(userDocRef, updatedUser, { merge: true }); // Save to Firestore

      localStorage.setItem("local_npub", updatedUser.local_npub); // Persist locally

      setUser(updatedUser); // Update Zustand store
      setAccountSwitchSuccess(true);
      setError("");
      setInputId("");
    } catch (err) {
      console.error("Error saving user data:", err);
      setError(lang[language].errorOccurred);
      setAccountSwitchSuccess(false);
    }
  };

  const handleCopy = () => {
    if (user?.local_npub) {
      navigator.clipboard.writeText(localStorage.getItem("local_nsec"));
      setCopySuccess(true);

      setTimeout(() => {
        setCopySuccess(false);
      }, 2000);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{lang[language].settings}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div
          style={{
            color: "#565656",
            fontWeight: "bold",
            backgroundColor: "#FEEBC8",
            padding: 10,
            borderRadius: 20,
          }}
        >
          {lang[language].instructions}
        </div>
        <br />
        <Button variant="outline-secondary" onMouseDown={handleCopy}>
          {copySuccess ? lang[language].copiedKeys : lang[language].copyKeys}
        </Button>
        <br />
        <br />
        <Button
          variant="link"
          href="https://patreon.com/NotesAndOtherStuff"
          target="_blank"
        >
          {lang[language].visit}
        </Button>
        <br /> <br />
        {accountSwitchSuccess && (
          <Alert variant="success">{lang[language].accountSwitched}</Alert>
        )}
        <Form>
          <Form.Group controlId="formCurrentUserId">
            <Form.Label>{lang[language].currentUserId}</Form.Label>
            <InputGroup>
              <FormControl
                type="text"
                value={
                  user?.local_npub ? `${user.local_npub.slice(0, 16)}...` : ""
                }
                readOnly
              />
            </InputGroup>
          </Form.Group>
          <br />
          <USStatesDropdown
            lang={lang}
            language={language}
            selectedState={selectedState}
            onSelectState={setSelectedState}
          />
          <br />
          <Form.Group controlId="formUserId">
            <Form.Label>{lang[language].switchAccounts}</Form.Label>
            <Form.Control
              type="text"
              placeholder={lang[language].enterId}
              value={inputId}
              onChange={(e) => setInputId(e.target.value)}
            />
            {error && <small className="text-danger">{error}</small>}
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="dark" onMouseDown={handleSave}>
          {lang[language].modify}
        </Button>
        <Button variant="tertiary" onMouseDown={handleClose}>
          {lang[language].close}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SettingsModal;
