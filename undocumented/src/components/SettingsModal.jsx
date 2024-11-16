import { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Form,
  InputGroup,
  FormControl,
  Alert,
} from "react-bootstrap";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { database } from "../database/setup";
import { lang } from "../utils/utils";

const SettingsModal = ({ show, handleClose, updateUserId, language }) => {
  const [inputId, setInputId] = useState("");
  const [error, setError] = useState("");
  const [currentId, setCurrentId] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);
  const [accountSwitchSuccess, setAccountSwitchSuccess] = useState(false);

  useEffect(() => {
    const storedId = localStorage.getItem("uniqueId");
    if (storedId) {
      setCurrentId(storedId);
    }
  }, []);

  const isValidDID = (did) => {
    return /^did:(key|dht|ion):/.test(did);
  };

  const handleSave = async () => {
    if (!isValidDID(inputId)) {
      setError(lang[language].invalidDid);
      setAccountSwitchSuccess(false);
      return;
    }

    try {
      const userDocRef = doc(database, "users", inputId);
      const docSnap = await getDoc(userDocRef);

      if (!docSnap.exists()) {
        await setDoc(userDocRef, {
          uniqueId: inputId,
          createdAt: new Date().toISOString(),
        });
      }

      localStorage.setItem("uniqueId", inputId);
      updateUserId(inputId);
      setCurrentId(inputId);
      setAccountSwitchSuccess(true);
      setError("");
    } catch (err) {
      console.error("Error checking user ID:", err);
      setError(lang[language].errorOccurred);
      setAccountSwitchSuccess(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(currentId);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{lang[language].title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {lang[language].instructions}
        <br />
        <br />
        {accountSwitchSuccess && (
          <Alert variant="success">{lang[language].accountSwitched}</Alert>
        )}
        <Form>
          <Form.Group controlId="formCurrentUserId">
            <Form.Label>{lang[language].currentUserId}</Form.Label>
            <InputGroup>
              <FormControl
                type="text"
                value={`${currentId.slice(0, 16)}...`}
                readOnly
              />
              <Button variant="outline-secondary" onMouseDown={handleCopy}>
                {copySuccess ? lang[language].copied : lang[language].copy}
              </Button>
            </InputGroup>
          </Form.Group>
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
          {lang[language].switch}
        </Button>
        <Button
          variant="link"
          href="https://robotsbuildingeducation.com"
          target="_blank"
        >
          {lang[language].visit}
        </Button>
        <Button variant="tertiary" onMouseDown={handleClose}>
          {lang[language].close}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SettingsModal;
