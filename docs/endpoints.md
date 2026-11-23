# API endpoint reference

Generated from the [ChMS v2 OpenAPI specification](https://docs.pushpay.io/chms-v2/openapi). 406 endpoints.

Every method is available as `ccb.api.<group>.<method>()`. Path parameters come first, then the request body (if any), then query parameters (if any).

## campuses

| Method | Endpoint | Description |
| --- | --- | --- |
| `campuses.getCampuses` | `GET /campuses` | Get campus list |
| `campuses.updateCampus` | `PUT /campuses` | Update campus information |

## church

| Method | Endpoint | Description |
| --- | --- | --- |
| `church.addIndividualFavoriteCampus` | `POST /individuals/{individual_id}/favorite_campuses/{campus_id}` | Mark a campus as a favorite for an individual. Must be the currently logged in user. |
| `church.getAreasOfTown` | `GET /church/areas_of_town` | Get schools |
| `church.getAttendanceGroupings` | `GET /church/attendance_groupings` | Get attendance groupings |
| `church.getCampusServiceTimes` | `GET /campuses/{id}/service_times` | Get campus service times |
| `church.getChurch` | `GET /church` | Get current church information |
| `church.getCountries` | `GET /church/countries` | Get countries |
| `church.getCustomFields` | `GET /church/custom_fields` | Get custom fields |
| `church.getEnvelopeUserOptions` | `GET /church/envelope_user_options` | Get envelope user options |
| `church.getEthnicities` | `GET /church/ethnicities` | Get ethinicity options |
| `church.getHomeboundMinistryOptions` | `GET /church/homebound_ministries` | Get homebound ministry options |
| `church.getLeadershipRoles` | `GET /campuses/{id}/leadership_roles` | Get campus leadership roles |
| `church.getMembershipTypes` | `GET /church/membership_types` | Get membership types |
| `church.getMobileCarriers` | `GET /church/mobile_carriers` | Get mobile carriers |
| `church.getPreferredLanguages` | `GET /church/preferred_languages` | Get preferred language options |
| `church.getPrivacyDefaults` | `GET /church/privacy_defaults` | Get privacy defaults |
| `church.getReasonsLeft` | `GET /church/reasons_left` | Get reasons left options |
| `church.getReligions` | `GET /church/religions` | Get religion options |
| `church.getSchoolGrades` | `GET /church/school_grades` | Get school grades |
| `church.getSchools` | `GET /church/schools` | Get schools |
| `church.getServices` | `GET /church/services` | Get services |
| `church.getSocialNetworks` | `GET /church/social_networks` | Get social networks |
| `church.removeIndividualFavoriteCampus` | `DELETE /individuals/{individual_id}/favorite_campuses/{campus_id}` | Remove a favorite campus from an individual. Must be the currently logged in user. |
| `church.updatePrivacyDefaults` | `POST /church/privacy_defaults` | Update privacy defaults |

## departments

| Method | Endpoint | Description |
| --- | --- | --- |
| `departments.getDepartments` | `GET /departments` | Get Departments |
| `departments.getIndividualsDepartments` | `GET /individuals/{id}/departments` | Get the departments the individual is a department admin of |

## events

| Method | Endpoint | Description |
| --- | --- | --- |
| `events.assignEventAttendanceGrouping` | `PUT /events/{event_id}/attendance_grouping` | Assign an attendance grouping to an event |
| `events.createEvent` | `POST /events` | Create event |
| `events.createIndividualEvents` | `POST /individuals/events/{event_id}` | Create a batch of individual's event status |
| `events.deleteEvent` | `DELETE /events/{id}` | Delete event |
| `events.deleteEventOccurrence` | `DELETE /events/{id}/{occurrence}` | Delete event occurrence |
| `events.deleteEventPhoto` | `DELETE /events/{id}/photo` | Remove the event photo |
| `events.getCalendar` | `GET /calendar` | Get event calendar |
| `events.getEvent` | `GET /events/{id}` | Get event information |
| `events.getEventAttendees` | `GET /events/{id}/attendance/{occurrence}/attendees` | Get event attendees list |
| `events.getEventCalendar` | `GET /events/{id}/calendar` | Get the event calendar |
| `events.getEventCandidates` | `GET /events/{id}/attendance/candidates` | Get event candidate list |
| `events.getEventGuests` | `GET /events/{id}/guests` | Get event guest list |
| `events.getEventOccurrence` | `GET /events/{eventId}/occurrences/{occurrence}` | Get a specific occurrence of an event |
| `events.getEventResources` | `GET /events/{id}/resources` | Get event resource list |
| `events.getEventRooms` | `GET /events/{id}/rooms` | Get event room list |
| `events.getEvents` | `GET /events` | Get event list |
| `events.getEventSharedCampuses` | `GET /events/{id}/shared_campuses` | Get an events's shared campuses |
| `events.getEventsSearch` | `GET /events/search` | Search events |
| `events.getEventSummary` | `GET /events/{id}/attendance/{occurrence}` | Get event summary details |
| `events.getIndividualAdminEvents` | `GET /individuals/{id}/admin/events` | Get individual events they organize |
| `events.getIndividualCalendar` | `GET /individuals/{id}/calendar` | Get event calendar for an individual |
| `events.getIndividualEvent` | `GET /individuals/{id}/events/{event_id}` | Get an individual's event details |
| `events.getSharedEvent` | `GET /events/{id}/shared_campuses/{campus_id}` | Get a shared event |
| `events.getSharedEvents` | `GET /events/shared_campuses` | Get list of shared events, campuses, statuses |
| `events.postEventSharedCampuses` | `POST /events/{id}/shared_campuses` | Share an event with other campuses |
| `events.putEventSharedCampus` | `PUT /events/{id}/shared_campuses/{campus_id}` | Update shared event invite for campus |
| `events.updateEvent` | `PUT /events/{id}` | Update event |
| `events.updateEventAttendees` | `POST /events/{id}/attendance/{occurrence}/attendees` | Update event attendees |
| `events.updateEventInvitationSettings` | `PUT /events/{id}/invitation_settings` | Get event information |
| `events.updateEventPhoto` | `POST /events/{id}/photo` | Update the event photo |
| `events.updateEventSummary` | `POST /events/{id}/attendance/{occurrence}` | Create/update event summary details |
| `events.updateIndividualEvent` | `POST /individuals/{id}/events/{event_id}` | Update an individual's event status |

## families

| Method | Endpoint | Description |
| --- | --- | --- |
| `families.createFamily` | `POST /families` | Create family |
| `families.deleteFamilyPhoto` | `DELETE /families/{id}/photo` | Remove family photo |
| `families.getFamilies` | `GET /families` | Get families |
| `families.getFamily` | `GET /families/{id}` | Get family |
| `families.getFamilyMetricsGiving` | `GET /families/{id}/metrics/giving` | Get family giving metrics |
| `families.getFamilyNotes` | `GET /families/{id}/notes` | Get notes for all family members |
| `families.updateFamily` | `PUT /families/{id}` | Update family |
| `families.updateFamilyPhoto` | `POST /families/{id}/photo` | Update family photo |

## files

| Method | Endpoint | Description |
| --- | --- | --- |
| `files.deleteIndividualFile` | `DELETE /individuals/{id}/files/{file_id}` | Deletes file |
| `files.getFile` | `GET /files/{id}` | Get a file |
| `files.getIndividualFiles` | `GET /individuals/{id}/files` | Get an individual's profile files |
| `files.importIndividuals` | `POST /data_import/individuals` | Upload a CSV file for import with the following columns of data as families of individuals. Expected columns - First Name, Last Name, Email, Phone, Address. Address must be formatted as - street, city, state abbreviation, zip code |
| `files.importSacraments` | `POST /data_import/sacraments` | Upload a CSV file for importing sacraments for an individual. Expected columns - individual id, Name, sacrament data columns... |
| `files.updateIndividualFile` | `POST /individuals/{id}/files/{file_id}` | Updates file |
| `files.uploadFile` | `POST /files` | Upload a file |
| `files.uploadIndividualFile` | `POST /individuals/{id}/files` | Upload a file to an individual's profile |

## forms

| Method | Endpoint | Description |
| --- | --- | --- |
| `forms.addFormManager` | `POST /forms/{id}/managers` | Add form manager |
| `forms.createFormAutomation` | `POST /forms/{id}/automations` | Create form automation |
| `forms.createFormResponse` | `POST /forms/{id}/responses` | Create a new form response |
| `forms.deleteFormAutomation` | `DELETE /form_automations/{id}` | Delete form automation |
| `forms.deleteFormManager` | `DELETE /forms/{id}/managers/{manager_id}` | Remove form manager |
| `forms.getForm` | `GET /forms/{id}` | Get a specific form |
| `forms.getFormAutomations` | `GET /forms/{id}/automations` | Get a list of form automations |
| `forms.getFormQuestions` | `GET /forms/{id}/questions` | get a list of questions for a specific form |
| `forms.getFormRespondents` | `GET /forms/{id}/respondents` | Get the list of individuals you can make responses for |
| `forms.getFormResponse` | `GET /form_responses/{id}` | get a form response |
| `forms.getFormResponses` | `GET /forms/{id}/responses` | Get a list of form responses |
| `forms.getForms` | `GET /forms` | Get list of forms |
| `forms.getIndividualFormResponses` | `GET /individuals/{id}/form_responses` | Get an individual's form responses |
| `forms.getIndividualForms` | `GET /individuals/{id}/forms` | Get list of forms individual manages |
| `forms.updateFormAutomation` | `PUT /form_automations/{id}` | Update form automation |

## groups

| Method | Endpoint | Description |
| --- | --- | --- |
| `groups.addGroupMembers` | `POST /groups/{id}/members` | Add individuals to a group |
| `groups.createMessageComment` | `POST /messages/{id}/comments` | Create group message comment |
| `groups.deleteGroupMembers` | `DELETE /groups/{id}/members` | Remove individuals from a group |
| `groups.deleteGroupPhoto` | `DELETE /groups/{id}/photo` | Remove group's photo |
| `groups.deleteMessage` | `DELETE /messages/{id}` | Remove group message |
| `groups.deleteMessageComment` | `DELETE /messages/{id}/comments/{comment_id}` | Remove group message comment |
| `groups.getAttendanceNeededCount` | `GET /groups/{id}/attendance/needed` | Get the group attendance needed count |
| `groups.getGroup` | `GET /groups/{id}` | Get group |
| `groups.getGroupAreas` | `GET /group_areas` | Get Group Areas of Town |
| `groups.getGroupAttendance` | `GET /groups/{id}/attendance` | Get the group events in the timeframe |
| `groups.getGroupAttendanceGroupings` | `GET /groups/{id}/attendance_groupings` | Get group's attendance groupings |
| `groups.getGroupCalendar` | `GET /groups/{id}/calendar` | Get the group events in the timeframe |
| `groups.getGroupEventOwnerCandidates` | `GET /groups/{id}/event_owner_candidates` | Get group event owner candidates list |
| `groups.getGroupEvents` | `GET /groups/{id}/events` | Get list of group events |
| `groups.getGroupLeaders` | `GET /groups/{id}/leaders` | Get group leaders list |
| `groups.getGroupMeetDays` | `GET /group_meet_days` | Get Group Meet Days |
| `groups.getGroupMeetTimes` | `GET /group_meet_times` | Get Group Meet Times |
| `groups.getGroupMembers` | `GET /groups/{id}/members` | Get group members list |
| `groups.getGroupMessages` | `GET /groups/{id}/messages` | Get group messages |
| `groups.getGroups` | `GET /groups` | Get groups |
| `groups.getGroupsAdmin` | `GET /groups/admin` | Get groups |
| `groups.getGroupSettings` | `GET /groups/{group_id}/settings` | Get the consolidated settings payload for the modernized Edit Group Settings page |
| `groups.getGroupSpecialDays` | `GET /groups/{id}/special_days` | Get the group special days |
| `groups.getGroupTypes` | `GET /group_types` | Get Group Types |
| `groups.getIndividualsGroup` | `GET /individuals/{id}/groups/{group_id}` | Get individual's group membership details |
| `groups.getIndividualsGroups` | `GET /individuals/{id}/groups` | Get individuals groups |
| `groups.getIndividualsGroupsHistory` | `GET /individuals/{id}/history/groups` | Get individuals groups history |
| `groups.getIndividualsRequestingToJoinGroup` | `GET /groups/{id}/requesting` | Get individual's requesting to join the group |
| `groups.getMessage` | `GET /messages/{id}` | Get the group message details |
| `groups.getMessageComments` | `GET /messages/{id}/comments` | Get the group message comments |
| `groups.joinGroup` | `POST /individuals/{id}/groups/{group_id}` | Join a group |
| `groups.leaveGroup` | `DELETE /individuals/{id}/groups/{group_id}` | Leave a group |
| `groups.searchGroupParticipantCandidates` | `POST /groups/{group_id}/participant_candidates/search` | Search for people who can be added to a group |
| `groups.syncGroupAttendanceGroupings` | `POST /groups/{id}/attendance_groupings/sync` | Sync group's attendance groupings |
| `groups.updateGroup` | `PUT /groups/{id}` | Update group (currently only main leader is implemented) |
| `groups.updateGroupMemberRoles` | `PUT /groups/{group_id}/members/roles` | Update a group member's primary role and/or coach/director flags atomically |
| `groups.updateGroupMembers` | `PUT /groups/{id}/members` | Update individuals status in a group |
| `groups.updateGroupPhoto` | `POST /groups/{id}/photo` | Update group's photo |
| `groups.updateGroupSettings` | `PUT /groups/{group_id}/settings` | Update a partial subset of group settings |
| `groups.updateIndividualGroups` | `PUT /individuals/{id}/groups/bulk` | Mass remove individual from multiple groups |
| `groups.updateIndividualsGroup` | `PUT /individuals/{id}/groups/{group_id}` | Update individual's group membership details |
| `groups.updateMessage` | `PUT /messages/{id}` | Update group message |
| `groups.updateMessageComment` | `PUT /messages/{id}/comments/{comment_id}` | Update group message comment |

## individuals

| Method | Endpoint | Description |
| --- | --- | --- |
| `individuals.createBackgroundCheck` | `POST /individuals/{id}/background_checks` | Create a background check for an individual |
| `individuals.createIndividual` | `POST /individuals` | Creates an individual |
| `individuals.createIndividualNote` | `POST /individuals/{id}/notes` | Create note |
| `individuals.deleteBackgroundCheck` | `DELETE /individuals/background_checks/{id}` | Remove background check |
| `individuals.deleteIndividualMessage` | `DELETE /individual_messages/{id}` | Deletes a message |
| `individuals.deleteIndividualMessageReply` | `DELETE /individual_message_replies/{id}` | Deletes a message reply |
| `individuals.deleteIndividualPhoto` | `DELETE /individuals/{id}/photo` | Remove individual's photo |
| `individuals.getBackgroundChecks` | `GET /individuals/background_checks` | Get all background checks uploaded the vendor associated with that access token |
| `individuals.getDuplicateIndividuals` | `GET /individuals/duplicates` | Get potential duplicates matching the giving query parameters |
| `individuals.getDuplicateIndividualsForIndividual` | `GET /individuals/{id}/duplicates` | Get potential duplicates matching the giving query parameters |
| `individuals.getIgnoredIndividualsForIndividual` | `GET /individuals/{id}/ignored` | Get profiles ingnored by an individual |
| `individuals.getIndividual` | `GET /individuals/{id}` | Get details about an individual |
| `individuals.getIndividualAbilities` | `GET /individuals/{id}/abilities` | Get an individual's my fit abilities |
| `individuals.getIndividualBackgroundChecks` | `GET /individuals/{id}/background_checks` | Get all background checks for an individual by the vendor associated with the access token |
| `individuals.getIndividualGifts` | `GET /individuals/{id}/gifts` | Get an individual's my fit gifts |
| `individuals.getIndividualHistory` | `GET /individuals/{id}/history` | Gets recent edits associated with the individual |
| `individuals.getIndividualMessageReplies` | `GET /individual_messages/{id}/replies` | Gets messages replies for an individual message |
| `individuals.getIndividualMessages` | `GET /individuals/{id}/messages` | Gets messages sent or received by an individual |
| `individuals.getIndividualMetricsAttendance` | `GET /individuals/{id}/metrics/attendance` | Get individual attendance metrics |
| `individuals.getIndividualMetricsAttendanceRange` | `GET /individuals/{id}/metrics/attendance/summary` | Get occurrence of first and latest individual attendance metrics |
| `individuals.getIndividualMetricsDuplicates` | `GET /individuals/metrics/duplicates` | Get individual duplicate metrics |
| `individuals.getIndividualMetricsFormResponses` | `GET /individuals/{id}/metrics/form_responses` | Get aggregate information about an individual's form response history |
| `individuals.getIndividualMetricsGiving` | `GET /individuals/{id}/metrics/giving` | Get individual giving metrics |
| `individuals.getIndividualMetricsGivingRange` | `GET /individuals/{id}/metrics/giving/summary` | Get occurrence of first and latest individual giving metrics |
| `individuals.getIndividualMetricsGroups` | `GET /individuals/{id}/metrics/groups` | Get statistics about the individual's groups |
| `individuals.getIndividualMetricsGroupsHistory` | `GET /individuals/{id}/metrics/groups_history` | Get the individual's group totals for the past X months |
| `individuals.getIndividualMetricsProcessQueues` | `GET /individuals/{id}/metrics/process_queues` | Get information about the individual's process queue activity |
| `individuals.getIndividualMetricsServing` | `GET /individuals/{id}/metrics/serving` | Get individual serving metrics |
| `individuals.getIndividualMetricsServingRange` | `GET /individuals/{id}/metrics/serving/summary` | Get occurrence of first and latest individual serving metrics |
| `individuals.getIndividualNotes` | `GET /individuals/{id}/notes` | Get notes for an individual |
| `individuals.getIndividualPassions` | `GET /individuals/{id}/passions` | Get an individual's my fit passions |
| `individuals.getIndividualPledges` | `GET /individuals/{id}/pledges` | Get an individual's pledges |
| `individuals.getIndividualPrivacySettings` | `GET /individuals/{id}/privacy_settings` | Get an individual's privacy settings |
| `individuals.getIndividuals` | `GET /individuals` | Get individuals |
| `individuals.getIndividualsCategorizedTimelines` | `GET /individuals/{id}/categorized_timelines` | Get an individual's timeline by categories. |
| `individuals.getIndividualScheduledGifts` | `GET /individuals/{id}/scheduled_gifts` | Get an individual's scheduled gifts |
| `individuals.getIndividualsContextualTimelines` | `GET /individuals/{id}/timelines/{context_type}/{context_id}` | Get an individual's timeline by context |
| `individuals.getIndividualSocialNetworks` | `GET /individuals/{id}/social_networks` | Get an individual's social networks |
| `individuals.getIndividualsTimeline` | `GET /individuals/{id}/timelines` | Get an individual's timeline |
| `individuals.getMergedIndividualHistory` | `GET /individuals/merge_history` | Get merged individual history |
| `individuals.getMergeIndividuals` | `GET /merge/individuals` | Find profiles to merge with another profile |
| `individuals.mergeIndividuals` | `POST /individuals/{winner_id}/merge` | Merge the loser individual profile into the winner's |
| `individuals.sendIndividualMessage` | `POST /individuals/{id}/messages` | Sends an individual a message |
| `individuals.sendIndividualMessageReply` | `POST /individual_messages/{id}/replies` | Sends a reply to an individual message |
| `individuals.updateBackgroundCheck` | `PUT /individuals/background_checks/{id}` | Update an existing background check |
| `individuals.updateIndividual` | `PUT /individuals/{id}` | Updates individual |
| `individuals.updateIndividualContactInfo` | `PUT /individuals/{id}/contact_info` | Updates individual's contact info |
| `individuals.updateIndividualMessage` | `PUT /individual_messages/{id}` | Edit an individual a message |
| `individuals.updateIndividualMessageReply` | `PUT /individual_message_replies/{id}` | Edit an individual a message reply |
| `individuals.updateIndividualPhoto` | `POST /individuals/{id}/photo` | Update individual's photo |
| `individuals.updateIndividualPrivacySettings` | `PUT /individuals/{id}/privacy_settings` | Update an individual's privacy settings |
| `individuals.updateIndividualScheduledGift` | `PUT /individuals/{id}/scheduled_gifts/{gift_id}` | Update an individual's scheduled gift |
| `individuals.updateIndividualSocialNetworks` | `POST /individuals/{id}/social_networks` | Update an individual's social networks |

## integrations

| Method | Endpoint | Description |
| --- | --- | --- |
| `integrations.getCheckrIntegrations` | `GET /integrations/checkr` | Get all Checkr integrations for all campuses in an organization |

## needs

| Method | Endpoint | Description |
| --- | --- | --- |
| `needs.createNeed` | `POST /needs` | Create need |
| `needs.createNeedItem` | `POST /needs/{id}/items` | Create need item |
| `needs.deleteNeed` | `DELETE /needs/{id}` | Remove a need |
| `needs.deleteNeedItem` | `DELETE /needs/{id}/items/{item_id}` | Remove need item |
| `needs.deleteNeedItemAssignee` | `DELETE /need_items/{id}/assigned_to` | Remove need item's assignee |
| `needs.getGroupNeeds` | `GET /groups/{id}/needs` | Get group needs |
| `needs.getIndividualNeeds` | `GET /individuals/{id}/needs` | Get list of needs an individual coordinates |
| `needs.getNeedItems` | `GET /needs/{id}/items` | Get need items |
| `needs.reassignNeedCoordinator` | `PUT /needs/{id}/coordinator` | Reassign need coordinator |
| `needs.sendNeedInformEmail` | `POST /needs/{id}/inform` | Send need inform emails |
| `needs.updateNeed` | `PUT /needs/{id}` | Update a need |
| `needs.updateNeedItem` | `PUT /needs/{id}/items/{item_id}` | Update need item |
| `needs.updateNeedItemAssignee` | `PUT /need_items/{id}/assigned_to` | Update need item's assignee |

## notes

| Method | Endpoint | Description |
| --- | --- | --- |
| `notes.deleteNote` | `DELETE /notes/{id}` | Delete note |
| `notes.getIndividualNoteLeaders` | `GET /individuals/{id}/notes/leaders` | Get the sharing level leaders associated to an individual's notes |
| `notes.getNote` | `GET /notes/{id}` | Get note |
| `notes.getNotes` | `GET /notes` | Get notes |
| `notes.updateNote` | `PUT /notes/{id}` | Updates note |

## processQueues

| Method | Endpoint | Description |
| --- | --- | --- |
| `processQueues.addProcessManager` | `POST /processes/{process_id}/manager` | Add a single manager to a process |
| `processQueues.addQueueIndividual` | `POST /queues/{queue_id}/individuals` | Add an individual to a process queue |
| `processQueues.addQueueManager` | `POST /queues/{queue_id}/manager` | Add manager to a queue |
| `processQueues.completeQueueIndividual` | `POST /queues_individuals/{queueIndividualId}/done` | **Deprecated.** Complete the queue individual and perform automations |
| `processQueues.createProcess` | `POST /processes` | Create a new process |
| `processQueues.createQueue` | `POST /processes/{process_id}/queues` | **Deprecated.** Create a new queue |
| `processQueues.deleteProcess` | `DELETE /processes/{process_id}` | Delete a specific process |
| `processQueues.deleteProcessManager` | `DELETE /processes/{process_id}/managers/{manager_id}` | Remove a process manager |
| `processQueues.deleteProcessQueue` | `DELETE /queues/{queue_id}` | Delete a process queue |
| `processQueues.deleteQueueIndividual` | `DELETE /queue_individuals/{queue_individual_id}` | Remove an individual from a queue |
| `processQueues.deleteQueueIndividualDeprecated` | `DELETE /queues_individuals/{queueIndividualId}` | **Deprecated.** Remove an individual from a queue |
| `processQueues.deleteQueueManager` | `DELETE /queues/{queue_id}/managers/{manager_id}` | Remove a queue manager |
| `processQueues.duplicateProcess` | `POST /processes/{process_id}/duplicate` | Duplicate an existing process |
| `processQueues.getIndividualAdminProcesses` | `GET /individuals/{individual_id}/admin/processes` | Get a list of a processes the individual manages |
| `processQueues.getIndividualAdminProcessQueues` | `GET /individuals/{individual_id}/admin/queues` | Get a list of a queues the individual manages |
| `processQueues.getProcess` | `GET /processes/{process_id}` | Get a specific process |
| `processQueues.getProcesses` | `GET /processes` | Get a list of processes |
| `processQueues.getProcessManagers` | `GET /processes/{process_id}/managers` | Get the managers of a specific process |
| `processQueues.getProcessQueues` | `GET /processes/{process_id}/queues` | **Deprecated.** Get a list of a queues in a process |
| `processQueues.getQueue` | `GET /queues/{queue_id}` | Get queue details |
| `processQueues.getQueueIndividualByQueueId` | `GET /queues/{queue_id}/individuals/{individual_id}` | View queue individual details by queue and individual ids |
| `processQueues.getQueueManagers` | `GET /queues/{queue_id}/managers` | **Deprecated.** Get the queue's managers |
| `processQueues.getQueueManagersQueue` | `GET /queues/{queue_id}/managers/queue` | Get the managers of a queue |
| `processQueues.getStepIndividual` | `GET /queues_individuals/{queueIndividualId}` | View queue individual details |
| `processQueues.getStepIndividuals` | `GET /queues_individuals` | get a list of queue individuals |
| `processQueues.listQueues` | `GET /queues` | Get a list of queues |
| `processQueues.sendQueueIndividualsNotifications` | `POST /queues_individuals/notifications` | **Deprecated.** Send notifications for individuals added to queue |
| `processQueues.updateProcess` | `PUT /processes/{process_id}` | Update an existing process |
| `processQueues.updateQueueIndividualDeprecated` | `PUT /queues_individuals/{queueIndividualId}` | Updates queue individual |
| `processQueues.updateQueueIndividualInternal` | `PUT /queues_individuals/{queueIndividualId}/queue` | Update a queue individual |

## sacraments

| Method | Endpoint | Description |
| --- | --- | --- |
| `sacraments.createSacrament` | `POST /individuals/{id}/sacraments` | Create individual sacrament |
| `sacraments.deleteIndividualSacrament` | `DELETE /individuals/{individual_id}/sacraments/{id}` | Delete an individual sacrament |
| `sacraments.getSacrament` | `GET /individuals/{id}/sacraments` | gets individual sacraments |
| `sacraments.updateIndividualSacrament` | `PUT /individuals/{individual_id}/sacraments/{id}` | Update individual sacrament |

## savedSearches

| Method | Endpoint | Description |
| --- | --- | --- |
| `savedSearches.addUpdateSavedAdvancedSearchIndividual` | `PUT /saved_searches/search/{search_id}/individual/{individual_id}` | Update and share individual saved searches |
| `savedSearches.deleteSavedSearch` | `DELETE /saved_searches/{individual_id}/search/{id}` | Delete an advanced search |
| `savedSearches.duplicateSavedAdvancedSearch` | `POST /saved_searches/duplicate/{id}` | Create a duplicate of a saved search |
| `savedSearches.getSavedAdvancedSearch` | `GET /saved_searches/search/{id}` | Search for an advanced search. |
| `savedSearches.getSavedAdvancedSearches` | `GET /saved_searches/{individual_id}` | Search for the user's saved searches |
| `savedSearches.getSavedAdvancedSearchesList` | `GET /saved_searches/{individual_id}/list` | Search for a user's list of saved advanced searches |
| `savedSearches.getSavedAdvancedSearchIndividual` | `GET /saved_searches/search/{search_id}/individual/{individual_id}` | Get the individual associated with the saved search |
| `savedSearches.getSavedAdvancedSearchIndividuals` | `GET /saved_searches/search/{search_id}/individuals` | Get the individuals associated with the saved search |
| `savedSearches.leaveSavedSearch` | `DELETE /saved_searches/{individual_id}/search/{saved_search_id}/leave` | Removes an individual's association with a saved search. |
| `savedSearches.updateSavedSearchIndividualStar` | `PUT /saved_searches/search/{search_id}/individual/{individual_id}/star` | Update whether a saved search is starred or not. |

## scheduling

| Method | Endpoint | Description |
| --- | --- | --- |
| `scheduling.assignServingRotationToEvent` | `PUT /scheduling/events/{event_id}/serving_rotations/{serving_rotation_id}` | Assign a serving rotation to an event |
| `scheduling.autoScheduleAssignments` | `POST /scheduling/auto_schedule` | Creates as many assignments as possible for the given scheduling events |
| `scheduling.conflictsServingRotationToEvent` | `GET /scheduling/events/{event_id}/serving_rotations/{serving_rotation_id}/conflicts` | Get event assignment conflicts with serving rotation |
| `scheduling.copyEventAssignmentsEvent` | `PUT /scheduling/events/{id}/copy_assignments/{copyFromEventId}` | Update an event with assignments from another event |
| `scheduling.copyEventPositionAssignments` | `POST /scheduling/event_positions/{source_id}/copy_to/{target_id}` | Copy assignments from a source to a target |
| `scheduling.copyEventsAssignmentsEvent` | `PUT /scheduling/events/{id}/copy_assignments` | Update multiple events with assignments from another event |
| `scheduling.createAssignmentSwap` | `POST /scheduling/assignments/{id}/assignment_swaps` | Creates requests to swap serving assignments |
| `scheduling.createCategoryFile` | `POST /scheduling/categories/{id}/files` | Upload file for category |
| `scheduling.createCategoryOrganizer` | `POST /scheduling/categories/{id}/organizers` | Create new category organizer |
| `scheduling.createCategorySchedules` | `POST /scheduling/categories/{id}/schedules` | Create new schedules |
| `scheduling.createEventFile` | `POST /scheduling/events/{id}/files` | Upload file for event |
| `scheduling.createEventPositionAssignment` | `POST /scheduling/event_positions/{id}/assignments` | Creates a event position assignment |
| `scheduling.createFamilyBlockoutDate` | `POST /scheduling/families/{id}/blockout_dates` | Create a blockout date range for all family members |
| `scheduling.createIndividualBlockoutDate` | `POST /scheduling/individuals/{id}/blockout_dates` | Create a blockout date range |
| `scheduling.createIndividualServingPreferenceTimes` | `POST /scheduling/individuals/{individual_id}/preference_times` | **Deprecated.** creates a preference time per position for an individual |
| `scheduling.createPlanOrganizer` | `POST /scheduling/categories/{id}/plan_organizers` | Create a plan organizer |
| `scheduling.createScheduleCategory` | `POST /scheduling/categories` | Creates a new category e.g. Children's Ministry |
| `scheduling.createScheduleOrganizer` | `POST /scheduling/schedules/{id}/organizers` | Create a schedule organizer |
| `scheduling.createScheduleServicePlan` | `POST /scheduling/categories/{id}/service_plans` | Create a service plan |
| `scheduling.createScheduleServicePlanItem` | `POST /scheduling/service_plans/{id}/items` | Create a service plan item |
| `scheduling.createServingReminderTime` | `POST /scheduling/schedules/{id}/serving_reminder_times` | Create a serving reminder time |
| `scheduling.createServingRotationPlan` | `POST /scheduling/categories/{id}/serving_rotations` | Create a serving rotation |
| `scheduling.createServingRotationPositionAssignment` | `POST /scheduling/serving_rotation_positions/{id}/assignments` | Creates serving rotation position assignments |
| `scheduling.createTeamOrganizer` | `POST /scheduling/teams/{id}/organizers` | Create a team organizer |
| `scheduling.createVolunteer` | `POST /scheduling/positions/{id}/volunteers` | Adds a volunteer to the position |
| `scheduling.createVolunteerPosition` | `POST /scheduling/individual/{id}/positions` | Adds an individual to positions |
| `scheduling.deleteAssignment` | `DELETE /scheduling/assignments/{id}` | Delete an assignment |
| `scheduling.deleteAssignments` | `DELETE /scheduling/assignments` | Delete all assignments of the given events |
| `scheduling.deleteIndividualBlockoutDate` | `DELETE /scheduling/blockout_dates/{id}` | Delete an individual blockout date |
| `scheduling.deleteIndividualBlockoutDateOccurrence` | `DELETE /scheduling/blockout_dates/{id}/{occurrence}` | Remove a single occurrence from a recurring blockout date |
| `scheduling.deleteIndividualServingPreferences` | `DELETE /scheduling/individuals/{id}/preferences` | **Deprecated.** Delete an individual's serving preferences (legacy) |
| `scheduling.deleteIndividualServingPreferenceTimes` | `DELETE /scheduling/preference_times/{id}` | **Deprecated.** Deletes a preference time per position for an individual |
| `scheduling.deletePlanOrganizer` | `DELETE /scheduling/categories/{id}/plan_organizers/{individualId}` | Remove a plan organizer |
| `scheduling.deleteSchedule` | `DELETE /scheduling/schedules/{id}` | Delete a schedule |
| `scheduling.deleteScheduleCategory` | `DELETE /scheduling/categories/{id}` | Deletes a category |
| `scheduling.deleteScheduleEvents` | `DELETE /scheduling/categories/{id}/events` | Delete multiple schedule events |
| `scheduling.deleteScheduleOrganizer` | `DELETE /scheduling/schedules/{id}/organizers` | Remove a schedule organizer |
| `scheduling.deleteSchedules` | `DELETE /scheduling/categories/{id}/schedules` | Delete multiple schedules |
| `scheduling.deleteScheduleServicePlan` | `DELETE /scheduling/service_plans/{id}` | Delete a service plan |
| `scheduling.deleteScheduleServicePlanItem` | `DELETE /scheduling/service_plan_items/{id}` | delete a service plan item |
| `scheduling.deleteServingReminderTime` | `DELETE /scheduling/serving_reminder_times/{id}` | Delete a serving reminder time |
| `scheduling.deleteServingRotationPlan` | `DELETE /scheduling/categories/{id}/serving_rotations` | Delete a serving rotation |
| `scheduling.getAssignment` | `GET /scheduling/assignments/{id}` | Get an assignment |
| `scheduling.getAssignmentAssociatedTimes` | `GET /scheduling/assignments/{id}/associated_times` | Get associated times for an assignment |
| `scheduling.getAssignmentSwap` | `GET /scheduling/assignment_swaps/{id}` | get an assignment swap record |
| `scheduling.getAutoScheduleNeededVolunteers` | `GET /scheduling/auto_schedule/needed_volunteers` | Gets the number of needed volunteers for auto schedule |
| `scheduling.getAvailableAssignmentSwaps` | `GET /scheduling/assignments/{id}/available_swaps` | Get list of assignments that could possibly swap with the supplied assignment |
| `scheduling.getCategoryEvents` | `GET /scheduling/categories/{id}/events` | Gets events in the category |
| `scheduling.getCategoryIndividuals` | `GET /scheduling/categories/{id}/individuals` | Gets individuals serving in a category |
| `scheduling.getCategoryOrganizers` | `GET /scheduling/categories/{id}/organizers` | Get category's organizers |
| `scheduling.getEventPositionCandidates` | `GET /scheduling/event_positions/{id}/candidates` | Returns candidates for an event position |
| `scheduling.getFamilyAssignments` | `GET /scheduling/families/{id}/assignments` | Gets a family's assignments |
| `scheduling.getFamilyBlockoutDates` | `GET /scheduling/families/{id}/blockout_dates` | Get a familiy's blockout dates for a date range |
| `scheduling.getFamilyOpenEventPositions` | `GET /scheduling/families/{id}/open_event_positions` | Get a family's open event positions |
| `scheduling.getIndividualAssignments` | `GET /individuals/{id}/assignments` | Gets an individual's assignments |
| `scheduling.getIndividualBlockoutDates` | `GET /scheduling/individuals/{id}/blockout_dates` | Get an individuals blockout dates for a date range |
| `scheduling.getIndividualOpenEventPosition` | `GET /scheduling/individuals/{id}/open_event_positions/{event_position_id}` | Get an individual's open event position |
| `scheduling.getIndividualOpenEventPositions` | `GET /scheduling/individuals/{id}/open_event_positions` | Get an individual's open event positions |
| `scheduling.getIndividualPositions` | `GET /scheduling/individuals/{id}/positions` | Get an individual's filled positions |
| `scheduling.getIndividualServingPreferences` | `GET /scheduling/individuals/{id}/preferences` | **Deprecated.** Get an individuals serving preferences (legacy) |
| `scheduling.getIndividualServingPreferenceTimes` | `GET /scheduling/individuals/{individual_id}/preference_times` | **Deprecated.** retrieves preference times for an individual |
| `scheduling.getIndividualUnifiedServingPreferences` | `GET /scheduling/individuals/{id}/unified_preferences` | Get an individual's unified serving preferences |
| `scheduling.getNotificationMetrics` | `GET /scheduling/categories/{id}/notifications/metrics` | Gets notification metrics |
| `scheduling.getPlanOrganizers` | `GET /scheduling/categories/{id}/plan_organizers` | Get plan organizers |
| `scheduling.getSchedule` | `GET /scheduling/schedules/{id}` | Get a schedule |
| `scheduling.getScheduleAssignmentMetrics` | `GET /scheduling/schedules/{id}/assignment_metrics` | Get schedule assignment metrics |
| `scheduling.getScheduleCategories` | `GET /scheduling/categories` | Gets all categories |
| `scheduling.getScheduleCategory` | `GET /scheduling/categories/{id}` | Gets a category |
| `scheduling.getScheduleDates` | `GET /scheduling/categories/{id}/available_schedule_dates` | Get available schedule dates for a category |
| `scheduling.getScheduleOrganizer` | `GET /scheduling/schedules/{id}/organizers` | Get schedule organizers |
| `scheduling.getSchedules` | `GET /scheduling/categories/{id}/schedules` | Get schedules for a category |
| `scheduling.getScheduleServicePlan` | `GET /scheduling/categories/{id}/service_plans` | Get category service plans |
| `scheduling.getSchedulingEvent` | `GET /scheduling/events/{id}` | Get scheduling event |
| `scheduling.getServingReminderTimes` | `GET /scheduling/schedules/{id}/serving_reminder_times` | Get the serving reminder times for the schedule |
| `scheduling.getServingRotationPositionCandidates` | `GET /scheduling/serving_rotation_positions/{id}/candidates` | Get serving rotation position candidates |
| `scheduling.getServingRotations` | `GET /scheduling/categories/{id}/serving_rotations` | Get serving rotations for a category |
| `scheduling.getSongDetail` | `GET /scheduling/songs/{song_id}` | Get song detail |
| `scheduling.getTeamOrganizers` | `GET /scheduling/teams/{id}/organizers` | Get team organizers |
| `scheduling.getVersionLinks` | `GET /scheduling/song_versions/{version_id}/links` | Get song version links |
| `scheduling.messageSchedulers` | `POST /scheduling/schedules/{id}/message_schedulers` | Sends a message to the schedule's schedulers |
| `scheduling.messageVolunteers` | `POST /scheduling/categories/{id}/messages` | Sends notifications |
| `scheduling.migrateVolunteer` | `POST /scheduling/positions/{id}/volunteer-migrations` | Pulls group members into a position |
| `scheduling.openEventPositions` | `PUT /scheduling/schedules/{id}/open_event_positions` | Sets event positions as open or closed |
| `scheduling.openScheduleNotification` | `POST /scheduling/schedules/{id}/open_schedule_notifications` | Sends schedule notification for open positions |
| `scheduling.openScheduleNotificationRecipients` | `GET /scheduling/schedules/{id}/open_schedule_notifications/recipients` | Gets recipient info |
| `scheduling.removeTeamOrganizer` | `DELETE /scheduling/teams/{id}/organizers/{individual_id}` | Remove a team organizer |
| `scheduling.searchForSchedulingIndividuals` | `POST /scheduling/search_individuals` | **Deprecated.** Use `POST /search/scheduling_individuals/results` instead |
| `scheduling.searchPositions` | `GET /scheduling/positions` | Search for positions |
| `scheduling.searchTeams` | `GET /scheduling/teams` | Search teams |
| `scheduling.sendScheduleCategoryNotifications` | `POST /scheduling/categories/{id}/notifications` | Sends notifications |
| `scheduling.setCheckinLabels` | `PUT /scheduling/events/{id}/set_checkin_labels` | Sets event checkin labels status |
| `scheduling.updateAssignment` | `PUT /scheduling/assignments/{id}` | Update an assignment |
| `scheduling.updateAssignmentsAssociatedTimes` | `PUT /scheduling/assignments/{assignment_id}/associated_times/{associated_time_id}` | Updates an assignment associated time |
| `scheduling.updateAssignmentSwap` | `PUT /scheduling/assignment_swaps/{id}` | Update an assignment swap |
| `scheduling.updateBulkServicePlanItems` | `PUT /scheduling/service_plans/{id}/items` | Update bulk service plan items |
| `scheduling.updateEventPosition` | `PUT /scheduling/event_positions/{id}` | Updates the quantity required for an event position |
| `scheduling.updateEventPositionAssociatedTimes` | `PUT /scheduling/event_positions/{event_position_id}/associated_times/{associated_time_id}` | Updates all associated time associated times in an event position |
| `scheduling.updateEventPositionsAssociatedTimes` | `PUT /scheduling/events/{event_id}/event_position_associated_times` | Updates all event position associated times in an event |
| `scheduling.updateEventTeamAssociatedTimes` | `PUT /scheduling/event_teams/{event_team_id}/associated_times/{associated_time_id}` | Updates all assignment associated times in an event team |
| `scheduling.updateIndividualBlockoutDate` | `PUT /scheduling/blockout_dates/{id}` | Update an individual blockout date |
| `scheduling.updateIndividualServingPreferences` | `PUT /scheduling/individuals/{id}/preferences` | **Deprecated.** Update an individual's serving preferences (legacy) |
| `scheduling.updateIndividualServingPreferenceTimes` | `PUT /scheduling/preference_times/{id}` | **Deprecated.** updates a preference time per position for an individual |
| `scheduling.updateIndividualUnifiedServingPreferences` | `PUT /scheduling/individuals/{id}/unified_preferences` | Update an individual's unified serving preferences |
| `scheduling.updatePosition` | `PUT /scheduling/position/{id}` | Update a position |
| `scheduling.updateSchedule` | `PUT /scheduling/schedules/{id}` | Updates the schedule |
| `scheduling.updateScheduleCategory` | `PUT /scheduling/categories/{id}` | Updates a category |
| `scheduling.updateScheduleServicePlan` | `PUT /scheduling/service_plans/{id}` | Update a service plan |
| `scheduling.updateScheduleServicePlanItem` | `PUT /scheduling/service_plan_items/{id}` | Update a service plan item |
| `scheduling.updateSchedulingEvent` | `PUT /scheduling/events/{id}` | Update an event |
| `scheduling.updateServingReminderTime` | `PUT /scheduling/serving_reminder_times/{id}` | Update serving reminder time |
| `scheduling.updateServingRotationPlan` | `PUT /scheduling/categories/{id}/serving_rotations` | Update a serving rotation |
| `scheduling.updateServingRotationPosition` | `PUT /scheduling/serving_rotation_positions/{id}` | Updates the quantity required for a serving rotation position |
| `scheduling.updateVolunteer` | `PUT /scheduling/volunteers/{id}` | updates a volunteer |
| `scheduling.writeFamilyAssignments` | `PUT /scheduling/families/{id}/assignments` | Updates all assignments to given status for a family |
| `scheduling.writeIndividualAssignments` | `PUT /individuals/{id}/assignments` | Updates all assignments to given status |

## search

| Method | Endpoint | Description |
| --- | --- | --- |
| `search.getAdvancedSearchCriteria` | `GET /search/criteria/{domain}` | **Deprecated.** Use `GET /search/{domain}` instead |
| `search.getDepartmentDetailAdvancedSearchResults` | `POST /search/department_detail/results` | Search for department details |
| `search.getEventAttendanceAdvancedSearchResults` | `POST /search/individual_event_attendance/results` | Search for event attendance |
| `search.getGroupAdvancedSearchResults` | `POST /search/groups/results` | Search for groups |
| `search.getIndividualAdvancedSearchResults` | `POST /search/individuals/results` | Search for individuals |
| `search.getIndividualGroupAdvancedSearchResults` | `POST /search/individual_groups/results` | Search for groups associated to an individual |
| `search.getScheduleAdvancedSearchResults` | `POST /search/schedules/results` | Search for schedules |
| `search.getScheduleFileAdvancedSearchResults` | `POST /search/scheduling_files/results` | Search for scheduling files |
| `search.getScheduleTotalAdvancedSearchResults` | `POST /search/schedules_totals/results` | Search for totals for schedule results |
| `search.getSchedulingAssignmentAdvancedSearchResults` | `POST /search/assignments/results` | Search for scheduling assignments |
| `search.getSchedulingCategoriesAdvancedSearchResults` | `POST /search/categories/results` | Search for scheduling categories |
| `search.getSchedulingIndividualAdvancedSearchResults` | `POST /search/scheduling_individuals/results` | Search for individuals under a scheduling context |
| `search.getSchedulingOrganizerAdvancedSearchResults` | `POST /search/organizers/results` | Search for scheduling organizers |
| `search.getSchedulingPositionAdvancedSearchResults` | `POST /search/positions/results` | Search for scheduling positions |
| `search.getSchedulingVolunteerAdvancedSearchResults` | `POST /search/volunteers/results` | Search for scheduling volunteers |
| `search.getSongAdvancedSearchResults` | `POST /search/songs/results` | Search for songs |
| `search.performMassEditSacraments` | `POST /search/individuals/actions/mass_edit_sacraments` | mass edit sacraments for individuals |
| `search.performUnsavedAdvancedSearch` | `POST /search/results` | **Deprecated.** Use `POST /search/{domain}/results` instead |
| `search.saveAdvancedSearch` | `POST /search/save` | Save an advanced search |
| `search.updateAdvancedSearch` | `PUT /search/save/{id}` | Update an advanced search |

## session

| Method | Endpoint | Description |
| --- | --- | --- |
| `session.getMe` | `GET /me` | Get information about the current logged in individual |
| `session.resetPassword` | `POST /reset_password` | Generates reset password email |

## settings

| Method | Endpoint | Description |
| --- | --- | --- |
| `settings.getFinancialSettings` | `GET /settings/financial` | Returns organization financial settings |
| `settings.updateFinancialSettings` | `PUT /settings/financial` | Update organization financial settings |

## templates

| Method | Endpoint | Description |
| --- | --- | --- |
| `templates.createTemplate` | `POST /templates` | create a new template |
| `templates.deleteTemplate` | `DELETE /templates/{id}` | delete a template |
| `templates.getTemplate` | `GET /templates/{id}` | get a single template |
| `templates.getTemplates` | `GET /templates` | Search and filter templates |
| `templates.updateTemplate` | `PUT /templates/{id}` | edit a template |
| `templates.useTemplateToCreateEntity` | `POST /templates/{id}/entities` | Use a template to create a new entity, such as a form or mail merge |

## workflows

| Method | Endpoint | Description |
| --- | --- | --- |
| `workflows.deleteStepIndividual` | `DELETE /step_individuals/{step_individual_id}` | Delete a step individual |
| `workflows.getStep` | `GET /steps/{step_id}` | Get a step by ID |
| `workflows.getStepManagers` | `GET /steps/{step_id}/managers` | Get the managers assigned to a step |
| `workflows.getWorkflow` | `GET /workflows/{workflow_id}` | Get a workflow by ID |
| `workflows.getWorkflowManagers` | `GET /workflows/{workflow_id}/managers` | Get the managers of a specific workflow |
| `workflows.getWorkflowStepIndividual` | `GET /step_individuals/{step_individual_id}` | Get a step individual by ID |
| `workflows.listStepIndividuals` | `GET /step_individuals` | List all step individuals across all steps |
| `workflows.listSteps` | `GET /steps` | List steps across all workflows |
| `workflows.listWorkflows` | `GET /workflows` | List workflows |
| `workflows.listWorkflowSteps` | `GET /workflows/{workflow_id}/steps` | Get a list of steps in a workflow |
| `workflows.markStepIndividualDone` | `POST /step_individuals/{step_individual_id}/done` | Mark a step individual as done and execute step actions |
| `workflows.updateStepIndividual` | `PUT /step_individuals/{step_individual_id}` | Update a step individual |
