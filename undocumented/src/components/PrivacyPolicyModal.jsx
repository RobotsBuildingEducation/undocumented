import React from "react";
import { Button, Modal } from "react-bootstrap";
import { lang } from "../utils/utils";
import Markdown from "react-markdown";

const PrivacyPolicyModal = ({ show, handleClose, language }) => {
  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{lang[language].privacyPolicy}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Markdown>{lang[language].privacyPolicyContent}</Markdown>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="tertiary" onClick={handleClose}>
          {lang[language].close}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PrivacyPolicyModal;
