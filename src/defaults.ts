export const defaultNote = {
  note: "",
  context: "GENERAL",
  context_id: "",
  sharing_level: "PRIVATE",
};

export const defaultQueue = {
  individual_id: "",
  assignee_id: null,
  advanced_search: null,
  status: "NOT_STARTED",
  note: "",
};

export const defaultIndividual = {
  active: true,
  first_name: "",
  last_name: "",
  middle_name: "",
  legal_first_name: "",
  prefix: "",
  suffix: "",
  gender: "",
  birthday: "",
  anniversary: "",
  email: "",
  addresses: {
    mailing: {
      city: "",
      state: "",
      street: "",
      country_iso: "",
      zip: "",
    },
  },
  phone: {
    home: "",
    mobile: "",
    mobile_carrier_id: "",
    work: "",
  },
  preferred_number: "NONE",
  family_position: "PRIMARY_CONTACT",
  marital_status: "",
  baptized: "",
  baptized_date: "",
  baptized_note: "",
  deceased: "",
  allergies: "",
  confirmed_no_allergies: "NOT_SPECIFIED",
  membership_type_id: 1,
  membership_start_date: "",
  campus_id: 1,
  church_service: [""],
  school_id: "",
  school_grade_id: "",
  barcode: "",
  listed: true,
  imited_access_user: true,
  reason_left_id: "",
  cid: "",
  custom_fields: [],
};

export const defaultSearchConfig = {
  columns: [],
  order_by: [
    {
      column: "last_name",
      direction: "asc",
    },
  ],
  filter_profile_type: ["active"],
  include_unlisted: true, 
  include_lau: true,
  include_pending: true,
  return_search_results: true,
  return_family_positions: [],
};
