import type {
  CVData,
  CVProfileNode,
  CVCategoryNode,
  CVItemNode,
  CVSkillGroupNode,
  CVSkillNode,
  NodePosition,
} from '../types';

// Profile - the central node
const profile: CVProfileNode = {
  id: 'profile',
  type: 'profile',
  parentId: null,
  label: 'Frank Schmidt',
  name: 'Frank Schmidt',
  title: 'Full Stack Developer',
  subtitle: 'System Architecture & Team Collaboration',
  experience: '12+ Years Experience',
  email: 'fschmidt2011@gmail.com',
  location: 'Oberbarnim, Germany',
  photoUrl: 'https://www.gravatar.com/avatar/25bf785316eb59892ea99c72e92a6a45?s=200',
};

// Categories
const categories: CVCategoryNode[] = [
  { id: 'work', type: 'category', parentId: 'profile', label: 'Work' },
  { id: 'skills', type: 'category', parentId: 'profile', label: 'Skills' },
  { id: 'education', type: 'category', parentId: 'profile', label: 'Education' },
  { id: 'languages', type: 'category', parentId: 'profile', label: 'Languages' },
];

// Work items
const workItems: CVItemNode[] = [
  {
    id: 'job-ingenious',
    type: 'item',
    parentId: 'work',
    label: 'Full Stack Dev\nIngenious Tech',
    company: 'Ingenious Technologies AG',
    dateRange: '2018 - Present',
    technologies: ['Spring Boot', 'Spring Cloud Gateway', 'React', 'TypeScript', 'Kafka', 'PostgreSQL'],
  },
  {
    id: 'job-qyotta-fs',
    type: 'item',
    parentId: 'work',
    label: 'Full Stack Dev\nQyotta UG',
    company: 'Qyotta UG',
    dateRange: '2016 - 2018',
    technologies: ['Spring Boot', 'GWT', 'GCP', 'Kubernetes'],
  },
  {
    id: 'job-qyotta-mobile',
    type: 'item',
    parentId: 'work',
    label: 'Mobile Dev\nQyotta UG',
    company: 'Qyotta UG',
    dateRange: '2012 - 2016',
    technologies: ['Objective-C', 'Java', 'Apache Cordova', 'Linphone', 'GWT'],
  },
];

// Skill groups
const skillGroups: CVSkillGroupNode[] = [
  { id: 'skill-backend', type: 'skill-group', parentId: 'skills', label: 'Backend' },
  { id: 'skill-frontend', type: 'skill-group', parentId: 'skills', label: 'Frontend' },
  { id: 'skill-cloud', type: 'skill-group', parentId: 'skills', label: 'Cloud' },
  { id: 'skill-mobile', type: 'skill-group', parentId: 'skills', label: 'Mobile' },
];

// Individual skills
const skills: CVSkillNode[] = [
  // Backend
  { id: 'skill-java', type: 'skill', parentId: 'skill-backend', label: 'Java', proficiencyLevel: 'expert' },
  { id: 'skill-spring', type: 'skill', parentId: 'skill-backend', label: 'Spring Boot', proficiencyLevel: 'expert' },
  { id: 'skill-kafka', type: 'skill', parentId: 'skill-backend', label: 'Kafka', proficiencyLevel: 'advanced' },
  { id: 'skill-postgres', type: 'skill', parentId: 'skill-backend', label: 'PostgreSQL', proficiencyLevel: 'advanced' },
  // Frontend
  { id: 'skill-react', type: 'skill', parentId: 'skill-frontend', label: 'React', proficiencyLevel: 'advanced' },
  { id: 'skill-typescript', type: 'skill', parentId: 'skill-frontend', label: 'TypeScript', proficiencyLevel: 'advanced' },
  { id: 'skill-gwt', type: 'skill', parentId: 'skill-frontend', label: 'GWT', proficiencyLevel: 'intermediate' },
  // Cloud
  { id: 'skill-gcp', type: 'skill', parentId: 'skill-cloud', label: 'GCP', proficiencyLevel: 'advanced' },
  { id: 'skill-k8s', type: 'skill', parentId: 'skill-cloud', label: 'Kubernetes', proficiencyLevel: 'advanced' },
  // Mobile
  { id: 'skill-objc', type: 'skill', parentId: 'skill-mobile', label: 'Objective-C', proficiencyLevel: 'intermediate' },
  { id: 'skill-cordova', type: 'skill', parentId: 'skill-mobile', label: 'Cordova', proficiencyLevel: 'intermediate' },
];

// Education items
const educationItems: CVItemNode[] = [
  {
    id: 'edu-bachelor',
    type: 'item',
    parentId: 'education',
    label: 'B.Sc.\nMedia Informatics',
    company: 'BHT Berlin',
    dateRange: '2010 - 2013',
  },
  {
    id: 'edu-vocational',
    type: 'item',
    parentId: 'education',
    label: 'Vocational\nTraining',
    dateRange: 'Before 2010',
  },
];

// Language skills
const languageSkills: CVSkillNode[] = [
  { id: 'lang-german', type: 'skill', parentId: 'languages', label: 'German\nNative' },
  { id: 'lang-english', type: 'skill', parentId: 'languages', label: 'English\nFluent' },
];

// Positions (kept separate - can be auto-generated in future)
const positions: NodePosition[] = [
  // Central
  { nodeId: 'profile', x: 400, y: 300 },
  // Categories
  { nodeId: 'work', x: 80, y: 200 },
  { nodeId: 'skills', x: 780, y: 140 },
  { nodeId: 'education', x: 780, y: 500 },
  { nodeId: 'languages', x: 80, y: 500 },
  // Work items
  { nodeId: 'job-ingenious', x: -200, y: 80 },
  { nodeId: 'job-qyotta-fs', x: -240, y: 200 },
  { nodeId: 'job-qyotta-mobile', x: -180, y: 320 },
  // Skill groups
  { nodeId: 'skill-backend', x: 1020, y: 40 },
  { nodeId: 'skill-frontend', x: 1050, y: 220 },
  { nodeId: 'skill-cloud', x: 980, y: 360 },
  { nodeId: 'skill-mobile', x: 900, y: 480 },
  // Backend skills
  { nodeId: 'skill-java', x: 1220, y: -40 },
  { nodeId: 'skill-spring', x: 1280, y: 40 },
  { nodeId: 'skill-kafka', x: 1260, y: 120 },
  { nodeId: 'skill-postgres', x: 1180, y: 180 },
  // Frontend skills
  { nodeId: 'skill-react', x: 1260, y: 240 },
  { nodeId: 'skill-typescript', x: 1300, y: 320 },
  { nodeId: 'skill-gwt', x: 1220, y: 380 },
  // Cloud skills
  { nodeId: 'skill-gcp', x: 1140, y: 440 },
  { nodeId: 'skill-k8s', x: 1080, y: 520 },
  // Mobile skills
  { nodeId: 'skill-objc', x: 1000, y: 600 },
  { nodeId: 'skill-cordova', x: 920, y: 680 },
  // Education
  { nodeId: 'edu-bachelor', x: 1000, y: 600 },
  { nodeId: 'edu-vocational', x: 1080, y: 720 },
  // Languages
  { nodeId: 'lang-german', x: -100, y: 580 },
  { nodeId: 'lang-english', x: -160, y: 680 },
];

// Export the complete CV data
export const cvData: CVData = {
  nodes: [
    profile,
    ...categories,
    ...workItems,
    ...skillGroups,
    ...skills,
    ...educationItems,
    ...languageSkills,
  ],
  positions,
};
