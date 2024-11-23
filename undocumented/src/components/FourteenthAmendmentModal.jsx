import React from "react";
import { Modal, Button } from "react-bootstrap";
import Markdown from "react-markdown";
import { lang } from "../utils/utils";

const FourteenthAmendmentModal = ({ show, onHide, language }) => {
  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{lang[language].fourteenthAmendment}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Markdown>{lang[language].fourteenthAmendmentData}</Markdown>
        <Modal.Footer>
          <Button variant="tertiary" onMouseDown={onHide}>
            {lang[language].close}
          </Button>
        </Modal.Footer>
      </Modal.Body>
    </Modal>
  );
};

export default FourteenthAmendmentModal;
