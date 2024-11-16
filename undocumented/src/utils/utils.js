const cleanInstructions = (input, instructions) => {
  const languagePrefixPattern =
    /^(The user wants you speaking in spanish|The user wants you communicating in english)\s*/;
  return input
    .replace(instructions, "")
    .replace(languagePrefixPattern, "")
    .trim();
};

export { cleanInstructions };

export const lang = {
  en: {
    title: "Undocumented",
    subtitle: "Legal information assistance",
    messagePlaceholder: "Message",
    saveResponse: "Save response",
    languageSwitch: "English",
    modify: "Modify",
    saved: "Saved",
    settings: "Settings",
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
    switchAccounts: "Switch accounts",
    enterId: "Enter an ID to switch accounts",
    switch: "Switch",
    visit: "Visit RO.B.E",
    invalidDid:
      "Invalid DID. Please enter a DID starting with did:key, did:dht, or did:ion.",
    errorOccurred: "An error occurred. Please try again.",
    accountSwitched: "Account switched successfully!",
    instructions:
      "👋 You're using a decentralized identity to instantly launch inside of social media. Keep this ID so you can share it across apps or networks!",
    saving: "Saving...",
    savedButton: "Saved",
  },
  es: {
    title: "Indocumentado",
    subtitle: "Asistencia de información legal",
    messagePlaceholder: "Mensaje",
    saveResponse: "Guardar respuesta",
    languageSwitch: "Español",
    modify: "Modificar",
    saved: "Guardado",
    settings: "Configuraciones",
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
    enterId: "Ingrese un ID para cambiar cuentas",
    switch: "Cambiar",
    visit: "Visitar RO.B.E",
    invalidDid:
      "DID inválido. Por favor, ingrese un DID que comience con did:key, did:dht o did:ion.",
    errorOccurred: "Ocurrió un error. Por favor, inténtelo de nuevo.",
    accountSwitched: "¡Cuenta cambiada con éxito!",
    instructions:
      "👋 Está utilizando una identidad descentralizada para iniciar instantáneamente en las redes sociales. ¡Guarde este ID para que pueda compartirlo en aplicaciones o redes!",
    saving: "Guardando...",
    savedButton: "Guardado",
  },
};
