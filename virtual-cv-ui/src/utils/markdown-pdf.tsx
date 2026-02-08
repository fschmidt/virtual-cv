import { Text, View, StyleSheet } from '@react-pdf/renderer';
import { marked, type Token, type Tokens } from 'marked';

const styles = StyleSheet.create({
  h2: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: '#1a1a2e',
    marginBottom: 2,
  },
  h3: {
    fontSize: 10.5,
    fontFamily: 'Helvetica-Bold',
    color: '#667eea',
    marginTop: 6,
    marginBottom: 3,
  },
  paragraph: {
    fontSize: 9.5,
    fontFamily: 'Helvetica',
    color: '#333',
    lineHeight: 1.5,
    marginBottom: 4,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 2,
    paddingLeft: 4,
  },
  listBullet: {
    fontSize: 9.5,
    fontFamily: 'Helvetica',
    color: '#667eea',
    width: 12,
  },
  listText: {
    fontSize: 9.5,
    fontFamily: 'Helvetica',
    color: '#333',
    lineHeight: 1.5,
    flex: 1,
  },
  code: {
    fontSize: 8.5,
    fontFamily: 'Courier',
    backgroundColor: '#f0edff',
    color: '#667eea',
    padding: '2 5',
    borderRadius: 3,
  },
  codeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 4,
  },
  bold: {
    fontFamily: 'Helvetica-Bold',
  },
});

/** Render inline tokens (bold, code, text) into react-pdf Text children */
function renderInline(tokens: Token[]): React.ReactNode[] {
  return tokens.map((token, i) => {
    if (token.type === 'strong') {
      return (
        <Text key={i} style={styles.bold}>
          {(token as Tokens.Strong).text}
        </Text>
      );
    }
    if (token.type === 'codespan') {
      return (
        <Text key={i} style={styles.code}>
          {(token as Tokens.Codespan).text}
        </Text>
      );
    }
    if (token.type === 'text' || token.type === 'escape') {
      return <Text key={i}>{(token as Tokens.Text).text ?? (token as Tokens.Escape).text}</Text>;
    }
    if (token.type === 'em') {
      return (
        <Text key={i} style={{ fontStyle: 'italic' }}>
          {(token as Tokens.Em).text}
        </Text>
      );
    }
    // Fallback: render raw text
    if ('text' in token) {
      return <Text key={i}>{(token as Tokens.Generic).text}</Text>;
    }
    return null;
  });
}

/** Check if a paragraph contains only codespan tokens (technology tags) */
function isCodeOnlyParagraph(tokens: Token[]): boolean {
  const meaningful = tokens.filter(
    (t) => !(t.type === 'text' && 'text' in t && (t as Tokens.Text).text.trim() === '') && t.type !== 'space'
  );
  return meaningful.length > 0 && meaningful.every((t) => t.type === 'codespan');
}

/** Render a single block-level token */
function renderToken(token: Token, index: number): React.ReactNode {
  switch (token.type) {
    case 'heading': {
      const heading = token as Tokens.Heading;
      if (heading.depth === 2) {
        return <Text key={index} style={styles.h2}>{heading.text}</Text>;
      }
      if (heading.depth === 3) {
        return <Text key={index} style={styles.h3}>{heading.text}</Text>;
      }
      return <Text key={index} style={styles.paragraph}>{heading.text}</Text>;
    }

    case 'paragraph': {
      const para = token as Tokens.Paragraph;
      // Technology tags: paragraph with only backtick code spans
      if (para.tokens && isCodeOnlyParagraph(para.tokens)) {
        return (
          <View key={index} style={styles.codeRow}>
            {para.tokens
              .filter((t) => t.type === 'codespan')
              .map((t, i) => (
                <Text key={i} style={styles.code}>
                  {(t as Tokens.Codespan).text}
                </Text>
              ))}
          </View>
        );
      }
      // Regular paragraph with inline formatting
      if (para.tokens) {
        return (
          <Text key={index} style={styles.paragraph}>
            {renderInline(para.tokens)}
          </Text>
        );
      }
      return <Text key={index} style={styles.paragraph}>{para.text}</Text>;
    }

    case 'list': {
      const list = token as Tokens.List;
      return (
        <View key={index}>
          {list.items.map((item, i) => (
            <View key={i} style={styles.listItem}>
              <Text style={styles.listBullet}>{list.ordered ? `${i + 1}.` : '•'}</Text>
              <Text style={styles.listText}>
                {item.tokens ? renderInline(item.tokens.flatMap((t) => {
                  if (t.type === 'text' && 'tokens' in t && (t as Tokens.Text).tokens) {
                    return (t as Tokens.Text).tokens!;
                  }
                  return [t];
                })) : item.text}
              </Text>
            </View>
          ))}
        </View>
      );
    }

    case 'space':
      return null;

    default:
      if ('text' in token) {
        return <Text key={index} style={styles.paragraph}>{(token as Tokens.Generic).text}</Text>;
      }
      return null;
  }
}

/** Render markdown string as react-pdf components */
export function MarkdownContent({ content }: { content: string }) {
  const tokens = marked.lexer(content);
  return <View>{tokens.map((token, i) => renderToken(token, i))}</View>;
}
