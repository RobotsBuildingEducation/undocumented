import { doc, getDoc, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  Container,
  Form,
  ProgressBar,
  Row,
  Col,
  Table,
} from "react-bootstrap";
import { database } from "../database/setup";

const CareerAgentWizard = ({ language, local_npub, onComplete }) => {
  const [canEdit, setCanEdit] = useState(false);
  // Steps: 1) Basic Info, 2) Core Competencies, 3) Elevator Pitch, 4) Review
  const [step, setStep] = useState(1);

  const [basicInfo, setBasicInfo] = useState({
    name: "",
    education: "",
    city: "",
    company: "",
    jobTitle: "",
    industry: "",
    projects: "",
  });

  const [coreCompetencies, setCoreCompetencies] = useState({
    drive: "",
    competencies: "",
    examples: "",
  });

  const [pitch, setPitch] = useState({
    intro: "",
    zoneOfGenius: "",
    uvpClose: "",
  });

  // --- 1) Load existing careerData from the user's doc
  useEffect(() => {
    if (!local_npub) return;

    const fetchCareerData = async () => {
      try {
        const userDocRef = doc(database, "users", local_npub);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
          const userData = docSnap.data();
          if (userData.careerData) {
            const {
              basicInfo = {},
              coreCompetencies = {},
              pitch = {},
            } = userData.careerData;

            setBasicInfo((prev) => ({ ...prev, ...basicInfo }));
            setCoreCompetencies((prev) => ({ ...prev, ...coreCompetencies }));
            setPitch((prev) => ({ ...prev, ...pitch }));
            setCanEdit(true);
          }
        }
      } catch (err) {
        console.error("Error loading career data:", err);
      }
    };

    fetchCareerData();
  }, [local_npub]);

  // Move to next/previous step
  const handleNext = () => setStep((s) => s + 1);
  const handlePrev = () => setStep((s) => s - 1);

  // --- 2) On Finish: compile data + update Firestore + call onComplete
  const handleFinish = async () => {
    const compiled = { basicInfo, coreCompetencies, pitch };

    if (local_npub) {
      try {
        const userDocRef = doc(database, "users", local_npub);
        await updateDoc(userDocRef, {
          careerData: compiled,
        });
        console.log("Career data successfully updated in Firestore.");
      } catch (error) {
        console.error("Error updating career data:", error);
      }
    }

    onComplete(compiled);
  };

  // Progress UI
  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  return (
    <Container className="my-4">
      <Row className="mb-4">
        <Col>
          <ProgressBar now={progress} label={`Step ${step} of ${totalSteps}`} />
        </Col>
      </Row>

      {/* STEP 1: Basic Info */}
      {step === 1 && (
        <Card className="mb-4 shadow-sm">
          <Card.Header as="h5">Step 1: Basic Information</Card.Header>
          <Card.Body>
            <Form.Group controlId="basicInfoName" className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                value={basicInfo.name}
                onChange={(e) =>
                  setBasicInfo({ ...basicInfo, name: e.target.value })
                }
              />
            </Form.Group>

            <Form.Group controlId="basicInfoEducation" className="mb-3">
              <Form.Label>Education</Form.Label>
              <Form.Control
                type="text"
                placeholder="(Optional if not recent grad)"
                value={basicInfo.education}
                onChange={(e) =>
                  setBasicInfo({ ...basicInfo, education: e.target.value })
                }
              />
            </Form.Group>

            <Form.Group controlId="basicInfoCity" className="mb-3">
              <Form.Label>City</Form.Label>
              <Form.Control
                type="text"
                value={basicInfo.city}
                onChange={(e) =>
                  setBasicInfo({ ...basicInfo, city: e.target.value })
                }
              />
            </Form.Group>

            <Form.Group controlId="basicInfoCompany" className="mb-3">
              <Form.Label>Company</Form.Label>
              <Form.Control
                type="text"
                value={basicInfo.company}
                onChange={(e) =>
                  setBasicInfo({ ...basicInfo, company: e.target.value })
                }
              />
            </Form.Group>

            <Form.Group controlId="basicInfoJobTitle" className="mb-3">
              <Form.Label>Job Title</Form.Label>
              <Form.Control
                type="text"
                value={basicInfo.jobTitle}
                onChange={(e) =>
                  setBasicInfo({ ...basicInfo, jobTitle: e.target.value })
                }
              />
            </Form.Group>

            <Form.Group controlId="basicInfoIndustry" className="mb-3">
              <Form.Label>Industry</Form.Label>
              <Form.Control
                type="text"
                value={basicInfo.industry}
                onChange={(e) =>
                  setBasicInfo({ ...basicInfo, industry: e.target.value })
                }
              />
            </Form.Group>

            <Form.Group controlId="basicInfoProjects" className="mb-3">
              <Form.Label>Recent projects (optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Key personal or professional projects"
                value={basicInfo.projects}
                onChange={(e) =>
                  setBasicInfo({ ...basicInfo, projects: e.target.value })
                }
              />
            </Form.Group>

            <div className="d-flex justify-content-end">
              <Button variant="primary" onClick={handleNext}>
                Next
              </Button>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* STEP 2: Core Competencies */}
      {step === 2 && (
        <Card className="mb-4 shadow-sm">
          <Card.Header as="h5">Step 2: Core Competencies</Card.Header>
          <Card.Body>
            <Form.Group controlId="coreCompetenciesDrive" className="mb-3">
              <Form.Label>What drives you?</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="Ex: 'I value curiosity...' or 'I believe in empowering...'"
                value={coreCompetencies.drive}
                onChange={(e) =>
                  setCoreCompetencies({
                    ...coreCompetencies,
                    drive: e.target.value,
                  })
                }
              />
            </Form.Group>

            <Form.Group controlId="coreCompetencies" className="mb-3">
              <Form.Label>Your key competencies</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="Ex: Problem-solving, Leadership, etc."
                value={coreCompetencies.competencies}
                onChange={(e) =>
                  setCoreCompetencies({
                    ...coreCompetencies,
                    competencies: e.target.value,
                  })
                }
              />
            </Form.Group>

            <Form.Group controlId="coreCompetenciesExamples" className="mb-3">
              <Form.Label>Give examples or short stories</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="E.g. 'Designed a robot that sorted recyclables...'"
                value={coreCompetencies.examples}
                onChange={(e) =>
                  setCoreCompetencies({
                    ...coreCompetencies,
                    examples: e.target.value,
                  })
                }
              />
            </Form.Group>

            <div className="d-flex justify-content-between">
              <Button variant="secondary" onClick={handlePrev}>
                Previous
              </Button>
              <Button variant="primary" onClick={handleNext}>
                Next
              </Button>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* STEP 3: Elevator Pitch */}
      {step === 3 && (
        <Card className="mb-4 shadow-sm">
          <Card.Header as="h5">Step 3: Elevator Pitch Draft</Card.Header>
          <Card.Body>
            <p>
              Create or refine a short pitch including:
              <br />
              1) Intro (Name, role, company)
              <br />
              2) What you do well (Zone of Genius)
              <br />
              3) UVP &amp; Close
            </p>

            <Form.Group controlId="pitchIntro" className="mb-3">
              <Form.Label>Introduction</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="My name is Sarah, I graduated from..."
                value={pitch.intro}
                onChange={(e) => setPitch({ ...pitch, intro: e.target.value })}
              />
            </Form.Group>
            <Form.Group controlId="pitchZone" className="mb-3">
              <Form.Label>Zone of Genius</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="I work specifically on building brand awareness..."
                value={pitch.zoneOfGenius}
                onChange={(e) =>
                  setPitch({ ...pitch, zoneOfGenius: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group controlId="pitchUVP" className="mb-3">
              <Form.Label>Unique Value Proposition + Close</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="I would love to learn more about how you're spreading brand awareness..."
                value={pitch.uvpClose}
                onChange={(e) =>
                  setPitch({ ...pitch, uvpClose: e.target.value })
                }
              />
            </Form.Group>

            <div className="d-flex justify-content-between">
              <Button variant="secondary" onClick={handlePrev}>
                Previous
              </Button>
              <Button variant="primary" onClick={handleNext}>
                Next
              </Button>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* STEP 4: Review & Submit */}
      {step === 4 && (
        <Card className="shadow-sm">
          <Card.Header as="h5">Step 4: Review &amp; Submit</Card.Header>
          <Card.Body>
            <Row>
              <Col md={6}>
                <h6>Basic Info</h6>
                <Table bordered size="sm">
                  <tbody>
                    <tr>
                      <th>Name</th>
                      <td>{basicInfo.name}</td>
                    </tr>
                    <tr>
                      <th>Education</th>
                      <td>{basicInfo.education}</td>
                    </tr>
                    <tr>
                      <th>City</th>
                      <td>{basicInfo.city}</td>
                    </tr>
                    <tr>
                      <th>Company</th>
                      <td>{basicInfo.company}</td>
                    </tr>
                    <tr>
                      <th>Job Title</th>
                      <td>{basicInfo.jobTitle}</td>
                    </tr>
                    <tr>
                      <th>Industry</th>
                      <td>{basicInfo.industry}</td>
                    </tr>
                    <tr>
                      <th>Projects</th>
                      <td>{basicInfo.projects}</td>
                    </tr>
                  </tbody>
                </Table>
              </Col>
              <Col md={6}>
                <h6>Core Competencies</h6>
                <Table bordered size="sm">
                  <tbody>
                    <tr>
                      <th>What Drives You</th>
                      <td>{coreCompetencies.drive}</td>
                    </tr>
                    <tr>
                      <th>Key Competencies</th>
                      <td>{coreCompetencies.competencies}</td>
                    </tr>
                    <tr>
                      <th>Examples / Stories</th>
                      <td>{coreCompetencies.examples}</td>
                    </tr>
                  </tbody>
                </Table>
              </Col>
            </Row>

            <Row className="mt-4">
              <Col>
                <h6>Elevator Pitch</h6>
                <Table bordered size="sm">
                  <tbody>
                    <tr>
                      <th>Introduction</th>
                      <td>{pitch.intro}</td>
                    </tr>
                    <tr>
                      <th>Zone of Genius</th>
                      <td>{pitch.zoneOfGenius}</td>
                    </tr>
                    <tr>
                      <th>UVP &amp; Close</th>
                      <td>{pitch.uvpClose}</td>
                    </tr>
                  </tbody>
                </Table>
              </Col>
            </Row>

            <p className="mt-3">
              Once you click finish, we'll compile these details and update
              Firestore.
            </p>
            <div className="d-flex justify-content-between">
              <Button variant="secondary" onClick={handlePrev}>
                Previous
              </Button>
              <Button variant="success" onClick={handleFinish}>
                Finish
              </Button>
            </div>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default CareerAgentWizard;
