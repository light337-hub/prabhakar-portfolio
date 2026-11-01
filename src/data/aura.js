// AURA case-study content. Facts are limited to what Prabhakar confirmed (see CLAUDE_HANDOFF_README.md):
// Python + Flask backend, SQLite database, Chronos-2 attendance forecasting (7- or 14-week horizon),
// TabPFN employee-risk prediction, organizational/project workflows, BI + decision-support dashboards.
// No metrics, accuracy figures, dataset sizes, integrations or deployment claims belong in this file.

export const auraSections = [
  { id: 'aura', label: 'Overview' },
  { id: 'aura-problem', label: 'Problem' },
  { id: 'aura-architecture', label: 'Architecture' },
  { id: 'aura-modules', label: 'Modules' },
  { id: 'aura-intelligence', label: 'AI / ML' },
  { id: 'aura-workflow', label: 'Workflow' },
  { id: 'aura-stack', label: 'Stack' },
  { id: 'aura-publication', label: 'Publication' }
]

export const auraIntro = {
  name: 'AURA',
  fullName: 'Artificial Unified Resource Analytics',
  positioning: 'AI-Powered Project Management & Business Intelligence System',
  purpose: 'AURA is an intelligent organizational management and decision-support platform. It brings employee operations, attendance, projects and business information into one connected system, then adds forecasting and prediction on top.'
}

export const auraProblem = {
  problem: 'Organizations need a connected way to manage employee operations, attendance, projects and business information. When these live in separate places, it is hard to see the whole picture or to plan ahead.',
  solution: 'AURA combines organizational management, project workflows, analytics and predictive intelligence in one decision-support platform.',
  pillars: [
    { title: 'Organizational management', text: 'Employees, departments and attendance-related operations managed together.' },
    { title: 'Project workflows', text: 'Projects and their tasks organised inside the same system.' },
    { title: 'Analytics', text: 'Business-intelligence dashboards that present the organization’s information.' },
    { title: 'Predictive intelligence', text: 'Chronos-2 forecasts attendance; TabPFN assesses employee risk.' }
  ]
}

// Architecture map. Coordinates are in a 1000 x 680 space shared by the HTML map and the 3D station.
// The data-flow direction follows the project workflow described by Prabhakar; internal module boundaries are not claimed.
export const ARCH_VB = [1000, 680]
export const archNodes = [
  { id: 'ui', n: '01', title: 'Application interface', line: 'What people use', x: 500, y: 58, w: 300, kind: 'app',
    detail: 'The part of AURA that people see and use: sign-in, management screens and dashboards. The sign-in screen is shown in the interface preview above.' },
  { id: 'flask', n: '02', title: 'Python & Flask backend', line: 'Application logic', x: 500, y: 182, w: 300, kind: 'core',
    detail: 'The backend is written in Python and served with Flask. It handles requests from the interface and coordinates the workflows and the database.' },
  { id: 'workflows', n: '03', title: 'Organizational & project workflows', line: 'Employees · attendance · projects', x: 215, y: 318, w: 290, kind: 'core',
    detail: 'The operational side of AURA: employee, attendance, department, project and task management.' },
  { id: 'sqlite', n: '04', title: 'SQLite database', line: 'Stores the information', x: 500, y: 318, w: 250, kind: 'data',
    detail: 'SQLite holds the organizational and project information that the workflows work with.' },
  { id: 'chronos', n: '05', title: 'Chronos-2 forecasting', line: 'Attendance · 7 or 14 weeks', x: 290, y: 462, w: 290, kind: 'ml-a',
    detail: 'Attendance forecasting over a 7-week or a 14-week horizon. Chronos-2 does not predict employee risk.' },
  { id: 'tabpfn', n: '06', title: 'TabPFN risk prediction', line: 'Employee risk', x: 710, y: 462, w: 290, kind: 'ml-b',
    detail: 'Employee risk prediction from tabular employee data. TabPFN does not forecast attendance.' },
  { id: 'bi', n: '07', title: 'Business intelligence & decision support', line: 'Dashboards for management', x: 500, y: 606, w: 360, kind: 'app',
    detail: 'Dashboards that present operational information together with the model outputs, to support management decisions.' }
]
export const archEdges = [
  { from: 'ui', to: 'flask' },
  { from: 'flask', to: 'workflows' },
  { from: 'flask', to: 'sqlite' },
  { from: 'workflows', to: 'sqlite' },
  { from: 'sqlite', to: 'chronos', path: 'a' },
  { from: 'sqlite', to: 'tabpfn', path: 'b' },
  { from: 'chronos', to: 'bi', path: 'a' },
  { from: 'tabpfn', to: 'bi', path: 'b' },
  { from: 'bi', to: 'ui', d: 'M 680 606 C 950 606 950 58 650 58', label: 'shown in the interface' }
]
export const archTour = ['ui', 'flask', 'workflows', 'sqlite', 'chronos', 'tabpfn', 'bi']

