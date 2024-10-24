INSERT INTO settings("key", "value", "label", "description", "input_type", "categories") VALUES ('mileage_rate', .58, 'Mileage Rate', 'The current mileage rate for personal car mileage reimbursement.', 'number', '{"approval-requests", "reimbursement-requests", "admin-settings"}');

-- approval requests
INSERT INTO "settings" ("key", "value", "label", "description", "default_value", "use_default_value", "keywords", "settings_page_order", "input_type", "categories", "can_be_html")
VALUES ('approval_request_form_intro', '', 'Approval Request Form Intro', 'Shown on the top of the approval request form.', 'Use the following form to request approval for your travel, training, or professional development.', '1', NULL, '10', 'textarea', '{approval-requests,admin-settings}', '1');

INSERT INTO "settings" ("key", "value", "label", "description", "default_value", "use_default_value", "keywords", "settings_page_order", "input_type", "categories", "can_be_html")
VALUES ('approval_request_form_location_in-state', '', 'Location: In-state desciption', 'Description below the in-state option of the location radio on the approval request form', NULL, '0', NULL, '10', 'textarea', '{approval-requests,admin-settings}', '1');

INSERT INTO "settings" ("key", "value", "label", "description", "default_value", "use_default_value", "keywords", "settings_page_order", "input_type", "categories", "can_be_html")
<<<<<<< HEAD
VALUES ('approval_request_form_location_out-of-state', '', 'Location: Out of State Description', 'Description below the out-of-state option of the location radio on the approval request form', 'IMPORTANT: All out-of-state trips must be registered using the <a href=''https://ehs.ucop.edu/away/''>UC Away form</a>.', '1', NULL, '10', 'textarea', '{approval-requests,admin-settings}', '1');
=======
VALUES ('approval_request_form_location_out-of-state', '', 'Location: Out of State Description', 'Description below the out-of-state option of the location radio on the approval request form', '', '0', NULL, '10', 'textarea', '{approval-requests,admin-settings}', '1');
>>>>>>> e08265d6bde15cb1c212bc80a0d6db0fec292361

INSERT INTO "settings" ("key", "value", "label", "description", "default_value", "use_default_value", "keywords", "settings_page_order", "input_type", "categories", "can_be_html")
VALUES ('approval_request_form_location_virtual', '', 'Location: Virtual desciption', 'Description below the virtual option of the location radio on the approval request form', NULL, '0', NULL, '10', 'textarea', '{approval-requests,admin-settings}', '1');

INSERT INTO "settings" ("key", "value", "label", "description", "default_value", "use_default_value", "keywords", "settings_page_order", "input_type", "categories", "can_be_html")
VALUES ('approval_request_form_custom_travel', '', 'Custom Travel Dates Explanatory Text', 'Placed below "Custom Travel Dates" checkbox on new approval form.', 'Travel dates are different from program dates entered above', '1', NULL, '10', 'textarea', '{approval-requests,admin-settings}', '1');

INSERT INTO "settings" ("key", "value", "label", "description", "default_value", "use_default_value", "keywords", "settings_page_order", "input_type", "categories", "can_be_html")
VALUES ('approval_request_form_travel-required', '', 'Travel Required Explanatory Text', 'Placed below "Travel Required" checkbox on new approval form.', 'Travel is required for this trip, training, or professional development opportunity.', '1', NULL, '10', 'textarea', '{approval-requests,admin-settings}', '1');

INSERT INTO "settings" ("key", "value", "label", "description", "default_value", "use_default_value", "keywords", "settings_page_order", "input_type", "categories", "can_be_html")
VALUES ('mileage_rate_description', '', 'Mileage Rate Description', 'Displayed below mileage input on approval request form.', 'Your estimated round-trip mileage. Reimbursement is based on mileage driven and the current IRS mileage rates, not actual expenses such as gasoline.', '1', NULL, '10', 'textarea', '{approval-requests,admin-settings}', '1');

INSERT INTO "settings" ("key", "value", "label", "description", "default_value", "use_default_value", "keywords", "settings_page_order", "input_type", "categories", "can_be_html")
VALUES ('approval_chain_intro', '', 'Approval Chain Introduction', 'Displayed above list of required approvers.', 'Based on the funding sources selected, the following employees will be notified and required to approve your request:', '1', NULL, '10', 'textarea', '{approval-requests,admin-settings}', '1');

INSERT INTO "settings" ("key", "value", "label", "description", "default_value", "use_default_value", "keywords", "settings_page_order", "input_type", "categories", "can_be_html")
VALUES ('approval_chain_intro_none', '', 'Approval Chain Introduction (no approval required)', 'Displayed above list of required approvers if no approval is required.', 'Based on the funding sources selected, approval is not required for this request.', '1', NULL, '10', 'textarea', '{approval-requests,admin-settings}', '0');

