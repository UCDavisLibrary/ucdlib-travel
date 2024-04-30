
CREATE TABLE cache (
    id SERIAL PRIMARY KEY,
    type VARCHAR(100),
    query TEXT NOT NULL,
    data JSONB NOT NULL DEFAULT '{}'::JSONB,
    created timestamp DEFAULT NOW(),
    UNIQUE (type, query)
);
COMMENT ON TABLE cache IS 'Cache table for storing http requests and other data';

CREATE TABLE department (
    department_id INTEGER PRIMARY KEY,
    label VARCHAR(200) NOT NULL,
    archived BOOLEAN DEFAULT FALSE
);
COMMENT ON TABLE department IS 'Historical department information. Most department information is pulled from our IAM system';
COMMENT ON COLUMN department.department_id IS 'The group ID from the Library IAM system.';

CREATE TABLE employee (
    kerberos VARCHAR(100) PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL
);
COMMENT ON TABLE employee IS 'Historical employee information. Most employee information is pulled from our IAM system';

CREATE TABLE employee_department (
    employee_department_id SERIAL PRIMARY KEY,
    employee_kerberos VARCHAR(100) REFERENCES employee(kerberos),
    department_id INTEGER REFERENCES department(department_id),
    start_date DATE NOT NULL DEFAULT NOW(),
    end_date DATE
);
COMMENT ON TABLE employee_department IS 'Mapping table for employees and departments.';

CREATE TABLE funding_source (
    funding_source_id SERIAL PRIMARY KEY,
    label VARCHAR(200) NOT NULL,
    description TEXT,
    has_cap BOOLEAN DEFAULT FALSE,
    cap_default NUMERIC,
    require_description BOOLEAN DEFAULT FALSE,
    form_order INTEGER NOT NULL DEFAULT 0,
    hide_from_form BOOLEAN DEFAULT FALSE,
    archived BOOLEAN DEFAULT FALSE
);
COMMENT ON TABLE funding_source IS 'Funding sources that users can select from when creating a travel approval request.';
COMMENT ON COLUMN funding_source.has_cap IS 'Whether or not this funding source has an individual allocation cap';
COMMENT ON COLUMN funding_source.cap_default IS 'The default allocation cap for this funding source.';
COMMENT ON COLUMN funding_source.require_description IS 'More info is required from user when submitting a travel approval request with this funding source.';

CREATE TABLE approver_type (
    approver_type_id SERIAL PRIMARY KEY,
    label VARCHAR(200) NOT NULL,
    description TEXT,
    system_generated BOOLEAN DEFAULT FALSE,
    hide_from_fund_assignment BOOLEAN DEFAULT FALSE,
    archived BOOLEAN DEFAULT FALSE
);
COMMENT ON TABLE approver_type IS 'Types of approvers that can be assigned to a funding source.';
COMMENT ON COLUMN approver_type.system_generated IS 'System handles the logic for determining the employee list for this approver type. If true, ignore values from approver_type_employee.';
COMMENT ON COLUMN approver_type.hide_from_fund_assignment IS 'If true, this approver type will not be available for assignment to a funding source from the GUI';

CREATE TABLE approver_type_employee (
    approver_type_id INTEGER REFERENCES approver_type(approver_type_id),
    employee_kerberos VARCHAR(100) REFERENCES employee(kerberos),
    approval_order INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (approver_type_id, employee_kerberos)
);

CREATE TABLE funding_source_approver (
    funding_source_id INTEGER REFERENCES funding_source(funding_source_id),
    approver_type_id INTEGER REFERENCES approver_type(approver_type_id),
    approval_order INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (funding_source_id, approver_type_id)
);
COMMENT ON TABLE funding_source_approver IS 'Mapping table for funding sources and approver types.';

CREATE TABLE settings (
    settings_id SERIAL PRIMARY KEY,
    key VARCHAR(100) NOT NULL,
    value TEXT NOT NULL,
    label VARCHAR(200),
    description TEXT,
    default_value TEXT,
    use_default_value BOOLEAN DEFAULT FALSE,
    keywords TEXT,
    settings_page_order INTEGER DEFAULT 0,
    input_type VARCHAR(100) DEFAULT 'text',
    categories TEXT[],
    can_be_html BOOLEAN DEFAULT FALSE
);
COMMENT ON TABLE settings IS 'Settings table for storing key-value pairs of configuration data. So we dont have to hard code so many values in the application.';
COMMENT ON COLUMN settings.use_default_value IS 'The value will be ignored and the hardcoded default value will be used instead.';
COMMENT ON COLUMN settings.keywords IS 'Just to help with searching for settings.';
COMMENT ON COLUMN settings.settings_page_order IS 'The order in which this setting will be displayed on the settings page.';
COMMENT ON COLUMN settings.input_type IS 'The type of input to use for this setting. Options are text, textarea, checkbox, number';
COMMENT ON COLUMN settings.categories IS 'List of categories that this setting belongs to - for easier querying by client';
COMMENT ON COLUMN settings.can_be_html IS 'If true, the value of this setting can contain HTML.';

