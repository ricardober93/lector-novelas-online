export const authAdditionalFields = {
  user: {
    role: {
      type: "string",
      required: true,
      defaultValue: "READER",
      input: false,
      returned: true,
    },
    showAdult: {
      type: "boolean",
      required: true,
      defaultValue: false,
      input: false,
      returned: true,
    },
  },
  session: {},
} as const;
