import { addDoc, collection, doc } from "firebase/firestore";
import React, { useState } from "react";
import { Button, Form, ProgressBar } from "react-bootstrap";
import { database } from "../database/setup";

/**
 * A multi-step form that collects user’s info and pitch.
 * Each step is displayed conditionally; user clicks “Next” to proceed.
 */
const CareerAgentWizard = ({ language, onComplete, local_npub }) => {
  const [careerData, setCareerData] = useState(null);

  //   window.alert("what the frick");
  // Steps: 1) Basic Info, 2) Core Competencies, 3) Elevator Pitch, 4) Review
  const [step, setStep] = useState(1);

  // Gather user input
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

  useEffect(() => {
    if (!local_npub) return;

    const fetchCareerData = async () => {
      try {
        // Suppose you store each user’s career data as a single doc
        // in a sub-collection "careerData" or maybe just a single doc "careerData"
        const userDocRef = doc(database, "users", local_npub);
        const careerDataRef = doc(userDocRef, "careerData", "latest");
        // or however you structure it

        const careerSnap = await getDoc(careerDataRef);
        if (careerSnap.exists()) {
          setCareerData(careerSnap.data());
        }
      } catch (err) {
        console.error("Error loading career data:", err);
      }
    };

    fetchCareerData();
  }, [local_npub]);

  // Move to next step
  const handleNext = () => setStep((prev) => prev + 1);
  // Move to previous step
  const handlePrev = () => setStep((prev) => prev - 1);

  // When user finalizes the wizard, we call onComplete with the entire data
  const handleFinish = () => {
    // Combine everything into an object
    const compiled = {
      basicInfo,
      coreCompetencies,
      pitch,
    };
    onComplete(compiled);
  };

  // Optionally, you can also track progress with a progress bar
  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  return (
    <div style={{ marginTop: 24 }}>
      <ProgressBar now={progress} label={`Step ${step} of ${totalSteps}`} />

      {step === 1 && (
        <div>
          <h5>Basic Information</h5>
          <Form.Group controlId="basicInfoName" className="mb-2">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              value={basicInfo.name}
              onChange={(e) =>
                setBasicInfo({ ...basicInfo, name: e.target.value })
              }
            />
          </Form.Group>
          <Form.Group controlId="basicInfoEducation" className="mb-2">
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
          <Form.Group controlId="basicInfoCity" className="mb-2">
            <Form.Label>City</Form.Label>
            <Form.Control
              type="text"
              value={basicInfo.city}
              onChange={(e) =>
                setBasicInfo({ ...basicInfo, city: e.target.value })
              }
            />
          </Form.Group>
          <Form.Group controlId="basicInfoCompany" className="mb-2">
            <Form.Label>Company</Form.Label>
            <Form.Control
              type="text"
              value={basicInfo.company}
              onChange={(e) =>
                setBasicInfo({ ...basicInfo, company: e.target.value })
              }
            />
          </Form.Group>
          <Form.Group controlId="basicInfoJobTitle" className="mb-2">
            <Form.Label>Job Title</Form.Label>
            <Form.Control
              type="text"
              value={basicInfo.jobTitle}
              onChange={(e) =>
                setBasicInfo({ ...basicInfo, jobTitle: e.target.value })
              }
            />
          </Form.Group>
          <Form.Group controlId="basicInfoIndustry" className="mb-2">
            <Form.Label>Industry</Form.Label>
            <Form.Control
              type="text"
              value={basicInfo.industry}
              onChange={(e) =>
                setBasicInfo({ ...basicInfo, industry: e.target.value })
              }
            />
          </Form.Group>
          <Form.Group controlId="basicInfoProjects" className="mb-2">
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

          <Button variant="primary" onClick={handleNext}>
            Next
          </Button>
        </div>
      )}

      {step === 2 && (
        <div>
          <h5>Core Competencies</h5>
          <Form.Group controlId="coreCompetenciesDrive" className="mb-2">
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

          <Form.Group controlId="coreCompetencies" className="mb-2">
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

          <Form.Group controlId="coreCompetenciesExamples" className="mb-2">
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

          <div style={{ display: "flex", gap: "1rem" }}>
            <Button variant="secondary" onClick={handlePrev}>
              Previous
            </Button>
            <Button variant="primary" onClick={handleNext}>
              Next
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <h5>Elevator Pitch Draft</h5>
          <p>
            Use this step to create a short pitch that includes:
            <br />
            1) Intro (Name, role/company, etc.)
            <br />
            2) What you do well (Zone of Genius)
            <br />
            3) Unique Value Proposition & Close
          </p>

          <Form.Group controlId="pitchIntro" className="mb-2">
            <Form.Label>Introduction</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={pitch.intro}
              placeholder="My name is Sarah, I graduated from..."
              onChange={(e) => setPitch({ ...pitch, intro: e.target.value })}
            />
          </Form.Group>
          <Form.Group controlId="pitchZone" className="mb-2">
            <Form.Label>Zone of Genius (What you do well)</Form.Label>
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
          <Form.Group controlId="pitchUVP" className="mb-2">
            <Form.Label>Unique Value Proposition + Close</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="I would love to learn more about how you're spreading brand awareness..."
              value={pitch.uvpClose}
              onChange={(e) => setPitch({ ...pitch, uvpClose: e.target.value })}
            />
          </Form.Group>

          <div style={{ display: "flex", gap: "1rem" }}>
            <Button variant="secondary" onClick={handlePrev}>
              Previous
            </Button>
            <Button variant="primary" onClick={handleNext}>
              Next
            </Button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div>
          <h5>Review & Submit</h5>
          <p>
            <strong>Basic Info:</strong> {JSON.stringify(basicInfo, null, 2)}
          </p>
          <p>
            <strong>Core Competencies:</strong>{" "}
            {JSON.stringify(coreCompetencies, null, 2)}
          </p>
          <p>
            <strong>Elevator Pitch:</strong> {JSON.stringify(pitch, null, 2)}
          </p>

          <p>
            Once you click finish, we’ll compile these details and send them
            back to the main chat area for AI feedback or refinement.
          </p>
          <div style={{ display: "flex", gap: "1rem" }}>
            <Button variant="secondary" onClick={handlePrev}>
              Previous
            </Button>
            <Button variant="success" onClick={handleFinish}>
              Finish
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CareerAgentWizard;