// Modules. Only the six confirmed modules are listed. Descriptions are deliberately general.
export const auraModules = [
  { id: 'employees', title: 'Employee Management', motif: 'people',
    text: 'Keeps employee information and employee operations organised in one place.',
    tech: ['Flask', 'SQLite'], flow: 'Employee records → organizational workflows' },
  { id: 'attendance', title: 'Attendance Management', motif: 'calendar',
    text: 'Handles attendance-related operations. This is the information the Chronos-2 forecast looks ahead from.',
    tech: ['Flask', 'SQLite', 'Chronos-2'], flow: 'Attendance → 7- or 14-week forecast' },
  { id: 'projects', title: 'Project Management', motif: 'timeline',
    text: 'Organises projects and project workflows across the organization.',
    tech: ['Flask', 'SQLite'], flow: 'Projects → tasks → follow-up' },
  { id: 'tasks', title: 'Task Management', motif: 'board',
    text: 'Breaks project work into tasks so it can be organised and followed.',
    tech: ['Flask', 'SQLite'], flow: 'Project → task → status' },
  { id: 'departments', title: 'Department Management', motif: 'tree',
    text: 'Represents the organization’s departments, giving employees and projects a structure to belong to.',
    tech: ['Flask', 'SQLite'], flow: 'Organization → departments → people' },
  { id: 'analytics', title: 'Organizational analytics & decision support', motif: 'insight',
    text: 'Business-intelligence dashboards that bring operational information and model outputs together for management decisions.',
    tech: ['Dashboards', 'Chronos-2', 'TabPFN'], flow: 'Data + predictions → dashboards → decisions' }
]

export const intelligence = {
  chronos: {
    id: 'chronos', model: 'Chronos-2', role: 'Attendance forecasting', horizons: [7, 14],
    summary: 'Forecasts employee attendance over a 7-week or a 14-week horizon.',
    flow: [['Attendance history', 'Records kept in AURA'], ['Chronos-2', 'Time-series forecasting'], ['Forecast', '7 or 14 weeks ahead']],
    tabs: [
      { id: 'does', label: 'What it does', body: 'Forecasts employee attendance. Chronos-2 is a pretrained time-series forecasting model; in AURA it looks ahead from attendance history.' },
      { id: 'input', label: 'Input', body: 'Attendance information over time, taken from the attendance records managed in AURA.' },
      { id: 'output', label: 'Output', body: 'An attendance forecast over a 7-week or a 14-week horizon.' },
      { id: 'decisions', label: 'Decision support', body: 'A forecast supports organizational planning: management can look ahead at expected attendance instead of only reviewing the past.' }
    ],
    boundary: 'Chronos-2 forecasts attendance. It does not predict employee risk.'
  },
  tabpfn: {
    id: 'tabpfn', model: 'TabPFN', role: 'Employee risk prediction',
    summary: 'Assesses employee risk from tabular employee data.',
    flow: [['Tabular employee data', 'One row per employee'], ['TabPFN', 'Tabular classification'], ['Risk assessment', 'Per employee']],
    tabs: [
      { id: 'does', label: 'What it does', body: 'Assesses employee risk. TabPFN is a pretrained model for tabular data; in AURA it works on tabular employee data to make a prediction (classification).' },
      { id: 'input', label: 'Input', body: 'Tabular employee data: one row per employee, one column per attribute.' },
      { id: 'output', label: 'Output', body: 'A risk assessment for employees.' },
      { id: 'decisions', label: 'Decision support', body: 'The assessment appears alongside other organizational information, so managers can weigh it as one input to their decisions. It supports human judgement and does not replace it.' }
    ],
    boundary: 'TabPFN assesses employee risk. It does not forecast attendance.'
  }
}

