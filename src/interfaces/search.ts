export type ConstraintOperator = 'contains' | 'constains_like' | 'does_not_contain' | 'ends_with' | 'equal' | 'in' | 'is_not_set' | 'is_set' | 'like' | 'not_equal' | 'not_in' | 'not_like' | 'starts_with' | 'word_boundary'
export type IndividualConstraintField = 'ability'	| 'age' | 'allergies' | 'anniversary' | 'anniversary_date_parts'
    | 'anniversary_month' | 'area' | 'attendance_attendance_grouping' | 'attendance_department' | 'attendance_single_event'
    | 'barcode' | 'birth_date' | 'birth_date_parts' | 'birth_month' | 'campus' | 'child_work_approved_start_date'
    | 'child_work_approved_start_month' | 'child_work_approved_stop_date' | 'child_work_approved_stop_month' | 'church_service'
    | 'commitment_date' | 'commitment_story' | 'contact_phone_number' | 'creator_first_name' | 'creator_last_name'
    | 'current_story' | 'date_created' | 'date_created_month' | 'date_created_parts' | 'date_deceased' | 'date_deceased_month'
    | 'date_deceased_parts' | 'date_modified' | 'date_modified_month' | 'date_modified_parts' | 'discussion_posts' | 'email'
    | 'emergency_contact_number' | 'emergency_contact_phone_number' | 'event' | 'event_legacy' | 'family_child' | 'family_head'
    | 'family_id' | 'family_other' | 'family_photo' | 'family_position' | 'family_spouse' | 'fax_phone_number' | 'first_name'
    | 'form_question_answer' | 'gender' | 'giving_number' | 'group' | 'group_department' | 'group_name' | 'group_relationship'
    | 'group_search' | 'group_type' | 'group_udf_pulldown_1' | 'group_udf_pulldown_2' | 'group_udf_pulldown_3' | 'home_city'
    | 'home_country' | 'home_state' | 'home_street' | 'home_zip' | 'how_joined_church' | 'how_they_heard' | 'individual_id'
    | 'is_baptized' | 'is_confirmed_no_allergies' | 'is_home_listed' | 'is_inactive' | 'is_limited_access_user' | 'is_listed'
    | 'is_other_listed' | 'is_work_listed' | 'last_attended_date' | 'last_giving_date' | 'last_login_date' | 'last_login_date_parts'
    | 'last_name' | 'last_need_assigned_date' | 'legal_name' | 'login' | 'mailing_carrier_route' | 'mailing_city' | 'mailing_country'
    | 'mailing_state' | 'mailing_street' | 'mailing_zip' | 'marital_status' | 'membership_month' | 'membership_start_date'
    | 'membership_stop_date' | 'membership_type' | 'middle_name' | 'military' | 'mobile_carrier' | 'mobile_phone_number'
    | 'modifier_first_name' | 'modifier_last_name' | 'name' | 'new_giver' | 'other_city' | 'other_country' | 'other_id'
    | 'other_state' | 'other_street' | 'other_zip' | 'pager_phone_number' | 'passion' | 'personality_style' | 'photo' | 'pledge'
    | 'position' | 'process_queue' | 'process_queue_date' | 'reason_left_church' | 'school' | 'school_grade' | 'significant_event'
    | 'spiritual_gift' | 'spiritual_maturity' | 'sync_id' | 'transaction_amount' | 'udf_date_1' | 'udf_date_2' | 'udf_date_3'
    | 'udf_date_4' | 'udf_date_5' | 'udf_date_6' | 'udf_pulldow_1' | 'udf_pulldow_2' | 'udf_pulldow_3' | 'udf_pulldow_4'
    | 'udf_pulldow_5' | 'udf_pulldow_6' | 'udf_text_1' | 'udf_text_10' | 'udf_text_11' | 'udf_text_12' | 'udf_text_2' | 'udf_text_3'
    | 'udf_text_4' | 'udf_text_5' | 'udf_text_6' | 'udf_text_7' | 'udf_text_8' | 'udf_text_9' | 'work_city' | 'work_country'
    | 'work_state' | 'work_street' | 'work_zip';

export interface SearchGroup {
    type: 'group';
    operator: 'and' | 'or';
    inverted: boolean;
    conditions: SearchConstraint[];
}

export interface SearchConstraint {
    type: 'constraint';
    id: IndividualConstraintField;
    operator: ConstraintOperator;
    inverted: boolean;
    value: string | number;
}