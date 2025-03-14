import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { ResumeData } from '@/app/resume/constants';

interface ResumePDFProps {
  resume: {
    title: string;
    content: ResumeData;
  };
}

// Register fonts
Font.register({
  family: 'Inter',
  fonts: [
    { src: '/fonts/Inter-Regular.ttf' },
    { src: '/fonts/Inter-Medium.ttf', fontWeight: 500 },
    { src: '/fonts/Inter-Bold.ttf', fontWeight: 700 },
  ],
});

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Inter',
    fontSize: 11,
  },
  header: {
    marginBottom: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 700,
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  contact: {
    flexDirection: 'row',
    gap: 16,
    color: '#666',
    marginBottom: 20,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    marginBottom: 8,
    color: '#333',
  },
  summary: {
    marginBottom: 16,
    lineHeight: 1.4,
  },
  skillCategory: {
    marginBottom: 8,
  },
  skillTitle: {
    fontWeight: 500,
    marginBottom: 2,
  },
  skillList: {
    color: '#666',
  },
  experienceItem: {
    marginBottom: 12,
  },
  companyName: {
    fontWeight: 700,
    marginBottom: 2,
  },
  position: {
    fontWeight: 500,
    marginBottom: 2,
  },
  duration: {
    color: '#666',
    marginBottom: 4,
  },
  responsibilities: {
    marginLeft: 12,
  },
  responsibilityItem: {
    marginBottom: 2,
  },
  technologies: {
    color: '#666',
    marginTop: 4,
  },
  educationItem: {
    marginBottom: 8,
  },
  institution: {
    fontWeight: 500,
    marginBottom: 2,
  },
  degree: {
    marginBottom: 2,
  },
  courses: {
    color: '#666',
  },
  achievementItem: {
    marginBottom: 2,
  },
});

export function ResumePDF({ resume }: ResumePDFProps) {
  const { content } = resume;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>{content.personalInfo.name}</Text>
          <Text style={styles.title}>{content.personalInfo.title}</Text>
          <View style={styles.contact}>
            <Text>{content.personalInfo.contact.email}</Text>
            <Text>{content.personalInfo.contact.phone}</Text>
          </View>
        </View>

        {/* Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <Text style={styles.summary}>{content.summary}</Text>
        </View>

        {/* Technical Skills */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Technical Skills</Text>
          {Object.entries(content.technicalSkills).map(([category, skills]) => (
            <View key={category} style={styles.skillCategory}>
              <Text style={styles.skillTitle}>
                {category.replace(/([A-Z])/g, ' $1').trim()}
              </Text>
              <Text style={styles.skillList}>{skills.join(", ")}</Text>
            </View>
          ))}
        </View>

        {/* Experience */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Experience</Text>
          {content.experience.map((exp, index) => (
            <View key={index} style={styles.experienceItem}>
              <Text style={styles.companyName}>{exp.company}</Text>
              <Text style={styles.position}>{exp.position}</Text>
              <Text style={styles.duration}>{exp.duration}</Text>
              {exp.responsibilities && (
                <View style={styles.responsibilities}>
                  {exp.responsibilities.map((resp, i) => (
                    <Text key={i} style={styles.responsibilityItem}>
                      • {resp}
                    </Text>
                  ))}
                </View>
              )}
              {exp.technologies && (
                <Text style={styles.technologies}>
                  Technologies: {exp.technologies.join(", ")}
                </Text>
              )}
            </View>
          ))}
        </View>

        {/* Education */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Education</Text>
          {content.education.map((edu, index) => (
            <View key={index} style={styles.educationItem}>
              <Text style={styles.institution}>{edu.institution}</Text>
              {edu.degree && <Text style={styles.degree}>{edu.degree}</Text>}
              {edu.courses && (
                <Text style={styles.courses}>
                  Courses: {edu.courses.join(", ")}
                </Text>
              )}
              <Text style={styles.duration}>{edu.year}</Text>
            </View>
          ))}
        </View>

        {/* Achievements */}
        {content.achievements && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Achievements</Text>
            {content.achievements.map((achievement, index) => (
              <Text key={index} style={styles.achievementItem}>
                • {achievement}
              </Text>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
} 