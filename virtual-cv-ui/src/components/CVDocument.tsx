import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';
import type { CVData, CVNode, CVProfileNode, CVCategoryNode, CV_SECTIONS } from '../types';
import type { ContentMap } from '../services';
import { MarkdownContent } from '../utils/markdown-pdf';

const ACCENT = '#667eea';
const ACCENT_ALT = '#764ba2';
const SIDEBAR_BG = '#f8f7ff';
const SIDEBAR_WIDTH = '32%';
const FOOTER_HEIGHT = 24;

const styles = StyleSheet.create({
  page: {
    flexDirection: 'row',
    fontFamily: 'Helvetica',
    fontSize: 9.5,
    color: '#222',
    backgroundColor: '#ffffff',
    paddingBottom: FOOTER_HEIGHT + 10,
  },

  // ── Fixed elements (repeat on every page) ──
  sidebarBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: SIDEBAR_WIDTH,
    backgroundColor: SIDEBAR_BG,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: FOOTER_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    fontSize: 7.5,
    color: '#999',
  },

  // ── Two-column layout ──
  sidebar: {
    width: SIDEBAR_WIDTH,
    padding: '30 18',
  },
  main: {
    width: '68%',
    padding: '30 28 10 22',
  },

  // ── Header (in main column) ──
  header: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 14,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: ACCENT,
  },
  photo: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  headerContent: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: '#1a1a2e',
    marginBottom: 1,
  },
  title: {
    fontSize: 11.5,
    fontFamily: 'Helvetica-Bold',
    color: ACCENT,
    marginBottom: 1,
  },
  subtitle: {
    fontSize: 9,
    color: '#666',
  },

  // ── Contact (in sidebar) ──
  contactSection: {
    marginBottom: 16,
  },
  contactItem: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 5,
    fontSize: 8.5,
  },
  contactLabel: {
    color: ACCENT,
    fontFamily: 'Helvetica-Bold',
    width: 28,
  },
  contactValue: {
    flex: 1,
    color: '#333',
  },

  // ── Sidebar section headers ──
  sidebarSectionHeader: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: ACCENT,
    marginBottom: 6,
    paddingBottom: 3,
    borderBottomWidth: 1,
    borderBottomColor: '#e0ddf5',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },

  // ── Main section headers ──
  sectionHeader: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: ACCENT,
    marginBottom: 6,
    paddingBottom: 3,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },

  // ── Bio ──
  bio: {
    marginBottom: 14,
  },

  // ── Main sections ──
  section: {
    marginBottom: 12,
  },

  // ── Timeline (Work / Education) ──
  timelineItem: {
    marginBottom: 8,
    paddingLeft: 8,
    borderLeftWidth: 2,
    borderLeftColor: ACCENT_ALT,
  },

  // ── Skills (sidebar) ──
  skillGroup: {
    marginBottom: 8,
  },
  skillGroupTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#1a1a2e',
    marginBottom: 3,
  },
  skillTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 3,
  },
  skillTag: {
    fontSize: 7.5,
    fontFamily: 'Courier',
    backgroundColor: '#e8e4ff',
    color: ACCENT,
    padding: '2 4',
    borderRadius: 2,
  },

  // ── Languages (sidebar) ──
  languageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  languageName: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#1a1a2e',
  },
  languageLevel: {
    fontSize: 8.5,
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

const generatedDate = new Date().toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'long',
});

export default function CVDocument({ cvData, contentMap, sections }: CVDocumentProps) {
  const profileNode = cvData.nodes.find(isProfileNode);
  const categoryNodes = cvData.nodes.filter(isCategoryNode);
  const getChildren = (parentId: string): CVNode[] =>
    cvData.nodes.filter((node) => node.parentId === parentId);

  if (!profileNode) return null;

  const sortedSections = [...sections].sort((a, b) => a.order - b.order);

  // Sidebar sections: skills, languages
  const sidebarSectionIds = ['skills', 'languages'];
  const mainSections = sortedSections.filter((s) => !sidebarSectionIds.includes(s.id));
  const skillsSection = sortedSections.find((s) => s.id === 'skills');
  const languagesSection = sortedSections.find((s) => s.id === 'languages');

  return (
    <Document title={`${profileNode.name} - CV`} author={profileNode.name}>
      <Page size="A4" style={styles.page}>
        {/* ─── FIXED: sidebar background (repeats on every page) ─── */}
        <View style={styles.sidebarBg} fixed />

        {/* ─── FIXED: footer (repeats on every page) ─── */}
        <View style={styles.footer} fixed>
          <Text>{profileNode.email}</Text>
          <Text>{generatedDate}</Text>
          <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>

        {/* ─── LEFT SIDEBAR ─── */}
        <View style={styles.sidebar}>
          {/* Contact */}
          <View style={styles.contactSection}>
            <Text style={styles.sidebarSectionHeader}>Contact</Text>
            {profileNode.location && (
              <View style={styles.contactItem}>
                <Text style={styles.contactLabel}>Loc</Text>
                <Text style={styles.contactValue}>{profileNode.location}</Text>
              </View>
            )}
            {profileNode.email && (
              <View style={styles.contactItem}>
                <Text style={styles.contactLabel}>Mail</Text>
                <Text style={styles.contactValue}>{profileNode.email}</Text>
              </View>
            )}
            {profileNode.experience && (
              <View style={styles.contactItem}>
                <Text style={styles.contactLabel}>Exp</Text>
                <Text style={styles.contactValue}>{profileNode.experience}</Text>
              </View>
            )}
          </View>

          {/* Skills */}
          {skillsSection && (() => {
            const categoryNode = categoryNodes.find((c) => c.sectionId === 'skills');
            if (!categoryNode) return null;
            const groups = getChildren(categoryNode.id).filter((n) => n.type === 'skill-group');
            return (
              <View style={{ marginBottom: 16 }}>
                <Text style={styles.sidebarSectionHeader}>{skillsSection.label}</Text>
                {groups.map((group) => {
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
            );
          })()}

          {/* Languages */}
          {languagesSection && (() => {
            const categoryNode = categoryNodes.find((c) => c.sectionId === 'languages');
            if (!categoryNode) return null;
            const items = getChildren(categoryNode.id);
            return (
              <View>
                <Text style={styles.sidebarSectionHeader}>{languagesSection.label}</Text>
                {items.map((item) => (
                  <View key={item.id} style={styles.languageItem}>
                    <Text style={styles.languageName}>{item.label.split('\n')[0]}</Text>
                    <Text style={styles.languageLevel}>{item.label.split('\n')[1] || ''}</Text>
                  </View>
                ))}
              </View>
            );
          })()}
        </View>

        {/* ─── MAIN CONTENT ─── */}
        <View style={styles.main}>
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
            </View>
          </View>

          {/* Bio */}
          {contentMap['profile'] && (
            <View style={styles.bio}>
              <MarkdownContent content={contentMap['profile']} />
            </View>
          )}

          {/* Main sections (Work, Education) */}
          {mainSections.map((section) => {
            const categoryNode = categoryNodes.find((c) => c.sectionId === section.id);
            if (!categoryNode) return null;

            const items = getChildren(categoryNode.id);

            return (
              <View key={section.id} style={styles.section}>
                <Text style={styles.sectionHeader}>{section.label}</Text>
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
              </View>
            );
          })}
        </View>
      </Page>
    </Document>
  );
}
