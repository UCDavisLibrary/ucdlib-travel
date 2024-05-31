INSERT INTO settings("key", "value", "label", "description", "input_type", "categories") VALUES ('mileage_rate', 3.50, 'Mileage Rate', 'The current mileage rate for personal car mileage reimbursement.', 'number', '{"approval-requests", "admin-settings"}');

-- approval requests
INSERT INTO "settings" ("key", "value", "label", "description", "default_value", "use_default_value", "keywords", "settings_page_order", "input_type", "categories", "can_be_html")
VALUES ('approval_request_form_intro', '', 'Approval Request Form Intro', 'Shown on the top of the approval request form.', 'Use the following form to request approval for your travel, training, or professional development.', '1', NULL, '10', 'textarea', '{approval-requests,admin-settings}', '1');

INSERT INTO "settings" ("key", "value", "label", "description", "default_value", "use_default_value", "keywords", "settings_page_order", "input_type", "categories", "can_be_html")
VALUES ('approval_request_form_location_in-state', '', 'Location: In-state desciption', 'Description below the in-state option of the location radio on the approval request form', NULL, '0', NULL, '10', 'textarea', '{approval-requests,admin-settings}', '1');

INSERT INTO "settings" ("key", "value", "label", "description", "default_value", "use_default_value", "keywords", "settings_page_order", "input_type", "categories", "can_be_html")
VALUES ('approval_request_form_location_out-of-state', '', 'Location: Out of State Description', 'Description below the out-of-state option of the location radio on the approval request form', 'IMPORTANT: All out-of-state trips must be registered using the <a href=''https://ehs.ucop.edu/away/''>UC Away form</a>.', '1', NULL, '10', 'textarea', '{approval-requests,admin-settings}', '1');

INSERT INTO "settings" ("key", "value", "label", "description", "default_value", "use_default_value", "keywords", "settings_page_order", "input_type", "categories", "can_be_html")
VALUES ('approval_request_form_location_virtual', '', 'Location: Virtual desciption', 'Description below the virtual option of the location radio on the approval request form', NULL, '0', NULL, '10', 'textarea', '{approval-requests,admin-settings}', '1');

INSERT INTO "settings" ("key", "value", "label", "description", "default_value", "use_default_value", "keywords", "settings_page_order", "input_type", "categories", "can_be_html")
VALUES ('approval_request_form_custom_travel', '', 'Custom Travel Dates Explanatory Text', 'Placed below "Custom Travel Dates" checkbox on new approval form.', 'Travel dates are different from program dates entered above', '1', NULL, '10', 'textarea', '{approval-requests,admin-settings}', '1');

INSERT INTO "settings" ("key", "value", "label", "description", "default_value", "use_default_value", "keywords", "settings_page_order", "input_type", "categories", "can_be_html")
VALUES ('approval_request_form_travel-required', '', 'Travel Required Explanatory Text', 'Placed below "Travel Required" checkbox on new approval form.', 'Travel is required for this trip, training, or professional development opportunity.', '1', NULL, '10', 'textarea', '{approval-requests,admin-settings}', '1');

-- admin line items page
INSERT INTO "settings" ("key", "value", "label", "description", "default_value", "use_default_value", "keywords", "settings_page_order", "input_type", "categories", "can_be_html")
VALUES ('admin_line_items_description', '', 'Admin - Line Items Description', 'Displays on top of line item admin settings page', 'Requesters will be able to select and assign monetary values to the following line items when submitting an approval form', '1', NULL, '100', 'textarea', '{admin-line-items,admin-settings}', '1');
INSERT INTO "settings" ("key", "value", "label", "description", "default_value", "use_default_value", "keywords", "settings_page_order", "input_type", "categories", "can_be_html")
VALUES ('admin_line_items_form_order_help', '', 'Admin - Line Items Order Help Text', NULL, 'Changes the order in which the line item is displayed on the approval request form.', '1', NULL, '100', 'textarea', '{admin-line-items,admin-settings}', '0');
INSERT INTO "settings" ("key", "value", "label", "description", "default_value", "use_default_value", "keywords", "settings_page_order", "input_type", "categories", "can_be_html")
VALUES ('admin_approvers_funding_page_description', '', 'Admin - Approvers and Funding Sources Page Description', NULL, 'This is the Approvers and Funding Sources Page description', '1', NULL, '100', 'textarea', '{admin-page,admin-settings}', '0');
INSERT INTO "settings" ("key", "value", "label", "description", "default_value", "use_default_value", "keywords", "settings_page_order", "input_type", "categories", "can_be_html")
VALUES ('admin_reimbursement_requests_page_description', '', 'Admin - Reimbursement Requests Page Description', NULL, 'This is the Reimbursement Requests Page description', '1', NULL, '100', 'textarea', '{admin-page,admin-settings}', '0');
INSERT INTO "settings" ("key", "value", "label", "description", "default_value", "use_default_value", "keywords", "settings_page_order", "input_type", "categories", "can_be_html")
VALUES ('admin_employee_allocations_page_description', '', 'Admin - Employee Allocations Page Description', NULL, 'This is the Employee Allocations Page description', '1', NULL, '100', 'textarea', '{admin-page,admin-settings}', '0');
INSERT INTO "settings" ("key", "value", "label", "description", "default_value", "use_default_value", "keywords", "settings_page_order", "input_type", "categories", "can_be_html")
VALUES ('admin_allocations_general_settings_page_description', '', 'Admin - Employee Allocations General Settings Page Description', NULL, 'This is the Employee Allocations General Settings Page description', '1', NULL, '100', 'textarea', '{admin-page,admin-settings}', '0');
INSERT INTO "settings" ("key", "value", "label", "description", "default_value", "use_default_value", "keywords", "settings_page_order", "input_type", "categories", "can_be_html")
VALUES ('admin_allocations_line_items_page_description', '', 'Admin - Employee Allocations Line Items Page Description', NULL, 'This is the Employee Allocations Line Items description', '1', NULL, '100', 'textarea', '{admin-page,admin-settings}', '0');