import React from "react";
import { Modal, Button } from "react-bootstrap";
import { IoShareOutline } from "react-icons/io5";
import { IoIosMore } from "react-icons/io";
import { BsPlusSquare } from "react-icons/bs";
import { LuBadgeCheck } from "react-icons/lu";

import { lang } from "../utils/utils";

const InstallAppModal = ({
  show,
  handleClose,
  language,
  warning,
  setWarning,
}) => {
  return (
    <Modal
      show={show}
      onHide={() => {
        handleClose();
      }}
      centered
      animation={!warning}
    >
      <Modal.Header closeButton>
        <Modal.Title>{lang[language].installApp}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {warning ? (
          <div
            style={{
              color: "#565656",
              fontWeight: "bold",
              backgroundColor: "#FAC897",
              padding: 10,
              borderRadius: 20,
            }}
          >
            {lang[language]["badBrowser"]}
            <br />
            <br />
          </div>
        ) : null}

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            paddingBottom: 24,
          }}
        >
          <IoIosMore size={32} />
          <br />
          1. {lang[language].installAppInstructions1}
        </div>
        <hr />
        <br />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            paddingBottom: 24,
          }}
        >
          <IoShareOutline size={32} />
          <br />
          2. {lang[language].installAppInstructions2}
        </div>
        <hr />
        <br />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            paddingBottom: 24,
          }}
        >
          <BsPlusSquare size={32} />
          <br />
          3. {lang[language].installAppInstructions3}
        </div>
        <hr />
        <br />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            paddingBottom: 24,
          }}
        >
          <LuBadgeCheck size={32} />
          <br />
          4. {lang[language].installAppInstructions4}
        </div>
        <br />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="tertiary" onClick={handleClose}>
          {lang[language].close}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default InstallAppModal;
