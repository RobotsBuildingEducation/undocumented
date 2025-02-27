import React from "react";
import { Card, ListGroup } from "react-bootstrap";

// Helper function: returns true if at least one field in the object is non-empty.
const hasNonEmptyValues = (obj) => {
  if (!obj || typeof obj !== "object") return false;
  return Object.values(obj).some((value) =>
    typeof value === "string" ? value.trim() !== "" : Boolean(value)
  );
};

const CareerProfileCard = ({ profile, userLanguage }) => {
  console.log("Profile:", profile);
  if (!profile) return null;

  // Section titles in each language.
  const texts = {
    en: {
      careerProfile: "Career Profile",
      basicInfo: "Basic Info",
      coreCompetencies: "Core Competencies",
      elevatorPitch: "Elevator Pitch",
    },
    es: {
      careerProfile: "Perfil Profesional",
      basicInfo: "Información Básica",
      coreCompetencies: "Competencias Esenciales",
      elevatorPitch: "Discurso de Ascensor",
    },
  }[userLanguage];

  // Field translations for each section.
  // These keys will always be presentational.
  const fieldTranslations = {
    en: {
      basicInfo: {
        education: "Education",
        company: "Company",
        jobTitle: "Job Title",
        industry: "Industry",
        projects: "Projects",
      },
      coreCompetencies: {
        drive: "Drive",
        competencies: "Competencies",
        examples: "Examples",
      },
      pitch: {
        intro: "Intro",
        zoneOfGenius: "Zone of Genius",
        uvpClose: "UVP Close",
      },
    },
    es: {
      basicInfo: {
        education: "Educación",
        company: "Compañía",
        jobTitle: "Título del Trabajo",
        industry: "Industria",
        projects: "Proyectos",
      },
      coreCompetencies: {
        drive: "Impulso",
        competencies: "Competencias",
        examples: "Ejemplos",
      },
      pitch: {
        intro: "Introducción",
        zoneOfGenius: "Zona de Genialidad",
        uvpClose: "Cierre UVP",
      },
    },
  }[userLanguage];

  // Generic function to render a section (e.g. Basic Info, Core Competencies)
  // The sectionKey tells us which set of field translations to use.
  const renderSection = (sectionKey, sectionLabel, sectionData) => {
    if (!sectionData || typeof sectionData !== "object") return null;

    // Filter out empty fields.
    const filteredEntries = Object.entries(sectionData).filter(([, value]) =>
      typeof value === "string" ? value.trim() !== "" : Boolean(value)
    );

    if (filteredEntries.length === 0) return null;

    return (
      <>
        <Card.Subtitle className="mt-3 mb-2 text-muted">
          {sectionLabel}
        </Card.Subtitle>
        <ListGroup variant="flush">
          {filteredEntries.map(([key, value]) => {
            // Look up the translated label for the key.
            const fieldLabel =
              fieldTranslations[sectionKey]?.[key] ||
              key.charAt(0).toUpperCase() + key.slice(1);
            return (
              <ListGroup.Item key={key}>
                <strong>{fieldLabel}:</strong> {value}
              </ListGroup.Item>
            );
          })}
        </ListGroup>
      </>
    );
  };

  // Dedicated function for rendering the Elevator Pitch section.
  // Since the pitch fields use the "pitch" section in our translation mapping,
  // we look them up similarly.
  const renderElevatorPitchSection = (pitchData) => {
    if (!pitchData || typeof pitchData !== "object") return null;

    const filteredEntries = Object.entries(pitchData).filter(([, value]) =>
      typeof value === "string" ? value.trim() !== "" : Boolean(value)
    );

    if (filteredEntries.length === 0) return null;

    return (
      <>
        <Card.Subtitle className="mt-3 mb-2 text-muted">
          {texts.elevatorPitch}
        </Card.Subtitle>
        <ListGroup variant="flush">
          {filteredEntries.map(([key, value]) => {
            const fieldLabel =
              fieldTranslations.pitch?.[key] ||
              key.charAt(0).toUpperCase() + key.slice(1);
            return (
              <ListGroup.Item key={key}>
                <strong>{fieldLabel}:</strong> {value}
              </ListGroup.Item>
            );
          })}
        </ListGroup>
      </>
    );
  };

  return (
    <Card style={{ margin: "1rem 0" }}>
      <Card.Header>{texts.careerProfile}</Card.Header>
      <Card.Body>
        {hasNonEmptyValues(profile.basicInfo) &&
          renderSection("basicInfo", texts.basicInfo, profile.basicInfo)}
        {hasNonEmptyValues(profile.coreCompetencies) &&
          renderSection(
            "coreCompetencies",
            texts.coreCompetencies,
            profile.coreCompetencies
          )}
        {hasNonEmptyValues(profile.pitch) &&
          renderElevatorPitchSection(profile.pitch)}
      </Card.Body>
    </Card>
  );
};

export default CareerProfileCard;
