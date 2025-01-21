import { promptSet } from "./prompts";

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

const cleanInstructions = (
  input,
  instructions,
  statePrefix,
  mustCleanAll = false
) => {
  const languagePrefixPattern =
    /^(The user wants you speaking in spanish|The user wants you communicating in english)\s*/;

  // Escape special characters in statePrefix for use in regex
  const statePrefixPattern = new RegExp(`^${statePrefix}\\s*`);

  return input
    .replace(promptSet["undocumented"], "")
    .replace(promptSet["resume"], "")
    .replace(promptSet["fafsa"], "")
    .replace(promptSet["counselor"], "")
    .replace(languagePrefixPattern, "")
    ?.replace(statePrefixPattern, "")
    .trim();
};

export { cleanInstructions };

export const lang = {
  en: {
    badBrowser:
      "This app is using a non-standard in-app browser. Follow the instructions below to install the app on your phone in order to access this feature.",
    installAppInstructions1: `Open this page in your browser with the More Options button`,
    installAppInstructions2: `Press the Share button`,
    installAppInstructions3: `Press the Add To Homescreen button`,
    installAppInstructions4: `That's it! You don't need to download the app through an app store because we're using open-source standards for Progressive Web Apps.`,

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
    privacyPolicyContent: `Your data is private and there's no way for us or anyone to know who you are unless you personally share your identity key found in your profile. We collect data that a user chooses to create:
- The state you reside in
- Your identity key
- Messages you save
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
    ["subtitle.undocumented"]: "Legal information with intelligent assistance",
    ["title.fafsa"]: "La FAFSA",
    ["subtitle.fafsa"]:
      "College finance information with intelligent assistance",
    ["title.resume"]: "Smart Resume",
    ["subtitle.resume"]:
      "Job application resume support with intelligent assistance",
    ["title.counselor"]: "College Counselor",
    ["subtitle.counselor"]:
      "Navigate college with the support of intelligent assistance",
    messagePlaceholder: "Message",
    saveResponse: "Save response",
    languageSwitch: "English",
    modify: "Modify",
    saved: "Saved",
    settings: "Profile",
    filter: "Filter",
    filterPlaceholder: "Filter by title, content or date (M/D/Y)",
    editTitle: "Edit Title",
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
    switchAccounts: "Switch accounts",
    enterId: "Enter your secret key to switch accounts",
    switch: "Switch",
    visit: "Support the developer",
    invalidDid:
      "Invalid DID. Please enter a DID starting with did:key, did:dht, or did:ion.",
    errorOccurred: "An error occurred. Please try again.",
    accountSwitched: "Account switched successfully!",
    instructions:
      "👋 You're using a decentralized identity to instantly launch inside of social media. Keep your secret key and store it somewhere safely so you can use it across apps or networks! Additionally, Configure your settings to improve your AI.",
    saving: "Saving...",
    savedButton: "Saved",
  },
  es: {
    ["title.counselor"]: "Consejero Universitario",
    ["subtitle.counselor"]:
      "Navega la universidad con el apoyo de una asistencia inteligente",
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
    ["title.resume"]: "Currículum Inteligente",
    ["subtitle.resume"]:
      "Ayuda inteligente para tu currículum y solicitudes de empleo",

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

    privacyPolicyContent: `Tus datos son privados y no hay forma de que nosotros o cualquier otra persona sepamos quién eres a menos que compartas personalmente tu clave de identidad que se encuentra en tu perfil. Recopilamos datos que el usuario elige crear:
- El estado en el que resides
- Tu clave de identidad
- Los mensajes que guardas`,

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
      "Asistencia de información legal con ayuda inteligente",
    ["title.fafsa"]: "La FAFSA",
    ["subtitle.fafsa"]: "Financiación universitaria con ayuda inteligente",
    messagePlaceholder: "Mensaje",
    saveResponse: "Guardar respuesta",
    languageSwitch: "Español",
    modify: "Modificar",
    saved: "Guardado",
    settings: "Perfil",
    filter: "Filtrar",
    filterPlaceholder: "Filtrar por título, contenido o fecha (D/M/A)",
    editTitle: "Editar título",
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
    switchAccounts: "Cambiar cuentas",
    enterId: "Ingresa tu clave secreta para cambiar de cuenta",
    switch: "Cambiar",
    visit: "Apoya al desarrollador",
    invalidDid:
      "DID inválido. Por favor, ingrese un DID que comience con did:key, did:dht o did:ion.",
    errorOccurred: "Ocurrió un error. Por favor, inténtelo de nuevo.",
    accountSwitched: "¡Cuenta cambiada con éxito!",
    instructions:
      "👋 Estás utilizando una identidad descentralizada para lanzarte instantáneamente dentro de las redes sociales. Guarda tu clave secreta en un lugar seguro para que puedas usarla en diferentes aplicaciones o redes. Además, configura tus ajustes para mejorar tu IA.",
    saving: "Guardando...",
    savedButton: "Guardado",
  },
};