// Workflow map (1000 x 440 space). Two ML paths are kept separate and labelled.
export const WF_VB = [1000, 440]
export const wfNodes = [
  { id: 's1', n: '01', title: 'Organizational information', line: 'Employees, attendance, projects', x: 80, y: 220, w: 124,
    detail: 'Employee, attendance, department, project and task information enters the system through the application interface.' },
  { id: 's2', n: '02', title: 'Application processing', line: 'Python & Flask', x: 238, y: 220, w: 124,
    detail: 'The Python and Flask backend processes requests and applies the workflow logic.' },
  { id: 's3', n: '03', title: 'Database & operational workflows', line: 'SQLite + workflows', x: 396, y: 220, w: 124,
    detail: 'SQLite stores the information, and the organizational and project workflows operate on it.' },
  { id: 'c', n: '04A', title: 'Chronos-2 path', line: 'Attendance forecast, 7 or 14 weeks', x: 598, y: 112, w: 190, path: 'a', tag: 'CHRONOS-2 PATH',
    detail: 'Attendance information goes to Chronos-2, which produces an attendance forecast over a 7-week or 14-week horizon.' },
  { id: 't', n: '04B', title: 'TabPFN path', line: 'Employee risk prediction', x: 598, y: 328, w: 190, path: 'b', tag: 'TABPFN PATH',
    detail: 'Tabular employee data goes to TabPFN, which produces an employee risk assessment.' },
  { id: 's5', n: '05', title: 'Business intelligence presentation', line: 'Dashboards', x: 778, y: 220, w: 124,
    detail: 'Dashboards present operational information together with the outputs of both model paths.' },
  { id: 's6', n: '06', title: 'Management decision support', line: 'Plan and decide', x: 924, y: 220, w: 124,
    detail: 'Managers use the combined view to plan and make decisions.' }
]
export const wfEdges = [
  { from: 's1', to: 's2' }, { from: 's2', to: 's3' },
  { from: 's3', to: 'c', path: 'a' }, { from: 's3', to: 't', path: 'b' },
  { from: 'c', to: 's5', path: 'a' }, { from: 't', to: 's5', path: 'b' },
  { from: 's5', to: 's6' }
]
export const wfTour = ['s1', 's2', 's3', 'c', 't', 's5', 's6']

export const auraStack = [
  { id: 'python', name: 'Python', role: 'Implementation language of the backend and the model workflows' },
  { id: 'flask', name: 'Flask', role: 'Web framework for the backend' },
  { id: 'sqlite', name: 'SQLite', role: 'Database for organizational and project information' },
  { id: 'chronos', name: 'Chronos-2', role: 'Attendance forecasting' },
  { id: 'tabpfn', name: 'TabPFN', role: 'Employee risk prediction' }
]

export const auraScope = [
  'AURA is a project-management and decision-support platform, not an ERP.',
  'Interface and dashboard visuals on this page are labelled previews or illustrations; none is a screenshot of the running application unless stated.',
  'No accuracy, dataset size, user count, deployment or business-impact figures are shown, because none are published here.'
]


// Journal publication card (routing + publication step).
// `url` is the exact link supplied by Prabhakar; it resolves to the paper itself. The remaining fields are copied verbatim from
// the first page of that paper (title, authors, journal masthead, volume/issue, publication date, ISSN) and are NOT in the
// AURA project report PDF. Nothing here is inferred. Edit or delete a field here and the card follows.
export const auraPublication = {
  url: 'https://doi-doi.org/101555/ijarp.9666',
  urlLabel: 'doi-doi.org/101555/ijarp.9666',
  title: 'AURA (Artificial Unified Resource Analytics): An AI-Enabled Enterprise Resource Management System for Small and Medium Enterprises',
  authors: 'V. Merlinfreeda, Gogula Vignesh S, Jeya Viknesh S, Prabhakar J',
  journal: 'International Journal Advanced Research Publications',
  articleType: 'Research Article',
  volume: '02',
  issue: '10',
  published: '27 October 2026',
  issn: '2456-9992'
}

// Section ids the 3D camera / scroll tracker follows on each page.
export const auraPageSectionIds = auraSections.map(s => s.id)