CREATE TABLE approval_request (
    approval_request_revision_id SERIAL PRIMARY KEY,
    approval_request_id SERIAL NOT NULL,
    is_current BOOLEAN NOT NULL DEFAULT TRUE,
    approval_status VARCHAR(100) NOT NULL,
    reimbursement_status VARCHAR(100) NOT NULL,
    employee VARCHAR(100) REFERENCES employee(kerberos),
    name VARCHAR(100) NOT NULL,
    organization VARCHAR(100) NOT NULL,
    business_purpose VARCHAR(500) NOT NULL,
    location VARCHAR(100) NOT NULL,
    location_details VARCHAR(100),
    program_start_date DATE NOT NULL,
    program_end_date DATE NOT NULL,
    travel_required BOOLEAN NOT NULL DEFAULT FALSE,
    has_custom_travel_dates BOOLEAN NOT NULL DEFAULT FALSE,
    travel_start_date DATE,
    travel_end_date DATE,
    comments VARCHAR(500),
    submitted timestamp DEFAULT NOW()
);
COMMENT ON TABLE approval_request IS 'Table for storing travel approval requests.';
COMMENT ON COLUMN approval_request.is_current IS 'Whether or not this is the current revision of the request.';

CREATE TABLE approval_request_funding_source (
    approval_request_funding_source_id SERIAL PRIMARY KEY,
    approval_request_revision_id INTEGER REFERENCES approval_request(approval_request_revision_id),
    funding_source_id INTEGER REFERENCES funding_source(funding_source_id),
    amount NUMERIC NOT NULL,
    accounting_code VARCHAR(100)
);
COMMENT ON TABLE approval_request_funding_source IS 'Mapping table for travel approval requests and funding source amounts.';
COMMENT ON COLUMN approval_request_funding_source.amount IS 'The amount of the funding source that is being requested.';
COMMENT ON COLUMN approval_request_funding_source.accounting_code IS 'The accounting code for this funding source - entered in by finance anytime after approval.';

CREATE TABLE expenditure_option (
    expenditure_option_id SERIAL PRIMARY KEY,
    label VARCHAR(50) NOT NULL,
    description TEXT,
    form_order INTEGER NOT NULL DEFAULT 0,
    archived BOOLEAN DEFAULT FALSE
);
COMMENT ON TABLE expenditure_option IS 'Line item expenditure options that can be selected by users when creating a travel approval request.';

CREATE TABLE approval_request_expenditure (
    approval_request_expenditure_id SERIAL PRIMARY KEY,
    approval_request_revision_id INTEGER REFERENCES approval_request(approval_request_revision_id),
    expenditure_option_id INTEGER REFERENCES expenditure_option(expenditure_option_id),
    amount NUMERIC NOT NULL
);
COMMENT ON TABLE approval_request_expenditure IS 'Mapping table for travel approval requests and expenditure line items.';

CREATE TABLE approval_request_approval_chain_link (
    approval_request_approval_chain_link_id SERIAL PRIMARY KEY,
    approval_request_revision_id INTEGER REFERENCES approval_request(approval_request_revision_id),
    approver_order INTEGER NOT NULL DEFAULT 0,
    action VARCHAR(100) NOT NULL DEFAULT 'approval-needed',
    employee_kerberos VARCHAR(100) REFERENCES employee(kerberos),
    comments VARCHAR(500),
    fund_changes JSONB NOT NULL DEFAULT '{}'::JSONB,
    occurred timestamp DEFAULT NOW()
);
COMMENT ON TABLE approval_request_approval_chain_link IS 'Table for storing the approval chain (past approval actions and future placeholders) for a travel approval request.';
COMMENT ON COLUMN approval_request_approval_chain_link.action IS 'The action that was taken (or will be taken) by the approver. Options are approval-needed, approved, denied, canceled, revision-requested, recalled, and approved-with-changes.';
COMMENT ON COLUMN approval_request_approval_chain_link.fund_changes IS 'The changes to the funding sources that were made by this approver if action was is approved-with-changes.';

CREATE TABLE link_approver_type (
    approval_request_approval_chain_link_id INTEGER REFERENCES approval_request_approval_chain_link(approval_request_approval_chain_link_id),
    approver_type_id INTEGER REFERENCES approver_type(approver_type_id),
    PRIMARY KEY (approval_request_approval_chain_link_id, approver_type_id)
);
COMMENT ON TABLE link_approver_type IS 'Mapping table for request approval chain links and approver types. An approver can have more than one for a request - e.g. supervisor and department head.';

