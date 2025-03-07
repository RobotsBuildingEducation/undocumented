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
import { CiUser } from "react-icons/ci";

import { lang } from "../utils/utils";
import { database } from "../database/setup";
import USStatesDropdown from "./USStatesDropdown";
import { useUserStore } from "../store/useUserStore";

const SettingsModal = ({ show, handleClose, language, auth }) => {
  const { user, setUser } = useUserStore();
  const [inputId, setInputId] = useState("");
  const [error, setError] = useState("");
  const [accountSwitchSuccess, setAccountSwitchSuccess] = useState(false);
  const [profileUpdateSuccess, setProfileUpdateSuccess] = useState(false);

  const [selectedState, setSelectedState] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    setSelectedState(user?.state === "All states" ? "" : user?.state);
  }, [user]);

  const isValidDID = (did) => {
    return /^did:(key|dht|ion):/.test(did);
  };

  // Updates only the state field in the user profile
  const handleUpdateProfile = async () => {
    try {
      const userDocRef = doc(database, "users", user.local_npub);
      const stateresult = isEmpty(selectedState) ? "All states" : selectedState;

      await setDoc(userDocRef, { state: stateresult }, { merge: true });
      setUser({ ...user, state: stateresult });
      setError("");
      setProfileUpdateSuccess(true);
      // Clear success message after 2 seconds
      setTimeout(() => setProfileUpdateSuccess(false), 2000);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(lang[language].errorOccurred);
    }
  };

  // Switches accounts using the provided ID
  const handleSwitchAccount = async () => {
    if (inputId.trim() === "") {
      setError(lang[language].invalidDid);
      return;
    }
    // if (!isValidDID(inputId)) {
    //   setError(lang[language].invalidDid);
    //   setAccountSwitchSuccess(false);
    //   return;
    // }
    try {
      const newId = auth(inputId);
      const userDocRef = doc(database, "users", newId);
      const updatedUser = {
        local_npub: newId,
        createdAt: new Date().toISOString(),
      };

      await setDoc(userDocRef, updatedUser, { merge: true });
      localStorage.setItem("local_npub", updatedUser.local_npub);
      setUser(updatedUser);
      setAccountSwitchSuccess(true);
      setError("");
      setInputId("");
    } catch (err) {
      console.error("Error switching account:", err);
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
        <div style={{ paddingBottom: 8 }}>
          <CiUser />
          {user?.local_npub ? `${user.local_npub.slice(0, 16)}...` : ""}
        </div>
        <Button variant="outline-secondary" onMouseDown={handleCopy}>
          {copySuccess ? lang[language].copiedKeys : lang[language].copyKeys}
        </Button>
        <br />
        <br />
        {accountSwitchSuccess && (
          <Alert variant="success">
            {lang[language].accountSwitched || "Account switched successfully!"}
          </Alert>
        )}
        <Form>
          <USStatesDropdown
            lang={lang}
            language={language}
            selectedState={selectedState}
            onSelectState={setSelectedState}
          />

          <Button
            variant="outline-secondary"
            onMouseDown={handleUpdateProfile}
            style={{
              marginTop: "8px",
            }}
          >
            {lang[language].updateProfileButton}
          </Button>
          {profileUpdateSuccess && (
            <Alert variant="success" style={{ marginTop: 10 }}>
              {lang[language].profileUpdated || "Profile updated successfully!"}
            </Alert>
          )}
          <br />
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
          <Button
            variant="outline-secondary"
            onMouseDown={handleSwitchAccount}
            style={{
              marginTop: "8px",
            }}
          >
            {lang[language].switchAccount}
          </Button>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="tertiary" onMouseDown={handleClose}>
          {lang[language].close}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SettingsModal;
