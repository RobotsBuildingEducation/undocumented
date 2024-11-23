import { Form, InputGroup } from "react-bootstrap";

const USStatesDropdown = ({ lang, language, selectedState, onSelectState }) => {
  const states = [
    "Alabama",
    "Alaska",
    "Arizona",
    "Arkansas",
    "California",
    "Colorado",
    "Connecticut",
    "Delaware",
    "Florida",
    "Georgia",
    "Hawaii",
    "Idaho",
    "Illinois",
    "Indiana",
    "Iowa",
    "Kansas",
    "Kentucky",
    "Louisiana",
    "Maine",
    "Maryland",
    "Massachusetts",
    "Michigan",
    "Minnesota",
    "Mississippi",
    "Missouri",
    "Montana",
    "Nebraska",
    "Nevada",
    "New Hampshire",
    "New Jersey",
    "New Mexico",
    "New York",
    "North Carolina",
    "North Dakota",
    "Ohio",
    "Oklahoma",
    "Oregon",
    "Pennsylvania",
    "Rhode Island",
    "South Carolina",
    "South Dakota",
    "Tennessee",
    "Texas",
    "Utah",
    "Vermont",
    "Virginia",
    "Washington",
    "West Virginia",
    "Wisconsin",
    "Wyoming",
  ];

  return (
    <Form.Group controlId="formStateDropdown">
      <Form.Label>{lang[language].selectStateLabel}</Form.Label>
      <InputGroup>
        <Form.Select
          value={selectedState}
          onChange={(e) => onSelectState(e.target.value)}
        >
          <option value="" disabled>
            {lang[language].selectStateLabel}
          </option>
          {states.map((state, index) => (
            <option key={index} value={state}>
              {state}
            </option>
          ))}
        </Form.Select>
      </InputGroup>
    </Form.Group>
  );
};

export default USStatesDropdown;
