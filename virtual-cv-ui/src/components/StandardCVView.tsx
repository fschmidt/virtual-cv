import { memo } from 'react';
import Markdown from 'react-markdown';
import SectionIcon from './SectionIcon';
import type { CVData, CVNode, CVProfileNode, CVCategoryNode, CV_SECTIONS } from '../types';
import type { ContentMap } from '../services';
import './StandardCVView.css';

interface StandardCVViewProps {
  cvData: CVData;
  contentMap: ContentMap;
  sections: typeof CV_SECTIONS;
}

// Type guard for profile node
function isProfileNode(node: CVNode): node is CVProfileNode {
  return node.type === 'profile';
}

// Type guard for category node
function isCategoryNode(node: CVNode): node is CVCategoryNode {
  return node.type === 'category';
}

function StandardCVView({ cvData, contentMap, sections }: StandardCVViewProps) {
  const profileNode = cvData.nodes.find(isProfileNode);
  const categoryNodes = cvData.nodes.filter(isCategoryNode);

  // Get children of a node
  const getChildren = (parentId: string): CVNode[] => {
    return cvData.nodes.filter((node) => node.parentId === parentId);
  };

  if (!profileNode) {
    return <div className="standard-cv">No profile data found</div>;
  }

  // Sort sections by order
  const sortedSections = [...sections].sort((a, b) => a.order - b.order);

  return (
    <div className="standard-cv">
      <div className="cv-container">
        {/* Header / Profile */}
        <header className="cv-header">
          <div className="cv-header-photo">
            <img src={profileNode.photoUrl} alt={profileNode.name} />
          </div>
          <div className="cv-header-content">
            <h1 className="cv-name">{profileNode.name}</h1>
            <h2 className="cv-title">{profileNode.title}</h2>
            <p className="cv-subtitle">{profileNode.subtitle}</p>
            <div className="cv-contact">
              <span className="cv-experience">{profileNode.experience}</span>
              <span className="cv-location">{profileNode.location}</span>
              <span className="cv-email">{profileNode.email}</span>
            </div>
            {contentMap['profile'] && (
              <div className="cv-about markdown-content">
                <Markdown>{contentMap['profile']}</Markdown>
              </div>
            )}
          </div>
        </header>

        {/* Sections */}
        {sortedSections.map((section) => {
          const categoryNode = categoryNodes.find((c) => c.sectionId === section.id);
          if (!categoryNode) return null;

          const items = getChildren(categoryNode.id);

          return (
            <section key={section.id} className="cv-section">
              <h2 className="cv-section-header">
                <SectionIcon icon={section.icon} size={22} className="cv-section-icon" />
                {section.label}
              </h2>
              <div className="cv-section-content">
                {section.id === 'skills' ? (
                  // Skills: render as grouped tags
                  <div className="cv-skills-grid">
                    {items
                      .filter((item) => item.type === 'skill-group')
                      .map((group) => {
                        const skills = getChildren(group.id);
                        return (
                          <div key={group.id} className="cv-skill-group">
                            <h3 className="cv-skill-group-title">{group.label}</h3>
                            <div className="cv-skill-tags">
                              {skills.map((skill) => (
                                <span key={skill.id} className="cv-skill-tag">
                                  {skill.label.replace('\n', ' ')}
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                ) : section.id === 'languages' ? (
                  // Languages: render as simple list
                  <div className="cv-languages">
                    {items.map((item) => (
                      <div key={item.id} className="cv-language-item">
                        <span className="cv-language-name">
                          {item.label.split('\n')[0]}
                        </span>
                        <span className="cv-language-level">
                          {item.label.split('\n')[1] || ''}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  // Work/Education: render as timeline items
                  <div className="cv-timeline">
                    {items.map((item) => {
                      const content = contentMap[item.id];
                      return (
                        <div key={item.id} className="cv-timeline-item">
                          {content ? (
                            <div className="markdown-content">
                              <Markdown>{content}</Markdown>
                            </div>
                          ) : (
                            <div className="cv-item-fallback">
                              <h3>{item.label.replace('\n', ' - ')}</h3>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

export default memo(StandardCVView);
