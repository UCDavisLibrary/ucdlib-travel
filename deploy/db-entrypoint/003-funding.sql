INSERT INTO funding_source(label, has_cap, cap_default, form_order) VALUES ('Represented Librarian Professional Development', true, 2000, 0);
INSERT INTO funding_source(label, form_order) VALUES ('LAUC-D or Statewide LAUC', 1);
INSERT INTO funding_source(label, form_order, require_description) VALUES ('Grant', 2, true);
INSERT INTO funding_source(label, form_order) VALUES ('Department Funding', 3);
INSERT INTO funding_source(label, form_order) VALUES ('Development Related', 4);
INSERT INTO funding_source(label, form_order) VALUES ('Administrative Funding', 5);
INSERT INTO funding_source(label, form_order, require_description) VALUES ('Other Funding', 6, true);
INSERT INTO funding_source(label, form_order, hide_from_form) VALUES ('No funding/program time only', 7, true);

INSERT INTO approver_type(label, description, system_generated, hide_from_fund_assignment) VALUES ('Supervisor', 'The current direct supervisor of the requester from iam.staff.library.ucdavis.edu.', true, false);
INSERT INTO approver_type(label, description, system_generated, hide_from_fund_assignment) VALUES ('Department Head', 'The current department head of the requester from iam.staff.library.ucdavis.edu. Often times will be the same as the supervisor.', true, false);
INSERT INTO approver_type(label, description, system_generated, hide_from_fund_assignment) VALUES ('Finance Head', 'The head of the Library Finance department', false, false);
INSERT INTO approver_type(label, description, system_generated, hide_from_fund_assignment) VALUES ('Requester', '', true, true);
INSERT INTO approver_type(label, description, system_generated, hide_from_fund_assignment) VALUES ('Application Admin', '', true, true);

-- use the approver_type_employee table to link approver types to employees
-- but i dont want to include kerb ids in a public repo
-- INSERT INTO approver_type_employee(approver_type_id, employee_kerberos) VALUES (3, 'financeheadkerb');

INSERT INTO funding_source_approver(funding_source_id, approver_type_id, approval_order) VALUES (1, 1, 0);
INSERT INTO funding_source_approver(funding_source_id, approver_type_id, approval_order) VALUES (1, 2, 1);

INSERT INTO funding_source_approver(funding_source_id, approver_type_id, approval_order) VALUES (2, 1, 0);
INSERT INTO funding_source_approver(funding_source_id, approver_type_id, approval_order) VALUES (2, 2, 1);

INSERT INTO funding_source_approver(funding_source_id, approver_type_id, approval_order) VALUES (3, 1, 0);
INSERT INTO funding_source_approver(funding_source_id, approver_type_id, approval_order) VALUES (3, 2, 1);

INSERT INTO funding_source_approver(funding_source_id, approver_type_id, approval_order) VALUES (4, 1, 0);
INSERT INTO funding_source_approver(funding_source_id, approver_type_id, approval_order) VALUES (4, 2, 1);

INSERT INTO funding_source_approver(funding_source_id, approver_type_id, approval_order) VALUES (5, 1, 0);
INSERT INTO funding_source_approver(funding_source_id, approver_type_id, approval_order) VALUES (5, 2, 1);
INSERT INTO funding_source_approver(funding_source_id, approver_type_id, approval_order) VALUES (5, 3, 2);

INSERT INTO funding_source_approver(funding_source_id, approver_type_id, approval_order) VALUES (6, 1, 0);
INSERT INTO funding_source_approver(funding_source_id, approver_type_id, approval_order) VALUES (6, 2, 1);
INSERT INTO funding_source_approver(funding_source_id, approver_type_id, approval_order) VALUES (6, 3, 2);

INSERT INTO funding_source_approver(funding_source_id, approver_type_id, approval_order) VALUES (7, 1, 0);
INSERT INTO funding_source_approver(funding_source_id, approver_type_id, approval_order) VALUES (7, 2, 1);
INSERT INTO funding_source_approver(funding_source_id, approver_type_id, approval_order) VALUES (7, 3, 2);

INSERT INTO funding_source_approver(funding_source_id, approver_type_id, approval_order) VALUES (8, 1, 0);
