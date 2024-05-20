INSERT INTO settings(key, value, label, description, input_type, categories) VALUES ('mileage_rate', 3.50, 'Mileage Rate', 'The current mileage rate for personal car mileage reimbursement.', 'number', '{"approval-request-form", "admin-settings"}');

-- approval requests
INSERT INTO "settings" ("key", "value", "label", "description", "default_value", "use_default_value", "keywords", "settings_page_order", "input_type", "categories", "can_be_html")
VALUES ('approval_request_form_intro', '', NULL, 'Shown on the top of the approval request form.', 'Use the following form to request approval for your travel, training, or professional development.', '1', NULL, '10', 'textarea', '{approval-requests,admin-settings}', '1');

-- admin line items page
INSERT INTO "settings" ("key", "value", "label", "description", "default_value", "use_default_value", "keywords", "settings_page_order", "input_type", "categories", "can_be_html")
VALUES ('admin_line_items_description', '', 'Admin - Line Items Description', 'Displays on top of line item admin settings page', 'Requesters will be able to select and assign monetary values to the following line items when submitting an approval form', '1', NULL, '100', 'textarea', '{admin-line-items,admin-settings}', '1');
INSERT INTO "settings" ("key", "value", "label", "description", "default_value", "use_default_value", "keywords", "settings_page_order", "input_type", "categories", "can_be_html")
VALUES ('admin_line_items_form_order_help', '', 'Admin - Line Items Order Help Text', NULL, 'Changes the order in which the line item is displayed on the approval request form.', '1', NULL, '100', 'textarea', '{admin-line-items,admin-settings}', '0');