CREATE TABLE employee_allocation (
    employee_allocation_id SERIAL PRIMARY KEY,
    employee_kerberos VARCHAR(100) REFERENCES employee(kerberos),
    funding_source_id INTEGER REFERENCES funding_source(funding_source_id),
    amount NUMERIC NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    added_by VARCHAR(100) REFERENCES employee(kerberos),
    added_at timestamp DEFAULT NOW(),
    deleted BOOLEAN DEFAULT FALSE,
    deleted_by VARCHAR(100) REFERENCES employee(kerberos),
    deleted_at timestamp
);
COMMENT ON TABLE employee_allocation IS 'Funding source allocations for employees by date range.';

CREATE TABLE reimbursement_request (
    reimbursement_request_id SERIAL PRIMARY KEY,
    approval_request_revision_id INTEGER REFERENCES approval_request(approval_request_revision_id),
    label VARCHAR(200) NOT NULL DEFAULT 'Reimbursement Request',
    employee_residence VARCHAR(100),
    travel_start timestamp,
    travel_end timestamp,
    personal_time VARCHAR(500),
    comments VARCHAR(500),
    amount NUMERIC NOT NULL,
    status VARCHAR(100) NOT NULL DEFAULT 'submitted'
);
COMMENT ON TABLE reimbursement_request IS 'Reimbursement requests for travel expenses.';

CREATE TABLE reimbursement_request_fund (
    reimbursement_request_fund_id SERIAL PRIMARY KEY,
    reimbursement_request_id INTEGER REFERENCES reimbursement_request(reimbursement_request_id),
    approval_request_funding_source_id INTEGER REFERENCES approval_request_funding_source(approval_request_funding_source_id),
    amount NUMERIC NOT NULL,
    added_by VARCHAR(100) REFERENCES employee(kerberos),
    added_at timestamp DEFAULT NOW(),
    deleted BOOLEAN DEFAULT FALSE,
    deleted_by VARCHAR(100) REFERENCES employee(kerberos),
    deleted_at timestamp
);
COMMENT ON TABLE reimbursement_request_fund IS 'Funding source reimbursements entered by Finance from Aggie Expense.';

CREATE TABLE reimbursement_request_expense (
    reimbursement_request_expense_id SERIAL PRIMARY KEY,
    reimbursement_request_id INTEGER REFERENCES reimbursement_request(reimbursement_request_id),
    amount NUMERIC NOT NULL DEFAULT 0,
    category VARCHAR(100) NOT NULL,
    date DATE,
    details JSONB NOT NULL DEFAULT '{}'::JSONB
);
COMMENT ON TABLE reimbursement_request_expense IS 'Line item expenses for reimbursement requests.';
COMMENT ON COLUMN reimbursement_request_expense.category IS 'The category of the expense - transportation, registration_fee, daily_expense';
COMMENT ON COLUMN reimbursement_request_expense.details IS 'Additional details about the expense. Keys vary by category.';

CREATE TABLE reimbursement_request_receipt (
    reimbursement_request_receipt_id SERIAL PRIMARY KEY,
    reimbursement_request_id INTEGER REFERENCES reimbursement_request(reimbursement_request_id),
    file_name VARCHAR(200) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    label VARCHAR(200),
    description VARCHAR(500),
    uploaded_by VARCHAR(100) REFERENCES employee(kerberos),
    uploaded_at timestamp DEFAULT NOW(),
    deleted BOOLEAN DEFAULT FALSE,
    deleted_by VARCHAR(100) REFERENCES employee(kerberos),
    deleted_at timestamp
);
COMMENT ON TABLE reimbursement_request_receipt IS 'Receipts uploaded by users for reimbursement requests.';

CREATE TABLE daily_expense_category (
    daily_expense_category_id SERIAL PRIMARY KEY,
    label VARCHAR(200) NOT NULL,
    sub_category TEXT[],
    archived BOOLEAN DEFAULT FALSE,
    archived_by VARCHAR(100) REFERENCES employee(kerberos),
    archived_at timestamp
);
COMMENT ON TABLE daily_expense_category IS 'Categories for daily expenses of reimbursement requests.';

CREATE TABLE notification (
    notification_id SERIAL PRIMARY KEY,
    approval_request_revision_id INTEGER REFERENCES approval_request(approval_request_revision_id),
    reimbursement_request_id INTEGER REFERENCES reimbursement_request(reimbursement_request_id),
    employee_kerberos VARCHAR(100) REFERENCES employee(kerberos),
    created_at timestamp DEFAULT NOW(),
    subject VARCHAR(200) NOT NULL,
    email_sent BOOLEAN DEFAULT FALSE,
    details JSONB NOT NULL DEFAULT '{}'::JSONB
);
COMMENT ON TABLE notification IS 'Notifications (emails) to employees about travel approval requests and reimbursement requests.';
