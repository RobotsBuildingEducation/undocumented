import { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Form,
  Card,
  Row,
  Col,
  InputGroup,
  FormControl,
} from "react-bootstrap";
import {
  collection,
  doc,
  getDocs,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { database } from "../database/setup";
import { lang } from "../utils/utils";

const ResponsesModal = ({
  show,
  handleClose,
  local_npub,
  loadResponses,
  language,
}) => {
  const [responses, setResponses] = useState([]);
  const [filteredResponses, setFilteredResponses] = useState([]);
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [editedContent, setEditedContent] = useState("");
  const [editedTitle, setEditedTitle] = useState("");
  const [filterText, setFilterText] = useState("");

  useEffect(() => {
    if (show && local_npub) {
      const fetchResponses = async () => {
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
      };

      fetchResponses();
    }
  }, [show, local_npub]);

  const updateResponse = async () => {
    if (local_npub && selectedResponse) {
      const userDocRef = doc(database, "users", local_npub);
      const responseDocRef = doc(userDocRef, "responses", selectedResponse.id);
      await updateDoc(responseDocRef, {
        title: editedTitle,
        content: editedContent,
        updatedAt: new Date().toISOString(),
      });
      const updatedResponses = responses.map((resp) =>
        resp.id === selectedResponse.id
          ? { ...resp, title: editedTitle, content: editedContent }
          : resp
      );
      setResponses(updatedResponses);
      setFilteredResponses(updatedResponses);
      setSelectedResponse(null);
      setEditedContent("");
      setEditedTitle("");
    }
  };

  const deleteResponse = async (id) => {
    if (local_npub) {
      const userDocRef = doc(database, "users", local_npub);
      const responseDocRef = doc(userDocRef, "responses", id);
      await deleteDoc(responseDocRef);
      const updatedResponses = responses.filter((resp) => resp.id !== id);
      setResponses(updatedResponses);
      setFilteredResponses(updatedResponses);
      loadResponses(); // Refresh the responses in the parent component
    }
  };

  const filterResponses = (text) => {
    setFilterText(text);
    const formattedText = text.toLowerCase();
    if (text.trim() === "") {
      setFilteredResponses(responses);
    } else {
      setFilteredResponses(
        responses.filter((response) =>
          [
            response.title,
            response.content,
            new Date(response.createdAt).toLocaleString(),
          ].some((field) => field.toLowerCase().includes(formattedText))
        )
      );
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered fullscreen>
      <Modal.Header closeButton>
        <Modal.Title>{lang[language].savedResponses}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {!selectedResponse ? (
          <>
            <label>&nbsp;{lang[language].filter}</label>
            <InputGroup className="mb-3">
              <FormControl
                placeholder={lang[language].filterPlaceholder}
                value={filterText}
                onChange={(e) => filterResponses(e.target.value)}
              />
            </InputGroup>
          </>
        ) : (
          <Form>
            <Form.Group controlId="formEditTitle">
              <Form.Label>{lang[language].editTitle}</Form.Label>
              <Form.Control
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
              />
            </Form.Group>
            <br />
            <b> {selectedResponse?.userMsg}</b>
            <br />
            <br />
            <Form.Group controlId="formEditContent">
              <Form.Label>{lang[language].editContent}</Form.Label>
              <Form.Control
                as="textarea"
                rows={12}
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
              />
            </Form.Group>
            <br />
            <Button variant="dark" onMouseDown={updateResponse}>
              {lang[language].saveChanges}
            </Button>
            &nbsp; &nbsp;
            <Button
              variant="tertiary"
              onMouseDown={() => setSelectedResponse(null)}
            >
              {lang[language].cancel}
            </Button>
          </Form>
        )}
        {!selectedResponse && (
          <Row>
            {filteredResponses.map((response) => (
              <Col key={response.id} sm={12} md={6} lg={4} className="mb-3">
                <Card
                  style={{
                    height: "350px",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Card.Body
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      height: "100%",
                      padding: "1rem",
                    }}
                  >
                    <div style={{ overflow: "hidden" }}>
                      <Card.Title
                        style={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {response.title}
                      </Card.Title>
                      <Card.Text
                        style={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                        }}
                      >
                        {response?.userMsg?.substring(0, 100)}
                        <hr />
                        {response?.original} <br />
                        {response?.content?.substring(0, 100)}...
                      </Card.Text>
                    </div>
                    <div style={{ marginTop: "auto", textAlign: "center" }}>
                      <Card.Subtitle className="mb-2 text-muted">
                        {new Date(response.createdAt).toLocaleString()}
                      </Card.Subtitle>
                      <Button
                        variant="dark"
                        size="sm"
                        onMouseDown={() => {
                          setSelectedResponse(response);
                          setEditedTitle(response.title);
                          setEditedContent(response.content);
                        }}
                      >
                        {lang[language].view}
                      </Button>
                      &nbsp; &nbsp;
                      <Button
                        variant="tertiary"
                        size="sm"
                        onMouseDown={() => deleteResponse(response.id)}
                      >
                        {lang[language].delete}
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="tertiary" onMouseDown={handleClose}>
          {lang[language].close}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ResponsesModal;
