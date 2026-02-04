-- Seed CV data for Frank Schmidt
-- Order matters: parent nodes must be inserted before children

-- Profile (root node)
INSERT INTO cv_node (id, type, parent_id, label, description, attributes, position_x, position_y, deleted, created_at, updated_at)
VALUES (
    'profile',
    'PROFILE',
    NULL,
    'Frank Schmidt',
    NULL,
    '{"name": "Frank Schmidt", "title": "Full Stack Developer", "subtitle": "System Architecture & Team Collaboration", "experience": "12+ Years Experience", "email": "fschmidt2011@gmail.com", "location": "Oberbarnim, Germany", "photoUrl": "https://www.gravatar.com/avatar/25bf785316eb59892ea99c72e92a6a45?s=200"}'::jsonb,
    400, 300,
    false, NOW(), NOW()
);

-- Categories
INSERT INTO cv_node (id, type, parent_id, label, attributes, position_x, position_y, deleted, created_at, updated_at) VALUES
('work', 'CATEGORY', 'profile', 'Work', '{"sectionId": "work"}'::jsonb, 80, 200, false, NOW(), NOW()),
('skills', 'CATEGORY', 'profile', 'Skills', '{"sectionId": "skills"}'::jsonb, 780, 140, false, NOW(), NOW()),
('education', 'CATEGORY', 'profile', 'Education', '{"sectionId": "education"}'::jsonb, 780, 500, false, NOW(), NOW()),
('languages', 'CATEGORY', 'profile', 'Languages', '{"sectionId": "languages"}'::jsonb, 80, 500, false, NOW(), NOW());

-- Work items
INSERT INTO cv_node (id, type, parent_id, label, attributes, position_x, position_y, deleted, created_at, updated_at) VALUES
('job-ingenious', 'ITEM', 'work', E'Full Stack Dev\nIngenious Tech',
    '{"company": "Ingenious Technologies AG", "dateRange": "2018 - Present", "technologies": ["Spring Boot", "Spring Cloud Gateway", "React", "TypeScript", "Kafka", "PostgreSQL"]}'::jsonb,
    -200, 80, false, NOW(), NOW()),
('job-qyotta-fs', 'ITEM', 'work', E'Full Stack Dev\nQyotta UG',
    '{"company": "Qyotta UG", "dateRange": "2016 - 2018", "technologies": ["Spring Boot", "GWT", "GCP", "Kubernetes"]}'::jsonb,
    -240, 200, false, NOW(), NOW()),
('job-qyotta-mobile', 'ITEM', 'work', E'Mobile Dev\nQyotta UG',
    '{"company": "Qyotta UG", "dateRange": "2012 - 2016", "technologies": ["Objective-C", "Java", "Apache Cordova", "Linphone", "GWT"]}'::jsonb,
    -180, 320, false, NOW(), NOW());

-- Skill groups
INSERT INTO cv_node (id, type, parent_id, label, attributes, position_x, position_y, deleted, created_at, updated_at) VALUES
('skill-backend', 'SKILL_GROUP', 'skills', 'Backend', NULL, 1020, 40, false, NOW(), NOW()),
('skill-frontend', 'SKILL_GROUP', 'skills', 'Frontend', NULL, 1050, 220, false, NOW(), NOW()),
('skill-cloud', 'SKILL_GROUP', 'skills', 'Cloud', NULL, 980, 360, false, NOW(), NOW()),
('skill-mobile', 'SKILL_GROUP', 'skills', 'Mobile', NULL, 900, 480, false, NOW(), NOW());

-- Backend skills
INSERT INTO cv_node (id, type, parent_id, label, attributes, position_x, position_y, deleted, created_at, updated_at) VALUES
('skill-java', 'SKILL', 'skill-backend', 'Java', '{"proficiencyLevel": "expert"}'::jsonb, 1220, -40, false, NOW(), NOW()),
('skill-spring', 'SKILL', 'skill-backend', 'Spring Boot', '{"proficiencyLevel": "expert"}'::jsonb, 1280, 40, false, NOW(), NOW()),
('skill-kafka', 'SKILL', 'skill-backend', 'Kafka', '{"proficiencyLevel": "advanced"}'::jsonb, 1260, 120, false, NOW(), NOW()),
('skill-postgres', 'SKILL', 'skill-backend', 'PostgreSQL', '{"proficiencyLevel": "advanced"}'::jsonb, 1180, 180, false, NOW(), NOW());

-- Frontend skills
INSERT INTO cv_node (id, type, parent_id, label, attributes, position_x, position_y, deleted, created_at, updated_at) VALUES
('skill-react', 'SKILL', 'skill-frontend', 'React', '{"proficiencyLevel": "advanced"}'::jsonb, 1260, 240, false, NOW(), NOW()),
('skill-typescript', 'SKILL', 'skill-frontend', 'TypeScript', '{"proficiencyLevel": "advanced"}'::jsonb, 1300, 320, false, NOW(), NOW()),
('skill-gwt', 'SKILL', 'skill-frontend', 'GWT', '{"proficiencyLevel": "intermediate"}'::jsonb, 1220, 380, false, NOW(), NOW());

-- Cloud skills
INSERT INTO cv_node (id, type, parent_id, label, attributes, position_x, position_y, deleted, created_at, updated_at) VALUES
('skill-gcp', 'SKILL', 'skill-cloud', 'GCP', '{"proficiencyLevel": "advanced"}'::jsonb, 1140, 440, false, NOW(), NOW()),
('skill-k8s', 'SKILL', 'skill-cloud', 'Kubernetes', '{"proficiencyLevel": "advanced"}'::jsonb, 1080, 520, false, NOW(), NOW());

-- Mobile skills
INSERT INTO cv_node (id, type, parent_id, label, attributes, position_x, position_y, deleted, created_at, updated_at) VALUES
('skill-objc', 'SKILL', 'skill-mobile', 'Objective-C', '{"proficiencyLevel": "intermediate"}'::jsonb, 1000, 600, false, NOW(), NOW()),
('skill-cordova', 'SKILL', 'skill-mobile', 'Cordova', '{"proficiencyLevel": "intermediate"}'::jsonb, 920, 680, false, NOW(), NOW());

-- Education items
INSERT INTO cv_node (id, type, parent_id, label, attributes, position_x, position_y, deleted, created_at, updated_at) VALUES
('edu-bachelor', 'ITEM', 'education', E'B.Sc.\nMedia Informatics',
    '{"company": "BHT Berlin", "dateRange": "2010 - 2013"}'::jsonb,
    1000, 600, false, NOW(), NOW()),
('edu-vocational', 'ITEM', 'education', E'Vocational\nTraining',
    '{"dateRange": "Before 2010"}'::jsonb,
    1080, 720, false, NOW(), NOW());

-- Language skills
INSERT INTO cv_node (id, type, parent_id, label, attributes, position_x, position_y, deleted, created_at, updated_at) VALUES
('lang-german', 'SKILL', 'languages', E'German\nNative', NULL, -100, 580, false, NOW(), NOW()),
('lang-english', 'SKILL', 'languages', E'English\nFluent', NULL, -160, 680, false, NOW(), NOW());