INSERT INTO "settings" ("key", "value", "label", "description", "default_value", "use_default_value", "keywords", "settings_page_order", "input_type", "categories", "can_be_html")
VALUES ('allocation_summary_description', '', 'Allocation Summary Description', 'Displays below the title of the "Your Allocations" widget', 'The following funding sources are subject to an allocation cap:', '1', NULL, '10', 'textarea', '{approval-requests,admin-settings}', '1');

INSERT INTO "settings" ("key", "value", "label", "description", "default_value", "use_default_value", "keywords", "settings_page_order", "input_type", "categories", "can_be_html")
VALUES ('approval_request_form_release_time', '', 'Release Time - Description', 'Displays below release time input on approval request form', NULL, '0', NULL, '10', 'textarea', '{approval-requests,admin-settings}', '0');

<<<<<<< HEAD
=======
INSERT INTO "settings" ("key", "value", "label", "description", "default_value", "use_default_value", "keywords", "settings_page_order", "input_type", "categories", "can_be_html")
VALUES ('approval_request_more_reimbursement_description', '', 'More Reimbursement Description', 'Shows in reimbursement section of approval request when all reimbursements have been processed, but employee has indicated that more requests are forthcoming', 'Even though all reimbursement requests have been fully processed, the overall reimbursement status for this trip/professional development opportunity is still "partially processed" because the employee indicated that more reimbursement requests are forthcoming.', '1', NULL, '10', 'textarea', '{approval-requests,admin-settings}', '1');

INSERT INTO "settings" ("key", "value", "label", "description", "default_value", "use_default_value", "keywords", "settings_page_order", "input_type", "categories", "can_be_html")
VALUES ('approval_request_more_reimbursement_action', '', 'More Reimbursement Action', 'Shows in reimbursement section of approval request when all reimbursements have been processed, but employee has indicated that more requests are forthcoming', 'Change overall status to "fully reimbursed"', '1', NULL, '10', 'textarea', '{approval-requests,admin-settings}', '0');

INSERT INTO "settings" ("key", "value", "label", "description", "default_value", "use_default_value", "keywords", "settings_page_order", "input_type", "categories", "can_be_html")
VALUES ('approval_request_form_business_purpose', '', 'Business Purpose Description', 'Displayed below the business purpose input on the new approval request form', 'Business purpose must describe how the expense benefits you, as well as how it benefits the university.', '1', NULL, '10', 'textarea', '{approval-requests,admin-settings}', '1');



INSERT INTO "settings" ("key", "value", "label", "description", "default_value", "use_default_value", "keywords", "settings_page_order", "input_type", "categories", "can_be_html")
VALUES ('approval_request_form_location_description', '', 'Location: Overall Description', 'Displays below location section header on new approval request form', 'IMPORTANT: All out-of-state trips must be registered using the <a href=''https://ehs.ucop.edu/away/''>UC Away form</a>.', '1', NULL, '10', 'textarea', '{approval-requests,admin-settings}', '1');

>>>>>>> e08265d6bde15cb1c212bc80a0d6db0fec292361
-- admin line items page
INSERT INTO "settings" ("key", "value", "label", "description", "default_value", "use_default_value", "keywords", "settings_page_order", "input_type", "categories", "can_be_html")
VALUES ('admin_line_items_description', '', 'Admin - Line Items Description', 'Displays on top of line item admin settings page', 'Requesters will be able to select and assign monetary values to the following line items when submitting an approval form', '1', NULL, '100', 'textarea', '{admin-line-items,admin-settings}', '1');
INSERT INTO "settings" ("key", "value", "label", "description", "default_value", "use_default_value", "keywords", "settings_page_order", "input_type", "categories", "can_be_html")
VALUES ('admin_line_items_form_order_help', '', 'Admin - Line Items Order Help Text', NULL, 'Changes the order in which the line item is displayed on the approval request form.', '1', NULL, '100', 'textarea', '{admin-line-items,admin-settings}', '0');

-- admin approver type and funding sources page
INSERT INTO "settings" ("key", "value", "label", "description", "default_value", "use_default_value", "keywords", "settings_page_order", "input_type", "categories", "can_be_html")
VALUES ('approver_type_description', '', 'Admin - Approver Type Description', 'Displays on top of approver type admin settings page', 'When a request is submitted to this application, approval is required from a list of employees determined by the funding source. Employees must be registered as an approver before they can be added to the approval chain of a funding source. Some approver types are automatically generated by this system and cannot be removed in this section.', '1', NULL, '10', 'textarea', '{admin-approver-form,admin-settings}', '1');

