-- Populate markdown_content from formerly bundled cv-content.md
-- Content was previously served from a static frontend file; now stored in DB.

UPDATE cv_node SET markdown_content = $$Passionate Software Developer with a weakness for system architectures and a tendency towards reflection. As a generalist, I have a solid understanding of nearly all parts of the system and am able to contribute wherever the focus is at any given time.

I work best in a team, both with customers and colleagues. For me, teamwork means learning from and with each other.

**I'm passionate about:** Reflection, Recursion

**I enjoy working with:** MacBook, Tuple, Slack, Jira/Confluence$$
WHERE id = 'profile';

UPDATE cv_node SET markdown_content = $$Professional experience spanning 12+ years in software development, from mobile apps to cloud-based enterprise platforms.$$
WHERE id = 'work';

UPDATE cv_node SET markdown_content = $$## Ingenious Technologies AG
**2018 - Present** | Full Stack Developer

Planning, design, development, maintenance and operation of the cloud-based Ingenious Partner Marketing Platform.

### Key Achievements
- Migration of software to Google Cloud Platform
- Key driver for introducing ZDD (Zero Downtime Deployment)
- Champion of Pair Programming practices
- Led TypeScript adoption and Code Review culture

### Technologies
`Spring Boot` `Spring Cloud Gateway` `React` `TypeScript` `Kafka` `PostgreSQL`$$
WHERE id = 'job-ingenious';

UPDATE cv_node SET markdown_content = $$## Qyotta UG
**2016 - 2018** | Full Stack Developer

*(Subsidiary of Ingenious Technologies AG)*

Development and operation of a Cashback platform with API-based integration into the Ingenious system for utilizing existing financial processes.

### Responsibilities
- Feature planning with customers via Scrum/Kanban
- Development team organization
- Full-stack development and operations

### Technologies
`Spring Boot` `GWT` `GCP` `Kubernetes`$$
WHERE id = 'job-qyotta-fs';

UPDATE cv_node SET markdown_content = $$## Qyotta UG
**2012 - 2016** | Mobile Developer

*(Partly as working student)*

Development of a VoIP-based telecommunications app combining a hybrid UI with a native core.

### Highlights
- Independent client collaboration
- Hybrid mobile architecture design
- VoIP integration with Linphone

### Technologies
`Objective-C` `Java` `Apache Cordova` `Linphone` `GWT`$$
WHERE id = 'job-qyotta-mobile';

UPDATE cv_node SET markdown_content = $$Technical expertise across the full stack, from backend systems to frontend applications, cloud infrastructure, and mobile development.$$
WHERE id = 'skills';

UPDATE cv_node SET markdown_content = $$Server-side development with focus on JVM technologies, messaging systems, and relational databases.$$
WHERE id = 'skill-backend';

UPDATE cv_node SET markdown_content = $$**Expert** | 12+ years

Primary language for backend development. Deep experience with the JVM ecosystem, design patterns, and enterprise application architecture.$$
WHERE id = 'skill-java';

UPDATE cv_node SET markdown_content = $$**Expert** | 8+ years

Extensive experience with Spring Boot, Spring Cloud, and the broader Spring ecosystem for building microservices and cloud-native applications.$$
WHERE id = 'skill-spring';

UPDATE cv_node SET markdown_content = $$**Advanced** | 4+ years

Event-driven architecture and message streaming. Experience with Kafka for building resilient, scalable distributed systems.$$
WHERE id = 'skill-kafka';

UPDATE cv_node SET markdown_content = $$**Advanced** | 8+ years

Relational database design, query optimization, and PostgreSQL-specific features for enterprise applications.$$
WHERE id = 'skill-postgres';

UPDATE cv_node SET markdown_content = $$Client-side development with modern JavaScript frameworks and type-safe development practices.$$
WHERE id = 'skill-frontend';

UPDATE cv_node SET markdown_content = $$**Advanced** | 5+ years

Modern React development with hooks, functional components, and state management. Experience with React ecosystem tools.$$
WHERE id = 'skill-react';

UPDATE cv_node SET markdown_content = $$**Advanced** | 5+ years

Type-safe JavaScript development. Strong advocate for TypeScript adoption in both frontend and Node.js projects.$$
WHERE id = 'skill-typescript';

UPDATE cv_node SET markdown_content = $$**Intermediate** | 4 years

Google Web Toolkit for Java-to-JavaScript compilation. Legacy experience with enterprise GWT applications.$$
WHERE id = 'skill-gwt';

UPDATE cv_node SET markdown_content = $$Cloud infrastructure and container orchestration for scalable, resilient deployments.$$
WHERE id = 'skill-cloud';

UPDATE cv_node SET markdown_content = $$**Advanced** | 6+ years

Google Cloud Platform services including Compute Engine, Cloud Run, Cloud SQL, and Cloud Storage. Led GCP migration projects.$$
WHERE id = 'skill-gcp';

UPDATE cv_node SET markdown_content = $$**Advanced** | 5+ years

Kubernetes for container orchestration. Experience with deployment strategies, service mesh, and cluster management.$$
WHERE id = 'skill-k8s';

UPDATE cv_node SET markdown_content = $$Native and hybrid mobile application development.$$
WHERE id = 'skill-mobile';

UPDATE cv_node SET markdown_content = $$**Intermediate** | 4 years

iOS development with Objective-C. Native app development and integration with hybrid frameworks.$$
WHERE id = 'skill-objc';

UPDATE cv_node SET markdown_content = $$**Intermediate** | 4 years

Apache Cordova for hybrid mobile apps. Cross-platform development combining web technologies with native capabilities.$$
WHERE id = 'skill-cordova';

UPDATE cv_node SET markdown_content = $$Academic background in Media Informatics with focus on system architectures and application development.$$
WHERE id = 'education';

UPDATE cv_node SET markdown_content = $$## B.Sc. Media Informatics
**2010 - 2013** | BHT Berlin *(formerly Beuth Hochschule für Technik)*

### Focus Areas
- System Architectures
- Application Development

**Final Grade:** 1.4$$
WHERE id = 'edu-bachelor';

UPDATE cv_node SET markdown_content = $$## Earlier Education
**Before 2010**

- Various opportunities in Social Work
- Vocational baccalaureate (second chance education)
- Training as Office Communication Clerk$$
WHERE id = 'edu-vocational';

UPDATE cv_node SET markdown_content = $$Communication skills in German and English.$$
WHERE id = 'languages';

UPDATE cv_node SET markdown_content = $$**Native Speaker**

Mother tongue with excellent written and verbal communication skills.$$
WHERE id = 'lang-german';

UPDATE cv_node SET markdown_content = $$**Fluent**

Professional working proficiency. Comfortable in international team environments and technical discussions.$$
WHERE id = 'lang-english';
