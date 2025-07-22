import { promptSet } from "./prompts";

export const STEPS = [
  { key: "name", question: "What is your name?" },
  { key: "city", question: "Where do you live?" },
  { key: "education", question: "What is your education background?" },
  { key: "drive", question: "What drives you in your career?" },
  { key: "competencies", question: "What are your key competencies?" },
  { key: "examples", question: "Can you share any examples or short stories?" },
  { key: "intro", question: "Please provide an introduction for your pitch." },
  { key: "zoneOfGenius", question: "What is your zone of genius?" },
  {
    key: "uvpClose",
    question:
      "What is your unique value proposition (UVP) or closing statement?",
  },
  // ...and so on, you can reorder or break them out how you like
];

export const isValidDID = (did) => {
  return /^did:(key|dht|ion):/.test(did);
};
export const isUnsupportedBrowser = () => {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;

  const isByteDanceWebview = /ByteDanceWebview/.test(userAgent) && "Tiktok";
  const isByteLocale = /ByteLocale/.test(userAgent) && "Tiktok";
  const isMusicalLy = /musical_ly/.test(userAgent) && "Tiktok";
  const isInstagram = /Instagram/.test(userAgent) && "Instagram";
  const isPinterest = /Pinterest/.test(userAgent) && "Pinterest";
  const isNotValid =
    !(/Safari/.test(userAgent) || /Chrome/.test(userAgent)) &&
    "Instagram or other invalid in-app browsers";

  const isInAppBrowser =
    isByteDanceWebview ||
    isByteLocale ||
    isMusicalLy ||
    isInstagram ||
    isPinterest ||
    isNotValid;

  return isInAppBrowser;
  // return true;
};

export const prefixMap = {
  undocumented: "The user is asking about law & enforcement",
};

// if you have a default or fallback
const DEFAULT_PREFIX = "law & enforcement";
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractJSONFromMessage(message) {
  const firstBraceIndex = message.indexOf("{");
  if (firstBraceIndex === -1) return null;

  let balance = 0;
  let endIndex = -1;

  // Iterate through the string starting from the first '{'
  for (let i = firstBraceIndex; i < message.length; i++) {
    const char = message[i];
    if (char === "{") {
      balance++;
    } else if (char === "}") {
      balance--;
      if (balance === 0) {
        endIndex = i;
        break;
      }
    }
  }

  // Return the JSON substring if we found a balanced block.
  if (endIndex !== -1) {
    return message.substring(firstBraceIndex, endIndex + 1);
  }
  return null;
}

export function cleanInstructions(
  input,
  currentInstructions,
  statePrefix,
  mustCleanAll = false
) {
  if (!input) return "";

  let output = input;

  // 1) Create an array of prompts we want to remove.
  // If mustCleanAll is true, remove references to every promptSet. Otherwise just remove the current instructions.
  const allPrompts = Object.values(promptSet); // e.g. [promptSet["undocumented"], promptSet["resume"], ...]
  const promptsToRemove = mustCleanAll ? allPrompts : [currentInstructions];

  // 2) Remove any leftover text from the known prompt sets that might appear.
  for (const promptText of promptsToRemove) {
    if (!promptText) continue;
    const escaped = escapeRegex(promptText);
    const regex = new RegExp(escaped, "g");
    output = output.replace(regex, "");
  }

  // 3) Remove language prefix:
  // e.g., "The user wants you speaking in spanish" or "The user wants you communicating in english"
  const languagePrefixPattern =
    /^(The user wants you speaking in spanish|The user wants you communicating in english)\s*/i;
  output = output.replace(languagePrefixPattern, "");

  // 4) Remove state prefix, if present.
  if (statePrefix && statePrefix.trim().length > 0) {
    const escapedState = escapeRegex(statePrefix);
    const statePrefixPattern = new RegExp(`^${escapedState}\\s*`, "i");
    output = output.replace(statePrefixPattern, "");
  }

  // 5) Remove any JSON block found within the output.
  const jsonBlock = extractJSONFromMessage(output);
  if (jsonBlock) {
    output = output.replace(jsonBlock, "");
  }

  // 6) Final cleanup: remove extra whitespace or newlines.
  output = output.replace(/\s\s+/g, " ").trim();
  output = output.replace(/^null\s*/, "");

  return output;
}