-- admin page descriptions
INSERT INTO "settings" ("key", "value", "label", "description", "default_value", "use_default_value", "keywords", "settings_page_order", "input_type", "categories", "can_be_html")
VALUES ('admin_approvers_funding_page_description', '', 'Admin - Approvers and Funding Sources Page Description', NULL, 'Maintain funding source options and their respective approval requirements.', '1', NULL, '100', 'textarea', '{admin-page,admin-settings}', '0');
INSERT INTO "settings" ("key", "value", "label", "description", "default_value", "use_default_value", "keywords", "settings_page_order", "input_type", "categories", "can_be_html")
VALUES ('admin_reimbursement_requests_page_description', '', 'Admin - Reimbursement Requests Page Description', NULL, 'Manage submitted reimbursement requests.', '1', NULL, '100', 'textarea', '{admin-page,admin-settings}', '0');
INSERT INTO "settings" ("key", "value", "label", "description", "default_value", "use_default_value", "keywords", "settings_page_order", "input_type", "categories", "can_be_html")
VALUES ('admin_employee_allocations_page_description', '', 'Admin - Employee Allocations Page Description', NULL, 'Allocate funds to specific employees from designated sources and time periods.', '1', NULL, '100', 'textarea', '{admin-page,admin-settings}', '0');
INSERT INTO "settings" ("key", "value", "label", "description", "default_value", "use_default_value", "keywords", "settings_page_order", "input_type", "categories", "can_be_html")
VALUES ('admin_allocations_general_settings_page_description', '', 'Admin - Employee Allocations General Settings Page Description', NULL, 'Manage form field help text and other general settings.', '1', NULL, '100', 'textarea', '{admin-page,admin-settings}', '0');
INSERT INTO "settings" ("key", "value", "label", "description", "default_value", "use_default_value", "keywords", "settings_page_order", "input_type", "categories", "can_be_html")
VALUES ('admin_allocations_line_items_page_description', '', 'Admin - Employee Allocations Line Items Page Description', NULL, 'Manage expenditure line item options when submitting an approval request.', '1', NULL, '100', 'textarea', '{admin-page,admin-settings}', '0');
<<<<<<< HEAD
=======
INSERT INTO "settings" ("key", "value", "label", "description", "default_value", "use_default_value", "keywords", "settings_page_order", "input_type", "categories", "can_be_html")
VALUES ('admin_approval_requests_page_description', '', 'Admin - Approval Requests Page Description', NULL, 'View and manage all approval requests.', '1', NULL, '100', 'textarea', '{admin-page,admin-settings}', '0');
>>>>>>> e08265d6bde15cb1c212bc80a0d6db0fec292361

