import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';
import type { CVData, CVNode, CVProfileNode, CVCategoryNode, CV_SECTIONS } from '../types';
import type { ContentMap } from '../services';
import { MarkdownContent } from '../utils/markdown-pdf';

const ACCENT = '#667eea';
const ACCENT_ALT = '#764ba2';

const styles = StyleSheet.create({
  page: {
    padding: '40 45',
    fontFamily: 'Helvetica',
    fontSize: 9.5,
    color: '#222',
    backgroundColor: '#ffffff',
  },

  // ── Header ──
  header: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: ACCENT,
  },
  photo: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  headerContent: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: '#1a1a2e',
    marginBottom: 2,
  },
  title: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: ACCENT,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 10,
    color: '#666',
    marginBottom: 6,
  },
  contactRow: {
    flexDirection: 'row',
    gap: 16,
    fontSize: 8.5,
    color: '#555',
  },
  contactItem: {
    flexDirection: 'row',
    gap: 3,
  },
  contactLabel: {
    color: ACCENT,
    fontFamily: 'Helvetica-Bold',
  },

  // ── Bio ──
  bio: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },

  // ── Sections ──
  section: {
    marginBottom: 14,
  },
  sectionHeader: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: ACCENT,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // ── Timeline (Work / Education) ──
  timelineItem: {
    marginBottom: 10,
    paddingLeft: 10,
    borderLeftWidth: 2,
    borderLeftColor: ACCENT_ALT,
  },

  // ── Skills ──
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  skillGroup: {
    width: '47%',
    marginBottom: 6,
  },
  skillGroupTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#1a1a2e',
    marginBottom: 4,
  },
  skillTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  skillTag: {
    fontSize: 8,
    fontFamily: 'Courier',
    backgroundColor: '#f0edff',
    color: ACCENT,
    padding: '2 6',
    borderRadius: 3,
  },

  // ── Languages ──
  languagesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
  },
  languageItem: {
    marginBottom: 4,
  },
  languageName: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#1a1a2e',
  },
  languageLevel: {
    fontSize: 9,
    color: ACCENT,
  },
});

function isProfileNode(node: CVNode): node is CVProfileNode {
  return node.type === 'profile';
}

function isCategoryNode(node: CVNode): node is CVCategoryNode {
  return node.type === 'category';
}

interface CVDocumentProps {
  cvData: CVData;
  contentMap: ContentMap;
  sections: typeof CV_SECTIONS;
}

export default function CVDocument({ cvData, contentMap, sections }: CVDocumentProps) {
  const profileNode = cvData.nodes.find(isProfileNode);
  const categoryNodes = cvData.nodes.filter(isCategoryNode);
  const getChildren = (parentId: string): CVNode[] =>
    cvData.nodes.filter((node) => node.parentId === parentId);

  if (!profileNode) return null;

  const sortedSections = [...sections].sort((a, b) => a.order - b.order);

  return (
    <Document title={`${profileNode.name} - CV`} author={profileNode.name}>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          {profileNode.photoUrl && (
            <Image src={profileNode.photoUrl} style={styles.photo} />
          )}
          <View style={styles.headerContent}>
            <Text style={styles.name}>{profileNode.name}</Text>
            <Text style={styles.title}>{profileNode.title}</Text>
            {profileNode.subtitle && (
              <Text style={styles.subtitle}>{profileNode.subtitle}</Text>
            )}
            <View style={styles.contactRow}>
              {profileNode.experience && (
                <View style={styles.contactItem}>
                  <Text style={styles.contactLabel}>Exp</Text>
                  <Text>{profileNode.experience}</Text>
                </View>
              )}
              {profileNode.location && (
                <View style={styles.contactItem}>
                  <Text style={styles.contactLabel}>Loc</Text>
                  <Text>{profileNode.location}</Text>
                </View>
              )}
              {profileNode.email && (
                <View style={styles.contactItem}>
                  <Text style={styles.contactLabel}>Mail</Text>
                  <Text>{profileNode.email}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Bio */}
        {contentMap['profile'] && (
          <View style={styles.bio}>
            <MarkdownContent content={contentMap['profile']} />
          </View>
        )}

        {/* Sections */}
        {sortedSections.map((section) => {
          const categoryNode = categoryNodes.find((c) => c.sectionId === section.id);
          if (!categoryNode) return null;

          const items = getChildren(categoryNode.id);

          return (
            <View key={section.id} style={styles.section} wrap={false}>
              <Text style={styles.sectionHeader}>{section.label}</Text>

              {section.id === 'skills' ? (
                <View style={styles.skillsGrid}>
                  {items
                    .filter((item) => item.type === 'skill-group')
                    .map((group) => {
                      const skills = getChildren(group.id);
                      return (
                        <View key={group.id} style={styles.skillGroup}>
                          <Text style={styles.skillGroupTitle}>{group.label}</Text>
                          <View style={styles.skillTags}>
                            {skills.map((skill) => (
                              <Text key={skill.id} style={styles.skillTag}>
                                {skill.label.replace('\n', ' ')}
                              </Text>
                            ))}
                          </View>
                        </View>
                      );
                    })}
                </View>
              ) : section.id === 'languages' ? (
                <View style={styles.languagesRow}>
                  {items.map((item) => (
                    <View key={item.id} style={styles.languageItem}>
                      <Text style={styles.languageName}>
                        {item.label.split('\n')[0]}
                      </Text>
                      <Text style={styles.languageLevel}>
                        {item.label.split('\n')[1] || ''}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : (
                <View>
                  {items.map((item) => {
                    const content = contentMap[item.id];
                    return (
                      <View key={item.id} style={styles.timelineItem} wrap={false}>
                        {content ? (
                          <MarkdownContent content={content} />
                        ) : (
                          <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 11 }}>
                            {item.label.replace('\n', ' - ')}
                          </Text>
                        )}
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          );
        })}
      </Page>
    </Document>
  );
}