export const lang = {
  en: {
    "webSearchAgent.description":
      "Prepares a list of resources and legal experts that you can contact for real assistance and help.",

    "webSearchAgent.modalTitle": "Legal Assistance Search Agent",
    "webSearchAgent.cityLabel": "Your City",
    "webSearchAgent.cityPlaceholder": "Enter your city",
    "webSearchAgent.stateLabel": "Your State",
    "webSearchAgent.statePlaceholder": "Enter your state",
    "webSearchAgent.additionalInfoLabel": "Additional Information",
    "webSearchAgent.additionalInfoPlaceholder":
      "Any additional information or details",
    "webSearchAgent.startSearchButton": "Start Search",
    "webSearchAgent.spinnerText": "Preparing a list of resources...",
    "webSearchAgent.resultsTitle": "Results:",
    "webSearchAgent.queryTitle": "Your Query:",
    "webSearchAgent.noResults":
      'No results yet. Click "Start Search" to fetch results.',
    "webSearchAgent.prompt.city": "City:",
    "webSearchAgent.prompt.state": "State:",
    "webSearchAgent.prompt.additionalInfo": "Additional Info:",
    "webSearchAgent.prompt.profileInfo": "Profile Info:",
    "webSearchAgent.prompt.query":
      "The user is undocumented and is searching for legal assistance to navigate law enforcement. The assistance must be accessible and affordable. Return a list outlining the name, expected costs or fees (free or not), phone number and address (if available) and website link in list format. Do not use headers, only use bold.",
    untitled: "Untitled",
    updateProfileButton: "Update Profile",
    badBrowser:
      "This app is using a non-standard in-app browser. Follow the instructions below to install the app on your phone in order to access this feature.",
    installAppInstructions1: `Open this page in your browser with the More Options button`,
    installAppInstructions2: `Press the Share button`,
    installAppInstructions3: `Press the Add To Homescreen button`,
    installAppInstructions4: `That's it! You don't need to download the app through an app store because we're using open-source standards for Progressive Web Apps.`,
    profileUpdated: "Profile updated successfully!",
    installApp: "Install App",
    emptyChatInstructions:
      "Write a message and our AI will help you learn more!",
    "emptyChatInstructions.resume": (
      <div>
        Write a message and our AI will help you learn more! The assistance
        offers
        <ul>
          <li>Refining and polishing descriptions</li>
          <li>Tailored suggestions to improve competitiveness</li>
          <li>Honesty and authenticity to inspire confidence</li>
          <li>and more!</li>
        </ul>
      </div>
    ),
    privacyPolicyContent: `Your identity is private and there's no way for us or anyone to confirm who you are. The only way to access your account is through the secret key that's found in your profile. 
    
We optionally store data (to improve user experiences) that a user may choose to store:
- The state you reside in to assist and help specify AI responses (profile)
- Individiual requests and respective responses that you save (notes)
- Language preferences
- Career data to help improve the career agent feature


    `,
    privacyPolicy: "Privacy Policy",
    selectStateLabel: "Select a state",

    fifthAmendment: "5th Amendment",
    fourteenthAmendment: "14th Amendment",
    fifthAmendmentData: `### Fifth Amendment
The Fifth Amendment to the United States Constitution is a cornerstone of American legal rights, ensuring that individuals are protected against abuse of government authority in legal proceedings. Here's how it works:

- **Right to Remain Silent**: This amendment guarantees that no person "shall be compelled in any criminal case to be a witness against himself." This means you have the right not to answer questions or provide information that may incriminate you. It applies to everyone within U.S. jurisdiction, regardless of citizenship status.
  
- **Double Jeopardy Protection**: You cannot be tried twice for the same offense after acquittal or conviction. This safeguards individuals from repeated legal harassment.

- **Due Process**: It mandates that the government cannot deprive you of "life, liberty, or property" without due process of law. This is particularly important for undocumented individuals, as it affirms that basic legal protections apply regardless of immigration status.

- **Property Rights**: The government cannot take private property for public use without just compensation, also known as the "Takings Clause."

Key takeaway: The Fifth Amendment is not dependent on moral character or citizenship. It protects anyone subject to U.S. law from coercive tactics or wrongful prosecution. If you're undocumented, understand that silence is a legal shield, not a betrayal of justice. The role of law enforcement is not to define guilt or innocence but to move cases into the judicial system. Your silence cannot be used against you in court.`,
    fourteenthAmendmentData: `### Fourteenth Amendment
The Fourteenth Amendment is a monumental piece of constitutional law that defines what it means to be a person under U.S. law and guarantees that all persons receive equal protection. This amendment includes:

- **Equal Protection Clause**: This ensures that no state shall "deny to any person within its jurisdiction the equal protection of the laws." This means undocumented individuals have the same fundamental protections under the law as U.S. citizens.

- **Due Process Clause**: Like the Fifth Amendment, it prohibits states from depriving "any person of life, liberty, or property, without due process of law." This guarantees fairness and accountability in any legal or governmental action.

- **Citizenship Clause**: While primarily addressing the rights of those born or naturalized in the U.S., this clause underscores the principle that the law applies to all persons, not just citizens.

For undocumented individuals, the Fourteenth Amendment is a critical safeguard. It assures that discrimination based on your immigration status is not permissible under the law. If a government official or law enforcement attempts to act in a way that denies your rights, the Fourteenth Amendment is your legal recourse.`,
    ["title.undocumented"]: "Undocumented",
    ["subtitle.undocumented"]:
      "Legal rights and law enforcement with intelligent assistance",
    messagePlaceholder: "Message",
    saveResponse: "Save note",
    languageSwitch: "English",
    modify: "Modify",
    saved: "Notes",
    settings: "Profile",
    filter: "Filter",
    filterPlaceholder: "Filter by title, content or date (M/D/Y)",
    editTitle: "Add Title",
    editContent: "Edit Content",
    saveChanges: "Save Changes",
    cancel: "Cancel",
    close: "Close",
    savedResponses: "Saved Responses",
    delete: "Delete",
    view: "View",
    currentUserId: "Current User ID",
    copy: "Copy",
    copied: "Copied!",
    copyKeys: "🔑 Copy keys",
    copiedKeys: "✅  Keys Copied!",
    switchAccount: "Switch account",
    switchAccounts: "Switch accounts",
    enterId: "Enter your secret key to switch accounts",
    switch: "Switch",
    visit: "Support the developer",
    invalidDid:
      "Invalid secret key. Please enter a valid nostr secret key starting with nsec.",
    errorOccurred: "An error occurred. Please try again.",
    accountSwitched: "Account switched successfully!",
    instructions:
      "👋 You're using a decentralized identity to instantly launch inside of social media. Keep your secret key and store it somewhere safely so you can use it across apps or networks! Additionally, Configure your settings to improve your AI.",
    saving: "Saving...",
    savedButton: "Saved",
    theCode: "The Code",
  },
  es: {
    "webSearchAgent.description":
      "Prepara una lista de recursos y expertos legales con los que puedes ponerte en contacto para obtener ayuda y asistencia reales.",
    "webSearchAgent.modalTitle": "Agente de búsqueda de asistencia legal",
    "webSearchAgent.cityLabel": "Tu ciudad",
    "webSearchAgent.cityPlaceholder": "Ingresa tu ciudad",
    "webSearchAgent.stateLabel": "Tu estado",
    "webSearchAgent.statePlaceholder": "Ingresa tu estado",
    "webSearchAgent.additionalInfoLabel": "Información adicional",
    "webSearchAgent.additionalInfoPlaceholder":
      "Cualquier información o detalle adicional",
    "webSearchAgent.startSearchButton": "Iniciar búsqueda",
    "webSearchAgent.spinnerText": "Preparando una lista de recursos...",
    "webSearchAgent.resultsTitle": "Resultados:",
    "webSearchAgent.queryTitle": "Tu consulta:",
    "webSearchAgent.noResults":
      'Aún no hay resultados. Haz clic en "Iniciar búsqueda" para obtener resultados.',
    "webSearchAgent.prompt.city": "Ciudad:",
    "webSearchAgent.prompt.state": "Estado:",
    "webSearchAgent.prompt.additionalInfo": "Información adicional:",
    "webSearchAgent.prompt.profileInfo": "Información del perfil:",
    untitled: "Sin título",

    updateProfileButton: "Actualizar perfil",
    profileUpdated: "¡Perfil actualizado con éxito!",
    "emptyChatInstructions.resume": (
      <div>
        ¡Escribe un mensaje y nuestra IA te ayudará a aprender más! La
        asistencia ofrece:
        <ul>
          <li>Refinar y pulir descripciones</li>
          <li>Sugerencias personalizadas para mejorar la competitividad</li>
          <li>Honestidad y autenticidad para inspirar confianza</li>
          <li>¡y más!</li>
        </ul>
      </div>
    ),

    copyKeys: "🔑 Copiar claves",
    copiedKeys: "✅ ¡Claves copiadas!",
    badBrowser:
      "Esta aplicación está utilizando un navegador integrado no estándar. Sigue las instrucciones a continuación para instalar la aplicación en tu teléfono y acceder a esta función.",
    installAppInstructions1: `Abre esta página en tu navegador con el botón de Más Opciones`,
    installAppInstructions2: `Presiona el botón Compartir`,
    installAppInstructions3: `Presiona el botón Agregar a la pantalla de inicio`,
    installAppInstructions4: `¡Eso es todo! No necesitas descargar la aplicación desde una tienda de aplicaciones porque estamos utilizando estándares de código abierto para Aplicaciones Web Progresivas.`,

    installApp: "Instalar aplicación",

    emptyChatInstructions:
      "¡Escribe un mensaje y nuestra inteligencia assistance te ayudará a aprender más!",

    privacyPolicyContent: `Tu identidad es privada y no hay forma de que nosotros o alguien pueda confirmar quién eres. La única manera de acceder a tu cuenta es a través de la clave secreta que se encuentra en tu perfil.

Opcionalmente, almacenamos datos (para mejorar la experiencia del usuario) que el usuario puede elegir guardar:

- El estado en el que resides para ayudar a especificar las respuestas de la IA (perfil)
- Solicitudes individuales y las respectivas respuestas que guardas (notas)
- Preferencias de idioma
- Datos de carrera para ayudar a mejorar la función del agente de carrera

`,

    privacyPolicy: "Política de Privacidad",

    selectStateLabel: "Selecciona un estado",
    fifthAmendment: "5ª Enmienda",
    fourteenthAmendment: "14ª Enmienda",
    fifthAmendmentData: `### Quinta Enmienda
La Quinta Enmienda de la Constitución de los Estados Unidos es un pilar fundamental de los derechos legales estadounidenses, asegurando que los individuos estén protegidos contra abusos de autoridad gubernamental en procedimientos legales. Así es como funciona:

- **Derecho a guardar silencio**: Esta enmienda garantiza que ninguna persona "será obligada en ningún caso penal a ser testigo en su contra". Esto significa que tienes derecho a no responder preguntas ni proporcionar información que pueda incriminarte. Esto aplica a todos dentro de la jurisdicción de los EE. UU., independientemente de su estatus migratorio.
  
- **Protección contra la doble incriminación**: No se te puede juzgar dos veces por el mismo delito después de ser absuelto o condenado. Esto protege a las personas de acoso legal repetido.

- **Debido proceso**: Establece que el gobierno no puede privarte de "la vida, la libertad o la propiedad" sin el debido proceso legal. Esto es particularmente importante para las personas indocumentadas, ya que afirma que las protecciones legales básicas aplican independientemente del estatus migratorio.

- **Derechos de propiedad**: El gobierno no puede tomar propiedad privada para uso público sin una compensación justa, conocido como la "Cláusula de Expropiación".

Conclusión clave: La Quinta Enmienda no depende del carácter moral o de la ciudadanía. Protege a cualquier persona sujeta a las leyes de los EE. UU. contra tácticas coercitivas o procesamientos indebidos. Si eres indocumentado, entiende que el silencio es un escudo legal, no una traición a la justicia. El rol de las fuerzas del orden no es definir la culpabilidad o la inocencia, sino llevar los casos al sistema judicial. Tu silencio no puede ser usado en tu contra en un tribunal.`,

    fourteenthAmendmentData: `### Decimocuarta Enmienda
La Decimocuarta Enmienda es una pieza monumental del derecho constitucional que define lo que significa ser una persona bajo las leyes de los Estados Unidos y garantiza que todas las personas reciban protección igualitaria. Esta enmienda incluye:

- **Cláusula de Igual Protección**: Esto asegura que ningún estado "negará a ninguna persona dentro de su jurisdicción la igual protección de las leyes". Esto significa que las personas indocumentadas tienen las mismas protecciones fundamentales bajo la ley que los ciudadanos estadounidenses.

- **Cláusula del Debido Proceso**: Al igual que la Quinta Enmienda, prohíbe que los estados priven a "ninguna persona de la vida, la libertad o la propiedad, sin el debido proceso legal". Esto garantiza equidad y responsabilidad en cualquier acción legal o gubernamental.

- **Cláusula de Ciudadanía**: Aunque se refiere principalmente a los derechos de quienes nacen o se naturalizan en los EE. UU., esta cláusula subraya el principio de que la ley se aplica a todas las personas, no solo a los ciudadanos.

Para las personas indocumentadas, la Decimocuarta Enmienda es una salvaguarda crítica. Asegura que la discriminación basada en tu estatus migratorio no sea permisible bajo la ley. Si un funcionario gubernamental o una fuerza del orden intenta actuar de manera que niegue tus derechos, la Decimocuarta Enmienda es tu recurso legal.`,
    ["title.undocumented"]: "Indocumentado",
    ["subtitle.undocumented"]:
      "Derechos legales y cumplimiento de la ley con asistencia inteligente",
    messagePlaceholder: "Mensaje",
    saveResponse: "Guardar nota",
    languageSwitch: "Español",

    theCode: "El Código",
    modify: "Modificar",
    saved: "Notas",
    settings: "Perfil",
    filter: "Filtrar",
    filterPlaceholder: "Filtrar por título, contenido o fecha (D/M/A)",
    editTitle: "Añadir título",
    editContent: "Editar contenido",
    saveChanges: "Guardar cambios",
    cancel: "Cancelar",
    close: "Cerrar",
    savedResponses: "Respuestas guardadas",
    delete: "Eliminar",
    view: "Ver",
    currentUserId: "ID de usuario actual",
    copy: "Copiar",
    copied: "¡Copiado!",
    switchAccount: "Cambia cuenta",
    switchAccounts: "Cambiar cuentas",
    enterId: "Ingresa tu clave secreta para cambiar de cuenta",
    switch: "Cambiar",
    visit: "Apoya al desarrollador",
    invalidDid:
      "Clave secreta inválida. Por favor, ingrese una clave secreta de nostr válida que comience con nsec.",
    errorOccurred: "Ocurrió un error. Por favor, inténtelo de nuevo.",
    accountSwitched: "¡Cuenta cambiada con éxito!",
    instructions:
      "👋 Estás utilizando una identidad descentralizada para lanzarte instantáneamente dentro de las redes sociales. Guarda tu clave secreta en un lugar seguro para que puedas usarla en diferentes aplicaciones o redes. Además, configura tus ajustes para mejorar tu IA.",
    saving: "Guardando...",
    savedButton: "Guardado",
  },
};