-- admin email settings
INSERT INTO "settings" ("key", "value", "label", "description", "default_value", "use_default_value", "keywords", "settings_page_order", "input_type", "categories", "can_be_html") VALUES
('admin_email_settings_description',	'',	'Admin - Email Settings Description',	NULL,	'Maintain Email Default verbage and ability to disable emails being sent as Notification.',	'1',	NULL,	100,	'textarea',	'{admin-email-settings,admin-settings}',	'0');
INSERT INTO "settings" ("key", "value", "label", "description", "default_value", "use_default_value", "keywords", "settings_page_order", "input_type", "categories", "can_be_html") VALUES
('admin_email_body_request',	'',	'Admin - Email Body Request Submitted',	'Primary Email Body for sending notifications to the admin within the approval chain - "Requester submits/resubmits approval request"',	'Hi ${requesterFirstName},

Your travel, training, or professional development request has been successfully submitted. It has been sent to ${nextApproverFullName} for approval.

You may cancel, resubmit, or view the status of this request by clicking on the travel request.

Summary of your travel request:

Event Name: ${requesterLabel}
Location: ${requesterLocation}
Dates: ${requesterProgramDate}
Travel Request: ${approvalRequestUrl}',	'1',	NULL,	10,	'textarea',	'{admin-email-settings,admin-settings,admin-email-request}',	'1');
INSERT INTO "settings" ("key", "value", "label", "description", "default_value", "use_default_value", "keywords", "settings_page_order", "input_type", "categories", "can_be_html") VALUES
('admin_email_subject_request',	'',	'Admin - Email Subject Request Submitted',	'Primary Email Subject for sending notifications to the admin within the approval chain - "Requester submits/resubmits approval request"',	'Your Travel Request Has Been Submitted',	'1',	NULL,	10,	'textarea',	'{admin-email-settings,admin-settings,admin-email-request}',	'1');
INSERT INTO "settings" ("key", "value", "label", "description", "default_value", "use_default_value", "keywords", "settings_page_order", "input_type", "categories", "can_be_html") VALUES
('admin_email_body_approver_change',	'',	'Admin - Email Body Request Changed',	'Primary Email Body for sending notifications to the admin within the approval chain - "Approver denies, changes requested, or approves but modifies request"',	'Dear ${requesterFullName},

Your request has been returned for correction or not approved. Please read the comments and, if applicable, make changes and resubmit.

Summary of your travel request:

Event Name: ${requesterLabel}
Location: ${requesterLocation}
Dates: ${requesterProgramDate}
Travel Request: ${approvalRequestUrl}
',	'1',	NULL,	10,	'textarea',	'{admin-email-settings,admin-settings,admin-email-approver-change}',	'1');
INSERT INTO "settings" ("key", "value", "label", "description", "default_value", "use_default_value", "keywords", "settings_page_order", "input_type", "categories", "can_be_html") VALUES
('admin_email_subject_approver_change',	'',	'Admin - Email Subject Request Changed',	'Primary Email Subject for sending notifications to the admin within the approval chain - "Approver denies, changes requested, or approves but modifies request"',	'A Status Change Has Been Made To Your Travel Request',	'1',	NULL,	10,	'textarea',	'{admin-email-settings,admin-settings,admin-email-approver-change}',	'1');
INSERT INTO "settings" ("key", "value", "label", "description", "default_value", "use_default_value", "keywords", "settings_page_order", "input_type", "categories", "can_be_html") VALUES
('admin_email_subject_chain_completed',	'',	'Admin - Email Subject Request Approved',	'Primary Email Subject for sending notifications to the admin within the approval chain - "All approvers in chain have approved request"',	'Your Travel Request Has Been Approved',	'1',	NULL,	10,	'textarea',	'{admin-email-settings,admin-settings,admin-email-chain-completed}',	'1');
INSERT INTO "settings" ("key", "value", "label", "description", "default_value", "use_default_value", "keywords", "settings_page_order", "input_type", "categories", "can_be_html") VALUES
('admin_email_subject_next_approver',	'',	'Admin - Email Subject Approver Next',	'Primary Email Subject for sending notifications to the admin within the approval chain - "An approver approves approval request"',	'Travel Request for ${requesterFullName} Needs Approval ',	'1',	NULL,	10,	'textarea',	'{admin-email-settings,admin-settings,admin-email-next-approver}',	'1');
INSERT INTO "settings" ("key", "value", "label", "description", "default_value", "use_default_value", "keywords", "settings_page_order", "input_type", "categories", "can_be_html") VALUES
('admin_email_subject_funded_hours',	'',	'Admin - Email Subject Funded Hours',	'Primary Email Subject for sending notifications to the admin within the approval chain - "hours completed of funded trip"',	'Reminder To Submit Your Expenses',	'1',	NULL,	10,	'textarea',	'{admin-email-settings,admin-settings,admin-email-funded-hours}',	'1');
INSERT INTO "settings" ("key", "value", "label", "description", "default_value", "use_default_value", "keywords", "settings_page_order", "input_type", "categories", "can_be_html") VALUES
('admin_email_body_next_approver',	'',	'Admin - Email Body Approver Next',	'Primary Email Body for sending notifications to the admin within the approval chain - "An approver approves approval request"',	'Dear ${nextApproverFullName},

${requesterFullName} has submitted a travel request.  Please review this request that needs your approval.

Summary of your travel request:

Event Name: ${requesterLabel}
Location: ${requesterLocation}
Dates: ${requesterProgramDate}
Travel Request: ${approvalRequestUrl}',	'1',	NULL,	10,	'textarea',	'{admin-email-settings,admin-settings,admin-email-next-approver}',	'1');
INSERT INTO "settings" ("key", "value", "label", "description", "default_value", "use_default_value", "keywords", "settings_page_order", "input_type", "categories", "can_be_html") VALUES
('admin_email_body_request_cancel',	'',	'Admin - Email Body Request Canceled',	'Primary Email Body for sending notifications to the admin within the approval chain - "Requester recalls/cancels approval request"',	'Dear ${requesterFullName},

Your request has been returned for correction or not approved. Please read the comments and, if applicable, make changes and resubmit.

Summary of your travel request:

Event Name: ${requesterLabel}
Location: ${requesterLocation}
Dates: ${requesterProgramDate}
Travel Request: ${approvalRequestUrl}
',	'1',	NULL,	10,	'textarea',	'{admin-email-settings,admin-settings,admin-email-request-cancel}',	'1');
INSERT INTO "settings" ("key", "value", "label", "description", "default_value", "use_default_value", "keywords", "settings_page_order", "input_type", "categories", "can_be_html") VALUES
('admin_email_subject_request_cancel',	'',	'Admin - Email Subject Request Canceled',	'Primary Email Subject for sending notifications to the admin within the approval chain - "Requester recalls/cancels approval request"',	'A Status Change Has Been Made To Your Travel Request',	'1',	NULL,	10,	'textarea',	'{admin-email-settings,admin-settings,admin-email-request-cancel}',	'1');
INSERT INTO "settings" ("key", "value", "label", "description", "default_value", "use_default_value", "keywords", "settings_page_order", "input_type", "categories", "can_be_html") VALUES
('admin_email_address',	'',	'Admin - Primary Email Address',	'Primary Email Address for sending notifications to the admin inside the approval chain',	'',	'0',	NULL,	10,	'textarea',	'{admin-email-settings,admin-settings}',	'1');
INSERT INTO "settings" ("key", "value", "label", "description", "default_value", "use_default_value", "keywords", "settings_page_order", "input_type", "categories", "can_be_html") VALUES
('admin_email_subject_submit_reimbursement',	'',	'Admin - Email Subject Reimbursement Submitted',	'Primary Email Subject for sending notifications to the admin within the approval chain - "Requester submits reimbursement"',	'Travel Expense Has Been Submitted',	'1',	'',	10,	'textarea',	'{admin-email-settings,admin-settings,admin-email-submit-reimbursement}',	'1');
INSERT INTO "settings" ("key", "value", "label", "description", "default_value", "use_default_value", "keywords", "settings_page_order", "input_type", "categories", "can_be_html") VALUES
('admin_email_body_funded_hours',	'',	'Admin - Email Body Funded Hours',	'Primary Email Body for sending notifications to the admin within the approval chain - "hours completed of funded trip"',	'Dear ${requesterFullName},

For your recent travel or professional development/training expense, please submit an expense submission form with receipts to Library Administration within 5 days. Expenses not submitted in a timely fashion are subject to being reported as taxable income. If you have no expenses to claim, or have already submitted your expenses for processing, please disregard this message. Please contact your travel processor if you have any questions

Summary of your travel request:

Event Name: ${requesterLabel}
Location: ${requesterLocation}
Dates: ${requesterProgramDate}
Travel Request: ${approvalRequestUrl}',	'1',	NULL,	10,	'textarea',	'{admin-email-settings,admin-settings,admin-email-funded-hours}',	'1');
INSERT INTO "settings" ("key", "value", "label", "description", "default_value", "use_default_value", "keywords", "settings_page_order", "input_type", "categories", "can_be_html") VALUES
('admin_email_body_chain_completed',	'',	'Admin - Email Body Request Approved',	'Primary Email Body for sending notifications to the admin within the approval chain - "All approvers in chain have approved request"',	'Dear ${requesterFullName},

We are happy to inform you that your request has been APPROVED.

Summary of your travel request:

Event Name: ${requesterLabel}
Location: ${requesterLocation}
Dates: ${requesterProgramDate}
Travel Request: ${approvalRequestUrl}
',	'1',	NULL,	10,	'textarea',	'{admin-email-settings,admin-settings,admin-email-chain-completed}',	'1');
INSERT INTO "settings" ("key", "value", "label", "description", "default_value", "use_default_value", "keywords", "settings_page_order", "input_type", "categories", "can_be_html") VALUES
('admin_email_body_submit_reimbursement',	'',	'Admin - Email Body Reimbursement Submitted',	'Primary Email Body for sending notifications to the admin within the approval chain - "Requester submits reimbursement"',	'Dear Travel Processor:

A requester has submitted their expenses for:

Event: ${reimbursementLabel}
Dates: ${reimbursementTravelDate}
Reimbursement Request: ${reimbursementRequestUrl}',	'1',	'',	10,	'textarea',	'{admin-email-settings,admin-settings,admin-email-submit-reimbursement}',	'1');
-- INSERT INTO "settings" ("key", "value", "label", "description", "default_value", "use_default_value", "keywords", "settings_page_order", "input_type", "categories", "can_be_html")
-- VALUES ('admin_email_settings_description', '', 'Admin - Email Settings Description', NULL, 'Maintain Email Default verbage and ability to disable emails being sent as Notification.', '1', NULL, '100', 'textarea', '{admin-email-settings,admin-settings}', '0');
-- INSERT INTO "settings" ("key", "value", "label", "description", "default_value", "use_default_value", "keywords", "settings_page_order", "input_type", "categories", "can_be_html")
-- VALUES ('admin_email_body_chain_completed','','Admin - Email Body Request Approved','Primary Email Body for sending notifications to the admin within the approval chain - "All approvers in chain have approved request"','Template Body','1', NULL, '10','textarea','{admin-email-settings,admin-settings}','1');
-- INSERT INTO "settings" ("key", "value", "label", "description", "default_value", "use_default_value", "keywords", "settings_page_order", "input_type", "categories", "can_be_html")
-- VALUES ('admin_email_body_funded_hours','','Admin - Email Body Funded Hours','Primary Email Body for sending notifications to the admin within the approval chain - "hours completed of funded trip"','Template Body','1', NULL, '10','textarea','{admin-email-settings,admin-settings}','1');
-- INSERT INTO "settings" ("key", "value", "label", "description", "default_value", "use_default_value", "keywords", "settings_page_order", "input_type", "categories", "can_be_html")
-- VALUES ('admin_email_body_submit_reimbursement','','Admin - Email Body Reimbursement Submitted','Primary Email Body for sending notifications to the admin within the approval chain - "Requester submits reimbursement"','Template Body','1', NULL, '10','textarea','{admin-email-settings,admin-settings}','1');
-- INSERT INTO "settings" ("key", "value", "label", "description", "default_value", "use_default_value", "keywords", "settings_page_order", "input_type", "categories", "can_be_html")
-- VALUES ('admin_email_body_reimbursement_completed','','Admin - Email Body Reimbursement Completed','Primary Email Body for sending notifications to the admin within the approval chain - "Finance/HR states all reimbursement refunds are complete"','Template Body','1', NULL, '10','textarea','{admin-email-settings,admin-settings}','1');
-- INSERT INTO "settings" ("key", "value", "label", "description", "default_value", "use_default_value", "keywords", "settings_page_order", "input_type", "categories", "can_be_html")
-- VALUES ('admin_email_body_enter_reimbursement','','Admin - Email Body Reimbursement Recorded','Primary Email Body for sending notifications to the admin within the approval chain - "Finance/HR enters reimbursement into Aggie Expense"','Template Body','1', NULL, '10','textarea','{admin-email-settings,admin-settings}','1');
-- INSERT INTO "settings" ("key", "value", "label", "description", "default_value", "use_default_value", "keywords", "settings_page_order", "input_type", "categories", "can_be_html")
-- VALUES ('admin_email_body_reimbursement_refund','','Admin - Email Body Reimbursement Refund','Primary Email Body for sending notifications to the admin within the approval chain - "Finance/HR states one of the reimbursement refund goes through"','Template Body','1', NULL, '10','textarea','{admin-email-settings,admin-settings}','1');
-- INSERT INTO "settings" ("key", "value", "label", "description", "default_value", "use_default_value", "keywords", "settings_page_order", "input_type", "categories", "can_be_html")
-- VALUES ('admin_email_body_request','','Admin - Email Body Request Submitted','Primary Email Body for sending notifications to the admin within the approval chain - "Requester submits/resubmits approval request"','Template Body','1', NULL, '10','textarea','{admin-email-settings,admin-settings}','1');
-- INSERT INTO "settings" ("key", "value", "label", "description", "default_value", "use_default_value", "keywords", "settings_page_order", "input_type", "categories", "can_be_html")
-- VALUES ('admin_email_body_request_cancel','','Admin - Email Body Request Canceled','Primary Email Body for sending notifications to the admin within the approval chain - "Requester recalls/cancels approval request"','Template Body','1', NULL, '10','textarea','{admin-email-settings,admin-settings}','1');
-- INSERT INTO "settings" ("key", "value", "label", "description", "default_value", "use_default_value", "keywords", "settings_page_order", "input_type", "categories", "can_be_html")
-- VALUES ('admin_email_body_next_approver','','Admin - Email Body Approver Next','Primary Email Body for sending notifications to the admin within the approval chain - "An approver approves approval request"','Template Body','1', NULL, '10','textarea','{admin-email-settings,admin-settings}','1');
-- INSERT INTO "settings" ("key", "value", "label", "description", "default_value", "use_default_value", "keywords", "settings_page_order", "input_type", "categories", "can_be_html")
-- VALUES ('admin_email_body_approver_change','','Admin - Email Body Request Changed','Primary Email Body for sending notifications to the admin within the approval chain - "Approver denies, changes requested, or approves but modifies request"','Template Body','1', NULL, '10','textarea','{admin-email-settings,admin-settings}','1');
-- INSERT INTO "settings" ("key", "value", "label", "description", "default_value", "use_default_value", "keywords", "settings_page_order", "input_type", "categories", "can_be_html")
-- VALUES ('admin_email_subject_reimbursement_completed','','Admin - Email Subject Reimbursement Completed','Primary Email Subject for sending notifications to the admin within the approval chain - "Finance/HR states all reimbursement refunds are complete"','Your reimbursement refund has been completed','1', NULL, '10','textarea','{admin-email-settings,admin-settings}','1');
-- INSERT INTO "settings" ("key", "value", "label", "description", "default_value", "use_default_value", "keywords", "settings_page_order", "input_type", "categories", "can_be_html")
-- VALUES ('admin_email_subject_reimbursement_refund','','Admin - Email Subject Reimbursement Refund','Primary Email Subject for sending notifications to the admin within the approval chain - "Finance/HR states one of the reimbursement refund goes through"','One of your reimbursement refunds has gone through','1', NULL, '10','textarea','{admin-email-settings,admin-settings}','1');
-- INSERT INTO "settings" ("key", "value", "label", "description", "default_value", "use_default_value", "keywords", "settings_page_order", "input_type", "categories", "can_be_html")
-- VALUES ('admin_email_subject_enter_reimbursement','','Admin - Email Subject Reimbursement Recorded','Primary Email Subject for sending notifications to the admin within the approval chain - "Finance/HR enters reimbursement into Aggie Expense"','Your reimbursement request has been entered into Aggie Expense','1', NULL, '10','textarea','{admin-email-settings,admin-settings}','1');
-- INSERT INTO "settings" ("key", "value", "label", "description", "default_value", "use_default_value", "keywords", "settings_page_order", "input_type", "categories", "can_be_html")
-- VALUES ('admin_email_subject_submit_reimbursement','','Admin - Email Subject Reimbursement Submitted','Primary Email Subject for sending notifications to the admin within the approval chain - "Requester submits reimbursement"','A requester has submitted a reimbursement request','1', NULL, '10','textarea','{admin-email-settings,admin-settings}','1');
-- INSERT INTO "settings" ("key", "value", "label", "description", "default_value", "use_default_value", "keywords", "settings_page_order", "input_type", "categories", "can_be_html")
-- VALUES ('admin_email_subject_funded_hours','','Admin - Email Subject Funded Hours','Primary Email Subject for sending notifications to the admin within the approval chain - "hours completed of funded trip"','Reported hours of your completed trip','1', NULL, '10','textarea','{admin-email-settings,admin-settings}','1');
-- INSERT INTO "settings" ("key", "value", "label", "description", "default_value", "use_default_value", "keywords", "settings_page_order", "input_type", "categories", "can_be_html")
-- VALUES ('admin_email_subject_chain_completed','','Admin - Email Subject Request Approved','Primary Email Subject for sending notifications to the admin within the approval chain - "All approvers in chain have approved request"','Your Request is Approved','1', NULL, '10','textarea','{admin-email-settings,admin-settings}','1');
-- INSERT INTO "settings" ("key", "value", "label", "description", "default_value", "use_default_value", "keywords", "settings_page_order", "input_type", "categories", "can_be_html")
-- VALUES ('admin_email_subject_approver_change','','Admin - Email Subject Request Changed','Primary Email Subject for sending notifications to the admin within the approval chain - "Approver denies, changes requested, or approves but modifies request"','A change to a travel request has been made','1', NULL, '10','textarea','{admin-email-settings,admin-settings}','1');
-- INSERT INTO "settings" ("key", "value", "label", "description", "default_value", "use_default_value", "keywords", "settings_page_order", "input_type", "categories", "can_be_html")
-- VALUES ('admin_email_subject_next_approver','','Admin - Email Subject Approver Next','Primary Email Subject for sending notifications to the admin within the approval chain - "An approver approves approval request"','A travel request is needing your approval','1', NULL, '10','textarea','{admin-email-settings,admin-settings}','1');
-- INSERT INTO "settings" ("key", "value", "label", "description", "default_value", "use_default_value", "keywords", "settings_page_order", "input_type", "categories", "can_be_html")
-- VALUES ('admin_email_subject_request_cancel','','Admin - Email Subject Request Canceled','Primary Email Subject for sending notifications to the admin within the approval chain - "Requester recalls/cancels approval request"','A Requester has Recalled their Travel Request','1', NULL, '10','textarea','{admin-email-settings,admin-settings}','1');
-- INSERT INTO "settings" ("key", "value", "label", "description", "default_value", "use_default_value", "keywords", "settings_page_order", "input_type", "categories", "can_be_html")
-- VALUES ('admin_email_subject_request','','Admin - Email Subject Request Submitted','Primary Email Subject for sending notifications to the admin within the approval chain - "Requester submits/resubmits approval request"','A Requester has Submitted a Travel Request','1', NULL, '10','textarea','{admin-email-settings,admin-settings}','1');
-- INSERT INTO "settings" ("key", "value", "label", "description", "default_value", "use_default_value", "keywords", "settings_page_order", "input_type", "categories", "can_be_html")
-- VALUES ('admin_email_address','','Admin - Primary Email Address','Primary Email Address for sending notifications to the admin inside the approval chain','admin-libtravel@ucdavis.edu','1', NULL, '10','textarea','{admin-email-settings,admin-settings}','1');
-- site wide settings
INSERT INTO "settings" ("key", "value", "label", "description", "default_value", "use_default_value", "keywords", "settings_page_order", "input_type", "categories", "can_be_html")
VALUES ('site_wide_banner', '', 'Site wide banner text', NULL, '', '0', NULL, '100', 'textarea', '{app-main,admin-settings}', '0');

-- reimbursement requests
INSERT INTO "settings" ("key", "value", "label", "description", "default_value", "use_default_value", "keywords", "settings_page_order", "input_type", "categories", "can_be_html")
VALUES ('reimbursement_form_exceed_message', '', 'Exceeded Approved Expenses Message', 'Displayed on reimbursement request form if expenses exceed approved dollar amount.', 'You have exceeded the approved dollar amount for this travel, training, or professional development event. <br /> <br />Please verify with initial approvers before submitting this request.', '1', NULL, '200', 'textarea', '{admin-settings,reimbursement-requests}', '1');
INSERT INTO "settings" ("key", "value", "label", "description", "default_value", "use_default_value", "keywords", "settings_page_order", "input_type", "categories", "can_be_html")
VALUES ('reimbursement_no_fund_transactions_message', '', 'No Fund Transactions Message', 'Displays in "Reimbursement Status" section of reimbursement request if there has been nothing entered into Aggie Expense.', 'No reimbursements have been entered into Aggie Expense yet. Please check back later.', '1', NULL, '200', 'textarea', '{admin-settings,reimbursement-requests}', '1');
<<<<<<< HEAD
=======
INSERT INTO "settings" ("key", "value", "label", "description", "default_value", "use_default_value", "keywords", "settings_page_order", "input_type", "categories", "can_be_html")
VALUES ('reimbursement_form_receipts', '', 'Reimbursement Request Receipts Description', 'Displays above receipt repeater field on new reimbursement request page', NULL, '0', NULL, '30', 'textarea', '{reimbursement-requests,admin-settings}', '0');
INSERT INTO "settings" ("key", "value", "label", "description", "default_value", "use_default_value", "keywords", "settings_page_order", "input_type", "categories", "can_be_html")
VALUES ('reimbursement_form_label_options', '', 'Reimbursement Request Label Options', 'Populates "Label" select options on new reimbursement request.', 'Post-Trip Expenses
Pre-Trip Expenses
Other Expenses', '1', NULL, '30', 'textarea', '{reimbursement-requests,admin-settings}', '0');
>>>>>>> e08265d6bde15cb1c212bc80a0d6db0fec292361

-- reports
INSERT INTO "settings" ("key", "value", "label", "description", "default_value", "use_default_value", "keywords", "settings_page_order", "input_type", "categories", "can_be_html")
VALUES ('auth_request_url', '', 'Authorization Request Url', 'Url where user will be directed to request permissions to this application.', 'https://support.staff.library.ucdavis.edu/technical-support/web-applications/', '1', NULL, '5', 'text', '{admin-settings}', '0');
INSERT INTO "settings" ("key", "value", "label", "description", "default_value", "use_default_value", "keywords", "settings_page_order", "input_type", "categories", "can_be_html")
VALUES ('metric_allocated_description', '', 'Metric: Allocated - Description', 'Displayed in help modal on report builder page.', 'Total dollar amount allocated to employee for all funding sources and fiscal years.', '1', NULL, '50', 'textarea', '{reports,admin-settings}', '1');
INSERT INTO "settings" ("key", "value", "label", "description", "default_value", "use_default_value", "keywords", "settings_page_order", "input_type", "categories", "can_be_html")
VALUES ('metric_requested_description', '', 'Metric: Requested - Description', 'Displayed in help modal on report builder page.', 'Total dollar amount requested by employee in approval request.', '1', NULL, '50', 'textarea', '{reports,admin-settings}', '1');
INSERT INTO "settings" ("key", "value", "label", "description", "default_value", "use_default_value", "keywords", "settings_page_order", "input_type", "categories", "can_be_html")
VALUES ('metric_requestedOrReimbursed_description', '', 'Metric: Requested or Reimbursed - Description', 'Displayed in help modal on report builder page.', 'Total dollar amount requested by employee in approval request or reimbursed to employee if reimbursement process is complete.', '1', NULL, '50', 'textarea', '{reports,admin-settings}', '1');
INSERT INTO "settings" ("key", "value", "label", "description", "default_value", "use_default_value", "keywords", "settings_page_order", "input_type", "categories", "can_be_html")
VALUES ('metric_allocatedMinusRequested_description', '', 'Metric: Allocated Minus Requested - Description', 'Displayed in help modal on report builder page.', 'Total dollar amount allocated to employee for all funding sources and fiscal years minus total dollar amount requested by employee in approval request.', '1', NULL, '50', 'textarea', '{reports,admin-settings}', '1');
INSERT INTO "settings" ("key", "value", "label", "description", "default_value", "use_default_value", "keywords", "settings_page_order", "input_type", "categories", "can_be_html")
VALUES ('metric_allocatedMinusRequestedOrReimbursed_description', '', 'Metric: Allocated Minus Requested or Reimbursed - Description', 'Displayed in help modal on report builder page.', 'Total dollar amount allocated to employee for all funding sources and fiscal years minus total dollar amount requested by employee in approval request or reimbursed to employee if reimbursement process is complete.', '1', NULL, '50', 'textarea', '{reports,admin-settings}', '1');
INSERT INTO "settings" ("key", "value", "label", "description", "default_value", "use_default_value", "keywords", "settings_page_order", "input_type", "categories", "can_be_html")
VALUES ('metric_releaseTime_description', '', 'Metric: Release Time - Description', 'Displayed in help modal on report builder page.', 'Total release time (in hours) requested by employee in approval request.', '1', NULL, '50', 'textarea', '{reports,admin-settings}', '1');
INSERT INTO "settings" ("key", "value", "label", "description", "default_value", "use_default_value", "keywords", "settings_page_order", "input_type", "categories", "can_be_html")
VALUES ('metrics_description', '', 'Metrics Description', 'Overall description of metrics displayed on reports builder help modal.', 'When a report is generated, your selected metrics are placed in the table cells. If two aggregators are selected, only one measure can be selected. Below is a list of available measures:', '1', NULL, '50', 'textarea', '{reports,admin-settings}', '1');
INSERT INTO "settings" ("key", "value", "label", "description", "default_value", "use_default_value", "keywords", "settings_page_order", "input_type", "categories", "can_be_html")
VALUES ('aggregators_description', '', 'Aggregators Description', 'Overall description of aggregators displayed on reports builder help modal', 'Aggregators are how metrics are grouped, or bucketed, in your generated report. The components of each aggregator will be the headers along the x and/or y axis of the table. One aggregator is required, with a maximum of two (one for each axis). If you have more than one metric selected, only one aggregator is allowed since the metrics are displayed along the open axis.', '1', NULL, '50', 'textarea', '{reports,admin-settings}', '1');
